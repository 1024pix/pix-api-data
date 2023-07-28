import * as dotenv from 'dotenv';
import perf_hooks from 'perf_hooks';
import * as url from 'url';
import { logger } from '../../lib/common/logger/Logger.js';
import {
  disconnect,
  knexAPI,
} from '../../lib/common/db/knex-database-connections.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFile } from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import {
  MATCHING_OPTIONAL_BLOCK_REGEXP,
  MATCHING_PARAM_BLOCK_REGEXP,
  PARAM_NAME_REGEXP,
} from '../../lib/domain/models/DatamartQuery.js';
import { ParamType } from '../../lib/domain/models/QueryCatalogItem.js';
import type { Knex } from 'knex';

dotenv.config();
const { performance } = perf_hooks;

const PARAM_NAME_GLOBAL_REGEXP = new RegExp(PARAM_NAME_REGEXP, 'g');
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const parseMe = yargs(hideBin(process.argv))
  .option('file', {
    type: 'string',
    description: 'Chemin vers le fichier contenant les données',
  })
  .option('checkOnly', {
    type: 'boolean',
    description:
      'Option pour seulement effectuer une vérification des requêtes dans le fichier sans tenter de les insérer',
  })
  .option('dryRun', {
    type: 'boolean',
    description:
      "Option pour exécuter le script à blanc (ne produira que les sorties console sans réaliser d'insertion en BDD)",
  })
  .help();

const doJob = async (
  filePath: FilePath,
  checkOnly: boolean,
  dryRun: boolean,
): Promise<{ errorMessagesByQuery: string[][]; sqlByQuery: string[][] }> => {
  logger.info(`Récupération des requêtes depuis le fichier...`);
  const { errorMessagesByQuery, queries } = await parseQueriesFromCsv(filePath);
  if (checkOnly) {
    logger.info(`Récupération OK, ${queries.length} requêtes trouvées.`);
    return {
      errorMessagesByQuery,
      sqlByQuery: [],
    };
  }
  if (queries.length === 0 || queries.some((query) => !query.isValid)) {
    logger.error(
      'Sortie prématurée: au moins une requête dans le fichier est invalide.',
    );
    return {
      errorMessagesByQuery,
      sqlByQuery: [],
    };
  }
  logger.info(`Récupération OK, ${queries.length} requêtes trouvées.`);

  logger.info(
    `Insertion des requêtes dans le catalogue...${dryRun ? 'TEST-BLANC' : ''}`,
  );
  const sqlByQuery: string[][] = [];
  const trx = await knexAPI.transaction();
  try {
    for (const query of queries) {
      sqlByQuery[query.lineNumberInCSV] = await addQueryToCatalog(query, trx);
    }
    if (dryRun) await trx.rollback();
    else await trx.commit();
  } catch (err) {
    logger.error(
      `Sortie prématurée: l'insertion en catalogue s'est mal passée.`,
    );
    await trx.rollback();
    throw err;
  }

  return {
    errorMessagesByQuery: [],
    sqlByQuery,
  };
};

const parseQueriesFromCsv = async (
  filePath: FilePath,
): Promise<{ errorMessagesByQuery: string[][]; queries: QueryChecker[] }> => {
  const errorMessagesByQuery: string[][] = [];
  let buffer: Buffer;
  try {
    buffer = await readFile(filePath.fullPath);
  } catch (err) {
    logger.error('Erreur lors de la lecture du fichier');
    throw err;
  }
  const parsedCSVData = Papa.parse(buffer.toString(), { delimiter: ',' });
  if (parsedCSVData.errors.length > 0) {
    logger.error('Erreur lors du parsing CSV');
    throw new Error(JSON.stringify(parsedCSVData.errors));
  }
  const data: string[][] = parsedCSVData.data as string[][];
  const queries: QueryChecker[] = [];
  const dataWithoutEmptyLines = data.filter((line) =>
    line.some((cell) => cell.trim().length > 0),
  );
  for (const [lineNumber, line] of dataWithoutEmptyLines.entries()) {
    const queryChecker = QueryChecker.fromCSVLine(line, lineNumber);
    queries.push(queryChecker);
    errorMessagesByQuery[lineNumber] = queryChecker.check();
  }

  return {
    errorMessagesByQuery,
    queries,
  };
};

const addQueryToCatalog = async (
  queryChecker: QueryChecker,
  trx: Knex.Transaction,
): Promise<string[]> => {
  const sqlQueries: string[] = [];
  const knexQueryToExecute_query = trx('catalog_queries')
    .insert({
      sql_query: queryChecker.query,
    })
    .returning('id');
  sqlQueries.push(knexQueryToExecute_query.toString());
  const [{ id }] = await knexQueryToExecute_query;
  for (const providedParam of queryChecker.providedParams) {
    const knexQueryToExecute_param = trx('catalog_query_params').insert({
      catalog_query_id: id,
      name: providedParam.name,
      type: providedParam.type,
      mandatory: providedParam.mandatory,
    });
    sqlQueries.push(knexQueryToExecute_param.toString());
    await knexQueryToExecute_param;
  }
  return sqlQueries;
};

export class FilePath {
  file: string;
  fullPath: string;

  constructor(currentDir: string, file: string) {
    this.file = file;
    this.fullPath = path.join(currentDir, file);
  }
}

type ProvidedParam = {
  name: string;
  type: string;
  mandatory: boolean;
  provided: boolean;
};

class QueryChecker {
  query: string;
  mandatoryParamsInQuery: string[];
  optionalParamsInQuery: string[];
  lineNumberInCSV: number;
  providedParams: ProvidedParam[];
  isValid: boolean;

  constructor(
    query: string,
    mandatoryParamsInQuery: string[],
    optionalParamsInQuery: string[],
    lineNumberInCSV: number,
    providedParams: ProvidedParam[],
  ) {
    this.query = query;
    this.mandatoryParamsInQuery = mandatoryParamsInQuery;
    this.optionalParamsInQuery = optionalParamsInQuery;
    this.lineNumberInCSV = lineNumberInCSV;
    this.providedParams = providedParams;
    this.isValid = false;
  }

  static fromCSVLine(csvLine: string[], lineNumber: number): QueryChecker {
    const query = csvLine[0];
    if (query.trim().length === 0) {
      return new QueryChecker('', [], [], lineNumber, []);
    }
    const { queryWithoutOptionalBlocks, optionalParams } =
      extractOptionalParameters(query);
    const { mandatoryParams } = extractMandatoryParameters(
      queryWithoutOptionalBlocks,
    );
    const providedParams = parseProvidedParameters(csvLine.slice(1));

    return new QueryChecker(
      query,
      mandatoryParams,
      optionalParams,
      lineNumber,
      providedParams,
    );
  }

  check(): string[] {
    const errorMessages: string[] = [];
    if (this.isQueryEmpty()) {
      errorMessages.push(`Pas de requête.`);
    }
    for (const mandatoryParam of this.mandatoryParamsInQuery) {
      errorMessages.push(
        ...checkMandatoryParam(mandatoryParam, this.providedParams),
      );
    }
    for (const optionalParam of this.optionalParamsInQuery) {
      errorMessages.push(
        ...checkOptionalParam(optionalParam, this.providedParams),
      );
    }
    for (const providedParam of this.providedParams) {
      if (!providedParam.provided) {
        errorMessages.push(
          `Paramètre "${providedParam.name}" listé dans les paramètres fournis mais pas présent dans la requête.`,
        );
      }
    }
    this.isValid = errorMessages.length === 0;
    return errorMessages;
  }

  isQueryEmpty(): boolean {
    return this.query.trim().length === 0;
  }
}

function extractOptionalParameters(query: string): {
  queryWithoutOptionalBlocks: string;
  optionalParams: string[];
} {
  let cloneQuery = query + '';
  const optionalParams: string[] = [];
  const regExpMatchOptionalArrays = [
    ...cloneQuery.matchAll(MATCHING_OPTIONAL_BLOCK_REGEXP),
  ];
  const optionalBlocks = regExpMatchOptionalArrays.map(
    (regExpMatchArray) => regExpMatchArray[0],
  );
  if (optionalBlocks.length > 0) {
    for (const optionalBlock of optionalBlocks) {
      const optionalParam = [
        ...optionalBlock.matchAll(PARAM_NAME_GLOBAL_REGEXP),
      ].map((regExpMatchArray) => regExpMatchArray[1].slice(1, -1))[0];
      optionalParams.push(optionalParam);
      cloneQuery = cloneQuery.replace(optionalBlock, '');
    }
  }

  return {
    queryWithoutOptionalBlocks: cloneQuery,
    optionalParams,
  };
}

function extractMandatoryParameters(query: string): {
  queryWithoutMandatoryBlocks: string;
  mandatoryParams: string[];
} {
  let cloneQuery = query + '';
  const mandatoryParams: string[] = [];
  const regExpMatchMandatoryArrays = [
    ...cloneQuery.matchAll(MATCHING_PARAM_BLOCK_REGEXP),
  ];
  const mandatoryBlocks = regExpMatchMandatoryArrays.map(
    (regExpMatchArray) => regExpMatchArray[0],
  );
  if (mandatoryBlocks.length > 0) {
    for (const mandatoryBlock of mandatoryBlocks) {
      const mandatoryParam = [
        ...mandatoryBlock.matchAll(PARAM_NAME_GLOBAL_REGEXP),
      ].map((regExpMatchArray) => regExpMatchArray[1].slice(1, -1))[0];
      mandatoryParams.push(mandatoryParam);
      cloneQuery = cloneQuery.replace(mandatoryBlock, '');
    }
  }

  return {
    queryWithoutMandatoryBlocks: cloneQuery,
    mandatoryParams,
  };
}

function parseProvidedParameters(rawParams: string[]): ProvidedParam[] {
  const providedParams: ProvidedParam[] = [];
  const PARAM_NAME_REGEXP = /name *: *([^,\\}]*)[,\\}]/g;
  const PARAM_TYPE_REGEXP = /type *: *([^,\\}]*)[,\\}]/g;
  const PARAM_MANDATORY_REGEXP = /mandatory *: *([^,\\}]*)[,\\}]/g;
  for (const rawParam of rawParams) {
    if (rawParam.trim().length === 0) continue;
    const nameParam = [...rawParam.matchAll(PARAM_NAME_REGEXP)].map(
      (regExpMatchArray) =>
        regExpMatchArray[1].replaceAll('"', '').replaceAll("'", ''),
    )[0];
    const typeParam = [...rawParam.matchAll(PARAM_TYPE_REGEXP)].map(
      (regExpMatchArray) =>
        regExpMatchArray[1].replaceAll('"', '').replaceAll("'", ''),
    )[0];
    const mandatoryParam = [...rawParam.matchAll(PARAM_MANDATORY_REGEXP)].map(
      (regExpMatchArray) =>
        regExpMatchArray[1].replaceAll('"', '').replaceAll("'", ''),
    )[0];
    providedParams.push({
      name: nameParam,
      type: typeParam,
      mandatory:
        mandatoryParam === 'true'
          ? true
          : mandatoryParam === 'false'
          ? false
          : null,
      provided: false,
    });
  }
  return providedParams;
}

function checkMandatoryParam(
  mandatoryParam: string,
  providedParams: ProvidedParam[],
): string[] {
  return checkParam(mandatoryParam, providedParams, true);
}

function checkOptionalParam(
  optionalParam: string,
  providedParams: ProvidedParam[],
): string[] {
  return checkParam(optionalParam, providedParams, false);
}

function checkParam(
  param: string,
  providedParams: ProvidedParam[],
  shouldBeMandatory: boolean,
): string[] {
  const errorMessages: string[] = [];
  const providedParamWithName = providedParams.find(
    (providedParam) => providedParam.name === param,
  );
  if (!providedParamWithName) {
    errorMessages.push(
      `Paramètre ${
        shouldBeMandatory ? 'obligatoire' : 'facultatif'
      } "${param}" présent dans la requête mais non listé dans les paramètres fournis.`,
    );
    return errorMessages;
  }
  providedParamWithName.provided = true;
  if (shouldBeMandatory && !providedParamWithName.mandatory) {
    errorMessages.push(
      `Paramètre obligatoire "${param}" présent dans la requête en tant qu'obligatoire mais fourni en tant que paramètre facultatif.`,
    );
  }
  if (!shouldBeMandatory && providedParamWithName.mandatory) {
    errorMessages.push(
      `Paramètre facultatif "${param}" présent dans la requête en tant que facultatif mais fourni en tant que paramètre obligatoire.`,
    );
  }
  if (!isTypeInParamTypeEnum(providedParamWithName.type)) {
    errorMessages.push(
      `Paramètre facultatif "${param}" présent dans la requête et dans les paramètres fournis mais avec un type inexistant (type "${providedParamWithName.type}" indiqué).`,
    );
  }
  return errorMessages;
}

function isTypeInParamTypeEnum(type: string): boolean {
  function isValueInStringEnum<E extends string>(strEnum: Record<string, E>) {
    const enumValues = Object.values(strEnum) as string[];

    return (value: string): value is E => enumValues.includes(value);
  }
  const isValueInMyStrEnum = isValueInStringEnum(ParamType);
  return isValueInMyStrEnum(type);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
const __filename = modulePath;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const {
    file,
    checkOnly,
    dryRun,
  }: { file: string; checkOnly: boolean; dryRun: boolean } = await parseMe.argv;
  logger.info(`Script lancé avec le fichier ${file}.`);
  if (checkOnly) {
    logger.info(
      `En mode vérification uniquement, aucune opération en BDD ne sera effectuée`,
    );
  } else {
    if (dryRun) {
      logger.info(
        `En mode exécution, DRY_RUN activé, script lancé à blanc, aucune persistance en BDD.`,
      );
    } else {
      logger.info(`En mode exécution avec insertion en BDD.`);
    }
  }
  const { errorMessagesByQuery, sqlByQuery } = await doJob(
    new FilePath(__dirname, file),
    checkOnly,
    dryRun,
  );
  for (const [line, messages] of errorMessagesByQuery.entries()) {
    logger.info(
      `Erreurs pour la ligne n°${line}: ${
        messages.length === 0 ? 'Aucune' : `\n\t${messages.join('\n\t')}`
      }`,
    );
  }
  for (const [line, sqlQueries] of sqlByQuery.entries()) {
    logger.info(
      `Requêtes exécutées pour la ligne n°${line}: ${
        sqlQueries.length === 0 ? 'Aucune' : `\n\t${sqlQueries.join('\n\t')}`
      }`,
    );
  }
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { doJob };

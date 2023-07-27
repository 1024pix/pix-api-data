import * as dotenv from 'dotenv';
dotenv.config();
import perf_hooks from 'perf_hooks';
import * as url from 'url';
const { performance } = perf_hooks;
import { logger } from '../../lib/common/logger/Logger.js';
import {
  knexAPI,
  disconnect,
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

const PARAM_NAME_GLOBAL_REGEXP = new RegExp(PARAM_NAME_REGEXP, 'g');
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const parseMe = yargs(hideBin(process.argv))
  .option('file', {
    type: 'string',
    description: 'Chemin vers le fichier contenant les données',
  })
  .option('generateSQL', {
    type: 'boolean',
    description:
      "Option pour générer le SQL d'insertion de la requête et de ses paramètres",
  })
  .help();

const checkQuery = async (
  filePath: FilePath,
  generateSQL: boolean,
): Promise<{ messagesByLine: string[][]; sql: string[][] }> => {
  const messagesByLine: string[][] = [];
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
  for (const [lineNumber, line] of data.entries()) {
    const queryChecker = QueryChecker.fromCSVLine(line, lineNumber);
    queries.push(queryChecker);
    messagesByLine[lineNumber] = queryChecker.check();
  }

  const sql: string[][] = [];
  if (generateSQL) {
    for (const [index, queryCheck] of queries.entries()) {
      sql[index] = queryCheck.generateSQL();
    }
  }

  return {
    messagesByLine,
    sql,
  };
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

  generateSQL(): string[] {
    if (!this.isValid) return ['Requête invalide, pas de SQL généré.'];
    const sqlQueries: string[] = [];
    sqlQueries.push(
      knexAPI('catalog_queries').insert({ sql_query: this.query }).toString(),
    );
    for (const providedParam of this.providedParams) {
      sqlQueries.push(
        knexAPI('catalog_query_params')
          .insert({
            catalog_query_id: '<REPLACE_ME_WITH_CATALOG_QUERY_ID>',
            name: providedParam.name,
            type: providedParam.type,
            mandatory: providedParam.mandatory,
          })
          .toString(),
      );
    }
    return sqlQueries;
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
  const { file, generateSQL }: { file: string; generateSQL: boolean } =
    await parseMe.argv;
  const { messagesByLine } = await checkQuery(
    new FilePath(__dirname, file),
    generateSQL,
  );
  for (const [line, messages] of messagesByLine.entries()) {
    logger.info(
      `Erreurs pour la ligne n°${line}: ${
        messages.length === 0 ? 'N/A' : `\n\t${messages.join('\n\t')}`
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

export { checkQuery };

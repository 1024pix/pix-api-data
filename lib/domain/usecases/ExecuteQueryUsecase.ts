import type {
  CatalogQueryRepository,
} from '../../infrastructure/CatalogQueryRepository.js';
import {
  catalogQueryRepository,
} from '../../infrastructure/CatalogQueryRepository.js';
import type {
  DatamartRepository,
} from '../../infrastructure/DatamartRepository.js';
import {
  datamartRepository,
} from '../../infrastructure/DatamartRepository.js';
import {
  type QueryAccessRepository,
  queryAccessRepository,
} from '../../infrastructure/QueryAccessRepository.js';
import type { UserCommand } from '../commands/UserCommand.js';
import { DatamartQueryModel } from '../models/DatamartQuery.js';
import type { DatamartResponse } from '../models/DatamartResponse.js';
import type { QueryCatalogItem } from '../models/QueryCatalogItem.js';
import { Result } from '../models/Result.js';

export interface ExecuteQueryUseCase {
  executeQuery: (_userCommand: UserCommand) => Promise<Result<DatamartResponse>>;
}

export class ExecuteQueryUseCaseImpl implements ExecuteQueryUseCase {
  constructor(
    private readonly datamartRepository: DatamartRepository,
    private readonly catalogQueryRepository: CatalogQueryRepository,
    private readonly queryAccessRepository: QueryAccessRepository,
  ) {
    this.datamartRepository = datamartRepository;
    this.catalogQueryRepository = catalogQueryRepository;
    this.queryAccessRepository = queryAccessRepository;
  }

  async executeQuery(
    userCommand: UserCommand,
  ): Promise<Result<DatamartResponse>> {
    const queryCatalogItem: QueryCatalogItem
      = await this.catalogQueryRepository.find(userCommand.queryId);
    if (!queryCatalogItem.query) {
      return Result.failure(['cannot run requested query']);
    }

    try {
      const queryAccess = await this.queryAccessRepository.get(
        userCommand.queryId,
        userCommand.requesterId,
      );

      if (!queryAccess.areParamsValid(userCommand.params)) {
        return Result.failure(['No access to requested params']);
      }
    }
    catch {
      return Result.failure(['User is not allowed to run this query']);
    }

    const datamartQueryModel = new DatamartQueryModel({
      query: queryCatalogItem.query,
      paramValues: userCommand.params,
      paramDefinitions: queryCatalogItem.params,
    });
    if (!datamartQueryModel.isValid()) {
      return Result.failure(['cannot run requested query']);
    }

    const datamartResponse: DatamartResponse
      = await this.datamartRepository.find(datamartQueryModel);
    return Result.success(datamartResponse);
  }
}

export const executeQueryUseCase: ExecuteQueryUseCase
  = new ExecuteQueryUseCaseImpl(
    datamartRepository,
    catalogQueryRepository,
    queryAccessRepository,
  );

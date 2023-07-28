import {
  DatamartRepository,
  datamartRepository,
} from '../../infrastructure/DatamartRepository.js';
import {
  catalogQueryRepository,
  CatalogQueryRepository,
} from '../../infrastructure/CatalogQueryRepository.js';
import { DatamartQueryModel } from '../models/DatamartQuery.js';
import type { UserCommand } from '../commands/UserCommand.js';
import type { QueryCatalogItem } from '../models/QueryCatalogItem.js';
import { Result } from '../models/Result.js';
import type { DatamartResponse } from '../models/DatamartResponse.js';

export interface ExecuteQueryUseCase {
  executeQuery(_userCommand: UserCommand): Promise<Result<DatamartResponse>>;
}
class ExecuteQueryUseCaseImpl implements ExecuteQueryUseCase {
  constructor(
    private readonly datamartRepository: DatamartRepository,
    private readonly catalogQueryRepository: CatalogQueryRepository,
  ) {
    this.datamartRepository = datamartRepository;
    this.catalogQueryRepository = catalogQueryRepository;
  }

  async executeQuery(
    userCommand: UserCommand,
  ): Promise<Result<DatamartResponse>> {
    const queryCatalogItem: QueryCatalogItem =
      await this.catalogQueryRepository.find(userCommand.queryId);
    if (
      !queryCatalogItem.query ||
      !userCommand.isValid(queryCatalogItem.params)
    ) {
      return Result.failure(['cannot run requested query']);
    }

    const datamartQueryModel = new DatamartQueryModel({
      query: queryCatalogItem.query,
      paramValues: userCommand.params,
      paramDefinitions: queryCatalogItem.params,
    });
    if (!datamartQueryModel.isValid()) {
      return Result.failure(['cannot run requested query']);
    }
    const datamartResponse: DatamartResponse =
      await this.datamartRepository.find(datamartQueryModel);
    return Result.success(datamartResponse);
  }
}

export const executeQueryUseCase: ExecuteQueryUseCase =
  new ExecuteQueryUseCaseImpl(datamartRepository, catalogQueryRepository);

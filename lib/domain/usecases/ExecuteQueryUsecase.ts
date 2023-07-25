import {
  DatamartRepository,
  datamartRepository,
} from '../../infrastructure/DatamartRepository.ts';
import {
  catalogQueryRepository,
  CatalogQueryRepository,
} from '../../infrastructure/CatalogQueryRepository.ts';
import { DatamartResponse } from '../models/DatamartResponse.ts';
import { DatamartQueryModel } from '../models/DatamartQuery.ts';
import { UserCommand } from '../models/UserCommand.ts';
import { QueryCatalogItem } from '../models/QueryCatalogItem.ts';
import { Result } from '../models/Result.ts';

export interface ExecuteQueryUseCase {
  executeQuery(_userCommand: UserCommand): Promise<Result<string>>;
}
class ExecuteQueryUseCaseImpl implements ExecuteQueryUseCase {
  constructor(
    private readonly datamartRepository: DatamartRepository,
    private readonly catalogQueryRepository: CatalogQueryRepository,
  ) {
    this.datamartRepository = datamartRepository;
    this.catalogQueryRepository = catalogQueryRepository;
  }

  async executeQuery(userCommand: UserCommand): Promise<Result<string>> {
    const queryCatalogItem: QueryCatalogItem =
      await this.catalogQueryRepository.find(userCommand.queryId);
    if (!queryCatalogItem.query) {
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
    const datamartResponse = await this.datamartRepository.find(
      datamartQueryModel,
    );
    return Result.success(datamartResponse.result);
  }
}

export const executeQueryUseCase: ExecuteQueryUseCase =
  new ExecuteQueryUseCaseImpl(datamartRepository, catalogQueryRepository);

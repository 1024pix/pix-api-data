import {
  DatamartRepository,
  datamartRepository,
} from '../../infrastructure/DatamartRepository.ts';
import {
  catalogQueryRepository,
  CatalogQueryRepository,
} from '../../infrastructure/CatalogQueryDatasource.ts';
import { DatamartResponse } from '../models/DatamartResponse.ts';
import { DatamartQueryModel } from '../models/DatamartQuery.ts';
import { UserCommand } from '../models/UserCommand.ts';
import { QueryCatalogItem } from '../models/QueryCatalogItem.ts';
import { Result } from '../models/Result.ts';

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
    const query: QueryCatalogItem = await this.catalogQueryRepository.find(
      userCommand.queryId,
    );
    if (!query.query) {
      return Result.failure(['cannot run requested query']);
    }

    const datamartQueryModel = new DatamartQueryModel({
      query: query.query,
      paramValues: [],
      paramDefinitions: [],
    });
    if (!datamartQueryModel.isValid()) {
      return Result.failure(['cannot run requested query']);
    }
    const datamartResponse = await this.datamartRepository.find(
      datamartQueryModel,
    );
    return Result.success(datamartResponse);
  }
}

export const executeQueryUseCase: ExecuteQueryUseCase =
  new ExecuteQueryUseCaseImpl(datamartRepository, catalogQueryRepository);

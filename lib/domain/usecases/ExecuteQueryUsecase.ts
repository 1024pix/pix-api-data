import {
  DatamartRepository,
  datamartRepository,
} from '../../infrastructure/DatamartDatasource.ts';
import {
  catalogQueryRepository,
  CatalogQueryRepository,
} from '../../infrastructure/CatalogQueryDatasource.ts';
import { DatamartResponse } from '../models/DatamartResponse.ts';
import { DatamartQuery } from '../models/DatamartQuery.ts';
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
    const request: QueryCatalogItem = await this.catalogQueryRepository.find(
      userCommand.queryId,
    );
    if (!request.query) {
      return Result.failure(['cannot run requested query']);
    }

    const datamartQuery: DatamartQuery = {
      query: request.query,
      paramValues: [],
      paramDefinitions: [],
    };
    const datamartResponse = await this.datamartRepository.find(datamartQuery);
    return Result.success(datamartResponse);
  }
}

export const executeQueryUseCase: ExecuteQueryUseCase =
  new ExecuteQueryUseCaseImpl(datamartRepository, catalogQueryRepository);

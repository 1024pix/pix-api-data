import {
  DatamartRepository,
  datamartRepository,
} from '../../infrastructure/DatamartDatasource.ts';
import {
  catalogRequestRepository,
  CatalogRequestRepository,
} from '../../infrastructure/CatalogRequestDatasource.ts';
import { DatamartResponse } from '../models/DatamartResponse.ts';
import { DatamartRequest } from '../models/DatamartRequest.ts';
import { UserCommand } from '../models/UserCommand.ts';
import { RequestCatalogItem } from '../models/RequestCatalogItem.ts';
import { Result } from '../models/Result.ts';

export interface ExecuteQueryUseCase {
  executeQuery(_userCommand: UserCommand): Promise<Result<DatamartResponse>>;
}
class ExecuteQueryUseCaseImpl implements ExecuteQueryUseCase {
  constructor(
    private readonly datamartRepository: DatamartRepository,
    private readonly catalogRequestRepository: CatalogRequestRepository,
  ) {
    this.datamartRepository = datamartRepository;
    this.catalogRequestRepository = catalogRequestRepository;
  }

  async executeQuery(
    userCommand: UserCommand,
  ): Promise<Result<DatamartResponse>> {
    const request: RequestCatalogItem =
      await this.catalogRequestRepository.find(userCommand.requestId);
    if (!request.query) {
      return Result.failure(['cannot run requested query']);
    }

    const datamartRequest: DatamartRequest = {
      query: request.query,
      paramValues: [],
      paramDefinitions: [],
    };
    const datamartResponse = await this.datamartRepository.find(
      datamartRequest,
    );
    return Result.success(datamartResponse);
  }
}

export const executeQueryUseCase: ExecuteQueryUseCase =
  new ExecuteQueryUseCaseImpl(datamartRepository, catalogRequestRepository);

import {
  DatamartRepository,
  datamartRepository,
} from '../../infrastructure/DatamartDatasource.ts';
import { DatamartResponse } from '../models/DatamartResponse.ts';
import { DatamartRequest } from '../models/DatamartRequest.ts';
import { UserCommand } from '../models/UserCommand.ts';

export interface ExecuteQueryUseCase {
  executeQuery(_userCommand: UserCommand): Promise<DatamartResponse>;
}
class ExecuteQueryUseCaseImpl implements ExecuteQueryUseCase {
  constructor(private readonly datamartRepository: DatamartRepository) {
    this.datamartRepository = datamartRepository;
  }

  async executeQuery(_userCommand: UserCommand): Promise<DatamartResponse> {
    // TODO Get request catalog from user command
    const datamartRequest: DatamartRequest = {
      query: 'SELECT COUNT(*) FROM public.data_ref_academies',
      paramValues: [],
      paramDefinitions: [],
    };
    return this.datamartRepository.find(datamartRequest);
  }
}

export const executeQueryUseCase: ExecuteQueryUseCase =
  new ExecuteQueryUseCaseImpl(datamartRepository);

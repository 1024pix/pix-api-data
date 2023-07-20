import {
  DatamartRepository,
  datamartRepository,
} from '../infrastructure/DatamartDatasource.ts';
import { DatamartResponse } from './model/DatamartResponse.ts';
import { DatamartRequest } from './model/DatamartRequest.ts';

export interface ExecuteQueryUseCase {
  executeQuery(): Promise<DatamartResponse>;
}
class ExecuteQueryUseCaseImpl implements ExecuteQueryUseCase {
  constructor(private readonly datamartRepository: DatamartRepository) {}

  async executeQuery(): Promise<DatamartResponse> {
    // TODO Get request catalog
    const datamartRequest: DatamartRequest = {
      query: 'SELECT COUNT(*) FROM public.data_ref_academies',
      paramValues: [],
      paramDefinitions: [],
    };
    return datamartRepository.find(datamartRequest);
  }
}

export const executeQueryUseCase: ExecuteQueryUseCase =
  new ExecuteQueryUseCaseImpl(datamartRepository);

import { UUID } from 'crypto';
import { CatalogQueryRepository } from '../../../../lib/infrastructure/CatalogQueryRepository';
import { ParamType, QueryCatalogItem } from '../../../../lib/domain/models/QueryCatalogItem';
import { ExecuteQueryUseCaseImpl } from '../../../../lib/domain/usecases/ExecuteQueryUsecase';
import { DatamartRepository } from '../../../../lib/infrastructure/DatamartRepository';
import { DatamartResponse } from '../../../../lib/domain/models/DatamartResponse';
import { DatamartQueryModel } from '../../../../lib/domain/models/DatamartQuery';
import { expect } from '../../../test-helper';
import { UserCommand } from '../../../../lib/domain/commands/UserCommand';

describe('Unit | Domain | Usecases | ExecuteQueryUsecase', function () {

  describe('#executeQuery', function () {
    context('when query does not exist', function () {
      it('should return failed result', async function() {
        // given
        class DatamartRepositoryMock implements DatamartRepository {
          async find(_datamartQueryModel: DatamartQueryModel): Promise<DatamartResponse> {
            return { } as DatamartResponse;
          }
        }

        class QueryRepositoryMock implements CatalogQueryRepository {
          async find(_queryId: UUID): Promise<QueryCatalogItem> {
            return { query: undefined, params: [] } as QueryCatalogItem;
          }
        }

        const datamartRepository: DatamartRepository = new DatamartRepositoryMock();
        const queryRepository: CatalogQueryRepository = new QueryRepositoryMock();

        const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepository, queryRepository);

        const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

        const userCommand = {
          queryId,
          params: []
        } as UserCommand;

        // when
        const result = await executeQueryUsecase.executeQuery(userCommand);

        // then
        expect(result.isFailure).to.be.true;
        expect(result.errorMessages).to.deep.equal(['cannot run requested query']);
      });
    });

    context('when query exists', function () {

      context('when params are invalid', function () {

        it('should return failed result', async function() {
          // given
          const expectedResult = ['cannot run requested query']
          class DatamartRepositoryMock implements DatamartRepository {
            async find(_datamartQueryModel: DatamartQueryModel): Promise<DatamartResponse> {
              return { result: [] } as DatamartResponse;
            }
          }

          class QueryRepositoryMock implements CatalogQueryRepository {
            async find(_queryId: UUID): Promise<QueryCatalogItem> {
              return { query: 'select * from tests', params: [{ name: 'foo', type: ParamType.INT, mandatory: true }] } as QueryCatalogItem;
            }
          }

          const datamartRepository: DatamartRepository = new DatamartRepositoryMock();
          const queryRepository: CatalogQueryRepository = new QueryRepositoryMock();

          const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepository, queryRepository);

          const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

          const userCommand = {
            queryId,
            params: [{ name: 'foo', value: 'bar' }]
          } as UserCommand;

          // when
          const result = await executeQueryUsecase.executeQuery(userCommand);

          // then
          expect(result.isFailure).to.be.true;
          expect(result.errorMessages).to.deep.equal(expectedResult);
        });
      });

      context('when params are valid', function () {

        it('should return the query', async function() {
          // given
          const expectedResult = [{ test: Symbol('expected-result') }]
          class DatamartRepositoryMock implements DatamartRepository {
            async find(_datamartQueryModel: DatamartQueryModel): Promise<DatamartResponse> {
              return { result: expectedResult } as DatamartResponse;
            }
          }

          class QueryRepositoryMock implements CatalogQueryRepository {
            async find(_queryId: UUID): Promise<QueryCatalogItem> {
              return { query: 'select * from tests', params: [] } as QueryCatalogItem;
            }
          }

          const datamartRepository: DatamartRepository = new DatamartRepositoryMock();
          const queryRepository: CatalogQueryRepository = new QueryRepositoryMock();

          const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepository, queryRepository);

          const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

          const userCommand = {
            queryId,
            params: []
          } as UserCommand;

          // when
          const result = await executeQueryUsecase.executeQuery(userCommand);

          // then
          expect(result.isSuccess).to.be.true;
          expect(result.resultData.result).to.deep.equal(expectedResult);
        });
      });
    });
  });
});
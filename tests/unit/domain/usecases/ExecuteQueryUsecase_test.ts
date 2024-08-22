import type { UUID } from 'node:crypto';
import type { CatalogQueryRepository } from '../../../../lib/infrastructure/CatalogQueryRepository';
import type { QueryCatalogItem } from '../../../../lib/domain/models/QueryCatalogItem';
import { ParamType } from '../../../../lib/domain/models/QueryCatalogItem';
import { ExecuteQueryUseCaseImpl } from '../../../../lib/domain/usecases/ExecuteQueryUsecase';
import type { DatamartRepository } from '../../../../lib/infrastructure/DatamartRepository';
import type { DatamartResponse } from '../../../../lib/domain/models/DatamartResponse';
import type { DatamartQueryModel } from '../../../../lib/domain/models/DatamartQuery';
import { expect } from '../../../test-helper';
import type { UserCommand, UserCommandParam } from '../../../../lib/domain/commands/UserCommand';
import type { QueryAccessRepository } from '../../../../lib/infrastructure/QueryAccessRepository';
import { type QueryAccess, QueryAccessModel } from '../../../../lib/domain/models/QueryAccess';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Usecases | ExecuteQueryUsecase', function () {
  describe('#executeQuery', function () {
    context('when query does not exist', function () {
      it('should return failed result', async function () {
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

        class QueryAccessRepositoryMock implements QueryAccessRepository {
          async get(_queryId: UUID, _userId: UUID): Promise<QueryAccessModel> {
            return { } as QueryAccessModel;
          }
        }

        const datamartRepositoryMock = new DatamartRepositoryMock();
        const queryRepositoryMock = new QueryRepositoryMock();
        const queryAccessRepositoryMock = new QueryAccessRepositoryMock();

        const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepositoryMock, queryRepositoryMock, queryAccessRepositoryMock);

        const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const requesterId = 'c6eef19e-3de5-4b91-bcf0-70903af00551';

        const userCommand = {
          queryId,
          params: [],
          requesterId,
        } as UserCommand;

        // when
        const result = await executeQueryUsecase.executeQuery(userCommand);

        // then
        expect(result.isFailure).to.be.true;
        expect(result.errorMessages).to.deep.equal(['cannot run requested query']);
      });
    });

    context('when query exists', function () {
      context('when user is not allowed for this query', function () {
        it('should return failed result', async function () {
          // given
          const expectedResult = ['User is not allowed to run this query'];
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

          class QueryAccessRepositoryMock implements QueryAccessRepository {
            async get(_queryId: UUID, _userId: UUID): Promise<QueryAccessModel> {
              throw new NotFoundError('User not allowed to run this query');
            }
          }

          const datamartRepository: DatamartRepository = new DatamartRepositoryMock();
          const queryRepository: CatalogQueryRepository = new QueryRepositoryMock();
          const queryAccessRepository: QueryAccessRepository = new QueryAccessRepositoryMock();

          const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepository, queryRepository, queryAccessRepository);

          const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
          const requesterId = 'c6eef19e-3de5-4b91-bcf0-70903af00551';

          const userCommand = {
            queryId,
            params: [],
            requesterId,
          } as UserCommand;

          // when
          const result = await executeQueryUsecase.executeQuery(userCommand);

          // then
          expect(result.isFailure).to.be.true;
          expect(result.errorMessages).to.deep.equal(expectedResult);
        });
      });

      context('when user is allowed for this query', function () {
        context('when userCommand params are unauthorized', function () {
          it('should return failed result', async function () {
            // given
            const expectedError = ['No access to requested params'];
            class DatamartRepositoryMock implements DatamartRepository {
              async find(_datamartQueryModel: DatamartQueryModel): Promise<DatamartResponse> {
                return { result: [] } as DatamartResponse;
              }
            }

            class QueryRepositoryMock implements CatalogQueryRepository {
              async find(_queryId: UUID): Promise<QueryCatalogItem> {
                return { query: 'select * from tests', params: [] } as QueryCatalogItem;
              }
            }

            class QueryAccessModelMock extends QueryAccessModel {
              constructor(queryAccess: QueryAccess) {
                super(queryAccess);
              }

              override areParamsValid(_userCommandParams: UserCommandParam[]): boolean {
                return false;
              }
            }

            class QueryAccessRepositoryMock implements QueryAccessRepository {
              async get(_queryId: UUID, _userId: UUID): Promise<QueryAccessModel> {
                return new QueryAccessModelMock({} as QueryAccess);
              }
            }

            const datamartRepository: DatamartRepository = new DatamartRepositoryMock();
            const queryRepository: CatalogQueryRepository = new QueryRepositoryMock();
            const queryAccessRepository: QueryAccessRepository = new QueryAccessRepositoryMock();

            const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepository, queryRepository, queryAccessRepository);

            const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
            const requesterId = 'c6eef19e-3de5-4b91-bcf0-70903af00551';

            const userCommand = {
              queryId,
              params: [],
              requesterId,
            } as UserCommand;

            // when
            const result = await executeQueryUsecase.executeQuery(userCommand);

            // then
            expect(result.isFailure).to.be.true;
            expect(result.errorMessages).to.deep.equal(expectedError);
          });
        });

        context('when userCommand params are authorized', function () {
          context('when params are invalid', function () {
            it('should return failed result', async function () {
              // given
              const expectedResult = ['cannot run requested query'];
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

              class QueryAccessModelMock extends QueryAccessModel {
                constructor(queryAccess: QueryAccess) {
                  super(queryAccess);
                }

                override areParamsValid(_userCommandParams: UserCommandParam[]): boolean {
                  return true;
                }
              }

              class QueryAccessRepositoryMock implements QueryAccessRepository {
                async get(_queryId: UUID, _userId: UUID): Promise<QueryAccessModel> {
                  return new QueryAccessModelMock({} as QueryAccess);
                }
              }

              const datamartRepository: DatamartRepository = new DatamartRepositoryMock();
              const queryRepository: CatalogQueryRepository = new QueryRepositoryMock();
              const queryAccessRepository: QueryAccessRepository = new QueryAccessRepositoryMock();

              const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepository, queryRepository, queryAccessRepository);

              const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
              const requesterId = 'c6eef19e-3de5-4b91-bcf0-70903af00551';

              const userCommand = {
                queryId,
                params: [{ name: 'foo', value: 'bar' }],
                requesterId,
              } as UserCommand;

              // when
              const result = await executeQueryUsecase.executeQuery(userCommand);

              // then
              expect(result.isFailure).to.be.true;
              expect(result.errorMessages).to.deep.equal(expectedResult);
            });
          });

          context('when params are valid', function () {
            it('should return the query', async function () {
              // given
              const expectedResult = [{ test: Symbol('expected-result') }];
              class DatamartRepositoryMock implements DatamartRepository {
                async find(_datamartQueryModel: DatamartQueryModel): Promise<DatamartResponse> {
                  return { result: expectedResult } as DatamartResponse;
                }
              }

              class QueryRepositoryMock implements CatalogQueryRepository {
                async find(_queryId: UUID): Promise<QueryCatalogItem> {
                  return { query: 'select * from tests', params: [{ name: 'foo', type: ParamType.STRING, mandatory: true }] } as QueryCatalogItem;
                }
              }

              class QueryAccessModelMock extends QueryAccessModel {
                constructor(queryAccess: QueryAccess) {
                  super(queryAccess);
                }

                override areParamsValid(_userCommandParams: UserCommandParam[]): boolean {
                  return true;
                }
              }

              class QueryAccessRepositoryMock implements QueryAccessRepository {
                async get(_queryId: UUID, _userId: UUID): Promise<QueryAccessModel> {
                  return new QueryAccessModelMock({} as QueryAccess);
                }
              }

              const datamartRepository: DatamartRepository = new DatamartRepositoryMock();
              const queryRepository: CatalogQueryRepository = new QueryRepositoryMock();
              const queryAccessRepository: QueryAccessRepository = new QueryAccessRepositoryMock();

              const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepository, queryRepository, queryAccessRepository);

              const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
              const requesterId = 'c6eef19e-3de5-4b91-bcf0-70903af00551';

              const userCommand = {
                queryId,
                params: [{ name: 'foo', value: 'bar' }],
                requesterId,
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
  });
});

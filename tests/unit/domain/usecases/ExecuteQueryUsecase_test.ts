import { catalogQueryRepository } from '../../../../lib/infrastructure/CatalogQueryRepository.js';
import { ParamType } from '../../../../lib/domain/models/QueryCatalogItem.js';
import { ExecuteQueryUseCaseImpl } from '../../../../lib/domain/usecases/ExecuteQueryUsecase.js';
import { datamartRepository } from '../../../../lib/infrastructure/DatamartRepository.js';
import { expect, sinon } from '../../../test-helper.js';
import type { UserCommand, UserCommandParam } from '../../../../lib/domain/commands/UserCommand.js';
import { queryAccessRepository } from '../../../../lib/infrastructure/QueryAccessRepository.js';
import { type QueryAccess, QueryAccessModel } from '../../../../lib/domain/models/QueryAccess.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import type { DatamartResponse } from '../../../../lib/domain/models/DatamartResponse.js';

describe('Unit | Domain | Usecases | ExecuteQueryUsecase', function () {
  describe('#executeQuery', function () {
    context('when query does not exist', function () {
      it('should return failed result', async function () {
        // given

        sinon.stub(catalogQueryRepository, 'find').resolves({ query: undefined, params: [] });

        const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepository, catalogQueryRepository, queryAccessRepository);

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

          sinon.stub(catalogQueryRepository, 'find').resolves({ query: 'select * from tests', params: [{ name: 'foo', type: ParamType.INT, mandatory: true }] });
          sinon.stub(queryAccessRepository, 'get').throws(new NotFoundError('User not allowed to run this query'));

          const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepository, catalogQueryRepository, queryAccessRepository);

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
            const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
            const requesterId = 'c6eef19e-3de5-4b91-bcf0-70903af00551';

            const userCommand = {
              queryId,
              params: [],
              requesterId,
            } as UserCommand;

            const expectedError = ['No access to requested params'];
            sinon.stub(catalogQueryRepository, 'find').withArgs(queryId).resolves({ query: 'select * from tests', params: [] });

            class QueryAccessModelMock extends QueryAccessModel {
              constructor(queryAccess: QueryAccess) {
                super(queryAccess);
              }

              override areParamsValid(_userCommandParams: UserCommandParam[]): boolean {
                return false;
              }
            }

            sinon.stub(queryAccessRepository, 'get').withArgs(queryId, requesterId).resolves(new QueryAccessModelMock({} as QueryAccess));
            sinon.stub(datamartRepository, 'find').resolves({ result: [] });

            const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepository, catalogQueryRepository, queryAccessRepository);

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
              const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
              const requesterId = 'c6eef19e-3de5-4b91-bcf0-70903af00551';

              const userCommand = {
                queryId,
                params: [{ name: 'foo', value: 'bar' }],
                requesterId,
              } as UserCommand;

              class QueryAccessModelMock extends QueryAccessModel {
                constructor(queryAccess: QueryAccess) {
                  super(queryAccess);
                }

                override areParamsValid(_userCommandParams: UserCommandParam[]): boolean {
                  return true;
                }
              }

              const queryCatalogItem = { query: 'select * from tests', params: [{ name: 'foo', type: ParamType.INT, mandatory: true }] };
              sinon.stub(catalogQueryRepository, 'find').resolves(queryCatalogItem);
              sinon.stub(queryAccessRepository, 'get').withArgs(queryId, requesterId).resolves(new QueryAccessModelMock({} as QueryAccess));
              sinon.stub(datamartRepository, 'find').resolves({} as DatamartResponse);

              const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepository, catalogQueryRepository, queryAccessRepository);

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

              const queryId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
              const requesterId = 'c6eef19e-3de5-4b91-bcf0-70903af00551';

              const userCommand = {
                queryId,
                params: [{ name: 'foo', value: 'bar' }],
                requesterId,
              } as UserCommand;

              class QueryAccessModelMock extends QueryAccessModel {
                constructor(queryAccess: QueryAccess) {
                  super(queryAccess);
                }

                override areParamsValid(_userCommandParams: UserCommandParam[]): boolean {
                  return true;
                }
              }

              const queryCatalogItem = { query: 'select * from tests', params: [{ name: 'foo', type: ParamType.STRING, mandatory: true }] };
              sinon.stub(catalogQueryRepository, 'find').resolves(queryCatalogItem);
              sinon.stub(queryAccessRepository, 'get').withArgs(queryId, requesterId).resolves(new QueryAccessModelMock({} as QueryAccess));
              sinon.stub(datamartRepository, 'find').resolves({ result: expectedResult } as DatamartResponse);

              const executeQueryUsecase = new ExecuteQueryUseCaseImpl(datamartRepository, catalogQueryRepository, queryAccessRepository);

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

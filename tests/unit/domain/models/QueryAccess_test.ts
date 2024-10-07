import type { UserCommandParam } from '../../../../lib/domain/commands/UserCommand';
import type { QueryAccess } from '../../../../lib/domain/models/QueryAccess';
import { expect } from 'chai';
import { QueryAccessModel } from '../../../../lib/domain/models/QueryAccess';

describe('Unit | Domain | Models | QueryAccess', function () {
  describe('#areParamsValid', function () {
    context('when userCommandParams is allowed', function () {
      it('should return true', function () {
        // given
        const queryAccess: QueryAccess = {
          id: ['123'],
        };

        const userCommandParams: UserCommandParam[] = [{
          name: 'id',
          value: '123',
        }];

        // when
        const queryAccessModel = new QueryAccessModel(queryAccess);

        // then
        expect(queryAccessModel.areParamsValid(userCommandParams)).to.be.true;
      });
    });

    context('when userCommandParams is empty', function () {
      it('should return true', function () {
        // given
        const queryAccess: QueryAccess = {
          id: ['123'],
        };

        const userCommandParams: UserCommandParam[] = [];

        // when
        const queryAccessModel = new QueryAccessModel(queryAccess);

        // then
        expect(queryAccessModel.areParamsValid(userCommandParams)).to.be.true;
      });
    });

    context('when userCommandParams is not allowed', function () {
      it('should return false', function () {
        // given
        const queryAccess: QueryAccess = {
          id: ['123'],
        };

        const userCommandParams: UserCommandParam[] = [{ name: 'id', value: '456' }];

        // when
        const queryAccessModel = new QueryAccessModel(queryAccess);

        // then
        expect(queryAccessModel.areParamsValid(userCommandParams)).to.be.false;
      });
    });
  });
});

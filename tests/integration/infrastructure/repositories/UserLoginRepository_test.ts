import { expect, knexAPI, sinon } from '../../../test-helper.js';
import { userLoginRepository } from '../../../../lib/infrastructure/UserLoginRepository.js';
import { UserLogin } from '../../../../lib/domain/models/UserLogin.js';

describe('Integration | Repository | UserLoginRepository', function () {
  let userId;
  let user;

  beforeEach(async function () {
    userId = '26f6efcc-ce13-4b20-b6ea-5bebae6115af';
    user = await knexAPI('users')
      .insert({
        id: userId,
        username: 'foo',
        label: 'bar',
        hashed_password: 'hashedPassword',
      })
      .returning('*');
  });

  describe('#findByUserId', function () {
    afterEach(async function () {
      await knexAPI('user-logins').delete();
      await knexAPI('users').delete();
    });

    it('should return the found user-login', async function () {
      // given
      await knexAPI('user-logins').insert({
        id: 1,
        userId,
      });

      // when
      const result = await userLoginRepository.findByUserId(userId);

      // then
      expect(result).to.be.an.instanceOf(UserLogin);
      expect(result.id).to.equal(1);
    });

    it('should return null if no user is found', async function () {
      // given
      const nonExistentUserId = 'f427da8c-5a80-4df4-8485-0526f66a8d0e';

      // when
      const result = await userLoginRepository.findByUserId(nonExistentUserId);

      // then
      expect(result).to.be.null;
    });
  });

  describe('#create', function () {
    afterEach(async function () {
      await knexAPI('user-logins').delete();
      await knexAPI('users').delete();
    });

    it('should return the created user-login', async function () {
      // when
      const result = await userLoginRepository.create(userId);

      // then
      expect(result).to.be.an.instanceOf(UserLogin);
      expect(result.userId).to.equal(userId);
      expect(result.updatedAt).to.be.not.null;
      expect(result.failureCount).to.equal(0);
    });
  });

  describe('#update', function () {
    let clock;
    const now = new Date('2022-11-24');

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now });
    });

    afterEach(async function () {
      clock.restore();
      await knexAPI('user-logins').delete();
      await knexAPI('users').delete();
    });

    it('should return the updated user-login', async function () {
      // given
      const temporaryBlockedUntil = new Date('2022-10-10');

      const userLoginInDB = {
        id: 1,
        userId,
        failureCount: 10,
        temporaryBlockedUntil: '2021-12-12',
        blockedAt: null,
        lastLoggedAt: new Date('2022-10-10'),
        updatedAt: new Date('2022-10-10'),
        createdAt: new Date('2022-10-09'),
      };

      await knexAPI('user-logins').insert(userLoginInDB);

      const userLoginToUpdate = new UserLogin({
        ...userLoginInDB,
        temporaryBlockedUntil,
      });

      // when
      const result = await userLoginRepository.update(userLoginToUpdate);

      // then
      expect(result).to.be.an.instanceOf(UserLogin);
      expect(result).to.deep.equal({
        id: userLoginInDB.id,
        userId: userLoginInDB.userId,
        failureCount: 10,
        temporaryBlockedUntil,
        blockedAt: null,
        lastLoggedAt: userLoginInDB.lastLoggedAt,
        updatedAt: now,
      });
    });
  });

  describe('#findByUsername', function () {
    afterEach(async function () {
      await knexAPI('user-logins').delete();
      await knexAPI('users').delete();
    });

    it('should return the found user-login by username', async function () {
      // given
      const username = user[0].username;
      const userLoginInDB = {
        id: 1,
        userId,
        failureCount: 10,
        blockedAt: null,
        updatedAt: '2022-10-10',
        createdAt: new Date('2022-10-09'),
      };

      await knexAPI('user-logins').insert(userLoginInDB);

      // when
      const result = await userLoginRepository.findByUsername(username);

      // then
      expect(result).to.be.an.instanceOf(UserLogin);
      expect(result.id).to.equal(userLoginInDB.id);
    });

    it('should return null if no user is found', async function () {
      // given
      const nonExistentUsername = 'nonExisting@example.net';

      // when
      const result = await userLoginRepository.findByUsername(nonExistentUsername);

      // then
      expect(result).to.be.null;
    });
  });
});

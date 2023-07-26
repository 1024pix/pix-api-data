import { expect, catchErr, knexAPI, sinon } from '../../../test-helper.ts';
import { User, addUser } from '../../../../scripts/prod/add-user.ts';
import { encryptionService } from '../../../../lib/infrastructure/utils/EncryptionService.ts';

describe('Integration | scripts-prod | Add user', function () {
  afterEach(async function () {
    await knexAPI('users').delete();
  });

  it('should add user', async function () {
    // given
    const userToAdd: User = {
      username: 'fifi_brindacier',
      label: 'Une fille rousse très costaude',
      password: 'fifiDu66_muscles',
    };

    // when
    await addUser(userToAdd);

    // then
    const usersDTO = await knexAPI('users').select('*').orderBy('username');
    expect(usersDTO.length).to.equal(1);
    const arePasswordsIdentical = await encryptionService.checkPassword(
      userToAdd.password,
      usersDTO[0].password,
    );
    sinon.assert.match(usersDTO[0], {
      id: sinon.match.string,
      username: userToAdd.username,
      label: userToAdd.label,
      password: sinon.match.string,
      created_at: sinon.match.date,
    });
    expect(arePasswordsIdentical).to.be.true;
    const uuidRegExp: RegExp =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    expect(uuidRegExp.test(usersDTO[0].id)).to.be.true;
  });

  it('should throw an error when username already exists', async function () {
    // given
    await knexAPI('users').insert({
      username: 'fifi_brindacier',
      label: 'Une fille super costaude et rousse de surcroît',
      password: 'fifiDu31_pectoraux',
    });
    const userToAdd: User = {
      username: 'fifi_brindacier',
      label: 'Une fille rousse très costaude',
      password: 'fifiDu66_muscles',
    };

    // when
    await catchErr(addUser)(userToAdd);

    // then
    const usersDTO = await knexAPI('users').select('*').orderBy('username');
    expect(usersDTO.length).to.equal(1);
    expect(usersDTO[0].label).to.equal(
      'Une fille super costaude et rousse de surcroît',
    );
  });
});

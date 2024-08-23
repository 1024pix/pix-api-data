import type { UUID } from 'node:crypto';
import { knexAPI } from '../common/db/knex-database-connections.js';
import { UserLogin } from '../domain/models/UserLogin.js';

export interface UserLoginRepository {
  findByUserId: (_userId: UUID) => Promise<UserLogin>;
  create: (_userId: UUID) => Promise<UserLogin>;
  update: (_userLogin: UserLogin) => Promise<UserLogin>;
  findByUsername: (_username: string) => Promise<UserLogin>;
}

function _toDomain(userLoginDTO) {
  return new UserLogin({
    id: userLoginDTO.id,
    userId: userLoginDTO.userId,
    failureCount: userLoginDTO.failureCount,
    temporaryBlockedUntil: userLoginDTO.temporaryBlockedUntil,
    blockedAt: userLoginDTO.blockedAt,
    lastLoggedAt: userLoginDTO.lastLoggedAt,
    updatedAt: userLoginDTO.updatedAt,
  });
}

class UserLoginRepositoryImpl implements UserLoginRepository {
  async findByUserId(userId: string): Promise<UserLogin> {
    const foundUserLogin = await knexAPI
      .from('user-logins')
      .where({ userId })
      .first();
    return foundUserLogin ? _toDomain(foundUserLogin) : null;
  }

  async create(userId: UUID): Promise<UserLogin> {
    const [userLoginDTO] = await knexAPI('user-logins')
      .insert({ userId })
      .returning('*');
    return _toDomain(userLoginDTO);
  }

  async update(userLogin: UserLogin): Promise<UserLogin> {
    userLogin.updatedAt = new Date();
    const [userLoginDTO] = await knexAPI('user-logins')
      .where({ id: userLogin.id })
      .update(userLogin)
      .returning('*');
    return _toDomain(userLoginDTO);
  }

  async findByUsername(username: string): Promise<UserLogin> {
    const foundUserLogin = await knexAPI
      .select('user-logins.*')
      .from('user-logins')
      .orWhere('users.username', username.toLowerCase())
      .join('users', 'users.id', 'user-logins.userId')
      .first();

    return foundUserLogin ? _toDomain(foundUserLogin) : null;
  }
}

export const userLoginRepository: UserLoginRepository
  = new UserLoginRepositoryImpl();

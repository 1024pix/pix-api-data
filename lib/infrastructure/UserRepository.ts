import { knexAPI } from '../common/db/knex-database-connections.js';
import { User } from '../domain/models/User.ts';

export interface UserRepository {
  findByName(_name: string): Promise<User>;
}
class UserRepositoryImpl implements UserRepository {
  async findByName(name: string): Promise<User> {
    const result = await knexAPI('users')
      .select('*')
      .where('username', name)
      .first();
    if (!result) return null;
    return new User(result.id, result.username, result.hashed_password);
  }
}

export const userRepository: UserRepository = new UserRepositoryImpl();

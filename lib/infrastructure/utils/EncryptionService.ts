import bcrypt from 'bcrypt';
import { config } from '../../common/config.js';

export interface EncryptionService {
  hashPassword(_password: string): Promise<string>;
  checkPassword(
    _rawPassword: string,
    _hashedPassword: string,
  ): Promise<boolean>;
}
class EncryptionServiceImpl implements EncryptionService {
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(
      password,
      config.authentication.bcryptNumberOfSaltRounds,
    );
  }

  checkPassword(rawPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, hashedPassword);
  }
}

export const encryptionService: EncryptionService = new EncryptionServiceImpl();

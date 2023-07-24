// @ts-ignore
import { UUID } from 'crypto';
import { config } from '../../common/config.js';
// @ts-ignore
import jsonwebtoken from 'jsonwebtoken';

export interface JSONWebTokenService {
  generateToken(_userId: UUID): Promise<any>;
}
class JSONWebTokenImpl implements JSONWebTokenService {
  generateToken(userId: UUID): Promise<string> {
    return jsonwebtoken.sign(
      { user_id: userId },
      config.authentication.secret,
      { expiresIn: config.authentication.accessTokenLifespanMS },
    );
  }
}

export const jsonWebTokenService: JSONWebTokenService = new JSONWebTokenImpl();

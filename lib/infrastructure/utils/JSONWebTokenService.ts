// @ts-ignore
import { UUID } from 'crypto';
import { config } from '../../common/config.js';
import { Request } from '@hapi/hapi';
// @ts-ignore
import jsonwebtoken from 'jsonwebtoken';

export interface JSONWebTokenService {
  generateToken(_userId: UUID): Promise<string>;
  extractTokenFromHeader(_request: Request): string;
  getDecodedToken(_token: string): { user_id: UUID };
}

class JSONWebTokenImpl implements JSONWebTokenService {
  generateToken(userId: UUID): Promise<string> {
    return jsonwebtoken.sign(
      { user_id: userId },
      config.authentication.secret,
      { expiresIn: config.authentication.accessTokenLifespanMS },
    );
  }

  extractTokenFromHeader(request: Request): string {
    if (!request.headers.authorization) {
      return '';
    }
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return '';
    }
    return authorizationHeader.replace('Bearer ', '');
  }

  getDecodedToken(token: string): { user_id: UUID } {
    try {
      const { user_id } = jsonwebtoken.verify(
        token,
        config.authentication.secret,
      );
      return { user_id };
    } catch (err) {
      return null;
    }
  }
}

export const jsonWebTokenService: JSONWebTokenService = new JSONWebTokenImpl();

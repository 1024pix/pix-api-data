import { UUID } from 'crypto';
import { config } from '../../common/config.js';
import { Request } from '@hapi/hapi';
import jsonwebtoken from 'jsonwebtoken';

export type AuthenticationToken = {
  user_id: UUID;
};

export interface JSONWebTokenService {
  generateToken(_userId: UUID): Promise<string>;
  extractTokenFromHeader(_request: Request): string;
  getDecodedToken(_token: string): { user_id: UUID };
}

class JSONWebTokenImpl implements JSONWebTokenService {
  async generateToken(userId: UUID): Promise<string> {
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

  getDecodedToken(token: string): AuthenticationToken {
    try {
      const decodedToken = jsonwebtoken.verify(
        token,
        config.authentication.secret,
      ) as { user_id: UUID };
      return { user_id: decodedToken.user_id } as AuthenticationToken;
    } catch (err) {
      return null;
    }
  }
}

export const jsonWebTokenService: JSONWebTokenService = new JSONWebTokenImpl();

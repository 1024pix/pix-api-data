import { env, stdout } from 'node:process';
import * as dotenv from 'dotenv';
import ms from 'ms';

dotenv.config();

function _getLogForHumans(): boolean {
  const processOutputingToTerminal = stdout.isTTY;
  const forceJSONLogs = env.LOG_FOR_HUMANS === 'false';
  return processOutputingToTerminal && !forceJSONLogs;
}

function isFeatureEnabled(environmentVariable: string): boolean {
  return environmentVariable === 'true';
}
export interface Logging {
  enabled: boolean;
  logLevel: string;
  logForHumans: boolean;
}
export interface Authentication {
  accessTokenLifespanMS: number;
  secret: string;
  bcryptNumberOfSaltRounds: number;
}
export interface Config {
  environment: string;
  logging: Logging;
  authentication: Authentication;
}

function _getNumber(numberAsString: string, defaultValue: number): number {
  const number = Number.parseInt(numberAsString, 10);
  return Number.isNaN(number) ? defaultValue : number;
}

function buildConfiguration(): Config {
  const config = {
    environment: env.NODE_ENV || 'development',
    logging: {
      enabled: isFeatureEnabled(env.LOG_ENABLED),
      logLevel: env.LOG_LEVEL || 'info',
      logForHumans: _getLogForHumans(),
    },
    authentication: {
      accessTokenLifespanMS: ms(env.ACCESS_TOKEN_LIFESPAN || '20m'),
      secret: env.JWT_SECRET,
      bcryptNumberOfSaltRounds: _getNumber(
        env.BCRYPT_NUMBER_OF_SALT_ROUNDS,
        10,
      ),
    },
  };
  if (config.environment === 'test') {
    config.logging.enabled = false;
  }
  return config;
}

export const config = buildConfiguration();

import { env, stdout } from 'node:process';
import * as dotenv from 'dotenv';

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
  accessTokenLifespan: string;
  secret: string;
  bcryptNumberOfSaltRounds: number;
};
export interface Login {
  temporaryBlockingThresholdFailureCount: number;
  temporaryBlockingBaseTimeMs: number;
  blockingLimitFailureCount: number;
}

export interface Config {
  environment: string;
  logging: Logging;
  authentication: Authentication;
  login: Login;
};

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
      accessTokenLifespan: env.ACCESS_TOKEN_LIFESPAN || '20m',
      secret: env.JWT_SECRET,
      bcryptNumberOfSaltRounds: _getNumber(
        env.BCRYPT_NUMBER_OF_SALT_ROUNDS,
        10,
      ),
    },
    login: {
      temporaryBlockingThresholdFailureCount: _getNumber(
        env.LOGIN_TEMPORARY_BLOCKING_THRESHOLD_FAILURE_COUNT,
        10,
      ),
      temporaryBlockingBaseTimeMs: ms(env.LOGIN_TEMPORARY_BLOCKING_BASE_TIME || '2m'),
      blockingLimitFailureCount: _getNumber(env.LOGIN_BLOCKING_LIMIT_FAILURE_COUNT, 50),
    },
  };
  if (config.environment === 'test') {
    config.logging.enabled = false;
  }
  return config;
}

export const config = buildConfiguration();

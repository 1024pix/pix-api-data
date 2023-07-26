import * as dotenv from 'dotenv';
import ms from 'ms';

dotenv.config();

function _getLogForHumans(): boolean {
  const processOutputingToTerminal = process.stdout.isTTY;
  const forceJSONLogs = process.env.LOG_FOR_HUMANS === 'false';
  return processOutputingToTerminal && !forceJSONLogs;
}

function isFeatureEnabled(environmentVariable: string): boolean {
  return environmentVariable === 'true';
}
export type Logging = {
  enabled: boolean;
  logLevel: string;
  logForHumans: boolean;
};
export type Authentication = {
  accessTokenLifespanMS: number;
  secret: string;
  bcryptNumberOfSaltRounds: number;
};
export type Config = {
  environment: string;
  logging: Logging;
  authentication: Authentication;
};

function _getNumber(numberAsString: string, defaultValue: number): number {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultValue : number;
}

function buildConfiguration(): Config {
  return {
    environment: process.env.NODE_ENV || 'development',
    logging: {
      enabled: isFeatureEnabled(process.env.LOG_ENABLED),
      logLevel: process.env.LOG_LEVEL || 'info',
      logForHumans: _getLogForHumans(),
    },
    authentication: {
      accessTokenLifespanMS: ms(process.env.ACCESS_TOKEN_LIFESPAN || '20m'),
      secret: process.env.JWT_SECRET,
      bcryptNumberOfSaltRounds: _getNumber(
        process.env.BCRYPT_NUMBER_OF_SALT_ROUNDS,
        10,
      ),
    },
  };
}

export const config = buildConfiguration();

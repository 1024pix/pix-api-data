import * as dotenv from 'dotenv';
import ms from 'ms';

dotenv.config();

function _getLogForHumans() {
  const processOutputingToTerminal = process.stdout.isTTY;
  const forceJSONLogs = process.env.LOG_FOR_HUMANS === 'false';
  return processOutputingToTerminal && !forceJSONLogs;
}

function isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

function _getNumber(numberAsString, defaultValue) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultValue : number;
}

const configuration = (function () {
  const config = {
    environment: process.env.NODE_ENV || 'development',
    logging: {
      enabled: isFeatureEnabled(process.env.LOG_ENABLED),
      logLevel: process.env.LOG_LEVEL || 'info',
      logForHumans: _getLogForHumans(),
    },
    authentication: {
      bcryptNumberOfSaltRounds: _getNumber(
        process.env.BCRYPT_NUMBER_OF_SALT_ROUNDS,
        10,
      ),
    },
  };

  return config;
})();

export { configuration as config };

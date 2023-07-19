import * as dotenv from "dotenv";

dotenv.config();

function _getLogForHumans() {
  const processOutputingToTerminal = process.stdout.isTTY;
  const forceJSONLogs = process.env.LOG_FOR_HUMANS === "false";
  return processOutputingToTerminal && !forceJSONLogs;
}

function isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

const configuration = (function() {
  const config = {
    environment: process.env.NODE_ENV || 'development',
    logging: {
      enabled: isFeatureEnabled(process.env.LOG_ENABLED),
      logLevel: process.env.LOG_LEVEL || "info",
      logForHumans: _getLogForHumans()
    }
  };

  return config;
})();

export { configuration as config };

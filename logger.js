const { createLogger, transports, format } = require("winston");
const { combine, timestamp, label, printf } = format;

// Define the log format
const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// Create a logger instance
const logger = createLogger({
  format: combine(label({ label: "node-logger" }), timestamp(), logFormat),
  transports: [
    // Console transport for logging to the console
    new transports.Console(),
    // You can add more transports here, like file, HTTP, etc.
  ],
});

module.exports = logger;

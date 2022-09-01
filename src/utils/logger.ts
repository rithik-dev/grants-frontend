import P from 'pino'

const logger = P()

const defaultLogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
const logLevel = process.env.LOG_LEVEL || defaultLogLevel
logger.level = logLevel

export default logger
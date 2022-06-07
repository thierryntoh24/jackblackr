import config from "."

const
    DEFAULT_NAMESPACE = config.defaults.namespace,

    getDate = () => (new Date().toLocaleString()),

    info = (message: any, namespace?: string) => {
        typeof message === 'string'
            ? console.info(`[${getDate()}] [${namespace || DEFAULT_NAMESPACE}] [INFO] ${message}`)
            : console.info(`[${getDate()}] [${namespace || DEFAULT_NAMESPACE}] [INFO]`, message)
    },
    warn = (message: any, namespace?: string) => {
        typeof message === 'string'
            ? console.warn(`[${getDate()}] [${namespace || DEFAULT_NAMESPACE}] [WARN] ${message}`)
            : console.warn(`[${getDate()}] [${namespace || DEFAULT_NAMESPACE}] [WARN]`, message)
    },
    error = (message: any, namespace?: string) => {
        typeof message === 'string'
            ? console.error(`[${getDate()}] [${namespace || DEFAULT_NAMESPACE}] [ERROR] ${message}`)
            : console.error(`[${getDate()}] [${namespace || DEFAULT_NAMESPACE}] [ERROR]`, message)
    },
    logger = { info, warn, error }

export default logger
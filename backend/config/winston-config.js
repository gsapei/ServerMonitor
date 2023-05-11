const {
    createLogger,
    format,
    transports,
    config
} = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

config.npm.levels = { 
    emerg: 0, 
    alert: 1, 
    crit: 2, 
    error: 3, 
    warning: 4, 
    notice: 5, 
    info: 6, 
    debug: 7
    };

const options = {};
options.DESA = {
    console: {
        handleExceptions: true,        
        level: 'debug',
        levels: config.npm.levels,
        format: format.combine(
            format.timestamp({
                format: global.gConfig.timeFormat //'YYYY-MM-DD HH:mm:ss'
            }),
            format(info => {
                info.level = info.level.toUpperCase();
                return info;
            })(),
            format.colorize(),
            format.printf(info => {
                const args = info[Symbol.for('splat')] || [];
                const strArgs = args
                    .map(JSON.stringify)
                    .join(' ')
                    .replace(/['"]+/g, '');
                return `[${info.timestamp}] - [${info.level}]: ${info.message} ${strArgs}`;
            }))
    },
    file: {
        filename: 'application-%DATE%.log',
        dirname:'./log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '180d',        
        level: 'info',
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format(info => {
                info.level = info.level.toUpperCase();
                return info;
            })(),
            format.printf(info => {
                const args = info[Symbol.for('splat')] || [];
                const strArgs = args
                    .map(JSON.stringify)
                    .join(' ')
                    .replace(/['"]+/g, '');
                return `[${info.timestamp}] - [${info.level}]: ${info.message} ${strArgs}`;
            })
        )
    },
};

options.PRO = {
    console: {
        handleExceptions: true,        
        level: 'warning',
        levels: config.npm.levels,
        format: format.combine(
            format.timestamp({
                format: global.gConfig.timeFormat //'YYYY-MM-DD HH:mm:ss'
            }),
            format(info => {
                info.level = info.level.toUpperCase();
                return info;
            })(),
            format.colorize(),
            format.printf(info => {
                const args = info[Symbol.for('splat')] || [];
                const strArgs = args
                    .map(JSON.stringify)
                    .join(' ')
                    .replace(/['"]+/g, '');
                return `[${info.timestamp}] - [${info.level}]: ${info.message} ${strArgs}`;
            }))
    },
    file: {
        filename: 'application-%DATE%.log',
        dirname:'./log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '180d',        
        level: 'notice',
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format(info => {
                info.level = info.level.toUpperCase();
                return info;
            })(),
            format.printf(info => {
                const args = info[Symbol.for('splat')] || [];
                const strArgs = args
                    .map(JSON.stringify)
                    .join(' ')
                    .replace(/['"]+/g, '');
                return `[${info.timestamp}] - [${info.level}]: ${info.message} ${strArgs}`;
            })
        )
    },
};


function getLogger() {
    if (global.gConfig.environment === 'development'){
        return createLogger({
            transports: [
                new transports.Console(
                    options.DESA.console
                ),        
                new DailyRotateFile(
                    options.DESA.file
                )
            ]
        });
    } else {
        return createLogger({
            transports: [
                new transports.Console(
                    options.PRO.console
                ),        
                new DailyRotateFile(
                    options.PRO.file
                )
            ]
        });
    }
};

module.exports = getLogger();
import { createLogger, format, transports } from 'winston';
import "winston-daily-rotate-file"
const customFormat = format.combine(
    format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
    format.align(),
    format.printf((i) => `${i.level}: ${[i.timestamp]}: ${i.message}`)
);
const defaultOptions = {
    format: customFormat,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
};
const globalLogger = createLogger({
    format: customFormat,
    transports: [
        new transports.DailyRotateFile({
            filename: "logs/info-%DATE%.log",
            level: "info",
            ...defaultOptions,
        }),
        new transports.DailyRotateFile({
            filename: "logs/error-%DATE%.log",
            level: "error",
            ...defaultOptions,
        }),
    ],
});
const authLogger = createLogger({
    transports: [
        new transports.DailyRotateFile({
            filename: "logs/authLog-%DATE%.log",
            ...defaultOptions,
        }),
    ],
});
export {
    globalLogger,
    authLogger,
};
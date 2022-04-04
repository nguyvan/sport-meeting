import express from 'express';
import log4js from './log';

let log = log4js.getLogger("middleware");

export function logMiddleware(request: express.Request, response: express.Response, next: express.NextFunction) {
    log.debug(`${request.method} ${request.originalUrl}`);
    next();
}
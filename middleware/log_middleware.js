"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMiddleware = void 0;
const log_1 = __importDefault(require("./log"));
let log = log_1.default.getLogger("middleware");
function logMiddleware(request, response, next) {
    log.debug(`${request.method} ${request.originalUrl}`);
    next();
}
exports.logMiddleware = logMiddleware;

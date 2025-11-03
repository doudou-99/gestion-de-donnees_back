"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
let PrismaExceptionFilter = class PrismaExceptionFilter {
    catch(exception, host) {
        const context = host.switchToHttp();
        const request = context.getRequest();
        const response = context.getResponse();
        const status = common_1.HttpStatus.BAD_REQUEST;
        let body = {
            status,
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        let message = "";
        switch (exception.code) {
            case "P2002":
                body.status = common_1.HttpStatus.PRECONDITION_FAILED;
                message = "Unique constraint failed";
                break;
            case "P2015":
                body.status = common_1.HttpStatus.NOT_FOUND;
                message = `A related record could not be found`;
                break;
            case "P2025":
                body.status = common_1.HttpStatus.NOT_FOUND;
                message = `An operation failed because it depends on one or more records that were required but not found`;
                break;
            default:
                body.status = common_1.HttpStatus.BAD_REQUEST;
                message = "Bad Request";
                break;
        }
        response.status(status).json({
            ...body,
            message: message
        });
    }
};
exports.PrismaExceptionFilter = PrismaExceptionFilter;
exports.PrismaExceptionFilter = PrismaExceptionFilter = __decorate([
    (0, common_1.Catch)(library_1.PrismaClientKnownRequestError)
], PrismaExceptionFilter);
//# sourceMappingURL=prisma.exception.filter.js.map
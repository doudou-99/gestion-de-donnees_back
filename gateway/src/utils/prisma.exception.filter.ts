import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response } from "express";

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const request = context.getRequest<Request>();
        const response = context.getResponse<Response>();

        const status: number = HttpStatus.BAD_REQUEST;
        let body = {
            status,
            timestamp: new Date().toISOString(),
            path: request.url,
        }
        let message = "";
        switch(exception.code) {
            case "P2002":
                body.status = HttpStatus.PRECONDITION_FAILED
                message = "Unique constraint failed"
                break;
            case "P2015":
                body.status = HttpStatus.NOT_FOUND
                message = `A related record could not be found`
                break;
            case "P2025":
                body.status = HttpStatus.NOT_FOUND
                message = `An operation failed because it depends on one or more records that were required but not found`
                break;
            default:
                body.status = HttpStatus.BAD_REQUEST
                message = "Bad Request"
                break;
        }
        response.status(status).json({
            ...body,
            message: message
        });
    }
}
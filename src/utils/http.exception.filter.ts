import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Request, Response } from "express";
import { timestamp } from "rxjs";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const request = context.getRequest<Request>();
        const response = context.getResponse<Response>();

        response.json({
            status: exception.getStatus(),
            timestamp: new Date(Date.now()),
            path: request.url,
            message: exception.message
        });
    }
}
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const http_exception_filter_1 = require("./utils/http.exception.filter");
const prisma_exception_filter_1 = require("./utils/prisma.exception.filter");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(), new prisma_exception_filter_1.PrismaExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true
    }));
    app.use((0, cookie_parser_1.default)());
    app.use('/favicon.ico', (req, res) => res.status(204).end());
    const list = process.env.ORIGINS?.split(',').map(o => o.trim()) || [
        'http://localhost:5173',
        'http:localhost',
        'http://localhost:85',
        'https://gestion-app.duckdns.org',
    ];
    app.enableCors({ origin: (origin, callback) => {
            if (!origin || list.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        }, credentials: true });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Data management')
        .setDescription('API that allows each user to manage the files and groups.')
        .setVersion('1.0')
        .addTag('Data management')
        .addBearerAuth()
        .build();
    const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('swagger', app, documentFactory, {
        jsonDocumentUrl: 'swagger/json'
    });
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map
import { ValidationPipe } from '@nestjs/common';

export const globalValidationPipe = new ValidationPipe({
    whitelist: true,              // strip properties not in the DTO
    forbidNonWhitelisted: true,   // throw if unknown properties are sent
    transform: true,              // auto-transform payloads to DTO class instances
    transformOptions: {
        enableImplicitConversion: true, // convert primitives (e.g. string → number) automatically
    },
});
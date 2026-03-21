import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { buildAPIDocs } from './configs/api-docs.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors(configService.get('corsConfig'));

  (app as any).set('trust proxy', true);

  buildAPIDocs(app);

  const port = configService.get('serverConfig').port;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();

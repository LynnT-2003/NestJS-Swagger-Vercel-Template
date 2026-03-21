import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { loadEnvConfigs } from './configs/env.config';
import { buildMongoUri } from './configs/mongo-uri-builder';
import { DB_CONNECTION_NAMES } from './configs/db-connection-names';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [loadEnvConfigs],
    }),
    MongooseModule.forRootAsync({
      connectionName: DB_CONNECTION_NAMES.APP,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: buildMongoUri(configService.get('databaseConfig')!),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    @InjectConnection(DB_CONNECTION_NAMES.APP)
    private readonly dbConnection: Connection,
  ) { }

  onModuleInit() {
    this.dbConnection.on('connected', () => {
      this.logger.log(
        `MongoDB connected: ${this.dbConnection.name} (host: ${this.dbConnection.host})`,
      );

      const collections = this.dbConnection.collections;
      const names = Object.keys(collections);
      if (names.length > 0) {
        this.logger.log(`Collections found: ${names.join(', ')}`);
      } else {
        this.logger.warn('No collections found in this database yet.');
      }
    });

    this.dbConnection.on('error', (err) => {
      this.logger.error(`MongoDB connection error: ${err.message}`, err.stack);
    });

    this.dbConnection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });
  }
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { knexImport } from './infrastructure/KnexModule';

@Module({
  imports: [...knexImport],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

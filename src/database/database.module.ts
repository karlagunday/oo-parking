import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

/**
 * @todo `Global` decorator seems to not work on this one
 */
@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

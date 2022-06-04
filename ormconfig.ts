import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

const source = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/src/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: ['dist/src/database/migrations/*.js'],
});

export default source;

import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../models';
import { Asset } from '../models/Assets';
import { AssetType } from '../models/AssetTypes';

dotenv.config();

if (
    !process.env.DATABASE_NAME ||
    !process.env.DATABASE_USER ||
    !process.env.DATABASE_PASSWORD ||
    !process.env.DATABASE_HOST
) {
    console.log('Please set up the .env file');
    process.exit(1);
}

const AppDataSource = new DataSource({
    type: 'postgres',
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    entities: [User, Asset, AssetType],
    synchronize: true,
    // dropSchema: true,
    logging: true
});

export default AppDataSource;

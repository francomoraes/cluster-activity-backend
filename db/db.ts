import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Activity, Challenge, User, UserChallenge, UserWorkspace, Workspace } from '../models';

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
    entities: [User, Workspace, Challenge, UserWorkspace, UserChallenge, Activity],
    synchronize: true,
    logging: true,
    dropSchema: true
});

export default AppDataSource;

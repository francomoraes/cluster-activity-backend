import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import pg from 'pg';
import { Activity, Challenge, User, UserChallenge, UserWorkspace, Workspace } from '../models';

dotenv.config();

if (!process.env.DATABASE_NAME || !process.env.DATABASE_USER || !process.env.DATABASE_PASSWORD || !process.env.DATABASE_HOST) {
    console.log('Please set up the .env file');
    process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: 'postgres',
    dialectModule: pg
});

sequelize.addModels([User, Workspace, Challenge, UserWorkspace, UserChallenge, Activity]);

async function validateDBConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

validateDBConnection();

export default sequelize;

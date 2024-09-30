import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/User';
import dotenv from 'dotenv';
import AppDataSource from '../db/db';

dotenv.config();

interface MyJwtPayload extends JwtPayload {
    id?: number; // Assuming 'id' is a number; adjust the type as necessary
}

const getUserByToken = async (token: string) => {
    if (!token) {
        throw new Error('Token not provided');
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not defined');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as MyJwtPayload;

    const userId = decoded.id?.toString();

    if (!userId) {
        throw new Error('User ID not found in token');
    }

    const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId } });

    return user;
};

export default getUserByToken;

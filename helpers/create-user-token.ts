import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Request, Response } from 'express';

dotenv.config();

const createUserToken = (user: User, req: Request, res: Response) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        {
            expiresIn: '24h'
        }
    );

    res.status(200).json({
        message: 'User authenticated.',
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        },
        token
    });
};

export default createUserToken;

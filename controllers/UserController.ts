import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/User';
import createUserToken from '../helpers/create-user-token';
import getToken from '../helpers/get-token';
import getUserByToken from '../helpers/get-user-by-token';
import { sendVerificationEmail } from '../helpers/send-verification-email';
import { appController } from './appController';
import AppDataSource from '../db/db';

export interface MyToken extends JwtPayload {
    id?: string;
}

export class UserController extends appController {
    getEntity() {
        return {
            name: 'User',
            model: AppDataSource.getRepository(User)
        };
    }

    static async register(req: Request, res: Response) {
        const { name, email, password, confirmpassword } = req.body;

        // validations
        if (!name || !email || !password || !confirmpassword) {
            res.status(422).json({
                message: `Missing fields: ${!name ? 'name, ' : ''}${!email ? 'email, ' : ''}${
                    !password ? 'password, ' : ''
                }${!confirmpassword ? 'confirmpassword' : ''}`
            });
            return;
        }

        if (password !== confirmpassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const userRepository = AppDataSource.getRepository(User);
        const checkIfUserExists = await userRepository.findOne({ where: { email } });

        if (checkIfUserExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // create password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // create verification code
        const verificationCode = Math.random().toString(36).substring(7) || '';

        try {
            const newUser = userRepository.create({
                name,
                email,
                password: passwordHash,
                avatar: '',
                isVerified: false,
                verificationCode
            });

            await userRepository.save(newUser);

            sendVerificationEmail(newUser.email, verificationCode);

            const token = createUserToken(newUser, req, res);

            res.status(200).json({
                message: 'User registered.',
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    avatar: newUser.avatar,
                    verificationCode
                },
                token
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async login(req: Request, res: Response) {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(422).json({ message: 'All fields are required' });
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = createUserToken(user, req, res);

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
    }

    static async verifyEmail(req: Request, res: Response) {
        const { token: verificationCode } = req.query;

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { verificationCode: verificationCode as string }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = true;
        user.verificationCode = '';
        await userRepository.save(user);

        res.status(200).json({ message: 'User verified successfully' });
    }

    async getUserById(req: Request, res: Response): Promise<void> {
        return super.getById(req, res, 'id');
    }

    async editUser(req: Request, res: Response) {
        try {
            const token = getToken(req);

            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const user = await getUserByToken(token);

            if (!user) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            const { name, email, password, confirmpassword } = req.body;

            if (!name || !email) {
                return res.status(422).json({ message: 'Name and email are required' });
            }

            const userRepository = AppDataSource.getRepository(User);

            const checkIfUserExists = await userRepository.findOne({ where: { email } });

            if (user.email !== email && checkIfUserExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            user.name = name;
            user.email = email;

            if (req.file) {
                user.avatar = req.file.filename;
            }

            if (password && password !== confirmpassword) {
                return res.status(400).json({ message: 'Passwords do not match' });
            } else if (password && password === confirmpassword) {
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(password, salt);
                user.password = passwordHash;
            }

            await userRepository.save(user);

            return res.status(200).json({ message: 'User edited successfully', user });
        } catch (error) {
            return res.status(500).json({ message: (error as Error).message });
        }
    }

    async deleteUser(req: Request, res: Response) {
        return super.delete(req, res, 'id');
    }

    async getAllUsers(req: Request, res: Response) {
        return super.getAll(req, res);
    }

    static async checkUser(req: Request, res: Response) {
        let currentUser;

        if (req.headers.authorization) {
            const token = getToken(req);

            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET not defined');
            }

            let decoded: any = jwt.verify(token, process.env.JWT_SECRET);

            if (typeof decoded === 'object' && decoded && 'id' in decoded) {
                decoded = decoded as MyToken; // Now safely cast since we checked

                const userRepository = AppDataSource.getRepository(User);
                currentUser = await userRepository.findOne({
                    where: { id: decoded.id },
                    select: ['id', 'name', 'email', 'avatar'] // Exclude password
                });
            } else {
                throw new Error('Invalid token format');
            }
        } else {
            currentUser = null;
        }
        res.status(200).json({ user: currentUser });
    }
}

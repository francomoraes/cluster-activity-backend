import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/User';
import createUserToken from '../helpers/create-user-token';
import getToken from '../helpers/get-token';
import getUserByToken from '../helpers/get-user-by-token';
import { sendVerificationEmail } from '../helpers/send-verification-email';

export interface MyToken extends JwtPayload {
    id?: string;
}

export class UserController {
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

        const checkIfUserExists = await User.findOne({ where: { email } });

        if (checkIfUserExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // create password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // create verification code
        const verificationCode = Math.random().toString(36).substring(7) || '';

        try {
            const newUser = await User.create({
                name,
                email,
                password: passwordHash,
                avatar: null,
                isVerified: false,
                verificationCode
            });

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

        const user = await User.findOne({ where: { email } });

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

                currentUser = await User.findByPk(decoded.id, {
                    attributes: { exclude: ['password'] }
                });
            } else {
                throw new Error('Invalid token format');
            }
        } else {
            currentUser = null;
        }
        res.status(200).json({ user: currentUser });
    }

    static async getUserById(req: Request, res: Response) {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(422).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    }

    static async editUser(req: Request, res: Response) {
        const { id } = req.params;
        const token = getToken(req);

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const user = await getUserByToken(token);

        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const { name, email, password, confirmpassword } = req.body;

        if (req.file) {
            user.avatar = req.file.filename;
        }

        if (!name || !email) {
            res.status(422).json({ message: 'Name and email are required' });
            return;
        }

        const checkIfUserExists = await User.findOne({ where: { email } });

        if (user?.email !== email && checkIfUserExists) {
            return res.status(400).json({ error: 'Email already in use' });
        } else {
            user.email = email;
        }

        if (password !== confirmpassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        } else if (password && password === confirmpassword) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            user.password = passwordHash;
        }

        try {
            await User.update(
                {
                    name,
                    email,
                    avatar: user.avatar,
                    password: user.password
                },
                {
                    where: { id: id }
                }
            );

            res.send('User edited successfully');
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    static async getAllUsers(req: Request, res: Response) {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });

        return res.status(200).json({ users });
    }

    static async deleteUser(req: Request, res: Response) {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // check if user is the same as the one making the request
        const token = getToken(req);

        if (!token) return res.status(401).json({ message: 'No token provided' });

        const currentUser = await getUserByToken(token);

        if (!currentUser) return res.status(401).json({ message: 'Invalid token' });

        if (currentUser.id !== user.id)
            return res.status(401).json({ message: 'You can only delete your own account' });

        await User.destroy({ where: { id } });

        res.status(200).json({ message: `User ${user.name} deleted successfully` });
    }

    static async verifyEmail(req: Request, res: Response) {
        const { token: verificationCode } = req.query;

        const user = await User.findOne({ where: { verificationCode } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = true;
        user.verificationCode = '';
        await user.save();

        res.status(200).json({ message: 'User verified successfully' });
    }
}

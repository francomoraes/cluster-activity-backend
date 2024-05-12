import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/User';
import createUserToken from '../helpers/create-user-token';
import getToken from '../helpers/get-token';
import getUserByToken from '../helpers/get-user-by-token';

export interface MyToken extends JwtPayload {
    id?: number; // Adjust the type according to what you actually store in the token
}

export class UserController {
    static async register(req: Request, res: Response) {
        const { name, email, password, confirmpassword } = req.body;

        // validations
        if (!name || !email || !password || !confirmpassword) {
            res.status(422).json({
                message: `Missing fields: ${!name ? 'name, ' : ''}${
                    !email ? 'email, ' : ''
                }${!password ? 'password, ' : ''}${
                    !confirmpassword ? 'confirmpassword' : ''
                }`
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

        try {
            const newUser = await User.create({
                name,
                email,
                password: passwordHash,
                avatar: null
            });

            createUserToken(newUser, req, res);
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

        createUserToken(user, req, res);
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
}

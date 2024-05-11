const User = require('../models/User');
const bcrypt = require('bcrypt');
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const jwt = require('jsonwebtoken');
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class UserController {
    static async register(req, res) {
        
        const { name, email, password, confirmpassword } = req.body;

        // validations
        if (!name || !email || !password || !confirmpassword) {
            res.status(422).json({ message: `Missing fields: ${
                !name ? 'name, ' : ''
            }${
                !email ? 'email, ' : ''
            }${
                !password ? 'password, ' : ''
            }${
                !confirmpassword ? 'confirmpassword' : ''
            }` });
            return
        }

        if (password !== confirmpassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const checkIfUserExists = await User.findOne({ where: { email } })

        if (checkIfUserExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // create password

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: passwordHash,
            role: 'user',
            avatar: null
        })

        try {
            const newUser = await user.save();

            await createUserToken(newUser, req, res);

        } catch (error) {
            res.status(500).json({message: error });
        }
    }

    static async login(req, res) {
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

        await createUserToken(user, req, res);
    }

    static async checkUser(req, res) {
        let currentUser;
        
        if(req.headers.authorization) {
            const token = getToken(req);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            currentUser = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

        } else {
            currentUser = null;
        }
        res.status(200).json({ user: currentUser });
    }

    static async getUserById(req, res) {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(422).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    }

    static async editUser(req, res) {
        const { id } = req.params;
        const token = getToken(req);

        const user = await getUserByToken(token);

        const { name, email, password, confirmpassword } = req.body;

        if(req.file) {
            console.log("test file")
            user.avatar = req.file.filename;
        }

        if (!name || !email) {
            res.status(422).json({ message: 'Name and email are required' });
            return
        }

        const checkIfUserExists = await User.findOne({ where: { email } })

        if (user?.email !== email && checkIfUserExists) {
            return res.status(400).json({ error: 'Email already in use' });
        } else {
            user.email = email;
        }

        if(password !== confirmpassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        } else if (password && password === confirmpassword) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            user.password = passwordHash;
        }

        try {
            await User.update({
                name,
                email,
                avatar: user.avatar,
                password: user.password
            }, {
                where: { _id: id }
            });

            res.send("User edited successfully")
        } catch (error) {
            res.status(500).json({message: error });
        }

    }
}
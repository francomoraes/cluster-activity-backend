import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();
import { OAuth2Client } from 'google-auth-library';
import { findOrCreateUserFromGoogle } from '../helpers/find-or-create-google-user';
import { createUserToken } from '../helpers';
import { User } from '../models';

async function getUserData(access_token: string) {
    if (!access_token) {
        console.log('No access token');
        return;
    }

    const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    );

    console.log('response', response);

    const data = await response.json();

    return data;
}

router.get('/', async function (req, res, next) {
    const code = req.query.code;
    try {
        const redirectUrl = 'http://127.0.0.1:5000/auth/google';
        const oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUrl
        );

        const response = await oAuth2Client.getToken(code as any);
        await oAuth2Client.setCredentials(response.tokens);
        const userInfo = await getUserData(oAuth2Client.credentials.access_token as string);

        if (!userInfo) {
            return res.status(401).json({ message: 'Unable to retrieve user info' });
        }

        const user = (await findOrCreateUserFromGoogle(userInfo)) as User;

        const token = createUserToken(user, req, res);

        res.redirect(`http://localhost:5173/login?token=${token}`);
    } catch (error) {
        console.log('Error with signing in with Google', error);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
});

export default router;

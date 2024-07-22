import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();
import { OAuth2Client } from 'google-auth-library';

router.post('/', async function (req, res, next) {
    // allow cross origin requests to not be blocked by CORS
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    // allow the following HTTP methods
    res.header('Referrer-Policy', 'no-referrer-when-downgrade');

    const redirectUrl = 'http://127.0.0.1:5000/auth/google';

    const oAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUrl
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile openid email'],
        prompt: 'consent'
    });

    res.json({ url: authorizeUrl });
});

export default router;

import jwt from 'jsonwebtoken';
import getToken from './get-token';
import { Request, Response, NextFunction } from 'express';

interface CustomRequest extends Request {
    user?: any;
}

const checkToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = getToken(req);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const verified = jwt.verify(token, 'JWT_SECRET');
        console.log('verified', verified);

        req.user = verified;
        next();
    } catch (err: any) {
        console.error('Token verification failed:', err);
        return res
            .status(400)
            .json({ message: 'Invalid token', error: err.message });
    }
};

export default checkToken;

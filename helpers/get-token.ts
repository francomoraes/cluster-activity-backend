import { Request } from 'express';

const getToken = (req: Request) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    return token;
};

export default getToken;

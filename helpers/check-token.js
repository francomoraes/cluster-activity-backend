const jwt = require('jsonwebtoken');
const getToken = require('./get-token');

const checkToken = (req, res, next) => {

    if(!req.headers.authorization) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = getToken(req);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const verified = jwt.verify(token, 'JWT_SECRET');
        req.user = verified;
        next();
} catch (err) {
    console.error('Token verification failed:', err);
    return res.status(400).json({ message: 'Invalid token', error: err.message });
}


}

module.exports = checkToken;
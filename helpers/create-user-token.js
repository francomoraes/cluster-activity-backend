const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const createUserToken = (user, req, res) => {
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });

    res.status(200).json({
        message: 'User authenticated.',
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        },
        token
    })
}

module.exports = createUserToken;

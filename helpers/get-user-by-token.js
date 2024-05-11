const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getUserByToken = async (token) => {
    if(!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("decoded", decoded);

    const userId = decoded.id;

    const user = await User.findOne({ where: { _id: userId } });

    return user;
};

module.exports = getUserByToken;
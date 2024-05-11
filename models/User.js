const { DataTypes } = require('sequelize');

const db = require('../db/db');

//User

const User = db.define('User', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        require: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        require: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        require: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        require: false
    }
});

module.exports = User;
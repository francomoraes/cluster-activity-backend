const { DataTypes } = require('sequelize');

const db = require('../db/db');

//Workspace

const Workspace = db.define('Workspace', {
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
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        require: false
    },
    ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        require: true
    },
    isPrivate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        require: true,
        defaultValue: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        require: true,
        defaultValue: true
    },
    memberLimit: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        require: false
    }
});

module.exports = Workspace;
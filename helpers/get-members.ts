import { Request, Response } from 'express';
import { Model, ModelCtor } from 'sequelize-typescript';
import getToken from './get-token';
import getUserByToken from './get-user-by-token';
import { User } from '../models';

export const getMembers = async (
    req: Request,
    res: Response,
    entityModel: ModelCtor<Model<any, any>>,
    userEntityModel: ModelCtor<Model<any, any>>,
    entityId: string,
    idParamName: string
) => {
    try {
        // Step 1: Get Token
        const token = getToken(req);

        if (!token) {
            return res.status(401).json({ message: 'No token found' });
        }

        // Step 2: Get User by Token
        const user = await getUserByToken(token);

        if (!user) {
            return res.status(401).json({ message: 'No user found' });
        }

        // Step 3: Get All UsersIds linked to the Entity
        const users = await userEntityModel.findAll({
            where: {
                [idParamName]: entityId
            }
        });

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        const usersIds = users.map((user: any) => user.userId);

        // Step 4: Get All Users
        const members = await User.findAll({
            where: {
                id: usersIds
            },
            attributes: { exclude: ['password'] }
        });

        // Step 5: Return Members
        return res.status(200).json(members);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

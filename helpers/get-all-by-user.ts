import { Request, Response } from 'express';
import getToken from './get-token';
import getUserByToken from './get-user-by-token';
import { Model, ModelCtor, ModelStatic } from 'sequelize-typescript';

export const getAllByUser = async (
    req: Request,
    res: Response,
    entityModel: ModelCtor<Model<any, any>>,
    userEntityModel: ModelCtor<Model<any, any>>,
    userIdField: string
) => {
    try {
        const token = getToken(req);

        if (!token) {
            return res.status(401).json({ message: 'No token found' });
        }

        const user = await getUserByToken(token);

        if (!user) {
            return res.status(401).json({ message: 'No user found' });
        }

        const ownedEntities = await entityModel.findAll({
            where: { [userIdField]: user.id }
        });

        const joinedEntitiesIds = await userEntityModel.findAll({
            where: { userId: user.id }
        });

        const joinedEntities = await entityModel.findAll({
            where: {
                id: joinedEntitiesIds.map((rel) => rel[`${entityModel.name}Id` as keyof typeof rel]) // Fix here
            }
        });

        return res.status(200).json({
            ownedEntities,
            joinedEntities
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

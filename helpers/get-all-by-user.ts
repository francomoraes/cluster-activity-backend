import { Request, Response } from 'express';
import { Repository, In } from 'typeorm';
import getToken from './get-token';
import getUserByToken from './get-user-by-token';

export const getAllByUser = async (
    req: Request,
    res: Response,
    entityModel: Repository<any>,
    userEntityModel: Repository<any>,
    userIdField: string,
    entityIdField: string
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

        const ownedEntities = await entityModel.find({
            where: { [userIdField]: user.id }
        });

        const joinedEntityRelations = await userEntityModel.find({
            where: { user: { id: user.id } }
        });

        const joinedEntityIds = joinedEntityRelations.map((rel: any) => rel[entityIdField]);

        const joinedEntities = await entityModel.find({
            where: { id: In(joinedEntityIds) }
        });

        return res.status(200).json({
            ownedEntities,
            joinedEntities
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

import { Request, Response } from 'express';
import { Model, ModelCtor } from 'sequelize-typescript';
import getToken from './get-token';
import getUserByToken from './get-user-by-token';

export const joinEntity = async (
    req: Request,
    res: Response,
    entityModel: ModelCtor<Model<any, any>>,
    userEntityModel: ModelCtor<Model<any, any>>,
    entityId: string,
    idParamName: string
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

        const entity = await entityModel.findByPk(entityId);

        if (!entity) {
            return res.status(404).json({ message: `${entityModel.name} not found` });
        }

        const isMember = await userEntityModel.findOne({
            where: { userId: user.id, [idParamName]: entity.id }
        });

        console.log('isMember', isMember);

        if (isMember) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        console.log('Create Object', {
            userId: user.id,
            [idParamName]: entity.id
        });

        await userEntityModel.create({
            userId: user.id,
            [idParamName]: entity.id
        });

        return res.status(200).json({
            message: `User ${user.name} joined ${entityModel.name} ${entity.getDataValue(
                'name'
            )} successfully`
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

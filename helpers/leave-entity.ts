import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import getToken from './get-token';
import getUserByToken from './get-user-by-token';

export const leaveEntity = async (
    req: Request,
    res: Response,
    entityModel: Repository<any>,
    userEntityModel: Repository<any>,
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

        const entity = await entityModel.findOne({ where: { id: entityId } });

        if (!entity) {
            return res
                .status(404)
                .json({ message: `Entity ${entityModel.metadata.name} not found` });
        }

        const isMember = await userEntityModel.findOne({
            where: { user: { id: user.id }, [idParamName]: entity.id }
        });

        if (!isMember) {
            return res.status(400).json({ message: 'User is not a member' });
        }

        await userEntityModel.delete({ user: { id: user.id }, [idParamName]: entity.id });

        return res.status(200).json({
            message: `User ${user.name} left ${entityModel.metadata.name} ${entity.getDataValue(
                'name'
            )} successfully`
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

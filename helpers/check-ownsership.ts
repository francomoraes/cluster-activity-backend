import { Request, Response, NextFunction } from 'express';
import getToken from '../helpers/get-token';
import getUserByToken from '../helpers/get-user-by-token';
import { Workspace } from '../models/Workspace';
import { Challenge } from '../models/Challenge';
import { Activity } from '../models/Activity';
import AppDataSource from '../db/db';

interface CustomRequest extends Request {
    user?: any;
    entity?: any;
}

const entityConfig = {
    workspace: { model: Workspace, ownerRelation: 'user' },
    challenge: { model: Challenge, ownerRelation: 'user' },
    activity: { model: Activity, ownerRelation: 'challenge.user' }
};

const checkOwnership = (
    entityType: 'workspace' | 'challenge' | 'activity',
    entityIdParam: string,
    roles: ('owner' | 'admin')[] = ['owner']
) => {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        const token = getToken(req);

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await getUserByToken(token);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const entityId = req.params[entityIdParam];
        const entityInfo = entityConfig[entityType];

        if (!entityInfo) {
            return res.status(400).json({ message: 'Invalid entity type' });
        }

        const entityRepository = AppDataSource.getRepository(entityInfo.model);
        const entity = await entityRepository.findOne({
            where: { id: entityId },
            relations: entityInfo.ownerRelation.split('.')
        });

        if (!entity) {
            return res.status(404).json({
                message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found`
            });
        }

        const ownerId = entityInfo.ownerRelation
            .split('.')
            .reduce((acc: any, curr: string) => acc?.[curr], entity)?.id;

        const isOwner = user.id === ownerId;
        const isAdmin =
            roles.includes('admin') && (await checkIfAdmin(user.id, entityType, entity));

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: `You are not authorized to edit this ${entityType}. Please reach out to the owner.`
            });
        }

        req.user = user;
        req.entity = entity;

        next();
    };
};

const checkIfAdmin = async (
    userId: string,
    entityType: 'workspace' | 'challenge' | 'activity',
    entity: any
) => {
    switch (entityType) {
        case 'workspace':
            // Implement logic to check if the user is an admin of the workspace
            break;
        case 'challenge':
            // Implement logic to check if the user is an admin of the challenge
            break;
        case 'activity':
            const challenge = await AppDataSource.getRepository(Challenge).findOne({
                where: { id: entity.challengeId },
                relations: ['user']
            });
            return userId === challenge?.user.id;
        default:
            return false;
    }
};

export default checkOwnership;

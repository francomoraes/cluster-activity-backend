import { Request, Response, NextFunction } from 'express';
import getToken from '../helpers/get-token';
import getUserByToken from '../helpers/get-user-by-token';
import { Workspace } from '../models/Workspace';
import { Challenge } from '../models/Challenge';
import { Activity } from '../models/Activity';

interface CustomRequest extends Request {
    user?: any;
    entity?: any;
}

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

        let entity;
        switch (entityType) {
            case 'workspace':
                entity = await Workspace.findByPk(req.params[entityIdParam]);
                break;
            case 'challenge':
                entity = await Challenge.findByPk(req.params[entityIdParam]);
                break;
            case 'activity':
                entity = await Activity.findByPk(req.params[entityIdParam]);
                break;
            default:
                return res.status(400).json({ message: 'Invalid entity type' });
        }

        if (!entity) {
            return res
                .status(404)
                .json({
                    message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found`
                });
        }

        // Check ownership or admin role
        const isOwner = user.id === entity.ownerId;
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
            // Implement your logic to check if the user is an admin of the workspace
            break;
        case 'challenge':
            // Implement your logic to check if the user is an admin of the challenge
            break;
        case 'activity':
            // Check if the user is the owner of the challenge related to the activity
            const challenge = await Challenge.findByPk(entity.challengeId);
            return userId === challenge?.ownerId;
        default:
            return false;
    }
};

export default checkOwnership;

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

const checkOwnership = (entityType: 'workspace' | 'challenge' | 'activity', entityIdParam: string) => {
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
            return res.status(404).json({ message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found` });
        }

        if (user.id !== entity.ownerId) {
            return res.status(403).json({
                message: `You are not authorized to edit this ${entityType}. Please reach out to the owner.`
            });
        }

        // Attach user and entity to req for further use in next middleware or controller
        req.user = user;
        req.entity = entity;

        next();
    };
};

export default checkOwnership;

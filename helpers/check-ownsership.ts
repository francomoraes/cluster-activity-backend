import { Request, Response, NextFunction } from 'express';
import getToken from '../helpers/get-token';
import getUserByToken from '../helpers/get-user-by-token';
import { Workspace } from '../models/Workspace';

interface CustomRequest extends Request {
    user?: any;
    workspace?: any;
}

export const checkOwnership = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const token = getToken(req);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await getUserByToken(token);

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Assuming you pass workspaceId through req.params
    const workspace = await Workspace.findByPk(req.params.id);

    if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
    }

    if (user.id !== workspace.ownerId) {
        return res.status(403).json({
            message:
                'You are not authorized to edit this workspace. Please reach out to the owner.'
        });
    }

    // Attach user and workspace to req for further use in next middleware or controller
    req.user = user;
    req.workspace = workspace;

    next();
};

import { Activity, Challenge, User, Workspace } from '../models';
import { appController } from './appController';
import { Request, Response } from 'express';
import { getToken, getUserByToken } from '../helpers';
import { validateEntity } from '../helpers/validate-entity';

export class ActivityController extends appController {
    getEntity() {
        return {
            name: 'Activity',
            model: Activity
        };
    }

    protected async beforeCreate(data: any, req: Request) {
        const { title, description, type, duration, ...rest } = data;
        const { workspaceId, challengeId } = req.params;
        const missingFields: string[] = [];

        if (!title) missingFields.push('title');
        if (!type) missingFields.push('type');
        if (!workspaceId) missingFields.push('workspaceId');
        if (!challengeId) missingFields.push('challengeId');

        if (missingFields.length > 0) {
            throw new Error(`Missing fields: ${missingFields.join(', ')}`);
        }

        if (!req.res) throw new Error('Response object not found');

        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', req.res);
        if (!workspace) throw new Error('Workspace not found');

        const challenge = await validateEntity(Challenge, challengeId, 'Challenge', req.res);
        if (!challenge) throw new Error('Challenge not found');

        const token = getToken(req);
        if (!token) throw new Error('No token found');

        const user = await getUserByToken(token);
        if (!user) throw new Error('No user found');

        const activityData = {
            ...rest,
            title,
            description,
            type,
            duration,
            ownerId: user.id,
            challengeId
        };

        if (req?.file?.filename) {
            activityData.image = req.file.filename;
        }

        return activityData;
    }

    protected async afterCreate(activity: any, _req: Request): Promise<any> {
        return activity;
    }

    async update(req: Request, res: Response) {
        const { activityId } = req.params;
        const { ...rest } = req.body;

        const image = req?.file?.filename;

        try {
            const activity = await Activity.findByPk(activityId);

            if (!activity) {
                res.status(404).json({ message: 'Activity not found' });
                return;
            }

            const updatedActivity = await activity.update({
                image: image || activity.image,
                ...rest
            });

            res.status(200).json({
                message: `Activity ${updatedActivity.title} updated successfully`,
                updatedActivity
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllByChallenge(req: Request, res: Response) {
        const { challengeId } = req.params;

        try {
            const activities = await Activity.findAll({
                where: { challengeId }
            });

            res.status(200).json(activities);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        super.getById(req, res, 'activityId');
    }

    async delete(req: Request, res: Response) {
        super.delete(req, res, 'activityId');
    }
}

import { Activity, Challenge, Workspace } from '../models';
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

    async create(req: Request, res: Response) {
        const { workspaceId, challengeId } = req.params;
        const { title, description, type, duration, ...rest } = req.body;

        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

        const challenge = await validateEntity(Challenge, challengeId, 'Challenge', res);
        if (!challenge) return;

        const image = req?.file?.filename;

        let missingFields = [];
        if (!title) missingFields.push('title');
        if (!image) missingFields.push('image');
        if (!type) missingFields.push('type');

        if (missingFields.length > 0) {
            res.status(400).json({ message: `Missing fields: ${missingFields.join(', ')}` });
            return;
        }

        try {
            const token = getToken(req);

            if (!token) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const user = await getUserByToken(token);

            if (!user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const newActivity = await Activity.create({
                ownerId: user.id,
                challengeId,
                title,
                description,
                type,
                duration,
                image,
                ...rest
            });

            res.status(201).json({
                message: `Activity ${newActivity.title} created successfully`,
                newActivity
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
        const { activityId } = req.params;

        try {
            const activity = await Activity.findByPk(activityId);

            if (!activity) {
                res.status(404).json({ message: 'Activity not found' });
                return;
            }

            res.status(200).json(activity);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
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

    async delete(req: Request, res: Response) {
        const { activityId } = req.params;

        try {
            const activity = await Activity.findByPk(activityId);

            if (!activity) {
                res.status(404).json({ message: 'Activity not found' });
                return;
            }

            await activity.destroy();

            res.status(200).json({ message: 'Activity deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

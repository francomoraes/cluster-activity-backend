import { Activity } from '../models';
import { appController } from './appController';
import { Request, Response } from 'express';
import { getToken, getUserByToken } from '../helpers';

export class ActivityController extends appController {
    getEntity() {
        return {
            name: 'Activity',
            model: Activity
        };
    }

    async create(req: Request, res: Response) {
        const { challengeId } = req.params;
        const { title, description, type, duration, ...rest } = req.body;

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
                userId: user.id,
                challengeId,
                title,
                description,
                type,
                duration,
                image,
                ...rest
            });

            res.status(201).json({ message: `Activity ${newActivity.title} created successfully`, newActivity });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

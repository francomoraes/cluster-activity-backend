import { Challenge } from '../models/Challenge';
import { Request, Response } from 'express';
import { appController } from './appController';
import { getToken, getUserByToken } from '../helpers';

export class ChallengeController extends appController {
    getEntity() {
        return {
            name: 'Challenge',
            model: Challenge
        };
    }

    async create(req: Request, res: Response) {
        const { workspaceId } = req.params;
        const { name, description, startDate, endDate, ...rest } = req.body;

        // validations
        let missingFields = [];
        if (!name) missingFields.push('name');
        if (!description) missingFields.push('description');

        if (missingFields.length > 0) {
            res.status(422).json({
                message: `Missing fields: ${missingFields.join(', ')}`
            });
            return;
        }

        try {
            const token = getToken(req);

            if (!token) {
                res.status(401).json({ message: 'No token found' });
                return;
            }

            const user = await getUserByToken(token);

            if (!user) {
                res.status(401).json({ message: 'No user found' });
                return;
            }

            const newChallenge = await Challenge.create({
                workspaceId,
                name,
                description,
                startDate,
                endDate,
                ownerId: user.id,
                isActive: true,
                ...rest
            });

            res.status(201).json(newChallenge);
        } catch (error: any) {
            console.log('error', error);
            res.status(500).json({ message: error.message });
        }
    }

    async getAllByWorkspace(req: Request, res: Response) {
        const { workspaceId } = req.params;
        try {
            const challenges = await Challenge.findAll({
                where: { workspaceId }
            });
            res.status(200).json(challenges);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        const { challengeId } = req.params;

        try {
            const entity = await this.model.findByPk(challengeId);

            if (!entity) {
                res.status(404).json({
                    message: `${this.name} not found`
                });
                return;
            }

            res.status(200).json(entity);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        const { challengeId } = req.params;
        const data = req.body;

        try {
            const entity = await this.model.findByPk(challengeId);

            if (!entity) {
                res.status(404).json({
                    message: `${this.name} not found`
                });
                return;
            }

            if (req.file) {
                data.image = req.file.filename;
            }

            await entity.update(data);

            res.status(200).json(entity);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        console.log('req.params', req.params);

        const { challengeId } = req.params;
        try {
            const challenge = await Challenge.findByPk(challengeId);

            if (!challenge) {
                res.status(404).json({ message: 'Challenge not found' });
                return;
            }

            await challenge.destroy();

            res.status(200).json({ message: 'Challenge deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

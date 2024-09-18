import { Challenge } from '../models/Challenge';
import { Request, Response } from 'express';
import { appController } from './appController';
import { getToken, getUserByToken } from '../helpers';
import { User, UserChallenge, Workspace } from '../models';
import { validateEntity } from '../helpers/validate-entity';

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
        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

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

            await UserChallenge.create({
                userId: user.id,
                challengeId: newChallenge.id
            });

            res.status(201).json(newChallenge);
        } catch (error: any) {
            console.log('error', error);
            res.status(500).json({ message: error.message });
        }
    }

    async getAllByWorkspace(req: Request, res: Response) {
        const { workspaceId } = req.params;
        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

        try {
            const challenges = await Challenge.findAll({
                where: { workspaceId }
            });
            res.status(200).json(challenges);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getParticipants(req: Request, res: Response) {
        const { workspaceId, challengeId } = req.params;

        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

        try {
            const challenge = await Challenge.findByPk(challengeId);

            if (!challenge) {
                res.status(404).json({ message: 'Challenge not found' });
                return;
            }

            const users = await UserChallenge.findAll({
                where: {
                    challengeId: challenge.id
                }
            });

            if (users.length === 0) {
                res.status(404).json({ message: 'No participants found' });
                return;
            }

            const userIds = users.map((user) => user.userId);

            const participants = await User.findAll({
                where: {
                    id: userIds
                },
                attributes: { exclude: ['password'] }
            });

            res.status(200).json(participants);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        const { workspaceId, challengeId } = req.params;

        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

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
        const { workspaceId, challengeId } = req.params;
        const data = req.body;

        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

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
        const { workspaceId, challengeId } = req.params;

        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

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

    async joinChallenge(req: Request, res: Response) {
        const { workspaceId, challengeId } = req.params;

        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

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

        try {
            const challenge = await Challenge.findByPk(challengeId);

            if (!challenge) {
                res.status(404).json({ message: 'Challenge not found' });
                return;
            }

            // check if user is already part of the challenge
            const isParticipant = await UserChallenge.findOne({
                where: {
                    userId: user.id,
                    challengeId
                }
            });

            if (isParticipant) {
                res.status(400).json({ message: 'User is already part of this challenge' });
                return;
            }

            await UserChallenge.create({
                userId: user.id,
                challengeId: challenge.id
            });

            res.status(200).json({
                message: `User ${user.name} joined challenge ${challenge?.name}`
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async leaveChallenge(req: Request, res: Response) {
        const { workspaceId, challengeId } = req.params;

        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

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

        try {
            const challenge = await Challenge.findByPk(challengeId);

            if (!challenge) {
                res.status(404).json({ message: 'User is not part of this challenge' });
                return;
            }

            // check if user is already part of the challenge
            const isParticipant = await UserChallenge.findOne({
                where: {
                    userId: user.id,
                    challengeId
                }
            });

            if (!isParticipant) {
                res.status(400).json({ message: 'User is not part of this challenge' });
                return;
            }

            await UserChallenge.destroy({
                where: {
                    userId: user.id,
                    challengeId
                }
            });

            res.status(200).json({ message: `User ${user.name} left challenge ${challenge.name}` });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

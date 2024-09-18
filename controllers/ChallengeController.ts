import { Request, Response } from 'express';

import { User, UserChallenge, Workspace, Challenge } from '../models';

import { appController } from './appController';

import { getToken, getUserByToken } from '../helpers';
import { validateEntity } from '../helpers/validate-entity';
import { getMembers } from '../helpers/get-members';
import { joinEntity } from '../helpers/join-entity';
import { leaveEntity } from '../helpers/leave-entity';

export class ChallengeController extends appController {
    getEntity() {
        return {
            name: 'Challenge',
            model: Challenge
        };
    }

    getIncludes() {
        return [
            {
                model: User,
                as: 'owner',
                attributes: ['id', 'name', 'email']
            }
        ];
    }

    // Specific pre-create behavior
    protected async beforeCreate(data: any, req: Request) {
        const token = getToken(req);
        if (!token) throw new Error('No token found');

        const user = await getUserByToken(token);
        if (!user) throw new Error('No user found');

        return { ...data, ownerId: user.id, isActive: true };
    }

    // Specific post-create behavior
    protected async afterCreate(workspace: any, req: Request) {
        const token = getToken(req);

        if (!token) {
            throw new Error('No token found');
        }

        const user = await getUserByToken(token);

        if (!user) {
            throw new Error('No user found');
        }

        // Create relation with user
        await UserChallenge.create({
            userId: user.id,
            workspaceId: workspace.id
        });
        return workspace;
    }

    async update(req: Request, res: Response): Promise<void> {
        return super.update(req, res, 'challengeId');
    }

    async delete(req: Request, res: Response): Promise<void> {
        return super.delete(req, res, 'challengeId');
    }

    async getById(req: Request, res: Response): Promise<void> {
        return super.getById(req, res, 'challengeId');
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

        return getMembers(req, res, Challenge, UserChallenge, challengeId, 'challengeId');
    }

    async joinChallenge(req: Request, res: Response) {
        const { workspaceId, challengeId } = req.params;

        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

        return joinEntity(req, res, Challenge, UserChallenge, challengeId, 'challengeId');
    }

    async leaveChallenge(req: Request, res: Response) {
        const { workspaceId, challengeId } = req.params;

        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

        return leaveEntity(req, res, Challenge, UserChallenge, challengeId, 'challengeId');
    }
}

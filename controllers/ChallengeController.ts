import { Request, Response } from 'express';
import { User, UserChallenge, Workspace, Challenge } from '../models';
import { appController } from './appController';
import { getToken, getUserByToken } from '../helpers';
import { validateEntity } from '../helpers/validate-entity';
import { getMembers } from '../helpers/get-members';
import { joinEntity } from '../helpers/join-entity';
import { leaveEntity } from '../helpers/leave-entity';
import AppDataSource from '../db/db';

export class ChallengeController extends appController {
    getEntity() {
        return {
            name: 'Challenge',
            model: AppDataSource.getRepository(Challenge)
        };
    }

    // getIncludes() {
    //     return [
    //         {
    //             model: User,
    //             as: 'owner',
    //             attributes: ['id', 'name', 'email']
    //         }
    //     ];
    // }

    // Pre-create behavior (validates and adds extra fields)
    protected async beforeCreate(data: any, req: Request) {
        const { name, description, startDate, endDate, ...rest } = data;
        const { workspaceId } = req.params;
        const missingFields: string[] = [];

        // Validate required fields
        if (!name) missingFields.push('name');
        if (!description) missingFields.push('description');
        if (!workspaceId) missingFields.push('workspaceId');

        if (missingFields.length > 0) {
            throw new Error(`Missing fields: ${missingFields.join(', ')}`);
        }

        if (!req.res) throw new Error('Response object not found');
        // Validate the workspace existence
        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', req.res);
        if (!workspace) throw new Error('Workspace not found');

        // Handle token and user validation
        const token = getToken(req);
        if (!token) throw new Error('No token found');

        const user = await getUserByToken(token);
        if (!user) throw new Error('No user found');

        // Add ownerId, workspaceId, and isActive fields
        const challengeData = {
            ...rest,
            name,
            description,
            startDate,
            endDate,
            ownerId: user.id,
            workspaceId,
            isActive: true
        };

        // If there's an uploaded file (e.g., image), add it to the data
        if (req.file) {
            challengeData.image = req.file.filename;
        }

        return challengeData;
    }

    // Post-create behavior (creating UserChallenge association)
    protected async afterCreate(challenge: any, req: Request) {
        const token = getToken(req);
        if (!token) throw new Error('No token found');

        const user = await getUserByToken(token);
        if (!user) throw new Error('No user found');

        // Create UserChallenge association
        const userChallengeRepository = AppDataSource.getRepository(UserChallenge);
        const userChallenge = userChallengeRepository.create({
            user,
            challenge
        });

        await userChallengeRepository.save(userChallenge);

        return challenge;
    }

    // Overriding update to include req.file (handling file uploads)
    async update(req: Request, res: Response): Promise<void> {
        const { challengeId } = req.params;
        const data = req.body;

        try {
            const challengeRepository = AppDataSource.getRepository(Challenge);
            const challenge = await challengeRepository.findOne({ where: { id: challengeId } });

            if (!challenge) {
                res.status(404).json({ message: `${this.name} not found` });
                return;
            }

            // If there's an uploaded file, include it in the update data
            if (req.file) {
                data.image = req.file.filename;
            }

            challengeRepository.merge(challenge, data);
            await challengeRepository.save(challenge);

            res.status(200).json(challenge);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    // Other methods (getById, delete, joinChallenge, leaveChallenge) remain the same
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
            const challengeRepository = AppDataSource.getRepository(Challenge);
            const challenges = await challengeRepository.find({
                where: { workspace: { id: workspaceId } }
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

        return getMembers(
            req,
            res,
            AppDataSource.getRepository(Challenge),
            AppDataSource.getRepository(UserChallenge),
            challengeId,
            'challengeId'
        );
    }

    async joinChallenge(req: Request, res: Response) {
        const { workspaceId, challengeId } = req.params;

        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

        return joinEntity(
            req,
            res,
            AppDataSource.getRepository(Challenge),
            AppDataSource.getRepository(UserChallenge),
            challengeId,
            'challengeId'
        );
    }

    async leaveChallenge(req: Request, res: Response) {
        const { workspaceId, challengeId } = req.params;

        const workspace = await validateEntity(Workspace, workspaceId, 'Workspace', res);
        if (!workspace) return;

        return leaveEntity(
            req,
            res,
            AppDataSource.getRepository(Challenge),
            AppDataSource.getRepository(UserChallenge),
            challengeId,
            'challengeId'
        );
    }
}

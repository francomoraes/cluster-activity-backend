import { Request, Response } from 'express';
import { User, UserWorkspace, Workspace } from '../models';
import { appController } from './appController';
import { getAllByUser } from '../helpers/get-all-by-user';
import { getMembers } from '../helpers/get-members';
import { joinEntity } from '../helpers/join-entity';
import { leaveEntity } from '../helpers/leave-entity';
import getToken from '../helpers/get-token';
import getUserByToken from '../helpers/get-user-by-token';
import AppDataSource from '../db/db';

export class WorkspaceController extends appController {
    getEntity() {
        return {
            name: 'Workspace',
            model: AppDataSource.getRepository(Workspace)
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

    // Pre-create behavior (validates and adds extra fields)
    protected async beforeCreate(data: any, req: Request) {
        const { name, description, isPrivate } = data;
        const missingFields: string[] = [];

        // Validate required fields
        if (!name) missingFields.push('name');
        if (!description) missingFields.push('description');

        if (missingFields.length > 0) {
            throw new Error(`Missing fields: ${missingFields.join(', ')}`);
        }

        // Handle token and user validation
        const token = getToken(req);
        if (!token) throw new Error('No token found');

        const user = await getUserByToken(token);
        if (!user) throw new Error('No user found');

        // Add ownerId and isActive fields
        const workspaceData = {
            ...data,
            ownerId: user.id,
            isActive: true,
            memberLimit: null,
            image: null
        };

        // If there's an uploaded file (e.g., image), add it to the data
        if (req.file) {
            workspaceData.image = req.file.filename;
        }

        return workspaceData;
    }

    // Post-create behavior (creating UserWorkspace association)
    protected async afterCreate(workspace: any, req: Request) {
        const token = getToken(req);
        if (!token) throw new Error('No token found');

        const user = await getUserByToken(token);
        if (!user) throw new Error('No user found');

        // Create UserWorkspace association
        const userWorkspaceRepository = AppDataSource.getRepository(UserWorkspace);
        const userWorkspace = userWorkspaceRepository.create({
            user,
            workspace
        });

        await userWorkspaceRepository.save(userWorkspace);

        return workspace;
    }

    // Overriding update to include req.file (handling file uploads)
    async update(req: Request, res: Response): Promise<void> {
        const { workspaceId } = req.params;
        const data = req.body;

        try {
            const workspaceRepository = AppDataSource.getRepository(UserWorkspace);
            const workspace = await workspaceRepository.findOne({
                where: { workspace: { id: workspaceId } }
            });
            if (!workspace) {
                res.status(404).json({ message: 'Workspace not found' });
                return;
            }

            // If there's an uploaded file, include it in the update data
            if (req.file) {
                data.image = req.file.filename;
            }

            workspaceRepository.merge(workspace, data);
            await workspaceRepository.save(workspace);

            res.status(200).json({ message: 'Workspace updated successfully', workspace });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        return super.delete(req, res, 'workspaceId');
    }

    async getById(req: Request, res: Response): Promise<void> {
        return super.getById(req, res, 'workspaceId');
    }

    async getAllByUser(req: Request, res: Response) {
        return getAllByUser(
            req,
            res,
            AppDataSource.getRepository(Workspace),
            AppDataSource.getRepository(UserWorkspace),
            'ownerId',
            'workspaceId'
        );
    }

    async joinWorkspace(req: Request, res: Response) {
        const { workspaceId } = req.params;
        return joinEntity(
            req,
            res,
            AppDataSource.getRepository(Workspace),
            AppDataSource.getRepository(UserWorkspace),
            workspaceId,
            'workspaceId'
        );
    }

    async leaveWorkspace(req: Request, res: Response) {
        const { workspaceId } = req.params;
        return leaveEntity(
            req,
            res,
            AppDataSource.getRepository(Workspace),
            AppDataSource.getRepository(UserWorkspace),
            workspaceId,
            'workspaceId'
        );
    }

    async getMembers(req: Request, res: Response) {
        const { workspaceId } = req.params;
        return getMembers(
            req,
            res,
            AppDataSource.getRepository(Workspace),
            AppDataSource.getRepository(UserWorkspace),
            workspaceId,
            'workspaceId'
        );
    }
}

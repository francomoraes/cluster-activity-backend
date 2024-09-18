import { Request, Response } from 'express';

import { User, UserWorkspace, Workspace } from '../models';

import { appController } from './appController';

import { getAllByUser } from '../helpers/get-all-by-user';
import { getMembers } from '../helpers/get-members';
import { joinEntity } from '../helpers/join-entity';
import { leaveEntity } from '../helpers/leave-entity';
import getToken from '../helpers/get-token';
import getUserByToken from '../helpers/get-user-by-token';

export class WorkspaceController extends appController {
    getEntity() {
        return {
            name: 'Workspace',
            model: Workspace
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
        await UserWorkspace.create({
            userId: user.id,
            workspaceId: workspace.id
        });
        return workspace;
    }

    async update(req: Request, res: Response): Promise<void> {
        return super.update(req, res, 'workspaceId');
    }

    async delete(req: Request, res: Response): Promise<void> {
        return super.delete(req, res, 'workspaceId');
    }

    async getAllByUser(req: Request, res: Response) {
        return getAllByUser(req, res, Workspace, UserWorkspace, 'ownerId');
    }

    // Inside WorkspaceController
    async getById(req: Request, res: Response): Promise<void> {
        return super.getById(req, res, 'workspaceId');
    }

    async joinWorkspace(req: Request, res: Response) {
        const { workspaceId } = req.params;
        return joinEntity(req, res, Workspace, UserWorkspace, workspaceId, 'workspaceId');
    }

    async leaveWorkspace(req: Request, res: Response) {
        const { workspaceId } = req.params;
        return leaveEntity(req, res, Workspace, UserWorkspace, workspaceId, 'workspaceId');
    }

    async getMembers(req: Request, res: Response) {
        const { workspaceId } = req.params;
        return getMembers(req, res, Workspace, UserWorkspace, workspaceId, 'workspaceId');
    }
}

import { Workspace } from '../models/Workspace';
import { Request, Response } from 'express';
import { appController } from './appController';
import getToken from '../helpers/get-token';
import getUserByToken from '../helpers/get-user-by-token';
import { User, UserWorkspace } from '../models';

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

    async create(req: Request, res: Response) {
        const { name, description, isPrivate } = req.body;

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

            const newWorkspace = await Workspace.create({
                name,
                description,
                isPrivate,
                ownerId: user.id,
                isActive: true,
                memberLimit: null,
                image: null
            });

            await UserWorkspace.create({
                userId: user.id,
                workspaceId: newWorkspace.id
            });

            res.status(201).json(newWorkspace);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const workspaces = await Workspace.findAll();

            res.status(200).json(workspaces);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllByUser(req: Request, res: Response) {
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

            const ownedWorkspaces = await Workspace.findAll({
                where: {
                    ownerId: user.id
                }
            });

            const joinedWorkspacesIds = await UserWorkspace.findAll({
                where: {
                    userId: user.id
                }
            });

            const joinedMinusOwned = joinedWorkspacesIds.filter(
                (workspace) => !ownedWorkspaces.map((w) => w.id).includes(workspace.workspaceId)
            );

            const joinedWorkspaces = await Workspace.findAll({
                where: {
                    id: joinedMinusOwned.map((w) => w.workspaceId)
                }
            });

            if (ownedWorkspaces.length === 0 && joinedWorkspaces.length === 0) {
                res.status(404).json({
                    message: 'No workspaces found'
                });
                return;
            }

            if (ownedWorkspaces.length === 0 && joinedWorkspaces.length > 0) {
                res.status(200).json({ ownedWorkspaces: 'No owned workspaces', joinedWorkspaces });
                return;
            }

            if (ownedWorkspaces.length > 0 && joinedWorkspaces.length === 0) {
                res.status(200).json({ ownedWorkspaces, joinedWorkspaces: 'No joined workspaces' });
                return;
            }

            res.status(200).json({ ownedWorkspaces, joinedWorkspaces });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getMembers(req: Request, res: Response) {
        const { workspaceId } = req.params;

        try {
            const workspace = await Workspace.findByPk(workspaceId);

            if (!workspace) {
                res.status(404).json({
                    message: 'Workspace not found'
                });
                return;
            }

            const users = await UserWorkspace.findAll({
                where: {
                    workspaceId: workspace.id
                }
            });

            if (users.length === 0) {
                res.status(404).json({
                    message: 'No members found'
                });
                return;
            }

            const userIds = users.map((user) => user.userId);

            const members = await User.findAll({
                where: {
                    id: userIds
                },
                attributes: { exclude: ['password'] }
            });

            res.status(200).json(members);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        const { workspaceId } = req.params;

        try {
            const entity = await this.model.findByPk(workspaceId);

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
        const { workspaceId } = req.params;
        const { name, description, isPrivate, isActive, memberLimit } = req.body;

        try {
            const workspace = await Workspace.findByPk(workspaceId);

            if (!workspace) {
                res.status(404).json({
                    message: 'Workspace not found'
                });
                return;
            }

            if (req.file) {
                workspace.image = req.file.filename;
            }

            await workspace.update({
                name,
                description,
                isPrivate,
                isActive,
                memberLimit,
                image: workspace.image
            });

            res.status(200).json({ message: 'Workspace updated sucessfuly', workspace });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        const { workspaceId } = req.params;

        try {
            const workspace = await Workspace.findByPk(workspaceId);

            if (!workspace) {
                res.status(404).json({
                    message: 'Workspace not found'
                });
                return;
            }

            await workspace.destroy();

            res.status(204).json({ message: 'Workspace deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async joinWorkspace(req: Request, res: Response) {
        const { workspaceId } = req.params;

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
            const workspace = await Workspace.findByPk(workspaceId);

            if (!workspace) {
                res.status(404).json({ message: 'Workspace not found' });
                return;
            }

            // check if user isn't already a member
            const isMember = await UserWorkspace.findOne({
                where: {
                    userId: user.id,
                    workspaceId: workspace.id
                }
            });

            if (isMember) {
                res.status(400).json({ message: 'User is already a member of this workspace' });
                return;
            }

            await UserWorkspace.create({
                userId: user.id,
                workspaceId: workspace.id
            });

            res.status(200).json({
                message: `User ${user.name} joined workspace ${workspace.name} successfully`
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async leaveWorkspace(req: Request, res: Response) {
        const { workspaceId } = req.params;

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
            const workspace = await Workspace.findByPk(workspaceId);

            if (!workspace) {
                res.status(404).json({ message: 'Workspace not found' });
                return;
            }

            // check if user is owner
            if (workspace.ownerId === user.id) {
                res.status(400).json({ message: 'Owner cannot leave workspace' });
                return;
            }

            // check if user is a member
            const isMember = await UserWorkspace.findOne({
                where: {
                    userId: user.id,
                    workspaceId: workspace.id
                }
            });

            if (!isMember) {
                res.status(400).json({ message: 'User is not a member of this workspace' });
                return;
            }

            await UserWorkspace.destroy({
                where: {
                    userId: user.id,
                    workspaceId: workspace.id
                }
            });

            res.status(200).json({
                message: `User ${user.name} left workspace ${workspace.name} successfully`
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

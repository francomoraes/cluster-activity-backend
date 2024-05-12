import getToken from '../helpers/get-token';
import getUserByToken from '../helpers/get-user-by-token';
import { Workspace } from '../models/Workspace';
import { Request, Response } from 'express';

export class WorkspaceController {
    static async createWorkspace(req: Request, res: Response) {
        const { name, description, isPrivate, ownerId } = req.body;

        // validations
        let missingFields = [];
        if (!name) missingFields.push('name');
        if (!description) missingFields.push('description');
        if (!ownerId) missingFields.push('ownerId');

        if (missingFields.length > 0) {
            res.status(422).json({
                message: `Missing fields: ${missingFields.join(', ')}`
            });
            return;
        }

        try {
            const newWorkspace = await Workspace.create({
                name,
                description,
                isPrivate,
                ownerId,
                isActive: true,
                memberLimit: null,
                image: null
            });

            res.status(201).json(newWorkspace);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getWorkspaces(req: Request, res: Response) {
        try {
            const workspaces = await Workspace.findAll();

            res.status(200).json(workspaces);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getWorkspaceById(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const workspace = await Workspace.findByPk(id);

            if (!workspace) {
                res.status(404).json({ message: 'Workspace not found' });
                return;
            }

            res.status(200).json(workspace);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async updateWorkspace(req: Request, res: Response) {
        const { id } = req.params;
        const { name, description, isPrivate, isActive, memberLimit } =
            req.body;

        try {
            const workspace = await Workspace.findByPk(id);

            if (!workspace) {
                res.status(404).json({ message: 'Workspace not found' });
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

            res.status(200).json(workspace);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async deleteWorkspace(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const deleted = await Workspace.destroy({ where: { id: id } });

            if (deleted) {
                res.status(200).json({
                    message: 'Workspace deleted successfully'
                });
            } else {
                res.status(404).json({ message: 'Workspace not found' });
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

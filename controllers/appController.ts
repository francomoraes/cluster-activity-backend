import { Request, Response } from 'express';

export abstract class appController {
    name: string;
    model: any;

    constructor() {
        const entity = this.getEntity();
        this.name = entity.name;
        this.model = entity.model;
    }

    abstract getEntity(): { name: string; model: any };

    getIncludes(): any[] {
        return [];
    }

    async create(req: Request, res: Response) {
        const data = req.body;

        try {
            const newEntity = await this.model.create(data);

            res.status(201).json(newEntity);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const items = await this.model.findAll();
            res.json(items);
        } catch (error: unknown) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const entity = await this.model.findByPk(id);

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
        const { id } = req.params;
        const data = req.body;

        try {
            const entity = await this.model.findByPk(id);

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
        const { id } = req.params;

        try {
            const entity = await this.model.findByPk(id);

            if (!entity) {
                res.status(404).json({
                    message: `${this.name} not found`
                });
                return;
            }

            await entity.destroy();

            res.status(200).json({
                message: `${this.name} deleted successfully`
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

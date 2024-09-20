import { Request, Response } from 'express';

export abstract class appController {
    name: string;
    model: any;

    constructor() {
        const entity = this.getEntity();
        this.name = entity.name;
        this.model = entity.model;
    }

    // Abstract method that child controllers must implement
    abstract getEntity(): { name: string; model: any };

    // Pre-create hook for child classes to override
    protected async beforeCreate(data: any, req: Request): Promise<any> {
        return data;
    }

    // Post-create hook for child classes to override
    protected async afterCreate(entity: any, req: Request): Promise<any> {
        return entity;
    }

    getIncludes(): any[] {
        return [];
    }

    async create(req: Request, res: Response) {
        let data = req.body;

        try {
            data = await this.beforeCreate(data, req); // Custom behavior before creation
            const newEntity = await this.model.create(data);
            await this.afterCreate(newEntity, req); // Custom behavior after creation

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

    async getById(req: Request, res: Response, idParamName: string): Promise<void> {
        const id = req.params[idParamName];

        if (!id) {
            res.status(400).json({
                message: 'Missing id parameter'
            });
            return;
        }

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

    async update(req: Request, res: Response, idParamName: string): Promise<void> {
        const id = req.params[idParamName];
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

    async delete(req: Request, res: Response, idParamName: string): Promise<void> {
        const id = req.params[idParamName];

        if (!id) {
            res.status(400).json({
                message: 'Missing id parameter'
            });
            return;
        }

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

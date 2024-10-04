// src/controllers/AssetController.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import { appController } from './appController';
import { getAllByUser } from '../helpers/get-all-by-user';
import getToken from '../helpers/get-token';
import getUserByToken from '../helpers/get-user-by-token';
import AppDataSource from '../db/db';
import { Asset } from '../models';

export class AssetController extends appController {
    // Define the entity name and repository
    getEntity() {
        return {
            name: 'Asset',
            model: AppDataSource.getRepository(Asset)
        };
    }

    // Define the relationships to include when fetching entities
    getIncludes() {
        return [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }
        ];
    }

    // Pre-create behavior (validates and adds extra fields)
    protected async beforeCreate(data: any, req: Request) {
        const { asset_ticker, asset_qty, avg_price, current_price, currency } = data;
        const missingFields: string[] = [];

        // Validate required fields
        if (!asset_ticker) missingFields.push('asset_ticker');
        if (!asset_qty) missingFields.push('asset_qty');
        if (!avg_price) missingFields.push('avg_price');
        if (!current_price) missingFields.push('current_price');
        if (!currency) missingFields.push('currency');

        if (missingFields.length > 0) {
            throw new Error(`Missing fields: ${missingFields.join(', ')}`);
        }

        // Handle token and user validation
        const token = getToken(req);
        if (!token) throw new Error('No token found');

        const user = await getUserByToken(token);
        if (!user) throw new Error('No user found');

        // Add userId field to link the asset with the authenticated user
        const assetData = {
            ...data,
            user_id: user.id // Ensure the asset is linked to the user
        };

        return assetData;
    }

    // Post-create behavior (additional logic if needed)
    protected async afterCreate(asset: any, req: Request) {
        // You can perform additional operations after creating the asset, if necessary
        return asset;
    }

    // Overriding update to include logic for ownership validation and updating fields
    async update(req: Request, res: Response): Promise<void> {
        const { assetId } = req.params;
        const data = req.body;

        try {
            const assetRepository = AppDataSource.getRepository(Asset);
            const asset = await assetRepository.findOne({ where: { id: Number(assetId) } });

            if (!asset) {
                res.status(404).json({ message: 'Asset not found' });
                return;
            }

            // Update the asset with the new data
            assetRepository.merge(asset, data);
            await assetRepository.save(asset);

            res.status(200).json({ message: 'Asset updated successfully', asset });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        return super.delete(req, res, 'assetId');
    }

    async getById(req: Request, res: Response): Promise<void> {
        return super.getById(req, res, 'assetId');
    }

    async getAllByUser(req: Request, res: Response) {
        return getAllByUser(
            req,
            res,
            AppDataSource.getRepository(Asset),
            AppDataSource.getRepository(User), // No need for a join table as in Workspaces
            'user_id',
            'id'
        );
    }
}

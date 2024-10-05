import { Request, Response } from 'express';
import { User } from '../models/User';
import { appController } from './appController';
import getToken from '../helpers/get-token';
import getUserByToken from '../helpers/get-user-by-token';
import AppDataSource from '../db/db';
import { Asset } from '../models';
import { In } from 'typeorm';

export class AssetController extends appController {
    getEntity() {
        return {
            name: 'Asset',
            model: AppDataSource.getRepository(Asset)
        };
    }

    getIncludes() {
        return [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }
        ];
    }

    protected async beforeCreate(data: any, req: Request) {
        const {
            asset_class,
            asset_type,
            asset_ticker,
            asset_qty,
            avg_price,
            current_price,
            currency
        } = data;
        const missingFields: string[] = [];

        if (!asset_class) missingFields.push('asset_class');
        if (!asset_type) missingFields.push('asset_type');
        if (!asset_ticker) missingFields.push('asset_ticker');
        if (!asset_qty) missingFields.push('asset_qty');
        if (!avg_price) missingFields.push('avg_price');
        if (!current_price) missingFields.push('current_price');
        if (!currency) missingFields.push('currency');

        if (missingFields.length > 0) {
            throw new Error(`Missing fields: ${missingFields.join(', ')}`);
        }

        const token = getToken(req);
        if (!token) throw new Error('No token found');

        const user = await getUserByToken(token);
        if (!user) throw new Error('No user found');

        const assetData = {
            ...data,
            user_id: user.id
        };

        return assetData;
    }

    protected async afterCreate(asset: any, _req: Request) {
        return asset;
    }

    async update(req: Request, res: Response): Promise<void> {
        const assetsToUpdate = Array.isArray(req.body) ? req.body : [req.body];

        if (assetsToUpdate.length === 0) {
            res.status(400).json({ message: 'No assets to update' });
            return;
        }

        try {
            const assetRepository = AppDataSource.getRepository(Asset);

            const assetIds = assetsToUpdate.map((asset: any) => asset.id);

            const existingAssets = await assetRepository.find({
                where: { id: In(assetIds) }
            });

            const updatedResults = {
                updated: [] as any[],
                notFound: [] as any[],
                errors: [] as any[]
            };

            for (const assetData of assetsToUpdate) {
                const existingAsset = existingAssets.find(
                    (asset: any) => asset.id === assetData.id
                );

                if (existingAsset) {
                    try {
                        assetRepository.merge(existingAsset, assetData);
                        const updatedAsset = await assetRepository.save(existingAsset);
                        updatedResults.updated.push(updatedAsset);
                    } catch (error: any) {
                        updatedResults.errors.push({ id: assetData.id, error: error.message });
                    }
                } else {
                    updatedResults.notFound.push(assetData.id);
                }
            }

            res.status(200).json({ message: 'Asset updated successfully', ...updatedResults });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        return super.delete(req, res, 'assetId');
    }

    async getAllByUser(req: Request, res: Response) {
        try {
            const token = getToken(req);
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const user = await getUserByToken(token);
            if (!user) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            const userId = user.id;

            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }

            // Fetch assets for the user with no nested relations
            const assets = await this.model.find({
                where: { user_id: userId }
            });

            return res.status(200).json(assets); // Directly return the flat structure
        } catch (error: any) {
            console.error('Error in getAllByUser:', error);
            return res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { assetId } = req.params;

            const asset = await this.model.findOne({
                where: { id: Number(assetId) }
            });

            if (!asset) {
                res.status(404).json({ message: 'Asset not found' });
                return;
            }

            res.status(200).json(asset); // Directly return the flat structure
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

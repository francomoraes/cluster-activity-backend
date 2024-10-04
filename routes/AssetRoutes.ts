// src/routes/AssetRoutes.ts
import express from 'express';
import { checkToken } from '../helpers';
import { AssetController } from '../controllers/AssetController';

const router = express.Router();
const assetController = new AssetController();

// Create a new asset
router.post('/', checkToken, assetController.create.bind(assetController));

// Get all assets (admin or for listing purposes)
router.get('/', checkToken, assetController.getAll.bind(assetController));

// Get all assets for a specific user
router.get('/user', checkToken, assetController.getAllByUser.bind(assetController));

// Get asset by ID
router.get('/:assetId', checkToken, assetController.getById.bind(assetController));

// Update asset by ID
router.patch('/:assetId', checkToken, assetController.update.bind(assetController));

// Delete asset by ID
router.delete('/:assetId', checkToken, assetController.delete.bind(assetController));

export default router;

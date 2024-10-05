// src/routes/AssetRoutes.ts
import express from 'express';
import { checkToken } from '../helpers';
import { AssetController } from '../controllers/AssetController';

const router = express.Router();
const assetController = new AssetController();

router.post('/', assetController.create.bind(assetController));
router.get('/', assetController.getAllByUser.bind(assetController));
router.patch('/', assetController.update.bind(assetController));
router.get('/:assetId', assetController.getById.bind(assetController));
router.delete('/:assetId', assetController.delete.bind(assetController));

export default router;

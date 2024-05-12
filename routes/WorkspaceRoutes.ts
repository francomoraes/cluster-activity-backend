import express from 'express';
import checkToken from '../helpers/check-token';
import { WorkspaceController } from '../controllers/WorkspaceController';
import imageUpload from '../helpers/image-upload';
import { checkOwnership } from '../helpers/check-ownsership';

// middleware
const router = express.Router();

router.post(
    '/',
    checkToken,
    imageUpload.single('avatar'),
    WorkspaceController.createWorkspace
);
router.get('/', checkToken, WorkspaceController.getWorkspaces);
router.get('/:id', checkToken, WorkspaceController.getWorkspaceById);
router.patch(
    '/:id',
    checkToken,
    checkOwnership,
    imageUpload.single('image'),
    WorkspaceController.updateWorkspace
);
router.delete(
    '/:id',
    checkToken,
    checkOwnership,
    WorkspaceController.deleteWorkspace
);

export default router;

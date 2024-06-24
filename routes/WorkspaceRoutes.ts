import { Router } from 'express';
import { WorkspaceController } from '../controllers/WorkspaceController';
import challengeRoutes from './ChallengeRoutes';
import { checkOwnership, checkToken, imageUpload } from '../helpers';

// middleware
const router = Router();
const workspaceController = new WorkspaceController();

router.post('/', checkToken, workspaceController.create.bind(workspaceController));
router.get('/', checkToken, workspaceController.getAllByUser.bind(workspaceController));
router.get('/:workspaceId', checkToken, workspaceController.getById.bind(workspaceController));
router.patch('/:workspaceId', checkToken, checkOwnership, imageUpload.single('image'), workspaceController.update.bind(workspaceController));
router.delete('/:workspaceId', checkToken, checkOwnership, workspaceController.delete.bind(workspaceController));

router.get('/:workspaceId/members', checkToken, workspaceController.getMembers.bind(workspaceController));

router.post('/:workspaceId/join', checkToken, workspaceController.joinWorkspace.bind(workspaceController));
router.post('/:workspaceId/leave', checkToken, workspaceController.leaveWorkspace.bind(workspaceController));

router.use('/:workspaceId/challenges', challengeRoutes);

export default router;

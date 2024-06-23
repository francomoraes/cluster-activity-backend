import { Router } from 'express';
import { ChallengeController } from '../controllers/ChallengeController';
import { checkOwnership, checkToken, imageUpload } from '../helpers';

// middleware
const router = Router({ mergeParams: true });
const challengeController = new ChallengeController();

router.post('/', checkToken, challengeController.create.bind(challengeController));
router.get('/', checkToken, challengeController.getAllByWorkspace.bind(challengeController));
router.get('/:challengeId', checkToken, challengeController.getById.bind(challengeController));
router.patch('/:challengeId', checkToken, checkOwnership, imageUpload.single('image'), challengeController.update.bind(challengeController));
router.delete('/:challengeId', checkToken, checkOwnership, challengeController.delete.bind(challengeController));

export default router;

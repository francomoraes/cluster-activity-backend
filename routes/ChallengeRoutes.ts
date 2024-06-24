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

router.get('/:challengeId/participants', checkToken, challengeController.getParticipants.bind(challengeController));

router.post('/:challengeId/join', checkToken, challengeController.joinChallenge.bind(challengeController));
router.post('/:challengeId/leave', checkToken, challengeController.leaveChallenge.bind(challengeController));

export default router;

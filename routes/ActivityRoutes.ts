import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController';

import { checkOwnership, checkToken, imageUpload } from '../helpers';

// middleware
const router = Router({ mergeParams: true });
const activityController = new ActivityController();

router.post('/', checkToken, imageUpload.single('image'), activityController.create.bind(activityController));
router.get('/', checkToken, activityController.getAllByChallenge.bind(activityController));
router.get('/:activityId', checkToken, activityController.getById.bind(activityController));
router.patch('/:activityId', checkToken, checkOwnership('activity', 'activityId'), imageUpload.single('image'), activityController.update.bind(activityController));
router.delete('/:activityId', checkToken, checkOwnership('activity', 'activityId', ['owner', 'admin']), activityController.delete.bind(activityController));

export default router;

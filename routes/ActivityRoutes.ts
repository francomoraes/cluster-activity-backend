import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController';

import { checkOwnership, checkToken, imageUpload } from '../helpers';

// middleware
const router = Router({ mergeParams: true });
const activityController = new ActivityController();

router.post('/', checkToken, imageUpload.single('image'), activityController.create.bind(activityController));

export default router;

import express from 'express';
import checkToken from '../helpers/check-token';
import { UserController } from '../controllers/UserController';
import imageUpload from '../helpers/image-upload';

// middleware
const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/checkuser', UserController.checkUser);
router.get('/:id', UserController.getUserById);
router.patch(
    '/edit/:id',
    checkToken,
    imageUpload.single('avatar'),
    UserController.editUser
);

export default router;

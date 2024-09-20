import express from 'express';
import checkToken from '../helpers/check-token';
import { UserController } from '../controllers/UserController';
import imageUpload from '../helpers/image-upload';

// middleware
const router = express.Router();
const userController = new UserController();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/checkuser', UserController.checkUser);
router.get('/all', userController.getAllUsers.bind(userController));
router.patch(
    '/edit/:id',
    checkToken,
    imageUpload.single('avatar'),
    userController.editUser.bind(userController)
);
router.get('/verify-email', UserController.verifyEmail);
router.get('/:id', userController.getUserById.bind(userController));
router.delete('/:id', checkToken, userController.deleteUser.bind(userController));

export default router;

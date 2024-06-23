import { Router } from 'express';
import { checkToken, checkOwnership, imageUpload } from '../helpers';

const baseRoutes = (router: Router, controller: any) => {
    router.post('/', checkToken, imageUpload.single('avatar'), controller.create.bind(controller));
    router.get('/', checkToken, controller.getAll.bind(controller));
    // router.get('/:id', checkToken, controller.getById.bind(controller));
    // router.patch('/:id', checkToken, checkOwnership, imageUpload.single('image'), controller.update.bind(controller));
    // router.delete('/:id', checkToken, checkOwnership, controller.delete.bind(controller));
};

export default baseRoutes;

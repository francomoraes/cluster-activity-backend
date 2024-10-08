import multer from 'multer';
import path from 'path';

const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = '';

        if (req.baseUrl.includes('users')) {
            folder = 'users';
        } else if (req.baseUrl.includes('activities')) {
            folder = 'activities';
        } else if (req.baseUrl.includes('challenges')) {
            folder = 'challenges';
        } else if (req.baseUrl.includes('workspaces')) {
            folder = 'workspaces';
        }

        cb(null, `public/images/${folder}`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + String(Math.floor(Math.random() * 100)) + path.extname(file.originalname));
    }
});

const imageUpload = multer({
    storage: imageStorage,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a jpg, jpeg or png image'));
        }

        cb(null, true);
    }
});

export default imageUpload;

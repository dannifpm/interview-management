import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
});

export const uploadDocument = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only .pdf, .doc, and .docx files are allowed!'));
        }
    },
});

export const uploadImage = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, 
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only .jpeg, .jpg, and .png files are allowed!'));
        }
    },
});

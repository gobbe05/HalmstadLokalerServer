import { Router } from 'express';
import { deleteOffice, getOffices, getOffice, getUserOffices, postOffice, putOffice, getOfficesCount} from '../controllers/officeController';
import isAuthenticated from '../middleware/isAuthenticated';
import multer, { StorageEngine, FileFilterCallback } from 'multer';


const router = Router();




const storage = multer.memoryStorage(); // Store files in memory temporarily

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(null, false);
        }
        cb(null, true);
    },
});

router.get('/', getOffices)
router.get('/count', getOfficesCount)
router.get('/:id', getOffice)
router.get('/user/:id', getUserOffices)

router.put("/:id", isAuthenticated, putOffice)

router.post('/', isAuthenticated, upload.single("image"), postOffice)

router.delete('/:id', isAuthenticated, deleteOffice)
//router.delete('/', deleteAllOffices)

export default router;
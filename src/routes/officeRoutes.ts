import { Router } from 'express';
import { deleteOffice, getOffices, getOffice, getUserOffices, postOffice, putOffice, getOfficesCount, putOfficeHidden} from '../controllers/officeController';
import isAuthenticated from '../middleware/isAuthenticated';
import multer from 'multer';
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
router.get("/:id/hidden", isAuthenticated, putOfficeHidden)
router.get('/user/:id', getUserOffices)

router.put("/:id", isAuthenticated, putOffice)

router.post('/', isAuthenticated, upload.array("images[]", 10), postOffice)

router.delete('/:id', isAuthenticated, deleteOffice)
//router.delete('/', deleteAllOffices)

export default router;
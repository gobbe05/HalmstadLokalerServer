import { Router } from 'express';
import { deleteOffice, getOffices, getOffice, getUserOffices, postOffice, putOffice, getOfficesCount, putOfficeHidden, getSelfOffices} from '../controllers/officeController';
import isAuthenticated from '../middleware/isAuthenticated';
import multer from 'multer';
const router = Router();

const storage = multer.memoryStorage(); // Store files in memory temporarily

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if(file.fieldname == "images[]") {
            if(!file.mimetype.startsWith('image/')) {
                return cb(null, false);
            }
        }
        if(file.fieldname == "files[]") {
            if(!file.mimetype.startsWith('application/pdf')) {
                return cb(null, false);
            }
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // example: limit file size to 5 MB per file
});

const uploadFields = upload.fields([
    { name: "images[]", maxCount: 10 },
    { name: "files[]", maxCount: 10 }
]);

router.get('/', getOffices)
router.get('/count', getOfficesCount)
router.get('/self', isAuthenticated, getSelfOffices)
router.get('/:id', getOffice)
router.get("/:id/hidden", isAuthenticated, putOfficeHidden)
router.get('/user/:id', getUserOffices)

router.put("/:id", isAuthenticated, uploadFields, putOffice)

router.post('/', isAuthenticated, uploadFields, postOffice)

router.delete('/:id', isAuthenticated, deleteOffice)
//router.delete('/', deleteAllOffices)

export default router;
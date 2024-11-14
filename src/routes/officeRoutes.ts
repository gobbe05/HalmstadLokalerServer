import { Router } from 'express';
import { deleteAllOffices, deleteOffice, getAllOffices, getOffice, postOffice, putOffice} from '../controllers/officeController';
import isAuthenticated from '../middleware/isAuthenticated';
import multer, { StorageEngine, FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';

const router = Router();

// Configure multer storage
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/'); // Store in uploads folder
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Configure the upload with a file filter
const upload = multer({
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  },
});


router.get('/:id', getOffice)
router.get('/', getAllOffices)

router.put("/:id", isAuthenticated, putOffice)

router.post('/', isAuthenticated, upload.single("image"), postOffice)

router.delete('/:id', isAuthenticated, deleteOffice)
//router.delete('/', deleteAllOffices)

export default router;
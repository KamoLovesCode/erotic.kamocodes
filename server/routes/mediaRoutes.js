import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import multer from 'multer';
import { listMedia, getMedia, createMedia, updateMedia, deleteMedia, exportVideosJson, importVideosJson } from '../controllers/mediaController.js';

const router = Router();

router.get('/', listMedia);
router.get('/export/videos', exportVideosJson);

// Import videos from JSON (bulk import)
const memoryUpload = multer({ storage: multer.memoryStorage() });
router.post('/import/videos', memoryUpload.single('file'), importVideosJson);
router.get('/:id', getMedia);
router.post('/', upload.single('file'), createMedia);
router.put('/:id', upload.single('file'), updateMedia);
router.delete('/:id', deleteMedia);

export default router;

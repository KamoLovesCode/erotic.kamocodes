import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { listMedia, getMedia, createMedia, updateMedia, deleteMedia } from '../controllers/mediaController.js';

const router = Router();

router.get('/', listMedia);
router.get('/:id', getMedia);
router.post('/', upload.single('file'), createMedia);
router.put('/:id', upload.single('file'), updateMedia);
router.delete('/:id', deleteMedia);

export default router;

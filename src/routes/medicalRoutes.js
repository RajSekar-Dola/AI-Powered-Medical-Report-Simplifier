import express from 'express';
import multer from 'multer';
import { processTextReport, processImageReport } from '../controllers/medicalController.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.post('/process-text', processTextReport);

router.post('/process-image', upload.single('image'), processImageReport);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Medical API is running' });
});

export default router;
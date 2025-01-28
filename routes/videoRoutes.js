
const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/authMiddleware');
const videoController = require('../controllers/videoController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

router.use(authenticate);
router.post('/upload', upload.single('video'), videoController.uploadVideo);
router.post('/:id/trim', videoController.trimVideo);
router.post('/merge', videoController.mergeVideos);
router.post('/:id/share', videoController.shareVideo);
router.get('/', videoController.listVideos);

module.exports = router;

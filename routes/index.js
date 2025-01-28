
const express = require('express');
const videoRoutes = require('./videoRoutes');

const router = express.Router();

router.use('/videos', videoRoutes);

module.exports = router;

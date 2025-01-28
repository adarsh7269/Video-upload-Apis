
const videoService = require('../services/videoService');

exports.uploadVideo = async (req, res) => {
  try {
    const result = await videoService.uploadVideo(req.file);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.trimVideo = async (req, res) => {
  try {
    const result = await videoService.trimVideo(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.mergeVideos = async (req, res) => {
  try {
    const result = await videoService.mergeVideos(req.body.videoIds);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.shareVideo = async (req, res) => {
  try {
    const result = await videoService.shareVideo(req.params.id, req.body.expiry);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listVideos = async (req, res) => {
  try {
    const result = await videoService.listVideos();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

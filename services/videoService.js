const sqlite3 = require("sqlite3").verbose();
const ffmpeg = require("fluent-ffmpeg");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

//curl -X POST http://localhost:3000/videos/upload \
//-H "Authorization: Bearer my-static-token" \
//-F "video=@/Users/adarshkumarsharma/Downloads/frame.png"

//curl -X POST http://localhost:3000/videos/1234/trim \
//-H "Authorization: Bearer my-static-token" \
//-d '{
//  "start": 5,
//  "end": 20
//}'

const db = new sqlite3.Database("video.db");
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    filename TEXT,
    size INTEGER,
    duration REAL,
    uploaded_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS shared_links (
    id TEXT PRIMARY KEY,
    video_id TEXT,
    expiry TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id)
  )`);
});

exports.uploadVideo = (file) => {
  console.log(file.path);
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file uploaded."));

    ffmpeg.ffprobe(file.path, (err, metadata) => {
      if (err) return reject(new Error("Error processing video."));

      const duration = metadata.format.duration;
      if (duration < 5 || duration > 25) {
        fs.unlinkSync(file.path);
        return reject(new Error("Video duration out of allowed range."));
      }

      const id = uuidv4();
      db.run(
        `INSERT INTO videos (id, filename, size, duration, uploaded_at) VALUES (?, ?, ?, ?, datetime('now'))`,
        [id, file.filename, file.size, duration],
        (err) => {
          if (err) return reject(new Error("Database error."));
          resolve({ id, filename: file.filename, size: file.size, duration });
        }
      );
    });
  });
};

// Function to trim a video
exports.trimVideo = (id, { start, end }) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM videos WHERE id = ?`, [id], (err, row) => {
      if (err) {
        console.error("Database error:", err);
        return reject(new Error("Database error."));
      }
      if (!row) return reject(new Error("Video not found."));

      // Validate start and end
      if (typeof start !== "number" || typeof end !== "number") {
        return reject(new Error("Start and end times must be numbers."));
      }
      if (start < 0 || end > row.duration || start >= end) {
        return reject(new Error("Invalid start or end time."));
      }

      const inputPath = path.join(__dirname, "uploads", row.filename);
      const outputPath = path.join(__dirname, "uploads", `${id}_trimmed.mp4`);

      if (!fs.existsSync(inputPath)) {
        console.error(`File not found: ${inputPath}`);
        return reject(new Error("Input video file does not exist."));
      }

      console.log("Start time:", start);
      console.log("End time:", end);

      ffmpeg(inputPath)
        .setStartTime(start)
        .setDuration(end - start)
        .output(outputPath)
        .on("start", (commandLine) => {
          console.log(`FFmpeg command: ${commandLine}`);
        })
        .on("end", () =>
          resolve({ message: "Video trimmed successfully.", outputPath })
        )
        .on("error", (ffmpegErr, stdout, stderr) => {
          console.error("FFmpeg Error:", ffmpegErr);
          console.error("FFmpeg stderr:", stderr);
          reject(new Error("Video trimming failed."));
        })
        .run();
    });
  });
};

// Function to merge videos
exports.mergeVideos = (videoIds) => {
  return new Promise((resolve, reject) => {
    const inputPaths = [];
    videoIds.forEach((videoId, index) => {
      db.get(`SELECT * FROM videos WHERE id = ?`, [videoId], (err, row) => {
        if (err || !row)
          return reject(new Error(`Video ${videoId} not found.`));
        inputPaths.push(
          `file '${path.join(__dirname, "uploads", row.filename)}'`
        );
        if (index === videoIds.length - 1) {
          const fileListPath = path.join(__dirname, "uploads", "file_list.txt");
          fs.writeFileSync(fileListPath, inputPaths.join("\n"));

          const outputPath = path.join(
            __dirname,
            "uploads",
            "merged_video.mp4"
          );
          ffmpeg()
            .input(fileListPath)
            .inputOptions("-f concat -safe 0")
            .outputOptions("-c copy")
            .output(outputPath)
            .on("end", () => {
              const mergedId = uuidv4();
              db.run(
                `INSERT INTO videos (id, filename, size, duration, uploaded_at) VALUES (?, ?, ?, ?, datetime('now'))`,
                [
                  mergedId,
                  "merged_video.mp4",
                  fs.statSync(outputPath).size,
                  null,
                ], // Duration is null as it's unknown
                (dbErr) => {
                  if (dbErr) return reject(new Error("Database error."));
                  resolve({ id: mergedId, filename: "merged_video.mp4" });
                }
              );
            })
            .on("error", (err) => reject(new Error("Video merging failed.")))
            .run();
        }
      });
    });
  });
};

// Function to share a video
exports.shareVideo = (id, expiry) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM videos WHERE id = ?`, [id], (err, row) => {
      if (err || !row) return reject(new Error("Video not found."));

      const token = uuidv4();
      const expiryTimestamp = Date.now() + expiry * 1000;

      db.run(
        `INSERT INTO shared_links (id, video_id, expiry) VALUES (?, ?, ?)`,
        [token, id, expiryTimestamp],
        (dbErr) => {
          if (dbErr) return reject(new Error("Database error."));
          const shareLink = `${
            process.env.BASE_URL || "http://localhost:3000"
          }/videos/${id}/download?token=${token}`;
          resolve({ shareLink, expiry: new Date(expiryTimestamp) });
        }
      );
    });
  });
};

// Function to list all videos
exports.listVideos = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM videos`, [], (err, rows) => {
      if (err) return reject(new Error("Database error."));
      resolve(rows);
    });
  });
};

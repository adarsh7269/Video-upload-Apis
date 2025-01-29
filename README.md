# Video-upload-Apis

Endpoints
Upload Video

POST /videos/upload
Parameters: File (multipart), max size, min duration, max duration.
Validations:
Check file type.
Enforce size and duration limits.
Store metadata in SQLite.
Trim Video

POST /videos/:id/trim
Parameters: start_time, end_time.
Validations:
Ensure the video exists.
Validate start_time and end_time within the video's duration.
Process trimming with a library like FFmpeg.
Merge Videos

POST /videos/merge
Parameters: List of video IDs.
Validations:
Ensure all videos exist.
Check compatibility (e.g., resolution, format).
Use FFmpeg to merge.
Share Link

POST /videos/:id/share
Parameters: Expiry time.
Response: Temporary signed URL.
Store expiry metadata in SQLite.
Fetch Video Metadata

GET /videos/:id
Response: Video metadata (size, duration, upload time).
List All Videos

GET /videos
Response: List of videos with metadata.



Database Schema
Table: Videos

id: Primary key.
filename: Name of the stored video.
size: File size.
duration: Duration of the video.
uploaded_at: Timestamp.
Table: SharedLinks

id: Primary key.
video_id: Foreign key to Videos.
expiry: Expiry timestamp.



This is a well-structured requirement document for creating REST APIs to manage video files with specific features. Here's how you might approach this project:

Development Plan
Tech Stack
Programming Language: Node.js (aligned with your intention to switch tech stacks)
Framework: Express.js for API routing and middleware.
Database: SQLite (committed to the repo as required).
Testing: Jest for unit and e2e tests.
Documentation: Swagger/OpenAPI for API docs.
API Design
Authentication
Use static API tokens passed as headers (e.g., Authorization: Bearer <token>).
Middleware to validate tokens.
Endpoints
Upload Video

POST /videos/upload
Parameters: File (multipart), max size, min duration, max duration.
Validations:
Check file type.
Enforce size and duration limits.
Store metadata in SQLite.
Trim Video

POST /videos/:id/trim
Parameters: start_time, end_time.
Validations:
Ensure the video exists.
Validate start_time and end_time within the video's duration.
Process trimming with a library like FFmpeg.
Merge Videos

POST /videos/merge
Parameters: List of video IDs.
Validations:
Ensure all videos exist.
Check compatibility (e.g., resolution, format).
Use FFmpeg to merge.
Share Link

POST /videos/:id/share
Parameters: Expiry time.
Response: Temporary signed URL.
Store expiry metadata in SQLite.
Fetch Video Metadata

GET /videos/:id
Response: Video metadata (size, duration, upload time).
List All Videos

GET /videos
Response: List of videos with metadata.
Database Schema
Table: Videos

id: Primary key.
filename: Name of the stored video.
size: File size.
duration: Duration of the video.
uploaded_at: Timestamp.
Table: SharedLinks

id: Primary key.
video_id: Foreign key to Videos.
expiry: Expiry timestamp.
Assumptions
Video processing will use FFmpeg for trimming and merging.
Video uploads will be stored locally for simplicity.
Authentication tokens will be static and hardcoded for demo purposes.
Link sharing will generate a unique signed URL valid until expiry.


Setup Commands

Install Dependencies: npm install
Run Server: npm start

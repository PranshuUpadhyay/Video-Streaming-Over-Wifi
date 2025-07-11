const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename but add timestamp to avoid conflicts
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only video files
    const allowedTypes = /mp4|avi|mov|mkv|wmv|flv|webm|m4v/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB limit
  }
});

// Get local IP address for network access
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get list of uploaded videos
app.get('/api/videos', async (req, res) => {
  try {
    const files = await fs.readdir(uploadsDir);
    const videos = [];
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      
      videos.push({
        name: file,
        size: stats.size,
        sizeFormatted: formatFileSize(stats.size),
        uploadDate: stats.birthtime,
        path: `/api/stream/${encodeURIComponent(file)}`
      });
    }
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get videos list' });
  }
});

// Upload video
app.post('/api/upload', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
    res.json({
      message: 'Video uploaded successfully',
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Stream video
app.get('/api/stream/:filename', (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  const filePath = path.join(uploadsDir, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video not found' });
  }
  
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Delete video
app.delete('/api/videos/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(uploadsDir, filename);
    
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      res.json({ message: 'Video deleted successfully' });
    } else {
      res.status(404).json({ error: 'Video not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Utility function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 2GB.' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`🚀 Video Streaming Server is running!`);
  console.log(`📱 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://${localIP}:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`\n💡 Other devices on your network can access: http://${localIP}:${PORT}`);
});

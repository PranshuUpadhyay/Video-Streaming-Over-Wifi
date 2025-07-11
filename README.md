# Video Streaming Over WiFi

A modern, responsive web application that allows you to stream videos from one PC to all devices on the same network. Perfect for sharing videos with family, friends, or colleagues without needing external services.

## ✨ Features

- **🎬 Video Upload**: Drag & drop or click to upload video files
- **📱 Cross-Device Streaming**: Stream to any device on your network (phones, tablets, laptops, smart TVs)
- **🎯 Modern UI**: Beautiful, responsive interface that works on all screen sizes
- **⚡ Real-time Streaming**: Supports video seeking and partial content requests
- **🗂️ Video Management**: View, play, and delete uploaded videos
- **📊 Upload Progress**: Real-time progress tracking for large files
- **🔒 Local Network Only**: Your videos stay on your network, no external servers

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   git clone https://github.com/PranshuUpadhyay/Video-Streaming-Over-Wifi.git
   cd Video-Streaming-Over-Wifi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - **Local**: http://localhost:3000
   - **Network**: The server will display the network URL (e.g., http://192.168.1.100:3000)

## 📱 How to Use

### For the Host PC (Video Server)

1. **Start the server** using `npm start`
2. **Upload videos** by dragging and dropping them onto the upload area
3. **Share the network URL** with other devices on your network

### For Other Devices

1. **Connect to the same WiFi network** as the host PC
2. **Open a web browser** and navigate to the network URL
3. **Browse and play videos** from the video library

## 🎯 Supported Video Formats

- MP4
- AVI
- MOV
- MKV
- WMV
- FLV
- WebM
- M4V

**Maximum file size**: 2GB per video

## 🛠️ Technical Details

### Backend (Node.js + Express)

- **File Upload**: Multer middleware for handling video uploads
- **Video Streaming**: Range request support for efficient streaming
- **File Management**: Automatic file organization and metadata tracking
- **Error Handling**: Comprehensive error handling and user feedback

### Frontend (Vanilla JavaScript)

- **Modern UI**: CSS Grid and Flexbox for responsive design
- **Drag & Drop**: Native HTML5 drag and drop API
- **Video Player**: HTML5 video element with custom controls
- **Real-time Updates**: Automatic refresh of video library

### Network Features

- **CORS Enabled**: Allows cross-origin requests from network devices
- **Range Requests**: Supports video seeking and partial content
- **Automatic IP Detection**: Displays network URL for easy access

## 📁 Project Structure

```
Video-Streaming-Over-Wifi/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── README.md            # This file
├── public/              # Frontend files
│   ├── index.html       # Main HTML page
│   ├── styles.css       # CSS styles
│   └── script.js        # JavaScript functionality
└── uploads/             # Video storage (created automatically)
```

## 🔧 Configuration

### Port Configuration

The server runs on port 3000 by default. To change the port:

```bash
# Set environment variable
export PORT=8080
npm start

# Or on Windows
set PORT=8080
npm start
```

### File Size Limits

The default maximum file size is 2GB. To modify this limit, edit the `fileSize` property in `index.js`:

```javascript
limits: {
    fileSize: 5 * 1024 * 1024 * 1024 // 5GB limit
}
```

## 🚨 Troubleshooting

### Common Issues

1. **"Port already in use"**
   - Change the port using the PORT environment variable
   - Or kill the process using the port: `lsof -ti:3000 | xargs kill`

2. **"Cannot access from other devices"**
   - Ensure all devices are on the same WiFi network
   - Check Windows Firewall settings
   - Try accessing the network IP directly

3. **"Upload fails for large files"**
   - Check available disk space
   - Verify file size is under 2GB limit
   - Ensure stable network connection

4. **"Videos don't play on mobile"**
   - Ensure video format is supported by the device
   - Check if the video codec is compatible
   - Try converting to MP4 format

### Network Access Issues

If other devices can't access the server:

1. **Windows Firewall**: Allow Node.js through the firewall
2. **Antivirus**: Check if antivirus is blocking the connection
3. **Router Settings**: Ensure devices are on the same network segment

## 🔒 Security Considerations

- **Local Network Only**: The server only accepts connections from your local network
- **No Authentication**: Anyone on your network can access the videos
- **File Storage**: Videos are stored locally on your PC
- **No External Services**: No data is sent to external servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with Express.js for the backend
- Uses Multer for file uploads
- Font Awesome for icons
- Modern CSS for responsive design

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information

---

**Happy Streaming! 🎬✨**

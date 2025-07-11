// Global variables
let videos = [];

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const videoGrid = document.getElementById('videoGrid');
const videoModal = document.getElementById('videoModal');
const videoPlayer = document.getElementById('videoPlayer');
const modalTitle = document.getElementById('modalTitle');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadVideos();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Modal close
    window.addEventListener('click', function(event) {
        if (event.target === videoModal) {
            closeVideoModal();
        }
    });
}

// Handle file selection
function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        uploadFiles(files);
    }
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Handle drop
function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        uploadFiles(files);
    }
}

// Upload files
async function uploadFiles(files) {
    for (let file of files) {
        if (file.type.startsWith('video/')) {
            await uploadFile(file);
        } else {
            showMessage(`Skipped ${file.name} - not a video file`, 'error');
        }
    }
    
    // Clear file input
    fileInput.value = '';
    
    // Reload videos after upload
    setTimeout(loadVideos, 1000);
}

// Upload single file
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('video', file);
    
    // Show progress
    uploadProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = `Uploading ${file.name}...`;
    
    try {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
                progressText.textContent = `Uploading ${file.name}... ${Math.round(percentComplete)}%`;
            }
        });
        
        xhr.addEventListener('load', function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                showMessage(`${file.name} uploaded successfully!`, 'success');
            } else {
                showMessage(`Failed to upload ${file.name}`, 'error');
            }
            uploadProgress.style.display = 'none';
        });
        
        xhr.addEventListener('error', function() {
            showMessage(`Failed to upload ${file.name}`, 'error');
            uploadProgress.style.display = 'none';
        });
        
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
        
    } catch (error) {
        showMessage(`Error uploading ${file.name}: ${error.message}`, 'error');
        uploadProgress.style.display = 'none';
    }
}

// Load videos from server
async function loadVideos() {
    try {
        videoGrid.innerHTML = '<div class="loading">Loading videos...</div>';
        
        const response = await fetch('/api/videos');
        if (!response.ok) {
            throw new Error('Failed to load videos');
        }
        
        videos = await response.json();
        displayVideos();
        
    } catch (error) {
        console.error('Error loading videos:', error);
        videoGrid.innerHTML = '<div class="error">Failed to load videos</div>';
    }
}

// Display videos in grid
function displayVideos() {
    if (videos.length === 0) {
        videoGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-film"></i>
                <p>No videos uploaded yet</p>
                <p>Upload your first video to get started!</p>
            </div>
        `;
        return;
    }
    
    videoGrid.innerHTML = videos.map(video => createVideoCard(video)).join('');
}

// Create video card HTML
function createVideoCard(video) {
    const uploadDate = new Date(video.uploadDate).toLocaleDateString();
    const displayName = video.name.length > 30 ? video.name.substring(0, 30) + '...' : video.name;
    
    return `
        <div class="video-card">
            <div class="video-thumbnail">
                <i class="fas fa-play"></i>
            </div>
            <div class="video-info">
                <h3 title="${video.name}">${displayName}</h3>
                <div class="video-meta">
                    <span>${video.sizeFormatted}</span>
                    <span>${uploadDate}</span>
                </div>
                <div class="video-actions">
                    <button class="action-btn play-btn" onclick="playVideo('${video.name}', '${video.path}')">
                        <i class="fas fa-play"></i> Play
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteVideo('${video.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Play video
function playVideo(name, path) {
    modalTitle.textContent = name;
    videoPlayer.src = path;
    videoModal.style.display = 'block';
    
    // Auto-play when modal opens
    videoPlayer.play().catch(error => {
        console.log('Auto-play prevented:', error);
    });
}

// Close video modal
function closeVideoModal() {
    videoModal.style.display = 'none';
    videoPlayer.pause();
    videoPlayer.src = '';
}

// Delete video
async function deleteVideo(filename) {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/videos/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage(`${filename} deleted successfully`, 'success');
            loadVideos(); // Reload the video list
        } else {
            const error = await response.json();
            showMessage(`Failed to delete ${filename}: ${error.error}`, 'error');
        }
    } catch (error) {
        showMessage(`Error deleting ${filename}: ${error.message}`, 'error');
    }
}

// Show message
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Insert at the top of the main content
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // ESC to close modal
    if (event.key === 'Escape' && videoModal.style.display === 'block') {
        closeVideoModal();
    }
    
    // Space to play/pause video
    if (event.key === ' ' && videoModal.style.display === 'block') {
        event.preventDefault();
        if (videoPlayer.paused) {
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }
    }
});

// Video player event listeners
videoPlayer.addEventListener('ended', function() {
    // Auto-close modal when video ends
    setTimeout(closeVideoModal, 2000);
});

// Refresh videos every 30 seconds to check for new uploads
setInterval(loadVideos, 30000); 
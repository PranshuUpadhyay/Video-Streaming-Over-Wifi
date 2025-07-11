// Deployment Configuration Guide
// This file shows the changes needed for public deployment

// 1. Environment Variables (create a .env file)
const config = {
    // For production, use environment variables
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Security settings for production
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || (2 * 1024 * 1024 * 1024), // 2GB
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '*', // Restrict in production
    
    // Storage settings
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    
    // Rate limiting (for production)
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: 100 // requests per window
};

// 2. Production Security Middleware (add to index.js)
const securityMiddleware = {
    // Helmet for security headers
    helmet: `
    const helmet = require('helmet');
    app.use(helmet());
    `,
    
    // Rate limiting
    rateLimit: `
    const rateLimit = require('express-rate-limit');
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    });
    app.use(limiter);
    `,
    
    // CORS for production
    cors: `
    const corsOptions = {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        credentials: true
    };
    app.use(cors(corsOptions));
    `
};

// 3. Additional Dependencies for Production
const productionDependencies = {
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "compression": "^1.7.4"
};

// 4. PM2 Configuration (ecosystem.config.js)
const pm2Config = `
module.exports = {
    apps: [{
        name: 'video-streaming',
        script: 'index.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        }
    }]
};
`;

// 5. Nginx Configuration (for reverse proxy)
const nginxConfig = `
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # For large video files
    client_max_body_size 2G;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}
`;

module.exports = {
    config,
    securityMiddleware,
    productionDependencies,
    pm2Config,
    nginxConfig
}; 
# Deployment Guide - Roll With Advantage Website

## 📋 Table of Contents
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Production Build](#production-build)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

## 🔍 Pre-Deployment Checklist

### Security
- [ ] Change default admin password from `rollwithadvantage`
- [ ] Set secure `SESSION_SECRET` in environment variables
- [ ] Enable HTTPS/SSL certificate
- [ ] Set `TRUST_PROXY=true` if behind reverse proxy
- [ ] Review and restrict CORS settings if needed
- [ ] Ensure `.env` files are in `.gitignore`

### Performance
- [ ] Run `npm run build` to create minified assets
- [ ] Enable gzip compression on web server
- [ ] Configure CDN for static assets (optional)
- [ ] Set appropriate cache headers

### Code Quality
- [ ] All tests passing (if tests exist)
- [ ] No console errors or warnings
- [ ] Audit npm packages: `npm audit fix`

## 🏗️ Production Build

### 1. Install Dependencies
```bash
npm ci --production
```

### 2. Build Admin Assets
```bash
npm run build
```
This creates minified JavaScript files:
- `public/js/admin.min.js` (55% smaller than source)

### 3. Update HTML for Production
In `public/admin/index.html`, change:
```html
<!-- Development -->
<script src="/js/admin.js"></script>

<!-- Production -->
<script src="/js/admin.min.js"></script>
```

## ⚙️ Environment Configuration

### 1. Copy Example Config
```bash
cp .env.production.example .env.local
```

### 2. Edit Configuration
```bash
nano .env.local
```

Required settings:
```env
NODE_ENV=production
SESSION_SECRET=<generate-32-char-random-string>
PORT=5000
TRUST_PROXY=true
```

Optional settings:
```env
YOUTUBE_API_KEY=<your-key>
CHANNEL_ID=<your-channel-id>
```

### 3. Generate Secure Session Secret
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🚀 Deployment Options

### Option A: Traditional Server (VPS/Dedicated)

#### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "rwa-website"

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

#### Using systemd
Create `/etc/systemd/system/rwa-website.service`:
```ini
[Unit]
Description=Roll With Advantage Website
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/rwa-website
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable rwa-website
sudo systemctl start rwa-website
```

### Option B: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t rwa-website .
docker run -d -p 5000:5000 --env-file .env.local rwa-website
```

### Option C: Platform as a Service

#### Heroku
```bash
# Login to Heroku
heroku login

# Create app
heroku create rwa-website

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=$(openssl rand -base64 32)

# Deploy
git push heroku main
```

#### Vercel/Railway/Render
These platforms auto-detect Node.js apps. Just:
1. Connect your Git repository
2. Set environment variables in dashboard
3. Deploy

## 🔄 Post-Deployment

### 1. Verify Deployment
```bash
# Check server is running
curl https://your-domain.com/api/health

# Expected response:
# {"status":"ok","message":"Server is running"}
```

### 2. Test Admin Login
1. Navigate to `https://your-domain.com/admin/login`
2. Login with default credentials:
   - Username: `admin`
   - Password: `rollwithadvantage`
3. **IMMEDIATELY** change password in Settings

### 3. Configure Web Server (Nginx)

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check application health
curl https://your-domain.com/api/health

# Check PM2 status
pm2 status

# View logs
pm2 logs rwa-website --lines 100
```

### Database Backups
Backup the `data/` directory regularly:
```bash
# Create backup
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Automated daily backup (cron)
0 2 * * * cd /var/www/rwa-website && tar -czf /backups/rwa-$(date +\%Y\%m\%d).tar.gz data/
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm ci --production

# Rebuild assets
npm run build

# Restart application
pm2 restart rwa-website

# Or with systemd
sudo systemctl restart rwa-website
```

### Performance Monitoring

Recommended tools:
- **PM2**: Built-in monitoring with `pm2 monit`
- **New Relic**: Application performance monitoring
- **LogRocket**: Session replay and error tracking
- **Sentry**: Error tracking and debugging

## 🆘 Troubleshooting

### Server won't start
```bash
# Check logs
pm2 logs rwa-website

# Common issues:
# 1. Port already in use - change PORT in .env
# 2. Missing dependencies - run `npm install`
# 3. Permission errors - check file ownership
```

### Session issues
```bash
# Ensure SESSION_SECRET is set
echo $SESSION_SECRET

# Clear sessions (if persistent storage used)
# Default file-based sessions are in data/sessions/
```

### Admin login not working
```bash
# Reset admin password
# Delete data/admin-config.json
# Server will recreate with default password
```

## 📞 Support

For issues or questions:
- Check server logs: `pm2 logs` or `/var/log/rwa-website/`
- Review error messages in browser console (F12)
- Check environment variables are set correctly

## 🔐 Security Best Practices

1. **Never commit** `.env` or `.env.local` files
2. **Use HTTPS** in production (Let's Encrypt is free)
3. **Regular updates**: Keep dependencies updated
4. **Firewall**: Only expose necessary ports (443, 80)
5. **Rate limiting**: Consider adding rate limiting for API endpoints
6. **Monitoring**: Set up alerts for errors and downtime

## 📝 License

MIT License - See LICENSE file for details

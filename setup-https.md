# Quick HTTPS Setup Guide for EC2

## Prerequisites
- Domain pointing to your EC2 instance
- Port 80 and 443 open in Security Group

## Option A: Using Certbot (Let's Encrypt) - FREE

### 1. Install Certbot
```bash
# Amazon Linux 2
sudo yum install -y certbot python3-certbot-nginx

# Ubuntu
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### 2. Get SSL Certificate
```bash
# If using Nginx
sudo certbot --nginx -d rollwithadvantage.co -d www.rollwithadvantage.co

# If NOT using Nginx (standalone mode - stops your node server temporarily)
sudo systemctl stop your-node-service
sudo certbot certonly --standalone -d rollwithadvantage.co -d www.rollwithadvantage.co
sudo systemctl start your-node-service
```

### 3. Auto-renewal (certbot sets this up automatically)
```bash
# Test renewal
sudo certbot renew --dry-run
```

## Option B: Using Nginx as Reverse Proxy (Recommended)

### 1. Install Nginx
```bash
# Amazon Linux 2
sudo amazon-linux-extras install nginx1 -y

# Ubuntu
sudo apt-get install nginx -y
```

### 2. Configure Nginx
Create `/etc/nginx/conf.d/rwa.conf`:
```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name rollwithadvantage.co www.rollwithadvantage.co;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name rollwithadvantage.co www.rollwithadvantage.co;

    # SSL certificates (certbot will add these)
    ssl_certificate /etc/letsencrypt/live/rollwithadvantage.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rollwithadvantage.co/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy to Node.js
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
}
```

### 3. Get SSL Certificate with Nginx
```bash
sudo certbot --nginx -d rollwithadvantage.co -d www.rollwithadvantage.co
```

### 4. Start Nginx
```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5. Update Node.js to Trust Proxy
Add to your `.env.local`:
```bash
TRUST_PROXY=true
```

Then update `server.js` to trust the proxy (if not already done):
```javascript
app.set('trust proxy', 1);
```

## Option C: Temporary Fix (Development Mode)

If you can't set up HTTPS right now, temporarily use development mode:

```bash
# Edit .env.local
nano .env.local

# Change from:
NODE_ENV=production

# To:
NODE_ENV=development

# Restart
pm2 restart rwa-website
```

**WARNING**: The bookmarklet won't work in development mode! This is only for testing the admin panel locally.

## Verify HTTPS Works

```bash
# Check if site is accessible via HTTPS
curl -I https://rollwithadvantage.co

# Should return 200 OK
```

## Security Group Settings (AWS)

Make sure these ports are open:
- Port 80 (HTTP) - for redirect to HTTPS
- Port 443 (HTTPS) - for secure traffic
- Port 22 (SSH) - for management

```bash
# Check current rules
aws ec2 describe-security-groups --group-ids YOUR_SG_ID

# Or via AWS Console:
# EC2 → Security Groups → Your SG → Inbound Rules
```

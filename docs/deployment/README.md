# Deployment Guide

This guide covers deploying the 3D Virtual Classroom application to various environments.

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm run setup

# Start required services
brew services start postgresql redis  # macOS
# or
sudo systemctl start postgresql redis  # Linux

# Start development servers
npm run dev
```

### Production Deployment
```bash
# Build the application
npm run build

# Start with PM2 process manager
npm install -g pm2
pm2 start ecosystem.config.js

# Or deploy to cloud platforms
npm run deploy:production
```

## 🚀 Local Deployment

### Development Environment
```bash
# Start all services
npm run dev

# View logs
pm2 logs

# Stop services
pm2 stop all
```

### Production Environment
```bash
# Build production images
npm run build

# Deploy to production
pm2 start ecosystem.config.js --env production
```

## ☁️ Cloud Deployment

### AWS Deployment
1. **EC2 Instance Setup**
   ```bash
   # Launch EC2 instance (t3.medium or larger)
   # Install Node.js, PostgreSQL, and Redis
   sudo yum update -y
   sudo yum install -y nodejs npm postgresql redis
   sudo systemctl start postgresql redis
   sudo systemctl enable postgresql redis
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd HTN
   
   # Configure environment
   cp .env.example .env.production
   # Edit .env.production with production values
   
   # Install dependencies and build
   npm run setup
   npm run build
   
   # Start with PM2
   npm install -g pm2
   pm2 start ecosystem.config.js --env production
   ```

3. **Configure Load Balancer**
   - Create Application Load Balancer
   - Configure SSL certificate
   - Set up health checks

### Google Cloud Platform
1. **Create GKE Cluster**
   ```bash
   gcloud container clusters create classroom-cluster \
     --num-nodes=3 \
     --machine-type=e2-standard-2 \
     --zone=us-central1-a
   ```

2. **Deploy with Kubernetes**
   ```bash
   # Apply Kubernetes manifests
   kubectl apply -f k8s/
   
   # Check deployment status
   kubectl get pods
   kubectl get services
   ```

### Azure Deployment
1. **Create Container Instances**
   ```bash
   az container create \
     --resource-group classroom-rg \
     --name classroom-app \
     --image your-registry/classroom:latest \
     --ports 3000 8000
   ```

## 🔧 Environment Configuration

### Required Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# AI Services
AI_SERVICE_URL=http://handwriting-api:5000
LATEX_SERVICE_URL=http://latex-api:5001

# File Storage
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10MB

# External APIs
CALENDLY_API_KEY=your-calendly-key
ZOOM_API_KEY=your-zoom-key
GOOGLE_CALENDAR_CREDENTIALS=path/to/credentials.json
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
REACT_APP_ENVIRONMENT=development
```

### Production Considerations

1. **Security**
   - Use strong JWT secrets
   - Enable HTTPS
   - Configure CORS properly
   - Set up rate limiting
   - Use environment-specific secrets

2. **Performance**
   - Enable Redis caching
   - Configure CDN for static assets
   - Optimize database queries
   - Use connection pooling

3. **Monitoring**
   - Set up logging aggregation
   - Configure health checks
   - Monitor resource usage
   - Set up alerting

## 📊 Database Setup

### PostgreSQL Configuration
```sql
-- Create database
CREATE DATABASE classroom_db;

-- Create user
CREATE USER classroom_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE classroom_db TO classroom_user;
```

### Run Migrations
```bash
# Development
cd backend
npm run db:migrate

# Production
docker exec -it classroom-backend npm run db:migrate
```

## 🔍 Monitoring and Logging

### Application Monitoring
- **Health Checks**: `/health` endpoint
- **Metrics**: Prometheus-compatible metrics
- **Logging**: Structured JSON logs

### Log Aggregation
```bash
# Using ELK Stack
docker-compose -f docker-compose.monitoring.yml up -d
```

### Performance Monitoring
- **Frontend**: React DevTools, Lighthouse
- **Backend**: Node.js profiling, database query analysis
- **Infrastructure**: CPU, memory, disk usage

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   docker-compose logs postgres
   
   # Verify connection string
   echo $DATABASE_URL
   ```

2. **AI Service Not Responding**
   ```bash
   # Check AI service logs
   docker-compose logs handwriting-api
   
   # Verify model files
   docker exec -it classroom-handwriting-api ls -la /app/models
   ```

3. **File Upload Issues**
   ```bash
   # Check upload directory permissions
   ls -la backend/uploads/
   
   # Verify file size limits
   grep MAX_FILE_SIZE .env
   ```

### Performance Issues

1. **Slow LaTeX Compilation**
   - Increase container memory
   - Use SSD storage
   - Implement caching

2. **High Memory Usage**
   - Monitor container resources
   - Optimize image processing
   - Implement garbage collection

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to AWS
        run: |
          docker-compose -f docker-compose.prod.yml build
          docker-compose -f docker-compose.prod.yml up -d
```

### Automated Testing
```bash
# Run tests before deployment
npm test
npm run test:integration

# Security scanning
npm audit
docker scan classroom-backend:latest
```

## 📈 Scaling

### Horizontal Scaling
- **Load Balancer**: Distribute traffic across multiple instances
- **Database**: Read replicas for query distribution
- **AI Services**: Multiple instances with queue management

### Vertical Scaling
- **Memory**: Increase container memory for AI processing
- **CPU**: More cores for LaTeX compilation
- **Storage**: SSD for faster file operations

## 🔐 Security Checklist

- [ ] HTTPS enabled
- [ ] JWT secrets configured
- [ ] Database credentials secured
- [ ] File upload validation
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Regular security updates

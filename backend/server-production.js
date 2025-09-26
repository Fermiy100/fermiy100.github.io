/**
 * Production сервер для масштабирования
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cluster from 'cluster';
import os from 'os';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

// Import our modules
import { PRODUCTION_CONFIG } from './config/production.js';
import { cache, cacheMiddleware } from './cache.js';
import { metrics, metricsMiddleware, errorTrackingMiddleware } from './monitoring.js';
import { 
  authRateLimit, 
  generalRateLimit, 
  logSecurityEvent,
  detectSuspiciousActivity 
} from './security.js';
import MenuParser from './menuParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database setup (PostgreSQL for production)
import pkg from 'pg';
const { Pool } = pkg;

const db = new Pool({
  connectionString: PRODUCTION_CONFIG.DATABASE.URL,
  max: PRODUCTION_CONFIG.DATABASE.POOL_SIZE,
  idleTimeoutMillis: PRODUCTION_CONFIG.DATABASE.IDLE_TIMEOUT,
  connectionTimeoutMillis: PRODUCTION_CONFIG.DATABASE.CONNECTION_TIMEOUT
});

// Clustering for production
if (PRODUCTION_CONFIG.CLUSTERING.ENABLED && cluster.isPrimary) {
  console.log(`🚀 Master process ${process.pid} is running`);
  
  // Fork workers
  const numCPUs = PRODUCTION_CONFIG.CLUSTERING.WORKERS;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Master received SIGTERM, shutting down gracefully');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
  });
  
} else {
  // Worker process
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  // Production middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
  
  app.use(compression({ level: PRODUCTION_CONFIG.PERFORMANCE.COMPRESSION_LEVEL }));
  
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://fermiy100.github.io',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  // Rate limiting
  app.use('/api/', generalRateLimit);
  app.use('/api/auth/login', authRateLimit);
  
  // Monitoring middleware
  app.use(metricsMiddleware);
  
  // Security middleware
  app.use((req, res, next) => {
    if (detectSuspiciousActivity(req)) {
      logSecurityEvent('SUSPICIOUS_ACTIVITY', { 
        path: req.path, 
        method: req.method,
        body: req.body 
      }, req);
      return res.status(400).json({ error: 'Подозрительная активность обнаружена' });
    }
    next();
  });
  
  // Cache middleware for static endpoints
  app.use('/api/menu', cacheMiddleware(300, (req) => 
    `menu:${req.user?.school_id}:${req.query.week || new Date().toISOString().split('T')[0]}`
  ));
  
  // Health check with metrics
  app.get('/api/health', (req, res) => {
    const health = metrics.getHealthStatus();
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  });
  
  // Metrics endpoint (protected)
  app.get('/api/metrics', (req, res) => {
    // Add authentication check here
    res.json(metrics.getMetrics());
  });
  
  // Your existing routes here...
  // (Copy all the routes from your main server.js)
  
  // Error handling
  app.use(errorTrackingMiddleware);
  
  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });
  
  // Start server
  const server = createServer(app);
  
  server.listen(PORT, () => {
    console.log(`🚀 Worker ${process.pid} listening on port ${PORT}`);
    console.log(`📊 Metrics available at /api/metrics`);
    console.log(`🏥 Health check at /api/health`);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log(`Worker ${process.pid} received SIGTERM, shutting down gracefully`);
    server.close(() => {
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log(`Worker ${process.pid} received SIGINT, shutting down gracefully`);
    server.close(() => {
      process.exit(0);
    });
  });
}

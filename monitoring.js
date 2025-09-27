/**
 * Система мониторинга и метрик для production
 */

import os from 'os';

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byRoute: {},
        byStatus: {},
        responseTime: []
      },
      users: {
        active: 0,
        total: 0,
        byRole: {}
      },
      performance: {
        memory: [],
        cpu: [],
        uptime: Date.now()
      },
      errors: {
        total: 0,
        byType: {},
        recent: []
      }
    };
    
    this.startCollection();
  }

  startCollection() {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Cleanup old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);
  }

  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.performance.memory.push({
      timestamp: Date.now(),
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external
    });

    this.metrics.performance.cpu.push({
      timestamp: Date.now(),
      user: cpuUsage.user,
      system: cpuUsage.system
    });

    // Keep only last 100 entries
    if (this.metrics.performance.memory.length > 100) {
      this.metrics.performance.memory = this.metrics.performance.memory.slice(-100);
    }
    if (this.metrics.performance.cpu.length > 100) {
      this.metrics.performance.cpu = this.metrics.performance.cpu.slice(-100);
    }
  }

  cleanupOldMetrics() {
    const oneHourAgo = Date.now() - 3600000;
    
    // Cleanup old response times
    this.metrics.requests.responseTime = this.metrics.requests.responseTime
      .filter(rt => rt.timestamp > oneHourAgo);
    
    // Cleanup old errors
    this.metrics.errors.recent = this.metrics.errors.recent
      .filter(error => error.timestamp > oneHourAgo);
  }

  recordRequest(method, route, statusCode, responseTime) {
    this.metrics.requests.total++;
    
    // By method
    this.metrics.requests.byMethod[method] = 
      (this.metrics.requests.byMethod[method] || 0) + 1;
    
    // By route
    this.metrics.requests.byRoute[route] = 
      (this.metrics.requests.byRoute[route] || 0) + 1;
    
    // By status
    this.metrics.requests.byStatus[statusCode] = 
      (this.metrics.requests.byStatus[statusCode] || 0) + 1;
    
    // Response time
    this.metrics.requests.responseTime.push({
      timestamp: Date.now(),
      responseTime
    });
  }

  recordUserActivity(userId, role, action) {
    this.metrics.users.byRole[role] = 
      (this.metrics.users.byRole[role] || 0) + 1;
  }

  recordError(error, context = {}) {
    this.metrics.errors.total++;
    
    const errorType = error.name || 'Unknown';
    this.metrics.errors.byType[errorType] = 
      (this.metrics.errors.byType[errorType] || 0) + 1;
    
    this.metrics.errors.recent.push({
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      context
    });
  }

  getMetrics() {
    const uptime = Date.now() - this.metrics.performance.uptime;
    const avgResponseTime = this.metrics.requests.responseTime.length > 0
      ? this.metrics.requests.responseTime.reduce((sum, rt) => sum + rt.responseTime, 0) / this.metrics.requests.responseTime.length
      : 0;

    return {
      ...this.metrics,
      summary: {
        uptime: Math.floor(uptime / 1000),
        requestsPerMinute: this.calculateRequestsPerMinute(),
        averageResponseTime: Math.round(avgResponseTime),
        errorRate: this.calculateErrorRate(),
        memoryUsage: this.getCurrentMemoryUsage(),
        cpuUsage: this.getCurrentCpuUsage()
      }
    };
  }

  calculateRequestsPerMinute() {
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = this.metrics.requests.responseTime
      .filter(rt => rt.timestamp > oneMinuteAgo);
    return recentRequests.length;
  }

  calculateErrorRate() {
    if (this.metrics.requests.total === 0) return 0;
    return (this.metrics.errors.total / this.metrics.requests.total) * 100;
  }

  getCurrentMemoryUsage() {
    const memUsage = process.memoryUsage();
    return {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024) // MB
    };
  }

  getCurrentCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return {
      idle: totalIdle / cpus.length,
      total: totalTick / cpus.length,
      usage: Math.round(100 - (100 * totalIdle / totalTick))
    };
  }

  getHealthStatus() {
    const metrics = this.getMetrics();
    const memoryUsage = metrics.summary.memoryUsage;
    const errorRate = metrics.summary.errorRate;
    
    let status = 'healthy';
    let issues = [];

    // Check memory usage
    if (memoryUsage.heapUsed > 500) { // 500MB
      status = 'warning';
      issues.push('High memory usage');
    }

    // Check error rate
    if (errorRate > 5) { // 5%
      status = 'critical';
      issues.push('High error rate');
    }

    // Check response time
    if (metrics.summary.averageResponseTime > 1000) { // 1 second
      status = 'warning';
      issues.push('Slow response time');
    }

    return {
      status,
      issues,
      timestamp: new Date().toISOString(),
      metrics: metrics.summary
    };
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Middleware for collecting request metrics
export function metricsMiddleware(req, res, next) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    metrics.recordRequest(req.method, req.route?.path || req.path, res.statusCode, responseTime);
  });
  
  next();
}

// Error tracking middleware
export function errorTrackingMiddleware(err, req, res, next) {
  metrics.recordError(err, {
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  next(err);
}

export default metrics;

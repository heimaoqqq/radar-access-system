// 错误处理和性能监控系统
class ErrorHandler {
  constructor() {
    this.errors = [];
    this.performanceMetrics = [];
    this.setupGlobalErrorHandling();
  }

  setupGlobalErrorHandling() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError({
          type: 'runtime',
          message: event.message,
          source: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          type: 'promise',
          message: event.reason?.message || event.reason,
          stack: event.reason?.stack
        });
      });
    }
  }

  logError(error) {
    const errorEntry = {
      ...error,
      timestamp: new Date().toISOString(),
      userAgent: navigator?.userAgent,
      url: window?.location?.href
    };

    this.errors.push(errorEntry);
    
    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorEntry);
    }
  }

  trackPerformance(metric, value) {
    this.performanceMetrics.push({
      metric,
      value,
      timestamp: new Date().toISOString()
    });
  }

  getErrors() {
    return this.errors;
  }

  getPerformanceMetrics() {
    return this.performanceMetrics;
  }

  clearErrors() {
    this.errors = [];
  }
}

export default new ErrorHandler();

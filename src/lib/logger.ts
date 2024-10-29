// src/lib/logger.ts

export const logger = {
    error: (error: Error, context?: Record<string, unknown>) => {
      console.error('Error:', {
        message: error.message,
        stack: error.stack,
        ...context
      })
      
      // You could also send this to an error tracking service
      // if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
      //   // Send to error tracking service
      // }
    },
    
    warn: (message: string, context?: Record<string, unknown>) => {
      console.warn('Warning:', message, context)
    },
    
    info: (message: string, context?: Record<string, unknown>) => {
      if (process.env.NODE_ENV === 'development') {
        console.info('Info:', message, context)
      }
    }
  }
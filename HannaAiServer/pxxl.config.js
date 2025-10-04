module.exports = {
  // Build configuration
  build: {
    command: 'npm install',
    output: '.'
  },
  
  // Runtime configuration
  runtime: {
    command: 'npm start',
    port: 4000
  },
  
  // Environment variables
  env: {
    NODE_ENV: 'production',
    PORT: '4000'
  },
  
  // Health check
  healthCheck: {
    path: '/health',
    interval: 30
  }
}

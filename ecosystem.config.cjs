module.exports = {
  apps: [{
    name: 'vecino-activo',
    script: './server/dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3008
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3008
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s',
    watch: false,
    // Auto-restart on failure
    autorestart: true,
    // Don't restart if crashing too fast
    exp_backoff_restart_delay: 100
  }]
};

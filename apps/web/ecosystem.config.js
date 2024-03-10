module.exports = {
  apps: [
    {
      name: 'pm2-teambition',
      exec_mode: 'cluster',
      instances: 4, // Or a number of instances
      script: './apps/web/server.js',
      // args: 'start',
      combine_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: "./var/logs/api-error.log",
      out_file: "./var/logs/api-out.log",
      log_file: "./var/logs/api.log",
      // cwd: './app',
      env_prod: {
        APP_ENV: 'prod' // APP_ENV=prod
      }
    }
  ]
}

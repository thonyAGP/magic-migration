/**
 * PM2 Ecosystem Configuration for Factory CLI Dashboard
 *
 * Usage:
 *   pnpm pm2 start ecosystem.config.cjs        # Start service
 *   pnpm pm2 status                            # Check status
 *   pnpm pm2 logs factory-dashboard            # View logs
 *   pnpm pm2 restart factory-dashboard         # Restart
 *   pnpm pm2 stop factory-dashboard            # Stop
 *   pnpm pm2 startup                           # Enable auto-start at boot
 *   pnpm pm2 save                              # Save current process list
 */

module.exports = {
  apps: [
    {
      name: 'factory-dashboard',
      script: 'dist/cli.js',
      args: 'serve --port 3070 --dir ADH --project ../../',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      max_restarts: 10,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'development',
        PORT: '3070',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};

module.exports = {
  apps: [
    {
      name: 'specmap-server',
      script: 'dist/cli.js',
      args: 'serve --port 3070 --dir ADH',
      cwd: __dirname,
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

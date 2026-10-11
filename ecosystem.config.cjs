module.exports = {
  apps: [
    {
      name: 'otorrinonet',
      cwd: __dirname,
      script: '/usr/bin/bash',
      args: ['-c', 'npm run start -- -p 5000'],
      interpreter: 'none',
      watch: false,
      time: true,
      merge_logs: true,
      max_memory_restart: '512M',
      kill_timeout: 10000,
      env: {
        NODE_ENV: 'production',
      },
      out_file: '/home/ubuntu/.pm2/logs/otorrinonet-out.log',
      error_file: '/home/ubuntu/.pm2/logs/otorrinonet-error.log',
    },
  ],
}

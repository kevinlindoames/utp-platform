module.exports = {
  apps: [{
    name: 'utp-backend',
    script: 'dist/main.js',
    instances: '1',   // usa todos los núcleos de CPU
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
            PORT: 3001,

    },
  }],
};
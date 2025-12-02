module.exports = {
  apps: [
    {
      name: 'hooshsaz-backend',
      cwd: './backend',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'hooshsaz-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

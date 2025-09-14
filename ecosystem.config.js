module.exports = {
  apps: [
    {
      name: 'cogniverse-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'classroom-backend',
      script: 'npm',
      args: 'start',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      },
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'handwriting-api',
      script: 'python',
      args: 'app.py',
      cwd: './apis/handwriting-recognition',
      env: {
        FLASK_ENV: 'production',
        PORT: 5000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G'
    },
    {
      name: 'latex-api',
      script: 'python',
      args: 'app.py',
      cwd: './apis/latex-conversion',
      env: {
        FLASK_ENV: 'production',
        PORT: 5001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'integrations-api',
      script: 'python',
      args: 'app.py',
      cwd: './apis/external-integrations',
      env: {
        FLASK_ENV: 'production',
        PORT: 5002
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
};

const result = require('dotenv').config({ path: '/var/www/otorrinonet2/.env' })
if (result.error) {
  console.error('dotenv error:', result.error)
  process.exit(1)
}
console.log('dotenv loaded. SMTP_HOST:', process.env.SMTP_HOST ? 'SET' : 'NOT SET')

const { spawn } = require('child_process')

const child = spawn('npm', ['start'], {
  cwd: '/var/www/otorrinonet2',
  stdio: 'inherit',
  env: { ...process.env },
})

child.on('exit', code => process.exit(code))

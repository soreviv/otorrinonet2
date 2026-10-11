#!/bin/bash
set -a
source /var/www/otorrinonet2/.env
set +a
export PORT=5000
exec pm2 start npm --name "otorrinonet" -- start

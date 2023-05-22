#!/bin/bash
echo 'run after_install.sh: ' >> /home/admin/MiarBot/deploy.log

echo 'cd /home/admin/MiarBot' >> /home/admin/MiarBo/deploy.log
cd /home/admin/MiarBot >> /home/admin/MiarBot/deploy.log

echo 'npm install' >> /home/admin/MiarBot/deploy.log 
npm install >> /home/admin/MiarBot/deploy.log

echo 'npm run build' >> /home/admin/MiarBot/deploy.log

npm run build >> /home/admin/MiarBot/MiarBot/deploy.log

echo 'cd ./dist' >> /home/admin/MiarBot/deploy.log

cd ./dist >> /home/admin/MiarBot/deploy.log
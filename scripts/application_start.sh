#!/bin/bash

echo 'run application_start.sh: ' >> /home/admin/MiarBot/deploy.log

echo 'pm2 restart MiarBot' >> /home/admin/MiarBot/deploy.log
pm2 restart MiarBot >> /home/admin/MiarBot/deploy.log
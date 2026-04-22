#!/bin/sh
RDS_HOST=database-1.c3agsaymkxi0.eu-west-3.rds.amazonaws.com
RDS_PORT=3306
RDS_USER=admin
RDS_PASSWORD=S6tDBi6vv6SW58P3FL23
RDS_DATABASE=gestion_file

sudo apt-get install -y mysql-client

mysql -h $RDS_HOST -P $RDS_PORT -u $RDS_USER -p $RDS_PASSWORD $RDS_DATABASE --ssl-mode=VERIFY_IDENTITY --ssl-ca=./global-bundle.pem < ./init-user.sql

#!/bin/sh

mysql -h database-1.c3agsaymkxi0.eu-west-3.rds.amazonaws.com -P 3306 -u admin -p S6tDBi6vv6SW58P3FL23 --ssl-mode=VERIFY_IDENTITY --ssl-ca=./global-bundle.pem < ./init-user.sql

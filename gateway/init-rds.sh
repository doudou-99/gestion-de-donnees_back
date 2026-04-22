#!/bin/sh
RDS_HOST=database-1.c3agsaymkxi0.eu-west-3.rds.amazonaws.com
RDS_USER=admin
RDS_PASSWORD=S6tDBi6vv6SW58P3FL23
RDS_DATABASE=gestion_file

aws ssm send-command \
  --instance-ids "database-1" \
  --document-name "AWS-RunShellScript" \
  --parameters commands=["mysql -h $RDS_HOST -u $RDS_USER -p$RDS_PASSWORD $RDS_DATABASE --ssl-mode=VERIFY_IDENTITY --ssl-ca=./global-bundle.pem < ./init-user.sql"]

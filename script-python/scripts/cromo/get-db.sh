#! /bin/bash
. ~/.bashrc > /dev/null

conf_file="/u/prometium/v*/cromo/env/epe/conf/server.conf"

dbhost=$(cat $conf_file | grep -A8 "database" | grep "host" | cut -f2 -d"=" | xargs)
dbport=$(cat $conf_file | grep -A8 "database" | grep "port" | cut -f2 -d"=" | xargs)
dbservice=$(cat $conf_file | grep -A8 "database" | grep "service" | cut -f2 -d"=" | xargs)
dbstring="jdbc:oracle:thin:@$dbhost:$dbport:$dbservice"

echo $dbstring

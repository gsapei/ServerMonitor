#! /bin/bash
. ~/.bashrc > /dev/null

rm -f $epe_dir_certa_appserver_configuration/agatha.mem 
rm -f $epe_dir_certa_appserver_configuration/agatha.mem.old
touch "$epe_dir_certa_appserver_logs/`date +"%Y-%m-%d %T"`.restart_date"

echo -e "\nIniciando AppServer..."
$epe_dir_certa_appserver_bin/appserver.sh start &

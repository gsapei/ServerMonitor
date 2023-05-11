#! /bin/bash
. ~/.bashrc > /dev/null

pred=$($epe_dir_epe_scripts/oms/srv/prediction/get.sh)
smon=$($epe_dir_epe_scripts/oms/srv/situacion-monitor/get.sh)
cust=$($epe_dir_epe_scripts/oms/srv/customer-situation/get.sh)
noti=$($epe_dir_epe_scripts/oms/srv/notification-panel/get.sh)

# ATENCION! Las palabras Agatha y OMS solo deben aparecer en los casos en que dichos servicios se encuentran activos!
# ya que otros scripts solo analizan la presencia de dichas palabras en la cadena que este script retorna.
if [ $pred = "SI" -a $smon = "NO" -a $cust = "NO" -a $noti = "NO" ]; then
	echo "Modo solo Agatha"
elif [ $pred = "NO" -a $smon = "SI" -a $cust = "SI" -a $noti = "SI" ]; then
	echo "Modo solo OMS"
elif [ $pred = "SI" -a $smon = "SI" -a $cust = "SI" -a $noti = "SI" ]; then
	echo "Modo Agatha + OMS"
elif [ $pred = "NO" -a $smon = "NO" -a $cust = "NO" -a $noti = "NO" ]; then
	echo "Modo todo desactivado"
else
	echo "ERROR: combinacion no reconocida (pred:$pred, smon:$smon, cust:$cust, noti:$noti)"
fi
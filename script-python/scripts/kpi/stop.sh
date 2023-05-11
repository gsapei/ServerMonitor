#! /bin/bash
. ~/.bashrc > /dev/null

echo -e "\tDesactivando interfaz KPI mobile..."
componente=$(ls $epe_dir_certa_appserver_components/deploy/tca/Kpi-Mobile-*.4dl)

rm $epe_dir_certa_appserver_components/deploy/tca/Kpi-Mobile-*.4dl

echo -e "\tLink eliminado: $componente"
echo -e "\tSe ha desactivado la interfaz KPI mobile."
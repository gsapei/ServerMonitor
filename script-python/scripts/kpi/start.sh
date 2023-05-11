#! /bin/bash
. ~/.bashrc > /dev/null

echo -e "\tActivando interfaz KPI mobile..."

# WARNING! Esto funciona solamente si hay una y solo una version del componente disponible!
cd $epe_dir_certa_appserver_components/deploy/tca/
ln -s $epe_dir_certa_appserver_components/available/Kpi-Mobile-*.4dl
cd - > /dev/null

componente=$(ls $epe_dir_certa_appserver_components/deploy/tca/Kpi-Mobile-*.4dl)
echo -e "\tLink creado: $componente"
echo -e "\tSe ha activado la interfaz KPI mobile."

#! /bin/bash
. ~/.bashrc > /dev/null

echo -e "\tActivando interfaz SCADA..."

# WARNING! Esto funciona solamente si hay una y solo una version del componente disponible!
cd $epe_dir_certa_appserver_components/deploy/oms/
ln -s $epe_dir_certa_appserver_components/available/epe-operation-interface-*.4dl
cd - > /dev/null

componente=$(ls $epe_dir_certa_appserver_components/deploy/oms/epe-operation-interface-*.4dl)
echo -e "\tLink creado: $componente"
echo -e "\tSe ha activado la interfaz SCADA."

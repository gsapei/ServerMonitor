#! /bin/bash
. ~/.bashrc > /dev/null

echo -e "\tActivando TCA..."

# WARNING! Esto funciona solamente si hay una y solo una version del componente disponible!
cd $epe_dir_certa_appserver_components/deploy/tca/
ln -s $epe_dir_certa_appserver_components/available/tca-web-*.4dl
cd - > /dev/null

componente=$(ls $epe_dir_certa_appserver_components/deploy/tca/tca-web-*.4dl)
echo -e "\tLink creado: $componente"
echo -e "\tSe ha activado TCA."

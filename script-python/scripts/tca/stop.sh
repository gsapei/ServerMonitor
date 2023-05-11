#! /bin/bash
. ~/.bashrc > /dev/null

echo -e "\tDesactivando TCA..."
componente=$(ls $epe_dir_certa_appserver_components/deploy/tca/tca-web-*.4dl)

rm $epe_dir_certa_appserver_components/deploy/tca/tca-web-*.4dl

echo -e "\tLink eliminado: $componente"
echo -e "\tSe ha desactivado TCA."
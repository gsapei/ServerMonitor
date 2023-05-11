#! /bin/bash
. ~/.bashrc > /dev/null

echo -e "\nRegistrando condiciones previas a la detencion...\n"
cd $epe_dir_epe_logs
ps fax >             `date +"stop_ps_fax.%Y%m%d-%T.log"`
cp /var/log/messages `date +"stop_messages.%Y%m%d-%T.log"`
cp /var/log/dmesg    `date +"stop_dmesg.%Y%m%d-%T.log"`
tar -czf             `date +"stop_$SERVER.%Y-%m-%d_%H-%M.tgz"` stop_*.log --remove-files

echo -e "\nEnviando email a los administradores...\n"
#EMAIL="mcarpio@epe.santafe.gov.ar, lkarchesky@epe.santafe.gov.ar, nriestra@epe.santafe.gov.ar, ffaraudo@epe.santafe.gov.ar, dpadula@epe.santafe.gov.ar"
EMAIL="lkarchesky@epe.santafe.gov.ar,gsapei@epe.santafe.gov.ar"
BODY="Se ha detenido el appserver $SERVER.\n\nSe adjuntan logs de las condiciones previas a la detencion."
echo -e "$BODY" | mutt -s "[SCR] Detencion de $SERVER" "$EMAIL" -a stop_$SERVER.*.tgz
rm stop_$SERVER.*.tgz
cd -

echo "Deteniendo..."

echo -e "\nDeteniendo servidor (1 de 2)... aguarde 10 segundos\n"
$epe_dir_certa_appserver_bin/appserver.sh stop
for i in `seq 100 -2 0`;
do
        sleep 0.2
        if [[ $(( i % 10 )) == 0 ]]; then
                printf '%s' $(( i / 10 ))
        else
                printf '.'
        fi
done

echo -e "\nDeteniendo servidor (2 de 2)... aguarde 10 segundos\n"
$epe_dir_certa_appserver_bin/appserver.sh stop
for i in `seq 100 -2 0`;
do
        sleep 0.2
        if [[ $(( i % 10 )) == 0 ]]; then
                printf '%s' $(( i / 10 ))
        else
                printf '.'
        fi
done

echo -e "\nRenombrando los archivos de log..."
for i in $epe_dir_certa_appserver_logs/*.log; do mv "$i" `date +"$i.%Y%m%d-%T.old"`; done
rm $epe_dir_certa_appserver_logs/*.restart_date

echo -e "\n"
echo -e "Servidor detenido"

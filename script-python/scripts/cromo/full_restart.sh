#! /bin/bash
. ~/.bashrc > /dev/null

INICIO=$(date +%s)

# Detencion del servidor
yes | /u/prometium/cromo/vigente/cromo/bin/cromoserver.sh -e epe stop

# Borrar/backupear data vieja (salvo que sean requeridas para anásis)
rm -rf /u/backup_cromo_env_epe_dataold
mv /u/prometium/cromo/vigente/cromo/env/epe/data /u/backup_cromo_env_epe_dataold

# Borrar logs (salvo que sean requeridos para anásis)
rm /log/cromo/*
rm /log/business-updater/*

# Migracion de datos (demora 0.5hs)
/u/prometium/cromo/vigente/cromo/bin/update.sh -e epe

# Lo siguiente se realiza en segundo plano
/u/prometium/vigente/business-updater/bin/update.sh -e epe -m clientes

# Lo siguiente se realiza en segundo plano, demora 4.5hs, se puede chequear con: tail -f /log/cromo/index.log ("Finish to save Manzanas...")
/u/prometium/cromo/vigente/cromo/bin/index.sh -e epe -i blocks

# Reinicio del servidor
yes | /u/prometium/cromo/vigente/cromo/bin/cromoserver.sh -e epe start
# Al final acomodar manualmente lineas desordenadas de crontab, debe quedar:
#	# Actualizacion continua de las operaciones de la red
#	### Dependiendo de como se haya modificado esto, puede ser que sea una de las lineas del final. Es la que llama al updater
#	* * * * * /u/prometium/cromo/vigente/cromo/bin/updater.sh -e epe >> /u/prometium/cromo/vigente/cromo/log/updater-`date +\%Y\%m\%d`.log 2>&1

FIN=$(date +%s)
DEMORA=$(( FIN - INICIO ))
eval "echo Tiempo transcurrido: $(date -ud "@$DEMORA" +'%H:%M:%S')"

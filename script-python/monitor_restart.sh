#! /bin/bash
. ~/.bashrc > /dev/null

PROCESO=$(ps -ef | grep "python monitor.py" | grep -v grep | awk '{print $2}')
if [ "$PROCESO" != '' ]
then
    kill $PROCESO
    sleep 2
    ./monitor_start.sh
    echo "Monitor reiniciado correctamente"
else
    echo "El Monitor no se encuentra funcionando"
fi



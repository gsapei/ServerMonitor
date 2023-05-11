#! /bin/bash
. ~/.bashrc > /dev/null

APPSERVER_ZOMBIE="$(ps -ale | egrep '(defunct.*container|container.*defunct)')"
APPSERVER_UP="$(ps -u gisdesa | egrep '(*container.bin*)')"

if [ "$APPSERVER_ZOMBIE" ]; then
	echo "ZOMBIE"
elif [ "$APPSERVER_UP" ]; then
	echo "UP"
else
	echo "DOWN"
fi

#!/bin/sh

sh_path=`pwd`
echo sh_path:$sh_path
client_path=${sh_path}/..
netStructFileName=declare/net_structs.d.ts
mgrNetworkFileName=assets/scripts/game/manager/mgrNetwork.ts

while true; do
	s=`pwd`
	len=${#s}
	echo $s ${s:($len-4):3}

	if [ ${s:($len-4):3} == "ude" ]; then
		#echo "now, we in ude. pwd: `pwd`"
		cd prj.ulcocoscreator1.9.2/tools/netStructExporter
		python exporter.py $client_path $netStructFileName $mgrNetworkFileName
		break
	fi

	if [ $s == "/" ]; then
		echo "ude not found, please place sh in ude's sub path!"
		break
	fi

	cd ..
done

echo
echo press any key to continue ...
read anykey
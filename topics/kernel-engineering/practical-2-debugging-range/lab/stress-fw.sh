#!/bin/sh
# lg_fw: five rounds of 1000 images with a bad header, then one good image.
# Memory that a rejected image used must come back. The first round grows
# in any case (the script starts a thousand processes); what matters is
# whether rounds 2 to 5 keep growing.
set -u
unreclaim() { awk '/^SUnreclaim:/ { print $2 }' /proc/meminfo; }

start=$(unreclaim)
round=1
while [ "$round" -le 5 ]; do
	i=0
	while [ "$i" -lt 1000 ]; do
		dd if=/dev/zero of=/dev/lg_fw bs=4096 count=1 2>/dev/null
		i=$((i + 1))
	done
	echo "stress-fw: round $round, SUnreclaim grew $(( $(unreclaim) - start )) kB since the start"
	round=$((round + 1))
done
printf 'LGFW\010\000\000\000payload!' > /dev/lg_fw
echo "stress-fw: image size $(cat /dev/lg_fw), expected 16"

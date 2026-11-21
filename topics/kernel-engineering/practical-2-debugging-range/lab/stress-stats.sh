#!/bin/sh
# lg_stats: 4 writers, 2000 packets of 16 bytes each.
# Expected for this run: packets 8000 bytes 128000 next_seq 8000.
set -u
# The device prints "packets P bytes B next_seq S"; keep the three numbers.
set -- $(cat /dev/lg_stats)
p0=$2 b0=$4 s0=$6
w=0
while [ "$w" -lt 4 ]; do
	(
		i=0
		while [ "$i" -lt 2000 ]; do
			echo 0123456789abcde > /dev/lg_stats
			i=$((i + 1))
		done
	) &
	w=$((w + 1))
done
wait
set -- $(cat /dev/lg_stats)
echo "stress-stats: packets $(($2 - p0)) bytes $(($4 - b0)) next_seq $(($6 - s0))"
echo "stress-stats: expected packets 8000 bytes 128000 next_seq 8000"

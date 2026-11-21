#!/bin/sh
# lg_stats: 4 writers, 2000 packets of 16 bytes each.
# Expected: packets 8000 bytes 128000 next_seq 8000.
set -u
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
echo "stress-stats: $(cat /dev/lg_stats)"
echo "stress-stats: expected packets 8000 bytes 128000 next_seq 8000"

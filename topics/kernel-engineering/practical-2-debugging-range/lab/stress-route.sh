#!/bin/sh
# lg_route: one task switches tables while another looks up and reads stats.
set -u
D=/sys/kernel/debug/lg_route
(
	i=0
	while [ "$i" -lt 200 ]; do
		echo "table$i" > "$D/config"
		i=$((i + 1))
	done
) &
(
	i=0
	while [ "$i" -lt 200 ]; do
		echo "$i" > "$D/lookup"
		cat "$D/stats" > /dev/null
		i=$((i + 1))
	done
) &
wait
cat "$D/stats"
echo "stress-route: done"

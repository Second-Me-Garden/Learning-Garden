#!/bin/sh
# lg_session: 200 short sessions of 16 bytes each.
# Expected: this run adds 3200 bytes to the total.
set -u
before=$(cat /dev/lg_session)
i=0
while [ "$i" -lt 200 ]; do
	echo 0123456789abcde > /dev/lg_session
	i=$((i + 1))
done
sleep 1
after=$(cat /dev/lg_session)
echo "stress-session: this run added $((after - before)) bytes, expected 3200"

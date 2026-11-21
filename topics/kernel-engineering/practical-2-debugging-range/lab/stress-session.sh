#!/bin/sh
# lg_session: 200 short sessions, 16 bytes each. Expected total: 3200.
set -u
i=0
while [ "$i" -lt 200 ]; do
	echo 0123456789abcde > /dev/lg_session
	i=$((i + 1))
done
sleep 1
echo "stress-session: total $(cat /dev/lg_session), expected 3200"

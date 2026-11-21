#!/bin/sh
# Practical 2, the debugging range: build the lab modules as handed out and with the reference
# fixes applied, run every ticket in a guest of its own, and check that each one behaves the way
# the page says: the planted bug is reported by its tool, and the fixed module is clean.
#
#   range.sh <debug|kcsan> <linux-src> <build-dir> <work-dir>
#
# ONLY="warm stats" limits the run to the named tickets. Logs land in <work-dir>/logs.
# One guest per ticket, because KASAN reports only the first bad access of a boot and a report
# from either tool switches lockdep off.
set -eu
flavour=$1 src=$2 build=$3 work=$4
here=$(cd "$(dirname "$0")" && pwd)
lab=$here/../../topics/kernel-engineering/practical-2-debugging-range/lab

mkdir -p "$work/logs" "$work/share/fixed"
[ -f "$work/initramfs.cpio.gz" ] || sh "$here/make-initramfs.sh" "$work"

# The modules as handed out, and a second copy with the reference fixes applied.
rm -rf "$work/lab" "$work/lab-fixed"
cp -r "$lab" "$work/lab"
cp -r "$lab" "$work/lab-fixed"
for p in "$lab"/solutions/*.patch; do
	patch -s -p1 -d "$work/lab-fixed" < "$p"
done
for d in lab lab-fixed; do
	make -s -C "$src" O="$build" ARCH=arm64 LLVM=1 M="$work/$d" modules
done
cp "$work"/lab/*.ko "$work"/lab/stress-*.sh "$work/share/"
cp "$work"/lab-fixed/*.ko "$work/share/fixed/"

fail=0
wanted() {
	[ -z "${ONLY:-}" ] && return 0
	case " $ONLY " in *" $1 "*) return 0 ;; esac
	return 1
}
# ticket <name> <timeout>: the autorun body comes on stdin
ticket() {
	name=$1
	log=$work/logs/$flavour-$1.txt
	sh "$here/run-guest.sh" "$build" "$work" "$log" "$2"
	echo "--- $flavour/$name: $(tail -n 1 "$log")"
}
expect() {
	if grep -q -e "$2" "$work/logs/$flavour-$1.txt"; then echo "ok   $1: found: $2"
	else echo "FAIL $1: expected: $2"; fail=1; fi
}
refute() {
	if grep -q -e "$2" "$work/logs/$flavour-$1.txt"; then echo "FAIL $1: must not appear: $2"; fail=1
	else echo "ok   $1: absent: $2"; fi
}
count() {
	n=$(grep -c -e "$3" "$work/logs/$flavour-$1.txt" || true)
	if [ "$n" = "$2" ]; then echo "ok   $1: $2 times: $3"
	else echo "FAIL $1: expected $2 times, found $n: $3"; fail=1; fi
}
show() { grep -e "$2" "$work/logs/$flavour-$1.txt" || true; }
clean() { refute "$1" 'BUG: '; refute "$1" 'WARNING: '; refute "$1" 'INFO: task'; }

if [ "$flavour" = debug ]; then
	if wanted warm; then
		ticket warm 180 <<'EOF'
dmesg | grep -i -E 'KernelAddressSanitizer|kmemleak:|Lock dependency validator'
echo "=== insmod lg_warm"; insmod lg_warm.ko; sleep 1
echo "=== done"
EOF
		expect warm 'BUG: KASAN: slab-out-of-bounds in init_module'
		expect warm 'allocated 16-byte region'
	fi

	if wanted session; then
		# The guest usually hangs after the first report; the timeout ends it.
		ticket session 120 <<'EOF'
echo "=== insmod lg_session"; insmod lg_session.ko
echo "=== stress"; ./stress-session.sh; sleep 2
echo "=== rmmod"; rmmod lg_session
echo "=== done"
EOF
		expect session 'BUG: KASAN: slab-use-after-free'
		expect session 'lg_session_release+'
	fi
	if wanted fixed-session; then
		ticket fixed-session 300 <<'EOF'
echo "=== insmod fixed lg_session"; insmod fixed/lg_session.ko
echo "=== stress"; ./stress-session.sh; ./stress-session.sh; ./stress-session.sh; sleep 2
echo "=== rmmod"; rmmod lg_session; sleep 1
echo "=== done"
EOF
		count fixed-session 3 'stress-session: this run added 3200 bytes, expected 3200'
		expect fixed-session '=== done'
		clean fixed-session
	fi

	if wanted route; then
		ticket route 300 <<'EOF'
echo "=== insmod lg_route"; insmod lg_route.ko
echo 20 > /proc/sys/kernel/hung_task_timeout_secs
echo "=== stress"; ./stress-route.sh &
sleep 50
echo "=== sysrq w"; echo w > /proc/sysrq-trigger; sleep 2
echo "=== done"
EOF
		expect route 'WARNING: possible circular locking dependency detected'
		expect route 'lg_stats_show+'
		show route 'blocked for more than'
	fi
	if wanted fixed-route; then
		ticket fixed-route 300 <<'EOF'
echo "=== insmod fixed lg_route"; insmod fixed/lg_route.ko
echo 20 > /proc/sys/kernel/hung_task_timeout_secs
echo "=== stress"; ./stress-route.sh; ./stress-route.sh; ./stress-route.sh
echo "=== rmmod"; rmmod lg_route
echo "=== done"
EOF
		count fixed-route 3 'stress-route: done'
		expect fixed-route '=== done'
		clean fixed-route
	fi

	if wanted fw; then
		ticket fw 600 <<'EOF'
echo "=== insmod lg_fw"; insmod lg_fw.ko
echo "=== stress"; ./stress-fw.sh
echo "=== kmemleak"
sleep 6; echo scan > /sys/kernel/debug/kmemleak; sleep 2; echo scan > /sys/kernel/debug/kmemleak
head -n 40 /sys/kernel/debug/kmemleak
echo "=== leaks with lg_fw_write: $(grep -c 'lg_fw_write' /sys/kernel/debug/kmemleak)"
echo "=== done"
EOF
		expect fw 'unreferenced object'
		expect fw 'lg_fw_write+'
		show fw 'stress-fw: round'
	fi
	if wanted fixed-fw; then
		ticket fixed-fw 600 <<'EOF'
echo "=== insmod fixed lg_fw"; insmod fixed/lg_fw.ko
echo "=== stress"; ./stress-fw.sh
echo "=== kmemleak"
sleep 6; echo scan > /sys/kernel/debug/kmemleak; sleep 2; echo scan > /sys/kernel/debug/kmemleak
head -n 40 /sys/kernel/debug/kmemleak
echo "=== leaks with lg_fw_write: $(grep -c 'lg_fw_write' /sys/kernel/debug/kmemleak)"
echo "=== rmmod"; rmmod lg_fw
echo "=== done"
EOF
		expect fixed-fw '=== leaks with lg_fw_write: 0'
		expect fixed-fw 'stress-fw: image size 16, expected 16'
		expect fixed-fw '=== done'
		show fixed-fw 'stress-fw: round'
		clean fixed-fw
	fi
fi

# The stats ticket runs on both kernels: the debug kernel shows the symptom (lost updates),
# the KCSAN kernel names the two accesses that race. A KCSAN kernel is several times slower.
limit=600
[ "$flavour" = kcsan ] && limit=1800
if wanted stats; then
	ticket stats "$limit" <<'EOF'
dmesg | grep -i 'kcsan:'
echo "=== insmod lg_stats"; insmod lg_stats.ko
echo "=== stress"; ./stress-stats.sh
echo "=== done"
EOF
	expect stats 'stress-stats: packets'
	show stats 'stress-stats:'
	if [ "$flavour" = kcsan ]; then
		expect stats 'BUG: KCSAN: data-race in lg_stats_'
	fi
fi
if wanted fixed-stats; then
	ticket fixed-stats "$limit" <<'EOF'
echo "=== insmod fixed lg_stats"; insmod fixed/lg_stats.ko
echo "=== stress"; ./stress-stats.sh; ./stress-stats.sh; ./stress-stats.sh
echo "=== rmmod"; rmmod lg_stats
echo "=== done"
EOF
	count fixed-stats 3 'stress-stats: packets 8000 bytes 128000 next_seq 8000'
	expect fixed-stats '=== done'
	refute fixed-stats 'lg_stats_'
	# KCSAN also reports races in the kernel itself, so on that kernel only the module is checked.
	[ "$flavour" = kcsan ] || clean fixed-stats
fi

[ "$fail" = 0 ] && echo "range ($flavour): all checks passed" || echo "range ($flavour): FAILED"
exit "$fail"

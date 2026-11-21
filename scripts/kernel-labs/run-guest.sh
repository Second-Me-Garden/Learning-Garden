#!/bin/sh
# Boot one guest, let /mnt/share/autorun.sh run, and keep the serial console in a log.
#
#   run-guest.sh <build-dir> <work-dir> <log> <timeout-seconds> < autorun-body
#
# The machine is the one of the lab-setup page (run-vm.sh): virt, cortex-a72, 2 CPUs, 2G,
# the share on 9p. No disk: these labs do not need one.
set -eu
build=$1 work=$2 log=$3 limit=$4

mkdir -p "$work/share"
{
	echo '#!/bin/sh'
	echo 'mount -t debugfs none /sys/kernel/debug'
	echo 'cd /mnt/share'
	cat
} > "$work/share/autorun.sh"
chmod +x "$work/share/autorun.sh"

rc=0
timeout "$limit" qemu-system-aarch64 -M virt -cpu cortex-a72 -smp 2 -m 2G -nographic \
	-kernel "$build/arch/arm64/boot/Image" -initrd "$work/initramfs.cpio.gz" \
	-append "console=ttyAMA0 rdinit=/init nokaslr" \
	-virtfs "local,path=$work/share,mount_tag=share,security_model=none" \
	< /dev/null > "$log" 2>&1 || rc=$?
echo "run-guest: qemu exit $rc" >> "$log"

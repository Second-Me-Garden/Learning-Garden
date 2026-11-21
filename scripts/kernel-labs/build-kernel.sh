#!/bin/sh
# Build the arm64 kernel that the practical labs boot.
#
#   build-kernel.sh <debug|kcsan> <linux-src> <build-dir>
#
# debug: arm64 defconfig plus KASAN, lockdep, kmemleak and friends (Practical 2).
# kcsan: arm64 defconfig plus KCSAN, which cannot be combined with KASAN.
# Both add what the lab-setup page asks of every lab kernel (9p built in).
set -eu
flavour=$1 src=$2 out=$3

mkdir -p "$out"
m() { make -C "$src" LLVM=1 ARCH=arm64 O="$out" "$@"; }
cfg() { "$src/scripts/config" --file "$out/.config" "$@"; }

m defconfig
cfg -e NET_9P -e NET_9P_VIRTIO -e 9P_FS
case "$flavour" in
debug)
	cfg -e KASAN -e PROVE_LOCKING -e DEBUG_ATOMIC_SLEEP -e DEBUG_KMEMLEAK \
	    -e DETECT_HUNG_TASK -e DEBUG_LIST \
	    -e FTRACE -e FUNCTION_TRACER -e FUNCTION_GRAPH_TRACER \
	    -e GDB_SCRIPTS -d DEBUG_INFO_REDUCED
	want="KASAN KASAN_GENERIC PROVE_LOCKING DEBUG_KMEMLEAK DETECT_HUNG_TASK DEBUG_LIST"
	;;
kcsan)
	# On arm64 KCSAN is only offered when EXPERT is set (arch/arm64/Kconfig).
	cfg -e EXPERT -e KCSAN -e DETECT_HUNG_TASK
	want="KCSAN DETECT_HUNG_TASK"
	;;
*)
	echo "unknown flavour: $flavour" >&2
	exit 2
	;;
esac
m olddefconfig

for o in $want NET_9P NET_9P_VIRTIO 9P_FS; do
	grep -q "^CONFIG_$o=y" "$out/.config" || { echo "CONFIG_$o is not set after olddefconfig" >&2; exit 1; }
done

m -j"$(nproc)" Image
m modules_prepare
# Out-of-tree modules need Module.symvers. A reader who ran "make Image modules" has it;
# here only Image is built, so the list of symbols vmlinux exports stands in for it.
cp "$out/vmlinux.symvers" "$out/Module.symvers"

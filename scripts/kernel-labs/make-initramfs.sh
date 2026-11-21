#!/bin/sh
# Build the busybox initramfs the labs boot: the /init of the lab-setup page, plus one hook that
# runs /mnt/share/autorun.sh and powers off, so that a lab can run without a keyboard.
#
#   make-initramfs.sh <work-dir>      writes <work-dir>/initramfs.cpio.gz
#
# busybox is the static arm64 build of Ubuntu 24.04, pinned by checksum. The package pool keeps
# only the current version: when this download starts to fail, pin the new version and its sum.
set -eu
work=$1
deb=busybox-static_1.36.1-6ubuntu3.1_arm64.deb
sum=d96535e0402c011e0ee43449799df2f4504d44b842e4f2b3a6cbc845508eaafc

mkdir -p "$work/dl" "$work/root"
[ -f "$work/dl/$deb" ] || curl -fsS -o "$work/dl/$deb" "http://ports.ubuntu.com/ubuntu-ports/pool/main/b/busybox/$deb"
echo "$sum  $work/dl/$deb" | sha256sum -c -
dpkg-deb -x "$work/dl/$deb" "$work/dl/bb"

r=$work/root
mkdir -p "$r/bin" "$r/sbin" "$r/usr/bin" "$r/usr/sbin" "$r/proc" "$r/sys" "$r/dev" "$r/mnt"
cp "$work/dl/bb/usr/bin/busybox" "$r/bin/busybox"
ln -sf busybox "$r/bin/sh"
cat > "$r/init" <<'INIT'
#!/bin/sh
/bin/busybox --install -s
mount -t proc none /proc
mount -t sysfs none /sys
mount -t devtmpfs none /dev
mkdir -p /mnt/disk /mnt/share
mount -t ext4 /dev/vda /mnt/disk 2>/dev/null || echo "no disk"
mount -t 9p -o trans=virtio,version=9p2000.L share /mnt/share || echo "no 9p"
if [ -x /mnt/share/autorun.sh ]; then
	/mnt/share/autorun.sh
	poweroff -f
fi
exec /bin/sh
INIT
chmod +x "$r/init"
(cd "$r" && find . | cpio -o -H newc 2>/dev/null | gzip > ../initramfs.cpio.gz)
ls -l "$work/initramfs.cpio.gz"

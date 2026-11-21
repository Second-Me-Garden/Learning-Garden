// SPDX-License-Identifier: GPL-2.0
/*
 * lg_stats: packet accounting behind /dev/lg_stats.
 *
 * Every write is one packet. The driver gives it the next sequence number,
 * keeps a copy of the last packet, and counts packets and bytes. Reading
 * the device prints the three counters.
 *
 * Learning Garden, Kernel Engineering, Practical 2. This module has one bug.
 */
#include <linux/fs.h>
#include <linux/miscdevice.h>
#include <linux/module.h>
#include <linux/uaccess.h>

#define LG_PKT_MAX 256

static struct {
	u64 next_seq;
	u64 packets;
	u64 bytes;
	size_t last_len;
	u8 last[LG_PKT_MAX];
} lg_st;

static ssize_t lg_stats_write(struct file *file, const char __user *buf,
			      size_t count, loff_t *ppos)
{
	size_t n = min_t(size_t, count, LG_PKT_MAX);
	u64 seq;

	seq = lg_st.next_seq;

	if (copy_from_user(lg_st.last, buf, n))
		return -EFAULT;
	lg_st.last_len = n;

	lg_st.bytes += n;
	lg_st.packets++;
	lg_st.next_seq = seq + 1;

	return count;
}

static ssize_t lg_stats_read(struct file *file, char __user *buf,
			     size_t count, loff_t *ppos)
{
	char line[96];
	int len;

	len = scnprintf(line, sizeof(line), "packets %llu bytes %llu next_seq %llu\n",
			lg_st.packets, lg_st.bytes, lg_st.next_seq);
	return simple_read_from_buffer(buf, count, ppos, line, len);
}

static const struct file_operations lg_stats_fops = {
	.owner  = THIS_MODULE,
	.read   = lg_stats_read,
	.write  = lg_stats_write,
	.llseek = default_llseek,
};

static struct miscdevice lg_stats_dev = {
	.minor = MISC_DYNAMIC_MINOR,
	.name  = "lg_stats",
	.fops  = &lg_stats_fops,
	.mode  = 0666,
};
module_misc_device(lg_stats_dev);

MODULE_DESCRIPTION("Learning Garden debugging range: packet accounting");
MODULE_LICENSE("GPL");

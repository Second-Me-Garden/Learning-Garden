// SPDX-License-Identifier: GPL-2.0
/*
 * lg_fw: a firmware slot behind /dev/lg_fw.
 *
 * One write is one image: an 8-byte header (magic "LGFW", payload length,
 * both little endian) followed by the payload. A valid image replaces the
 * one in the slot. Reading the device prints the size of the image held.
 *
 * Learning Garden, Kernel Engineering, Practical 2. This module has one bug.
 */
#include <linux/fs.h>
#include <linux/miscdevice.h>
#include <linux/module.h>
#include <linux/mutex.h>
#include <linux/slab.h>
#include <linux/uaccess.h>

#define LG_FW_MAGIC 0x5746474c		/* "LGFW" read as little endian */
#define LG_FW_MAX   (64 * 1024)

struct lg_fw_hdr {
	__le32 magic;
	__le32 len;			/* payload bytes after the header */
};

static DEFINE_MUTEX(lg_fw_lock);	/* protects lg_fw_cur, lg_fw_size */
static void *lg_fw_cur;
static size_t lg_fw_size;

static ssize_t lg_fw_write(struct file *file, const char __user *buf,
			   size_t count, loff_t *ppos)
{
	struct lg_fw_hdr *hdr;
	void *blob;

	if (count < sizeof(*hdr) || count > LG_FW_MAX)
		return -EINVAL;

	blob = kmalloc(count, GFP_KERNEL);
	if (!blob)
		return -ENOMEM;

	if (copy_from_user(blob, buf, count)) {
		kfree(blob);
		return -EFAULT;
	}

	hdr = blob;
	if (le32_to_cpu(hdr->magic) != LG_FW_MAGIC)
		return -EINVAL;
	if (le32_to_cpu(hdr->len) != count - sizeof(*hdr))
		return -EINVAL;

	mutex_lock(&lg_fw_lock);
	kfree(lg_fw_cur);
	lg_fw_cur = blob;
	lg_fw_size = count;
	mutex_unlock(&lg_fw_lock);

	return count;
}

static ssize_t lg_fw_read(struct file *file, char __user *buf,
			  size_t count, loff_t *ppos)
{
	char line[32];
	int len;

	mutex_lock(&lg_fw_lock);
	len = scnprintf(line, sizeof(line), "%zu\n", lg_fw_size);
	mutex_unlock(&lg_fw_lock);
	return simple_read_from_buffer(buf, count, ppos, line, len);
}

static const struct file_operations lg_fw_fops = {
	.owner  = THIS_MODULE,
	.read   = lg_fw_read,
	.write  = lg_fw_write,
	.llseek = default_llseek,
};

static struct miscdevice lg_fw_dev = {
	.minor = MISC_DYNAMIC_MINOR,
	.name  = "lg_fw",
	.fops  = &lg_fw_fops,
	.mode  = 0666,
};

static int __init lg_fw_init(void)
{
	return misc_register(&lg_fw_dev);
}

static void __exit lg_fw_exit(void)
{
	misc_deregister(&lg_fw_dev);
	kfree(lg_fw_cur);
}

module_init(lg_fw_init);
module_exit(lg_fw_exit);

MODULE_DESCRIPTION("Learning Garden debugging range: firmware slot");
MODULE_LICENSE("GPL");

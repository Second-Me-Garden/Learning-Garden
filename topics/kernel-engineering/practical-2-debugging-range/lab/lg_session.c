// SPDX-License-Identifier: GPL-2.0
/*
 * lg_session: byte accounting, one session per open of /dev/lg_session.
 *
 * A write adds its length to the session. Every 20 ms a work item folds
 * what the session has collected into the global total, so a write never
 * touches the shared counter. Reading the device prints the total.
 *
 * Learning Garden, Kernel Engineering, Practical 2. This module has one bug.
 */
#include <linux/atomic.h>
#include <linux/fs.h>
#include <linux/jiffies.h>
#include <linux/miscdevice.h>
#include <linux/module.h>
#include <linux/slab.h>
#include <linux/uaccess.h>
#include <linux/workqueue.h>

#define LG_FOLD_MS 20

struct lg_session {
	struct delayed_work fold;
	atomic64_t pending;		/* bytes not yet in the total */
	u64 folded;			/* bytes this session has contributed */
};

static atomic64_t lg_total;

static void lg_session_fold(struct work_struct *work)
{
	struct lg_session *s = container_of(to_delayed_work(work),
					    struct lg_session, fold);
	u64 n = atomic64_xchg(&s->pending, 0);

	s->folded += n;
	atomic64_add(n, &lg_total);
	schedule_delayed_work(&s->fold, msecs_to_jiffies(LG_FOLD_MS));
}

static int lg_session_open(struct inode *inode, struct file *file)
{
	struct lg_session *s;

	s = kzalloc_obj(*s);
	if (!s)
		return -ENOMEM;

	INIT_DELAYED_WORK(&s->fold, lg_session_fold);
	file->private_data = s;
	schedule_delayed_work(&s->fold, msecs_to_jiffies(LG_FOLD_MS));
	return 0;
}

static ssize_t lg_session_write(struct file *file, const char __user *buf,
				size_t count, loff_t *ppos)
{
	struct lg_session *s = file->private_data;

	atomic64_add(count, &s->pending);
	return count;
}

static ssize_t lg_session_read(struct file *file, char __user *buf,
			       size_t count, loff_t *ppos)
{
	char line[32];
	int len;

	len = scnprintf(line, sizeof(line), "%lld\n",
			(long long)atomic64_read(&lg_total));
	return simple_read_from_buffer(buf, count, ppos, line, len);
}

static int lg_session_release(struct inode *inode, struct file *file)
{
	struct lg_session *s = file->private_data;

	/* Whatever the last fold has not seen yet still counts. */
	atomic64_add(atomic64_xchg(&s->pending, 0), &lg_total);
	kfree(s);
	return 0;
}

static const struct file_operations lg_session_fops = {
	.owner   = THIS_MODULE,
	.open    = lg_session_open,
	.read    = lg_session_read,
	.write   = lg_session_write,
	.release = lg_session_release,
};

static struct miscdevice lg_session_dev = {
	.minor = MISC_DYNAMIC_MINOR,
	.name  = "lg_session",
	.fops  = &lg_session_fops,
	.mode  = 0666,
};
module_misc_device(lg_session_dev);

MODULE_DESCRIPTION("Learning Garden debugging range: session accounting");
MODULE_LICENSE("GPL");

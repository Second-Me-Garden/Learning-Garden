// SPDX-License-Identifier: GPL-2.0
/*
 * lg_route: a toy routing table with counters, driven through debugfs.
 *
 *   /sys/kernel/debug/lg_route/config   write a name: switch to that table
 *   /sys/kernel/debug/lg_route/lookup   write a key: count a hit or a miss
 *   /sys/kernel/debug/lg_route/stats    read: table name, generation, counters
 *
 * Switching the table restarts the counters, and a stats line must show
 * counters that belong to the table it names.
 *
 * Learning Garden, Kernel Engineering, Practical 2. This module has one bug.
 */
#include <linux/debugfs.h>
#include <linux/delay.h>
#include <linux/fs.h>
#include <linux/module.h>
#include <linux/mutex.h>
#include <linux/seq_file.h>
#include <linux/string.h>
#include <linux/uaccess.h>

static DEFINE_MUTEX(lg_cfg_lock);	/* protects lg_cfg_name, lg_cfg_gen */
static DEFINE_MUTEX(lg_stats_lock);	/* protects lg_hits, lg_misses */

static char lg_cfg_name[32] = "default";
static unsigned int lg_cfg_gen;
static u64 lg_hits, lg_misses;
static struct dentry *lg_dir;

static ssize_t lg_config_write(struct file *file, const char __user *buf,
			       size_t count, loff_t *ppos)
{
	char name[sizeof(lg_cfg_name)];
	ssize_t len;

	len = simple_write_to_buffer(name, sizeof(name) - 1, ppos, buf, count);
	if (len <= 0)
		return len;
	name[len] = '\0';
	strim(name);

	mutex_lock(&lg_cfg_lock);
	strscpy(lg_cfg_name, name, sizeof(lg_cfg_name));
	lg_cfg_gen++;

	/* Give lookups that started on the old table time to finish. */
	usleep_range(500, 1000);

	mutex_lock(&lg_stats_lock);
	lg_hits = 0;
	lg_misses = 0;
	mutex_unlock(&lg_stats_lock);
	mutex_unlock(&lg_cfg_lock);

	return count;
}

static ssize_t lg_lookup_write(struct file *file, const char __user *buf,
			       size_t count, loff_t *ppos)
{
	char key;

	if (!count)
		return 0;
	if (get_user(key, buf))
		return -EFAULT;

	mutex_lock(&lg_stats_lock);
	if (key & 1)
		lg_hits++;
	else
		lg_misses++;
	mutex_unlock(&lg_stats_lock);

	return count;
}

static int lg_stats_show(struct seq_file *m, void *v)
{
	mutex_lock(&lg_stats_lock);
	/* The counters only mean something next to the table they count. */
	mutex_lock(&lg_cfg_lock);
	seq_printf(m, "table %s gen %u hits %llu misses %llu\n",
		   lg_cfg_name, lg_cfg_gen, lg_hits, lg_misses);
	mutex_unlock(&lg_cfg_lock);
	mutex_unlock(&lg_stats_lock);
	return 0;
}
DEFINE_SHOW_ATTRIBUTE(lg_stats);

static const struct file_operations lg_config_fops = {
	.owner  = THIS_MODULE,
	.open   = simple_open,
	.write  = lg_config_write,
	.llseek = default_llseek,
};

static const struct file_operations lg_lookup_fops = {
	.owner  = THIS_MODULE,
	.open   = simple_open,
	.write  = lg_lookup_write,
	.llseek = default_llseek,
};

static int __init lg_route_init(void)
{
	lg_dir = debugfs_create_dir("lg_route", NULL);
	debugfs_create_file("config", 0200, lg_dir, NULL, &lg_config_fops);
	debugfs_create_file("lookup", 0200, lg_dir, NULL, &lg_lookup_fops);
	debugfs_create_file("stats", 0400, lg_dir, NULL, &lg_stats_fops);
	return 0;
}

static void __exit lg_route_exit(void)
{
	debugfs_remove_recursive(lg_dir);
}

module_init(lg_route_init);
module_exit(lg_route_exit);

MODULE_DESCRIPTION("Learning Garden debugging range: routing table");
MODULE_LICENSE("GPL");

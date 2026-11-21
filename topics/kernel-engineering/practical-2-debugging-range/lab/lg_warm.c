// SPDX-License-Identifier: GPL-2.0
/*
 * lg_warm: the warm-up for the debugging range.
 *
 * Loading this module writes one byte past the end of a small allocation,
 * on purpose, so that the first KASAN report you read is one whose cause
 * you already know.
 *
 * Learning Garden, Kernel Engineering, Practical 2.
 */
#include <linux/module.h>
#include <linux/slab.h>
#include <linux/string.h>

static unsigned int len = 16;
module_param(len, uint, 0444);
MODULE_PARM_DESC(len, "size of the buffer to overrun by one byte");

static int __init lg_warm_init(void)
{
	char *name;

	name = kmalloc(len, GFP_KERNEL);
	if (!name)
		return -ENOMEM;

	memset(name, 'A', len);
	name[len] = '\0';		/* one byte past the end */

	pr_info("lg_warm: wrote %u bytes into a %u-byte buffer\n", len + 1, len);
	kfree(name);
	return 0;
}

static void __exit lg_warm_exit(void)
{
}

module_init(lg_warm_init);
module_exit(lg_warm_exit);

MODULE_DESCRIPTION("Learning Garden debugging range: warm-up");
MODULE_LICENSE("GPL");

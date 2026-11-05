# Kernel Engineering — pins and sources

The kernel topic was written against `torvalds/linux` master and `apple-oss-distributions/xnu` main (October 2026). Function names and file paths drift between releases (v6.19 has both `do_filp_open` and `do_file_open`; from v7.0 only `do_file_open`; checked at the tags on 2026-11-05; the lessons first dated that rename wrongly as 7.4-rc1), so from 2026-11-05 the topic is pinned the way the other four topics are: every source claim is checked at the tags below, the labs clone those tags, and a claim that only holds on a newer version says so with a date.

## Pins (checked 2026-11-05)

| What | Pin | Source checked | Note |
| --- | --- | --- | --- |
| Linux | tag `v7.3.1` on the kernel.org stable tree (stable 7.3 series, released 2026-10-30) | `https://www.kernel.org/releases.json`, 2026-11-05: latest stable 7.3.1; mainline 7.4-rc1 (2026-11-01). `git ls-remote`, 2026-11-05: tag object `dfc1145b` in `https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git` and in the `gregkh/linux` GitHub mirror | The lessons' function names are verified at this tag. `torvalds/linux` carries only mainline tags (`v7.3`, `v7.4-rc1`) and has no `v7.3.1`, so the clone uses the stable tree and source is read through the `gregkh/linux` mirror. Where a name changed in another release, the page names the pinned name and adds "renamed … in <version>" with the date. |
| Linux build | `git clone --depth 1 --branch v7.3.1 https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git` | Lab-setup and Phase 0 | `LLVM=1 ARCH=arm64 defconfig` as before. The same clone from `torvalds/linux` fails because that repository has no `v7.3.1` tag. |
| XNU | tag `xnu-12377.121.6` (the newest published tag) | `https://api.github.com/repos/apple-oss-distributions/xnu/tags`, 2026-11-05 | Apple publishes XNU source after each macOS release; the lab Mac runs macOS 27.2, whose XNU is not yet published, so the lessons read the newest published tag and say so. |
| XNU build | `git clone --depth 1 --branch xnu-12377.121.6 https://github.com/apple-oss-distributions/xnu.git` | Phase 0 Lab B | Phase 8 keeps its tag discovery command (`git ls-remote --tags`) and a full clone with `git checkout xnu-12377.121.6`, because its later lab diffs adjacent tags and a shallow clone has none; it names `xnu-12377.121.6` as the newest tag on 2026-11-05 and says macOS 27.2's source is not yet published. |
| QEMU | the Homebrew `qemu` of the day (no pin; `qemu-system-aarch64 --version` is recorded in the lab notes) | — | The `virt` machine's memory map is cited from `hw/arm/virt.c` on QEMU master, dated. |
| Books | as listed in each lesson's bibliography | — | Editions and years are part of the entry. |

## Rules

- A page that names a Linux file, function, table or constant names it as it is at `v7.3.1`. If the lesson's point depends on a change after that tag, the page says "at v7.3.1 …; from 7.4-rc1 …" with the date the newer tree was read.
- A page that names an XNU file or function names it as it is at `xnu-12377.121.6`.
- The lab commands pin the clones to these tags. A reader who wants newer source changes the tag deliberately.
- Re-pin by editing this table, re-running the verification list below, and dating the change; do not edit a function name on a page without re-checking it at the pin.

## Verification list

Every item below was checked at the pinned tags on 2026-11-05 by reading the raw file (the checker does not do this; it is a reading task). Linux files were read through the `gregkh/linux` mirror at `https://raw.githubusercontent.com/gregkh/linux/v7.3.1/<path>` (`Makefile` there reads 7 / 3 / 1; `fs/namei.c` was also read from `https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/plain/fs/namei.c?h=v7.3.1` and matches), XNU files at `https://raw.githubusercontent.com/apple-oss-distributions/xnu/xnu-12377.121.6/<path>`. A new claim on a kernel page is added here with the file it rests on.

| Page | Claim | File at the pin | Checked |
| --- | --- | --- | --- |
| Phase 0 | vector table: four groups of four `kernel_ventry`, `.align 7`; `el0t_64_sync`; `tramp_vectors` under KPTI | `arch/arm64/kernel/entry.S` | v7.3.1 ✓ (`vectors` at lines 513–532, `.align 7` in the macro at line 40, `tramp_vectors` at line 754) |
| Phase 0 | `el0t_64_sync_handler` → `el0_svc` → `do_el0_svc` reading `regs[8]`; `invoke_syscall`, `sys_call_table` | `arch/arm64/kernel/entry-common.c`, `arch/arm64/kernel/syscall.c` | v7.3.1 ✓ (`regs->regs[8]` at `syscall.c:140`) |
| Phase 0 | syscall numbers (`write` = 64, `openat` = 56) | `scripts/syscall.tbl` or `include/uapi/asm-generic/unistd.h` | v7.3.1 ✓ (both files) |
| Phase 0 | ESR encodings for SVC (EC 0x15) | `arch/arm64/include/asm/esr.h` | v7.3.1 ✓ (`ESR_ELx_EC_SVC64 UL(0x15)`) |
| Phase 1 | `cpu_switch_to` saves 13 registers; `struct cpu_context` | `arch/arm64/kernel/entry.S`, `arch/arm64/include/asm/processor.h` | v7.3.1 ✓ (x19–x28, x29, sp, lr; `cpu_context` ends `fp, sp, pc`) |
| Phase 1 | weights 1024 / 335; base slice 700 000 ns; log scaling by 1 + ilog2(min(cpus, 8)) | `kernel/sched/core.c`, `kernel/sched/fair.c` | v7.3.1 ✓ (`fair.c:85`, `get_update_sysctl_factor` at line 198) |
| Phase 2 | `do_translation_fault` → `do_page_fault`; `fault_info[7]` "level 3 translation fault"; ESR DFSC values | `arch/arm64/mm/fault.c`, `arch/arm64/include/asm/esr.h` | v7.3.1 ✓ (`fault_info[]` at line 917, index 7 at line 925) |
| Phase 2 | `cpu_do_switch_mm` writes the ASID into TTBR1 | `arch/arm64/mm/context.c`, `arch/arm64/mm/proc.S` | v7.3.1 ✓ (`context.c:349`, C not assembly; `proc.S` has no copy) |
| Phase 4 | `do_file_open` (v6.19 has both `do_filp_open` and `do_file_open`; from v7.0 only `do_file_open`; checked at the tags on 2026-11-05); `open_last_lookups` → `lookup_open`; `lookup_slow` for intermediate components; `fd_install` | `fs/namei.c`, `fs/file.c` | v7.3.1 ✓ as `do_file_open` (`namei.c:5018`); v6.19 has both `do_filp_open` and `do_file_open`, from v7.0 only `do_file_open` (checked at the tags on 2026-11-05). Other names ✓, and `fd_install` is reached through `FD_ADD` in `do_sys_openat2`. |
| Phase 4 | `AT_FDCWD` = −100; `dirty_expire_centisecs` = 3000 | `include/uapi/linux/fcntl.h`, `mm/page-writeback.c` | v7.3.1 ✓ (`dirty_expire_interval = 30 * 100`) |
| Phase 5 | virtio-mmio probe: magic, Version 1–3, DeviceID 0 → `-ENODEV`; register offsets 0x060 / 0x064 | `drivers/virtio/virtio_mmio.c`, `include/uapi/linux/virtio_mmio.h` | v7.3.1 ✓ (`version < 1 \|\| version > 3` at line 620 returns `-ENXIO`; bad magic and DeviceID 0 return `-ENODEV`) |
| Phase 5 | GIC hwirq = SPI + 32; `vring_interrupt` → `virtblk_done` → `blk_mq_complete_request` | `drivers/irqchip/irq-gic.c`, `drivers/virtio/virtio_ring.c`, `drivers/block/virtio_blk.c` | v7.3.1 ✓ (`param[1] + 32` at `irq-gic.c:1098`) |
| Phase 6 | `vt_ioctl` example and `faddr2line` | `Documentation/admin-guide/bug-hunting.rst`, `scripts/faddr2line` | v7.3.1 ✓ (`faddr2line` size-mismatch messages at lines 296, 303) |
| Phase 7 | PAC bit budget, `ptrauth_kernel_pac_mask` | `arch/arm64/include/asm/pointer_auth.h`, `Documentation/arch/arm64/pointer-authentication.rst` | v7.3.1 ✓ (`GENMASK_ULL(63, vabits_actual)`; rst: 48-bit VA gives 7 bits) |
| Lab-setup | `ARM\x64` magic at offset 56, `text_offset` at offset 8; boot protocol x0–x3 | `arch/arm64/kernel/head.S`, `Documentation/arch/arm64/booting.rst` | v7.3.1 ✓ (`text_offset` is `.quad 0`) |
| Phase 1 | `Image` header: first slot `efi_signature_nop`, second the branch to `primary_entry`; magic at 0x38 | `arch/arm64/kernel/head.S`, `arch/arm64/kernel/efi-header.S` | v7.3.1: page said the first instruction is the branch; fixed 2026-11-05 |
| Phase 6 | ftrace and bpftrace probe on the open path: `do_file_open` at the pin, `do_filp_open` on 6.x distribution kernels | `fs/namei.c` | v7.3.1: page probed `do_filp_open`, which does not exist at the tag; fixed 2026-11-05 |
| Phase 0, 3, 8 | `Lel0_synchronous_vector_64`, `fleh_synchronous`, `sleh_synchronous`, `handle_svc`, `unix_syscall`, `mach_syscall`; `SPILL_REGISTERS` stores q0–q31; `mach_msg2_trap` (−47); `sysent[]`, `mach_trap_table[]` | XNU `osfmk/arm64/locore.s`, `osfmk/arm64/sleh.c`, `osfmk/arm64/exception_asm.h`, `bsd/dev/arm/systemcalls.c`, `libsyscall/mach/mach_msg.c`, `bsd/kern/syscalls.master`, `osfmk/kern/syscall_sw.c` | xnu-12377.121.6 ✓ (`mach_msg2_trap` is trap 47 and `mach_msg_trap` trap 31 in `syscall_sw.c`) |

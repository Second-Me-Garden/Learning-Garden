# Kernel Engineering — practical track (authoring spec)

Topic id `kernel-engineering`, folders `topics/kernel-engineering/practical-N-<slug>/`, progress keys `kernel/practical-N` (N from 1). The practical track is a second route inside the kernel topic that starts after Phase 8. It does not get its own hub card. Written against `docs/authoring/PAGE_CONTRACT.md` (section "Practical stage pages"). The pins are the ones in `KERNEL_SYLLABUS.md`: Linux `v7.3.1`, XNU `xnu-12377.121.6`.

Accepted by the Founder on 2026-11-21 (「可以开始」, on the outline "内核工程 · 实战级别大纲（草案）"). He then settled the five decisions at the end of this file one by one the same day; they are recorded there in his words.

## Why this track exists

The nine phases take a reader from beginner to intermediate: they can explain the mechanisms and read the source. Of the 18 labs, most run commands and read output; kernel code is written in three places only (small demos in Phase 3, a character device and a platform driver in Phase 5, the capstone skeleton in Phase 8). A reader who finishes has nothing an employer can open and inspect. The practical track adds that: eight stages, each ending in one piece of work that can go on a résumé. It does not re-teach mechanisms; it assumes Phases 0 to 8.

What it cannot do: stand in for the "5+ years of experience" line in a posting. The aim is that a learner applying for a junior or mid-level role can show real patch links, analysis write-ups and repositories.

## What employers ask for (read 2026-11-21)

Four postings and the Linux Foundation's account of its kernel mentorship were read on 2026-11-21. Six requirements recur; every stage answers at least one.

| Requirement | How the postings put it | Named by |
| --- | --- | --- |
| Diagnosing real failures | deadlocks, races, panics, hangs, performance regressions; from a vague bug report to a root cause | all four |
| Upstream process and patches | submit, review and apply patches; know the upstream process and release cycle; a record of upstream contributions | Apple (Linux), Canonical, Collabora |
| Device drivers | port, maintain and upstream drivers; BSPs and board bring-up | Apple (Linux), Canonical, Collabora |
| Performance work | reduce lock contention, change the scheduler, build benchmarking tools | all four |
| CI and releases | pipelines that build, test and release kernels; regression triage; backports | Apple (Linux), Canonical, Collabora |
| Debugging tools | perf, ftrace, bpftrace, crash, gdb | Apple (Linux); the other three name no tools |

Also: all four require C, Rust appears in two and is optional in both; three ask for written communication (patch review, documentation); the mentorship's graduation bar is roughly 5 to 10 patches, patches still under review included.

Sources: Apple, Kernel Scheduler Engineer, Core OS (`https://jobs.anitab.org/companies/apple/jobs/72474426-kernel-scheduler-engineer-core-os`, closed); Apple, Linux Kernel Engineer (`https://jobs.anitab.org/companies/apple/jobs/86530044-linux-kernel-engineer`); Canonical, Linux Kernel Engineer (`https://job-boards.greenhouse.io/canonical/jobs/5151903`); Collabora, Linux Kernel Consultant (`https://jobs.lever.co/collabora/fb757480-1900-48c6-b903-2db192408c63`); Linux Foundation, "Behind the scenes of running Linux kernel mentorship programs" (2023). The two Apple postings were read on a job board's copy; Apple's own pages for them are gone. Postings expire: re-read before quoting them on a page, and never quote a posting on a lesson page as if it were current.

## Design rules

1. **Every stage ends in a piece of work**: a file, a link or a repository someone else can open (a patch ready for a list, a bug analysis, a driver with tests, a performance report, a CI pipeline).
2. **Real objects.** Patches are made against real development trees and are ready for the real lists, bugs come from real syzbot reports, backports target real stable branches. The one exception is the debugging range (Practical 2), whose modules carry bugs we planted, because practice needs a failure that reproduces every time.
3. **Goals, not steps.** A lesson lab is one command per step. A practical stage gives the task, the acceptance criteria and hints that stay folded until asked for; a reference solution, where there is one, is folded too.
4. **Everything is written up.** Each stage has a design note or a post-mortem, written the way the kernel community writes commit messages and bug reports.
5. **The author runs it first.** Every warm-up and every lab is run before the page says what it prints, and the page says where and when (see "How the labs were run"). A step that could not be run is marked 未运行 / not run.
6. **Free sources only.** Kernel documentation, source, LWN and list archives; no paid textbook.
7. **Nothing is sent on the learner's behalf.** A step that sends mail to a public list, replies to a reviewer or asks syzbot to test is marked 由学习者完成 / done by the learner and is never run by the author or by any tool acting for the author. The kernel's own rule for AI assistants says the same (`Documentation/process/coding-assistants.rst` at v7.3.1: "the assistant must never send anything itself"; "AI agents MUST NOT add Signed-off-by tags").
8. **Posting in public is the learner's choice.** Every stage that touches a public list or a public service has two finishing routes. The local route does every step up to the sending and counts as done. The public route really posts, and the page offers it only after saying what becomes public for good (real name, e-mail address, the mail itself). No acceptance criterion may require the public route (decision 1).

## Stages

Eight stages, in order, about five to six months of spare time. The durations are estimates and are corrected as stages are built.

| Stage | Folder | Theme | Work delivered | Requirement answered | Estimate |
| --- | --- | --- | --- | --- | --- |
| Practical 1 | `practical-1-upstream-workflow` | Upstream workflow and a first patch | a patch ready for a list, reviewed once and revised; the list archive link if the learner posts it | upstream process | 2 weeks |
| Practical 2 | `practical-2-debugging-range` | The debugging range | four post-mortems: use-after-free, deadlock, data race, memory leak | real failures, debugging tools | 3 weeks |
| Practical 3 | (planned) | Fix a real bug | a root-cause report and a tested fix; posted to a list if the learner chooses | real failures, upstream process | 3 weeks |
| Practical 4 | (planned) | A complete driver from nothing | a driver repository: code, tests, design note | device drivers | 4 weeks |
| Practical 5 | (planned) | A performance investigation | a report with before and after numbers, and benchmark scripts | performance, debugging tools | 3 weeks |
| Practical 6 | (planned) | CI, bisection and backports | a pipeline that builds, boots and tests; a backport patch | CI and releases | 2 weeks |
| Practical 7 | (on hold) | The Apple side | three panic analyses and a system extension or an XNU scheduler reading report | real failures, performance | 3 weeks |
| Practical 8 | (planned) | Portfolio and interviews | a portfolio page, three review exercises, five debugging stories | communication, upstream process | 2 weeks |

### Practical 1 · Upstream workflow and a first patch

- **Task**: set up `git send-email`; learn `checkpatch.pl` and `get_maintainer.pl`; read how one subsystem reviews; find a small real defect (a documentation error, a kernel-doc warning, a cleanup in `drivers/staging`), make the patch and mail it to oneself, then finish by one of two routes: local (review the patch oneself a day later, make a second version from the findings) or public (post it, answer the review, post a second version when asked).
- **Work**: the patch file and half a page of notes; on the public route also the patch link in a list archive.
- **Done when**: the patch passes `checkpatch.pl`, is addressed to the right maintainers and lists (shown by `git send-email --dry-run` on the local route), and went through one round of review: the learner's own on the local route, at least one answered review comment on the public route. Being merged is welcome and not required; the learner does not control the timing.
- **Warm-up (run by the author)**: two rounds on the pinned tree, never sent. Round 1 follows a `checkpatch.pl -f` suggestion on `drivers/staging/sm750fb/sm750.c` (`g_fbmode`), and the build fails, because the array is assigned at run time: tool output is a hint. Round 2 fixes a real kernel-doc warning in `drivers/staging/nvec/nvec.h` (`@gpio` for the member `gpiod`), takes it through `format-patch`, `checkpatch.pl`, `get_maintainer.pl`, a build and `git send-email --dry-run`, then produces a v2 with a changelog below the `---`.
- **Diagram**: the life of a patch, from a local commit to mainline.

### Practical 2 · The debugging range

- **Task**: four kernel modules, each with one planted bug. The page gives the symptom and a stress script, not the cause. The learner finds each root cause with KASAN, lockdep, the hung-task detector and SysRq, kmemleak and KCSAN, and fixes it.
- **Work**: four post-mortems (symptom, reproduction, root cause, fix, verification).
- **Done when**: in a fresh boot each fixed module passes its stress script three times, the tool that reported the bug stays silent, and the module unloads cleanly.
- **Modules** (`practical-2-debugging-range/lab/`): `lg_session` (a delayed work item outlives the object that embeds it), `lg_route` (two mutexes taken in opposite orders), `lg_stats` (counters updated without a lock), `lg_fw` (two error paths that do not free). The file names do not name the bug; the page's reference solutions do, behind a fold.
- **Diagram**: the debugging loop, from symptom to verified fix.

### Practical 3 to 8

One paragraph each until they are built; the outline accepted on 2026-11-21 is the source.

- **3 · Fix a real bug.** Pick a public syzbot report that has a reproducer; reproduce it in QEMU; `git bisect` to the commit that introduced it; write the root cause; write a fix with `Fixes:` and `Reported-by:`. Done when the reproducer no longer triggers on the patched kernel in the learner's own QEMU. Posting the fix and asking syzbot to test it are the public route, the learner's choice (rule 8). The page teaches how to pick a bug of the right size that nobody has claimed.
- **4 · A complete driver from nothing.** A driver for QEMU's `edu` device (PCI, registers, an interrupt, DMA) with read/write, `ioctl`, `poll` and `mmap`. Repository with the driver, KUnit tests, a user-space test program and a design note. Done when 1000 load/unload cycles are clean, the tests pass with KASAN and lockdep on, and the code passes `checkpatch.pl`. Rust version as an optional extra.
- **5 · A performance investigation.** Locate lock contention in a workload we slowed down (perf, ftrace, bpftrace) and fix it; then write a simple `sched_ext` policy and compare latency against the default scheduler. Report with before and after numbers, method and error bars, and scripts that reproduce them.
- **6 · CI, bisection and backports.** A GitHub Actions pipeline that builds the kernel, boots it in QEMU and runs the Practical 4 tests on every push; `git bisect run` on a regression; a mainline fix backported to a stable branch. Done when a deliberately bad commit turns the pipeline red and the backport builds and passes on its branch.
- **7 · The Apple side.** Three real macOS panic reports read field by field down to the function; then either a DriverKit system extension or an XNU scheduler reading report whose conclusions are checked on the learner's Mac. On hold: it needs Xcode and a Kernel Debug Kit on the Founder's Mac to be run by the author, and the Founder needs time to test there first (decision 2 below). Not built until he says so.
- **8 · Portfolio and interviews.** One page that links every piece of work; three review exercises (review a real patch from a list, then compare with the maintainer's review); five debugging stories that can be told in an interview.

## Decisions (the Founder, 2026-11-21)

1. **Do learners send patches to real mailing lists?** Only if the learner agrees: 「如果学习者同意的话，就可以发，不然的话就不发」. So posting is never required (rule 8): the local route counts as done, and the page says what becomes public before it offers the public route. The author never sends for a learner (rule 7).
2. **Practical 7 (the Apple side).** On hold: 「实战7暂时不安排添加，我需要有时间去测」. It is listed on the overview as 暂缓 / On hold and is not built until he says so. No software is installed on his Mac without a yes.
3. **Rust.** An optional extra inside Practical 4, not a stage of its own (his choice on the decision card, after asking for the reasons: two of the four postings list Rust and both as optional; v7.3.1 carries Rust drivers and `samples/rust/`; the same driver in C and in Rust shows what the compiler checks). The main line of the stage is C only, and the extra is written only after it has been run.
4. **Where it lives.** Inside the kernel topic (「放在内核专题里」), as a second list after Phase 8 on the topic overview. Phase 8's forward link points at Practical 1.
5. **Practical tracks for the other four topics.** After the kernel one is finished and he has seen how it works (「先等 内核做完看效果」); each needs its own reading of postings.

## How the labs were run

The lesson labs of this topic were written for an Apple Silicon Mac (an arm64 Linux guest under QEMU with HVF, built with `LLVM=1`). The practical track keeps that target, and the author's runs reproduce it on other hardware:

| Item | Value (2026-11-21) |
| --- | --- |
| Host | Linux x86_64 cloud sandbox, 4 cores, no KVM |
| Kernel source | `gregkh/linux` at tag `v7.3.1` (`Makefile`: 7 / 3 / 1) |
| Compiler | Ubuntu clang 18.1.3, `LLVM=1 ARCH=arm64` (the tree's minimum is LLVM 17.0.1, `scripts/min-tool-version.sh`) |
| Guest | `qemu-system-aarch64` 8.2.2, `-M virt -cpu cortex-a72`, TCG (emulated, so timings are not the reader's timings) |
| User space | `busybox-static` 1.36.1 (Ubuntu arm64 package) in an initramfs, the lab-setup `/init` |
| git | 2.43.0 with `git-email` |

A page states this once, next to the first block of output, and gives the date. Output on a page is pasted from these runs and trimmed with `...` where lines were cut; addresses, PIDs and timestamps will differ for the reader. Personal e-mail addresses in tool output (`get_maintainer.pl`) are replaced by `<…>`; list addresses stay.

Long runs (a kernel build, a full suite) go on GitHub from a pushed branch (Founder, 2026-11-21); the first debug-kernel build of 2026-11-21 ran in the sandbox because it had started before that answer.

The labs can be rerun without the author. `scripts/kernel-labs/build-kernel.sh` builds a lab kernel (`debug`: KASAN, lockdep, kmemleak; `kcsan`: KCSAN, which cannot share a kernel with KASAN), `make-initramfs.sh` builds the guest's user space, and `range.sh` builds the Practical 2 modules as handed out and with the reference fixes, boots one guest per ticket and checks that the planted bug is reported and that the fixed module is clean. `.github/workflows/kernel-labs.yml` runs all of that for both kernels when the lab code or these scripts change on a branch, or by hand; the built kernel is cached without its object files.

## Verification list

Every claim a practical page makes about the tree is checked at the pin, by reading the file in a clone of the tag or by running the tool there. A new claim is added here with the file it rests on.

| Page | Claim | File or command at the pin | Checked |
| --- | --- | --- | --- |
| Practical 1 | `checkpatch.pl -f drivers/staging/sm750fb/sm750.c` warns once, about `g_fbmode`; the array is assigned at lines 762, 764, 872 and 876, so the suggested `const` fails to build | the file; `make LLVM=1 ARCH=arm64 drivers/staging/sm750fb/` with `FB_SM750=m` | v7.3.1 ✓ (4 errors, clang 18.1.3) |
| Practical 1 | `scripts/kernel-doc -none drivers/staging/nvec/nvec.h` reports `gpiod` not described and an excess `gpio`; `struct nvec_platform_data` is named nowhere else in the tree; the GPIO is the `"request"` line obtained in `tegra_nvec_probe()` | `drivers/staging/nvec/nvec.h`, `nvec.c:847`, `git grep nvec_platform_data` | v7.3.1 ✓ |
| Practical 1 | checkpatch messages quoted on the page (subject names the tool, missing description, missing Signed-off-by, 75 columns) | `scripts/checkpatch.pl` run on the practice patches | v7.3.1 ✓ |
| Practical 1 | one week before a ping or resend; `RESEND`; interleaved replies; changelog below `---`; summary of 70 to 75 characters; imperative mood; `--base` | `Documentation/process/submitting-patches.rst` | v7.3.1 ✓ |
| Practical 1 | AI assistance: `Assisted-by:`, no `Signed-off-by` from a tool, the assistant never sends; tool-generated content is disclosed | `Documentation/process/coding-assistants.rst`, `Documentation/process/generated-content.rst` | v7.3.1 ✓ |
| Practical 1 | staging tree and list | `MAINTAINERS`, "STAGING SUBSYSTEM" | v7.3.1 ✓ |
| Practical 2 | the debug options are all `=y` after `olddefconfig`: `KASAN`, `KASAN_GENERIC`, `PROVE_LOCKING`, `DEBUG_KMEMLEAK`, `DETECT_HUNG_TASK`, `DEBUG_ATOMIC_SLEEP` | `scripts/kernel-labs/build-kernel.sh debug`, then `.config` | v7.3.1 ✓ (build 1111 s, build directory 4.3 GB) |
| Practical 2 | modules build against an `Image`-only tree after `modules_prepare` with `vmlinux.symvers` copied to `Module.symvers` | the lab modules built that way and loaded | v7.3.1 ✓ |
| Practical 2 | KASAN reports only the first invalid access of a boot; a KASAN report turns lock debugging off | `Documentation/dev-tools/kasan.rst` (`kasan_multi_shot`); `lg_warm` loaded twice in one boot gives one report | v7.3.1 ✓ |
| Practical 2 | `module_init()` aliases the init function to `init_module`, the name a report shows | `include/linux/module.h` | v7.3.1 ✓ |
| Practical 2 | kmemleak scans every 10 minutes by default, `echo scan` forces a scan, objects younger than 5 s are not reported | `Documentation/dev-tools/kmemleak.rst`; `MSECS_MIN_AGE` is 5000 in `mm/kmemleak.c` (the document still says 1000) | v7.3.1 ✓ |
| Practical 2 | KCSAN cannot be built with KASAN and needs `EXPERT` on arm64 | `lib/Kconfig.kcsan` (`depends on DEBUG_KERNEL && !KASAN`), `arch/arm64/Kconfig` (`select HAVE_ARCH_KCSAN if EXPERT`) | v7.3.1 ✓ |
| Practical 2 | `cancel_delayed_work()` may return while the callback still runs; the `_sync` variant waits | comments above both functions in `kernel/workqueue.c` | v7.3.1 ✓ |
| Practical 2 | the default hung-task timeout is 120 s | `CONFIG_DEFAULT_HUNG_TASK_TIMEOUT=120` in the built `.config`; `Documentation/admin-guide/sysctl/kernel.rst` | v7.3.1 ✓ |
| Practical 2 | a stack-trace entry of a module function in `.text` maps to a line with `llvm-nm` and `llvm-addr2line` (address of the function, plus the offset, minus 4) | run on `lg_fw.ko`: `lg_fw_write+0x54` gives `lg_fw.c:39`; `scripts/faddr2line` fails with `LLVM=1` here (`unknown argument '--section=.text'`), so the page does not use it | clang 18.1.3 ✓ |
| Practical 2 | every ticket as handed out is reported by its tool, and every module with its reference fix passes three runs with a clean log and unloads | `scripts/kernel-labs/range.sh debug`; logs quoted on the page | v7.3.1 ✓ (sandbox, 2026-11-21) |
| Practical 2 | the lab modules and the reference patches pass `checkpatch.pl --strict`; patch 1 warns about a missing `Fixes:` tag until one is added | `scripts/checkpatch.pl --strict` on the files and the patches | v7.3.1 ✓ |

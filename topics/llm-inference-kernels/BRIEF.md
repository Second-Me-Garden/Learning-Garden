# LLM Inference Kernels — SGLang (topic brief)

Founder's brief, 2026-10-31, used verbatim as this topic's overview page. "Kernel" here means GPU compute kernels (CUDA / Triton / CuTe ops under an LLM inference engine), not the OS kernel of the Kernel Engineering topic; the two topics link to each other.

Build order (Founder 2026-10-31): after the GPU / CUDA topic, as its applied capstone. Related topics: GPU Programming with CUDA (prerequisite), Parallel Programming (concepts), Kernel Engineering (drivers, memory, scheduling — the OS side of the same machine).

Planned phases (one per section of the brief): 0 the stack, top to bottom · 1 attention and KV-cache layouts (RadixAttention, paged/ragged, cascade) · 2 prefill vs decode (FA3, split-KV, MLA, per-phase backends) · 3 CUDA graphs and the plan()/run() split · 4 MoE kernels (routing, moe_align_block_size, grouped GEMM, DeepEP) · 5 fusions · 6 quantization kernels (FP8, NVFP4/MXFP4, int4; CUTLASS/CuTe) · 7 speculative decoding and structured-output kernels · 8 plugging in (sgl-kernel, AttentionBackend, profiling, the way in).

---

Kernel engineering is the bottom layer SGLang stands on. SGLang’s big ideas, like RadixAttention, continuous batching and speculative decoding, are scheduling and memory-management ideas. They only pay off if the GPU kernels underneath can work with the data layouts and execution patterns those ideas create. Kernel engineers write those kernels.

The stack, top to bottom
Frontend / program layer: gen, select, fork. These are LLM programs that naturally share prefixes.
Runtime (SRT) scheduler: continuous batching, the radix-tree KV cache, chunked prefill, the overlap scheduler, prefill/decode disaggregation, and speculative decoding (EAGLE).
Model executor: each forward pass breaks down into ops such as attention, GEMMs, MoE, RMSNorm, RoPE, activations, sampling and all-reduce.
Kernel layer: sgl-kernel (SGLang’s own CUDA/C++ ops), FlashInfer, FlashAttention-3, FlashMLA, Triton kernels, DeepGEMM, CUTLASS, DeepEP, and custom all-reduce. On AMD the equivalent is aiter/HIP.

Each design choice in layers 2–3 places a requirement on layer 4.

Where the layers meet

RadixAttention means the kernels can’t assume a contiguous KV cache. The cache is token-granular, and pages are scattered and shared across requests. So attention kernels take index arrays (CSR-style indptr/indices) and gather KV from arbitrary slots. Prefix sharing also enables cascade or shared-prefix attention, where the common prefix is computed once for many requests. FlashInfer’s paged and ragged APIs exist largely for this.

Prefill and decode are different problems. Prefill is compute-bound, so the goal is tensor-core utilization with FA3-style kernels. Decode is memory-bandwidth-bound: there is one query token per request, so speed comes down to how fast you can stream KV. That is why decode uses split-KV (flash-decoding) and why the MLA kernels for DeepSeek-style models are specialized. SGLang lets you pick a different attention backend for each phase.

CUDA graphs constrain how kernels are written. Decode steps are captured as CUDA graphs to remove launch overhead. A graph-capturable kernel can’t do host syncs or dynamic allocation, and its shapes must be static or padded. This is why FlashInfer splits each call into a CPU-side plan() step and a graph-safe run() step.

MoE is largely a kernel problem. The work splits into several kernels:

Routing and top-k.
moe_align_block_size, which sorts and pads tokens per expert. It lives in sgl-kernel.
Fused or grouped GEMMs, using Triton fused_moe or DeepGEMM for FP8 block-quantized weights.
With expert parallelism, all-to-all dispatch and combine through DeepEP.

Fusion cuts memory traffic. Common fusions include residual-add plus RMSNorm, SiLU-and-mul, RoPE plus writing to the KV cache, all-reduce plus norm, and sampling. FlashInfer does top-k/top-p sampling without a full sort.

Quantization depends on kernels. FP8, NVFP4/MXFP4 on Blackwell, and int4 AWQ/GPTQ each need dedicated GEMM kernels, usually built with CUTLASS or CuTe. Without those kernels, quantizing saves memory but not time.

Other runtime features need their own kernels too. Speculative decoding needs tree-attention masks and verification kernels. Structured output (xgrammar) applies a token bitmask to the logits each step, which is another small kernel on the hot path.

Where a kernel engineer plugs in
sgl-kernel/ in the SGLang repo: custom CUDA/C++ ops exposed through torch ops.
The AttentionBackend interface: init_forward_metadata, forward_extend, forward_decode, plus the CUDA-graph hooks. Adding a backend means implementing this interface around your kernel.
Upstream libraries: FlashInfer, DeepGEMM, FlashMLA, CUTLASS. SGLang often adopts kernels from these first.
Tooling: bench_one_batch, the torch profiler and Nsight Systems/Compute for finding which kernel dominates. Common languages are CUDA, CuTe/CuTe-DSL, Triton and TileLang.
A good way in
Read SGLang’s attention backend code alongside FlashInfer’s paged-attention API to see the data-layout contract.
Profile a decode step on a MoE model to see which kernels dominate.
Try writing or optimizing one small fused op in sgl-kernel, such as a norm or an activation.

That path covers the whole loop: a runtime design choice sets a layout or constraint, a kernel has to meet it, and you measure the end-to-end throughput.

/* Learning Garden — the topic map. One place declares every topic and the relations
 * between them; assets/related.js renders "Related topics" on topic pages and hub cards
 * and symmetrises the graph, so a relation declared once appears on both ends.
 * A plain script (not JSON) so it also works when the site is opened from a file. */
window.LG_TOPICS = {
  topics: [
    { id: "kernel-engineering", path: "topics/kernel-engineering/index.html", status: "ready",
      title: { "zh-CN": "Kernel Engineering", en: "Kernel Engineering" },
      line: { "zh-CN": "OS 内核：进程、内存、并发、驱动、调试、安全；Linux 为载体，XNU 对照，目标 Apple。", en: "The OS kernel: processes, memory, concurrency, drivers, debugging, security; Linux as the vehicle, XNU side by side, aimed at Apple." } },
    { id: "ros2", path: "topics/ros2/index.html", status: "ready",
      title: { "zh-CN": "ROS 2", en: "ROS 2" },
      line: { "zh-CN": "机器人中间件：节点、话题、执行器、实时性；Gazebo 仿真实验。", en: "Robot middleware: nodes, topics, executors, real-time behaviour; labs in Gazebo." } },
    { id: "parallel-programming", path: "topics/parallel-programming/index.html", status: "planned",
      title: { "zh-CN": "并行编程", en: "Parallel Programming" },
      line: { "zh-CN": "CPU 上的并行：线程、锁、内存模型、OpenMP、SIMD、性能测量。", en: "Parallelism on the CPU: threads, locks, memory models, OpenMP, SIMD, measurement." } },
    { id: "gpu-cuda", path: "topics/gpu-cuda/index.html", status: "planned",
      title: { "zh-CN": "GPU 编程与 CUDA", en: "GPU Programming with CUDA" },
      line: { "zh-CN": "CUDA 执行模型、内存层次、GEMM、带宽与剖析；云端 GPU 实验，Metal 作本地对照。", en: "The CUDA execution model, memory hierarchy, GEMMs, bandwidth and profiling; labs on a cloud GPU, Metal as the local counterpart." } },
    { id: "llm-inference-kernels", path: "topics/llm-inference-kernels/index.html", status: "planned",
      title: { "zh-CN": "推理引擎与 GPU 内核（SGLang）", en: "LLM Inference Kernels (SGLang)" },
      line: { "zh-CN": "RadixAttention、prefill/decode、CUDA graphs、MoE、融合与量化如何对 GPU 内核提出要求，以及内核工程师从哪里切入。", en: "How RadixAttention, prefill/decode, CUDA graphs, MoE, fusion and quantization place requirements on GPU kernels, and where a kernel engineer plugs in." } }
  ],
  relations: [
    { a: "kernel-engineering", b: "llm-inference-kernels",
      why: { "zh-CN": "两种「kernel」：OS 内核管设备、内存与调度，GPU 内核在它之上跑推理；驱动与 DMA（Phase 5）正好接上 CUDA graphs 与显存布局。", en: "Two kinds of kernel: the OS kernel owns devices, memory and scheduling, and GPU kernels run on top of it; drivers and DMA (Phase 5) meet CUDA graphs and device-memory layouts here." } },
    { a: "gpu-cuda", b: "llm-inference-kernels",
      why: { "zh-CN": "先学 CUDA、GEMM、带宽与剖析，再看推理引擎如何使用它们——这是 GPU topic 的应用篇。", en: "Learn CUDA, GEMMs, bandwidth and profiling first, then see how an inference engine uses them — this is the GPU topic's applied capstone." } },
    { a: "parallel-programming", b: "gpu-cuda",
      why: { "zh-CN": "线程、内存模型与数据并行的概念在 CPU 上先建立，再搬到 GPU 的 warp 与显存层次。", en: "Threads, memory models and data parallelism are built on the CPU first, then carried to the GPU's warps and memory hierarchy." } },
    { a: "kernel-engineering", b: "parallel-programming",
      why: { "zh-CN": "锁、RCU 与内存序（Phase 3）是并行编程的内核侧；调度（Phase 1）决定线程何时真正并行。", en: "Locks, RCU and memory ordering (Phase 3) are the kernel side of parallel programming; scheduling (Phase 1) decides when threads actually run in parallel." } },
    { a: "ros2", b: "parallel-programming",
      why: { "zh-CN": "ROS 2 的执行器、回调组与实时约束，本质上是并发与调度问题。", en: "ROS 2 executors, callback groups and real-time constraints are concurrency and scheduling problems at heart." } },
    { a: "ros2", b: "kernel-engineering",
      why: { "zh-CN": "实时性、调度策略与设备驱动决定一个机器人栈的延迟下限。", en: "Real-time behaviour, scheduling policy and device drivers set the latency floor of a robot stack." } }
  ]
};

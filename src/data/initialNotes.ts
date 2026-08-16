import { Note, Relationship, Perspective, DiscoveryConnection, KnowledgeGap } from '../types';

export const INITIAL_PERSPECTIVES: Perspective[] = [
  {
    id: 'general',
    name: 'General',
    description: 'Balanced view based on overall semantic similarity and explicit references.',
    priorityConcepts: ['Operating System', 'Kernel', 'Process', 'Memory', 'CPU', 'Hardware', 'Docker', 'CUDA', 'Machine Learning'],
    color: '#3B82F6', // Blue
  },
  {
    id: 'security',
    name: 'Cybersecurity',
    description: 'Prioritizes isolation, privilege boundaries, attack surfaces, kernel controls, and network security.',
    priorityConcepts: ['Kernel', 'Isolation', 'Process', 'Network Security', 'Privilege', 'Container', 'Memory Protection', 'Drivers', 'Authentication'],
    priorityRules: 'Boost kernel-to-hardware, process isolation, and container security relationships.',
    color: '#EF4444', // Red
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    description: 'Emphasizes hardware acceleration, parallel computation, GPU architectures, memory bandwidth, and frameworks.',
    priorityConcepts: ['Machine Learning', 'GPU', 'CUDA', 'Hardware', 'Memory Management', 'Tensor Processing', 'Parallel Computing', 'Virtual Memory'],
    priorityRules: 'Boost GPU acceleration, CUDA architecture, and memory access relationships.',
    color: '#10B981', // Emerald
  },
  {
    id: 'networking',
    name: 'Networking',
    description: 'Focuses on communication protocols, sockets, driver interfaces, packet flow, and distributed systems.',
    priorityConcepts: ['Network Security', 'TCP/IP', 'Device Drivers', 'Sockets', 'Sockets API', 'Hardware', 'Kernel', 'DMA', 'Latency'],
    priorityRules: 'Boost driver-to-hardware, kernel network stack, and socket API links.',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure & Cloud',
    description: 'Highlights containerization, orchestration, virtual resources, and cloud hardware management.',
    priorityConcepts: ['Docker', 'Kubernetes', 'Containers', 'Linux Kernel', 'Hardware', 'GPU', 'Isolation', 'Resource Scheduling'],
    priorityRules: 'Boost Docker container, Kubernetes orchestration, and host Linux kernel dependencies.',
    color: '#F59E0B', // Amber
  },
  {
    id: 'os',
    name: 'Operating Systems',
    description: 'Centers on low-level process scheduling, memory virtualization, system calls, and device drivers.',
    priorityConcepts: ['Operating System', 'Linux Kernel', 'Process Scheduling', 'Virtual Memory', 'CPU', 'Hardware', 'Device Drivers', 'System Calls', 'ABI'],
    priorityRules: 'Boost kernel process management, CPU scheduling, and virtual memory systems.',
    color: '#06B6D4', // Cyan
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Operating System & Kernel Architecture',
    content: `An **Operating System (OS)** acts as an intermediary between user applications and system hardware. At its core is the **Kernel**, which runs in privileged execution mode and directly manages **CPU** time, **Memory**, system devices, and **Processes**.

Key responsibilities:
- **Process Scheduling**: Allocating CPU execution slots across concurrent threads and processes.
- **Memory Management**: Virtualizing system RAM so each process operates in its own isolated address space.
- **Hardware Abstraction**: Providing uniform device driver interfaces so software doesn't deal with raw hardware registers.

*Key Takeaway*: Without the kernel, user-space code cannot safely communicate with underlying CPU or RAM.`,
    createdAt: '2026-08-10T08:42:00.000Z',
    updatedAt: '2026-08-10T08:42:00.000Z',
    source: 'Manual Note',
    tags: ['os', 'kernel', 'cpu', 'memory'],
    collection: 'Operating Systems',
    processingStatus: 'COMPLETED',
    concepts: [
      { id: 'c-os', name: 'Operating System', type: 'Concept', description: 'System software managing hardware and software resources.', confidence: 0.98 },
      { id: 'c-kernel', name: 'Kernel', type: 'Concept', description: 'Core component of an OS with privileged execution rights.', confidence: 0.99 },
      { id: 'c-process', name: 'Process', type: 'Concept', description: 'Program instance executing with allocated system resources.', confidence: 0.95 },
      { id: 'c-memory', name: 'Memory', type: 'Concept', description: 'Physical RAM and address space used for execution.', confidence: 0.94 },
      { id: 'c-cpu', name: 'CPU', type: 'Concept', description: 'Central Processing Unit executing program instructions.', confidence: 0.97 },
      { id: 'c-hardware', name: 'Hardware', type: 'Concept', description: 'Physical compute components like processor, memory, and devices.', confidence: 0.92 }
    ],
    acronyms: [
      { id: 'a-os', acronym: 'OS', expansion: 'Operating System', description: 'Core system manager.', category: 'Computing' },
      { id: 'a-cpu', acronym: 'CPU', expansion: 'Central Processing Unit', description: 'Main compute execution unit.', category: 'Hardware' }
    ]
  },
  {
    id: 'note-2',
    title: 'GPU Architecture & Machine Learning Acceleration',
    content: `Modern **Machine Learning (ML)** workloads heavily depend on **GPU** (Graphics Processing Unit) acceleration due to massively parallel matrix arithmetic.

Unlike a **CPU**, which features a small number of cores optimized for low-latency sequential processing, a GPU houses thousands of smaller cores designed to process parallel array operations concurrently.

- **CUDA**: NVIDIA's parallel computing platform allowing developers to execute general-purpose algorithms on GPUs.
- High memory bandwidth is crucial for feeding deep learning model weights into tensor execution pipelines.
- Drivers in the Linux kernel negotiate DMA (Direct Memory Access) channels to stream data directly from system RAM into high-speed GPU VRAM.`,
    createdAt: '2026-08-10T12:17:00.000Z',
    updatedAt: '2026-08-10T12:17:00.000Z',
    source: 'Course Notes',
    tags: ['gpu', 'cuda', 'ml', 'hardware'],
    collection: 'AI & Hardware',
    processingStatus: 'COMPLETED',
    concepts: [
      { id: 'c-gpu', name: 'GPU', type: 'Concept', description: 'Massively parallel accelerator unit for matrix calculations.', confidence: 0.99 },
      { id: 'c-ml', name: 'Machine Learning', type: 'Concept', description: 'Algorithms leveraging statistical patterns and tensor models.', confidence: 0.97 },
      { id: 'c-cuda', name: 'CUDA', type: 'Technology', description: 'NVIDIA parallel computing platform and programming model.', confidence: 0.98 },
      { id: 'c-hardware', name: 'Hardware', type: 'Concept', description: 'Physical compute components.', confidence: 0.91 },
      { id: 'c-dma', name: 'DMA', type: 'Concept', description: 'Direct Memory Access bypassing CPU for rapid transfer.', confidence: 0.89 }
    ],
    acronyms: [
      { id: 'a-gpu', acronym: 'GPU', expansion: 'Graphics Processing Unit', description: 'Parallel processing silicon.', category: 'Hardware' },
      { id: 'a-cuda', acronym: 'CUDA', expansion: 'Compute Unified Device Architecture', description: 'NVIDIA GPGPU platform.', category: 'Software' },
      { id: 'a-dma', acronym: 'DMA', expansion: 'Direct Memory Access', description: 'Hardware memory transfer mechanism.', category: 'Architecture' }
    ]
  },
  {
    id: 'note-3',
    title: 'Linux Network Security & Firewall Packet Flow',
    content: `Network security in Linux relies on the **Linux Kernel** netfilter subsystem and eBPF kernel hooks.

- **Isolation**: Processes handling sensitive network traffic run in restricted user accounts or isolated network namespaces.
- **Network Security**: Enforces access control lists, stateful packet filtering, and cryptographic tls/ipsec channels.
- **Device Drivers**: Network Interface Cards (NICs) pass incoming ethernet frames to kernel ring buffers, triggering interrupts that wake up kernel packet processing loops.

Threat vectors include buffer overflows in device drivers and kernel privilege escalation.`,
    createdAt: '2026-08-10T18:32:00.000Z',
    updatedAt: '2026-08-10T18:32:00.000Z',
    source: 'Security Whitepaper',
    tags: ['security', 'linux', 'networking'],
    collection: 'Cybersecurity',
    processingStatus: 'COMPLETED',
    concepts: [
      { id: 'c-netsec', name: 'Network Security', type: 'Concept', description: 'Policies and controls protecting system data on networks.', confidence: 0.96 },
      { id: 'c-linux', name: 'Linux Kernel', type: 'Technology', description: 'Open-source Unix-like operating system kernel.', confidence: 0.98 },
      { id: 'c-isolation', name: 'Process Isolation', type: 'Concept', description: 'Enforcing execution boundaries between processes.', confidence: 0.94 },
      { id: 'c-drivers', name: 'Device Drivers', type: 'Concept', description: 'Software enabling OS kernel to communicate with hardware devices.', confidence: 0.92 }
    ],
    acronyms: [
      { id: 'a-nic', acronym: 'NIC', expansion: 'Network Interface Card', description: 'Hardware network controller.', category: 'Hardware' }
    ]
  },
  {
    id: 'note-4',
    title: 'Docker Containers vs Kernel Namespaces',
    content: `**Docker** containers provide lightweight lightweight process runtime environments.

Unlike Virtual Machines (VMs) which emulate entire hardware platforms and run separate operating system kernels, Docker containers share the host **Linux Kernel**.

Key OS mechanisms used by Docker:
1. **Namespaces**: Provide process isolation (PID, net, ipc, mnt, user).
2. **Cgroups (Control Groups)**: Limit CPU, memory, and I/O resource consumption per container.
3. **Layered Filesystems**: Efficient container image layering.

*Security Implications*: Because containers share the underlying host kernel, a vulnerability in the host kernel could allow container breakout!`,
    createdAt: '2026-08-09T09:11:00.000Z',
    updatedAt: '2026-08-09T09:11:00.000Z',
    source: 'Tech Documentation',
    tags: ['docker', 'containers', 'linux', 'isolation'],
    collection: 'Infrastructure',
    processingStatus: 'COMPLETED',
    concepts: [
      { id: 'c-docker', name: 'Docker', type: 'Technology', description: 'Containerization engine for deploying microservices.', confidence: 0.99 },
      { id: 'c-containers', name: 'Containers', type: 'Concept', description: 'Isolated execution environments sharing host kernel.', confidence: 0.98 },
      { id: 'c-linux', name: 'Linux Kernel', type: 'Technology', description: 'Open-source OS kernel.', confidence: 0.97 },
      { id: 'c-isolation', name: 'Process Isolation', type: 'Concept', description: 'Enforcing security boundaries between workloads.', confidence: 0.95 }
    ],
    acronyms: [
      { id: 'a-vm', acronym: 'VM', expansion: 'Virtual Machine', description: 'Emulated hardware platform running guest OS.', category: 'Virtualization' }
    ]
  },
  {
    id: 'note-5',
    title: 'API vs ABI Interface Boundaries',
    content: `In software engineering, interface boundaries exist at different abstraction layers:

- **API (Application Programming Interface)**: Defines source-level code contracts (function signatures, data structures, methods) used at compile time.
- **ABI (Application Binary Interface)**: Defines binary-level contracts (calling conventions, register usage, stack layout, memory alignment) between compiled machine code artifacts.

For example, when an application invokes a system call on the **Operating System**, it relies on the kernel's **ABI** specification. Changing ABI breaks compiled binaries even if the source API remains unchanged!`,
    createdAt: '2026-08-08T14:20:00.000Z',
    updatedAt: '2026-08-08T14:20:00.000Z',
    source: 'Systems Engineering Notes',
    tags: ['api', 'abi', 'os', 'compilers'],
    collection: 'Software Engineering',
    processingStatus: 'COMPLETED',
    concepts: [
      { id: 'c-api', name: 'API', type: 'Concept', description: 'Source code contract for software components.', confidence: 0.98 },
      { id: 'c-abi', name: 'ABI', type: 'Concept', description: 'Binary specification for machine code interoperability.', confidence: 0.97 },
      { id: 'c-os', name: 'Operating System', type: 'Concept', description: 'Core system managing execution.', confidence: 0.91 }
    ],
    acronyms: [
      { id: 'a-api', acronym: 'API', expansion: 'Application Programming Interface', description: 'Source level contract.', category: 'Software' },
      { id: 'a-abi', acronym: 'ABI', expansion: 'Application Binary Interface', description: 'Binary level interoperability contract.', category: 'Architecture' }
    ]
  },
  {
    id: 'note-6',
    title: 'Virtual Memory & Page Table Translation',
    content: `**Virtual Memory** isolates process address spaces and prevents memory corruption across applications.

The **Operating System** kernel works alongside the Hardware MMU (Memory Management Unit) to translate Virtual Addresses into Physical RAM addresses using **Paging** and Page Tables.

- When a process accesses an unmapped virtual address, a **Page Fault** hardware exception occurs.
- The kernel intercepts the exception, fetches the missing page from disk swap or allocates physical RAM, and updates the translation entry.
- *Performance*: Page translation is cached in the CPU's TLB (Translation Lookaside Buffer).`,
    createdAt: '2026-08-07T11:05:00.000Z',
    updatedAt: '2026-08-07T11:05:00.000Z',
    source: 'Textbook Chapter 5',
    tags: ['virtual-memory', 'memory', 'kernel', 'mmu'],
    collection: 'Operating Systems',
    processingStatus: 'COMPLETED',
    concepts: [
      { id: 'c-vmem', name: 'Virtual Memory', type: 'Concept', description: 'Memory virtualization technique decoupling virtual from physical addresses.', confidence: 0.99 },
      { id: 'c-memory', name: 'Memory', type: 'Concept', description: 'Physical RAM hardware.', confidence: 0.95 },
      { id: 'c-kernel', name: 'Kernel', type: 'Concept', description: 'Privileged OS component managing page fault routines.', confidence: 0.96 },
      { id: 'c-cpu', name: 'CPU', type: 'Concept', description: 'Central processing unit with MMU silicon.', confidence: 0.93 }
    ],
    acronyms: [
      { id: 'a-mmu', acronym: 'MMU', expansion: 'Memory Management Unit', description: 'Hardware page table translation unit.', category: 'Hardware' },
      { id: 'a-tlb', acronym: 'TLB', expansion: 'Translation Lookaside Buffer', description: 'High-speed hardware page cache.', category: 'Hardware' }
    ]
  }
];

export const INITIAL_RELATIONSHIPS: Relationship[] = [
  {
    id: 'rel-1',
    sourceId: 'c-kernel',
    targetId: 'c-process',
    sourceName: 'Kernel',
    targetName: 'Process',
    relationshipType: 'MANAGES' as any,
    baseScore: 0.95,
    confidence: 0.98,
    evidence: ['Kernel runs in privileged mode and directly manages CPU time, Memory, and Processes.'],
    sourceNoteIds: ['note-1'],
    explanation: 'The kernel provides thread scheduling, task state management, and isolation enforcement for every running process in the system.',
    breakdown: {
      semanticSimilarity: 0.88,
      sharedConcepts: 0.95,
      explicitReferences: 1.0,
      relationshipInference: 0.98,
      evidenceStrength: 0.96,
      contextualRelevance: 0.94
    },
    createdAt: '2026-08-10T08:42:00.000Z'
  },
  {
    id: 'rel-2',
    sourceId: 'c-kernel',
    targetId: 'c-hardware',
    sourceName: 'Kernel',
    targetName: 'Hardware',
    relationshipType: 'DEPENDS_ON',
    baseScore: 0.92,
    confidence: 0.96,
    evidence: ['Kernel provides uniform device driver interfaces so software does not deal with raw hardware registers.'],
    sourceNoteIds: ['note-1', 'note-3'],
    explanation: 'Kernel hardware abstraction layers mediate software interactions with CPU execution pipelines, physical RAM, and peripheral devices.',
    breakdown: {
      semanticSimilarity: 0.85,
      sharedConcepts: 0.90,
      explicitReferences: 0.95,
      relationshipInference: 0.94,
      evidenceStrength: 0.92,
      contextualRelevance: 0.92
    },
    createdAt: '2026-08-10T08:42:00.000Z'
  },
  {
    id: 'rel-3',
    sourceId: 'c-cuda',
    targetId: 'c-gpu',
    sourceName: 'CUDA',
    targetName: 'GPU',
    relationshipType: 'USED_BY',
    baseScore: 0.98,
    confidence: 0.99,
    evidence: ['CUDA is NVIDIA parallel computing platform allowing developers to execute general-purpose algorithms on GPUs.'],
    sourceNoteIds: ['note-2'],
    explanation: 'CUDA abstracts GPU streaming multiprocessors into a C/C++ execution model for general purpose computing (GPGPU).',
    breakdown: {
      semanticSimilarity: 0.95,
      sharedConcepts: 0.98,
      explicitReferences: 1.0,
      relationshipInference: 0.99,
      evidenceStrength: 0.98,
      contextualRelevance: 0.96
    },
    createdAt: '2026-08-10T12:17:00.000Z'
  },
  {
    id: 'rel-4',
    sourceId: 'c-gpu',
    targetId: 'c-ml',
    sourceName: 'GPU',
    targetName: 'Machine Learning',
    relationshipType: 'REQUIRES',
    baseScore: 0.94,
    confidence: 0.97,
    evidence: ['Modern Machine Learning workloads heavily depend on GPU acceleration due to massively parallel matrix arithmetic.'],
    sourceNoteIds: ['note-2'],
    explanation: 'Deep learning matrix multiplication operations leverage thousands of GPU compute cores for high throughput tensor operations.',
    breakdown: {
      semanticSimilarity: 0.90,
      sharedConcepts: 0.92,
      explicitReferences: 0.98,
      relationshipInference: 0.96,
      evidenceStrength: 0.94,
      contextualRelevance: 0.94
    },
    createdAt: '2026-08-10T12:17:00.000Z'
  },
  {
    id: 'rel-5',
    sourceId: 'c-docker',
    targetId: 'c-linux',
    sourceName: 'Docker',
    targetName: 'Linux Kernel',
    relationshipType: 'DEPENDS_ON',
    baseScore: 0.91,
    confidence: 0.95,
    evidence: ['Unlike Virtual Machines, Docker containers share the host Linux Kernel.'],
    sourceNoteIds: ['note-4'],
    explanation: 'Docker containerization relies on Linux kernel primitives including control groups (cgroups), namespaces, and chroot.',
    breakdown: {
      semanticSimilarity: 0.82,
      sharedConcepts: 0.90,
      explicitReferences: 0.95,
      relationshipInference: 0.92,
      evidenceStrength: 0.90,
      contextualRelevance: 0.92
    },
    createdAt: '2026-08-09T09:11:00.000Z'
  },
  {
    id: 'rel-6',
    sourceId: 'c-docker',
    targetId: 'c-isolation',
    sourceName: 'Docker',
    targetName: 'Process Isolation',
    relationshipType: 'IMPLEMENTS',
    baseScore: 0.89,
    confidence: 0.94,
    evidence: ['Namespaces provide process isolation (PID, net, ipc, mnt, user).'],
    sourceNoteIds: ['note-4'],
    explanation: 'Container runtimes isolate process execution environments to enforce security and resource boundaries between tenant microservices.',
    breakdown: {
      semanticSimilarity: 0.85,
      sharedConcepts: 0.88,
      explicitReferences: 0.92,
      relationshipInference: 0.90,
      evidenceStrength: 0.88,
      contextualRelevance: 0.90
    },
    createdAt: '2026-08-09T09:11:00.000Z'
  },
  {
    id: 'rel-7',
    sourceId: 'c-api',
    targetId: 'c-abi',
    sourceName: 'API',
    targetName: 'ABI',
    relationshipType: 'SIMILAR_TO',
    baseScore: 0.87,
    confidence: 0.93,
    evidence: ['API defines source code contracts; ABI defines binary level contracts between compiled machine code.'],
    sourceNoteIds: ['note-5'],
    explanation: 'API and ABI both define boundary contracts, but API operates at compile-time source level while ABI operates at binary runtime machine level.',
    breakdown: {
      semanticSimilarity: 0.92,
      sharedConcepts: 0.85,
      explicitReferences: 0.90,
      relationshipInference: 0.88,
      evidenceStrength: 0.85,
      contextualRelevance: 0.82
    },
    createdAt: '2026-08-08T14:20:00.000Z'
  },
  {
    id: 'rel-8',
    sourceId: 'c-vmem',
    targetId: 'c-kernel',
    sourceName: 'Virtual Memory',
    targetName: 'Kernel',
    relationshipType: 'PART_OF',
    baseScore: 0.93,
    confidence: 0.96,
    evidence: ['Operating System kernel works alongside Hardware MMU to translate Virtual Addresses into Physical RAM.'],
    sourceNoteIds: ['note-6'],
    explanation: 'Virtual memory subsystem is a core kernel module handling page allocation, swap files, page fault interrupts, and address translation.',
    breakdown: {
      semanticSimilarity: 0.88,
      sharedConcepts: 0.92,
      explicitReferences: 0.96,
      relationshipInference: 0.95,
      evidenceStrength: 0.92,
      contextualRelevance: 0.94
    },
    createdAt: '2026-08-07T11:05:00.000Z'
  },
  {
    id: 'rel-9',
    sourceId: 'c-gpu',
    targetId: 'c-hardware',
    sourceName: 'GPU',
    targetName: 'Hardware',
    relationshipType: 'IS_A',
    baseScore: 0.96,
    confidence: 0.99,
    evidence: ['Drivers in Linux kernel negotiate DMA channels to stream data directly into high-speed GPU VRAM.'],
    sourceNoteIds: ['note-2'],
    explanation: 'GPU is a specialized silicon hardware accelerator integrated via PCI Express buses.',
    breakdown: {
      semanticSimilarity: 0.92,
      sharedConcepts: 0.96,
      explicitReferences: 0.98,
      relationshipInference: 0.97,
      evidenceStrength: 0.96,
      contextualRelevance: 0.95
    },
    createdAt: '2026-08-10T12:17:00.000Z'
  },
  {
    id: 'rel-10',
    sourceId: 'c-netsec',
    targetId: 'c-linux',
    sourceName: 'Network Security',
    targetName: 'Linux Kernel',
    relationshipType: 'DEPENDS_ON',
    baseScore: 0.90,
    confidence: 0.94,
    evidence: ['Network security in Linux relies on the Linux Kernel netfilter subsystem and eBPF hooks.'],
    sourceNoteIds: ['note-3'],
    explanation: 'Packet filtering, firewalls, and network encryption depend directly on in-kernel netfilter state machines.',
    breakdown: {
      semanticSimilarity: 0.82,
      sharedConcepts: 0.88,
      explicitReferences: 0.94,
      relationshipInference: 0.92,
      evidenceStrength: 0.90,
      contextualRelevance: 0.90
    },
    createdAt: '2026-08-10T18:32:00.000Z'
  }
];

export const INITIAL_DISCOVERIES: DiscoveryConnection[] = [
  {
    id: 'disc-1',
    sourceConcept: 'Machine Learning',
    targetConcept: 'Linux Kernel',
    confidence: 0.84,
    why: 'Your notes mention GPU acceleration for ML and Linux Kernel DMA driver channels for VRAM streaming. Connecting these reveals how ML runtime frameworks depend on Linux kernel memory sub-systems.',
    evidenceNotes: ['GPU Architecture & Machine Learning Acceleration', 'Operating System & Kernel Architecture'],
    suggestedType: 'DEPENDS_ON',
    status: 'PENDING'
  },
  {
    id: 'disc-2',
    sourceConcept: 'Process Isolation',
    targetConcept: 'Virtual Memory',
    confidence: 0.91,
    why: 'Virtual memory isolates process address spaces while process isolation enforces security boundaries. Virtual memory is the primary hardware-enforced mechanism for software process isolation.',
    evidenceNotes: ['Docker Containers vs Kernel Namespaces', 'Virtual Memory & Page Table Translation'],
    suggestedType: 'IMPLEMENTS',
    status: 'PENDING'
  },
  {
    id: 'disc-3',
    sourceConcept: 'ABI',
    targetConcept: 'Linux Kernel',
    confidence: 0.88,
    why: 'Your notes on API/ABI describe system calls invoking kernel functions via ABI binary conventions, bridging compiler output to kernel execution modes.',
    evidenceNotes: ['API vs ABI Interface Boundaries', 'Operating System & Kernel Architecture'],
    suggestedType: 'EXPLAINS',
    status: 'PENDING'
  }
];

export const INITIAL_KNOWLEDGE_GAPS: KnowledgeGap[] = [
  {
    id: 'gap-1',
    missingConcept: 'System Calls (Syscalls)',
    description: 'The explicit software trap interface used by processes to switch from user mode to kernel privilege mode.',
    connectedKnownConcepts: ['Kernel', 'Process', 'API', 'ABI'],
    reason: 'Your notes discuss Kernel, Process, API, and ABI extensively, but have not explicitly documented how system call traps (e.g., int 0x80 or syscall instruction) bridge user mode to kernel mode.',
    urgency: 'HIGH'
  },
  {
    id: 'gap-2',
    missingConcept: 'Container Orchestration (Kubernetes)',
    description: 'Automated management, scaling, and networking of Docker container deployments across clustered nodes.',
    connectedKnownConcepts: ['Docker', 'Containers', 'Network Security', 'Linux Kernel'],
    reason: 'You have documented single-host Docker containers and Linux networking, but lack multi-node orchestration concepts.',
    urgency: 'MEDIUM'
  }
];

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const books = [
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    price: 1499.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    description: "The definitive guide to system architecture, distributed systems, consistency, and reliability."
  },
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    price: 899.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80",
    description: "Learn how to write clean, maintainable, and readable code through practical refactoring examples."
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    price: 1199.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
    description: "A classic guide filled with timeless tips, mental models, and practical advice for software engineers."
  },
  {
    title: "Refactoring: Improving the Design of Existing Code",
    author: "Martin Fowler",
    price: 1299.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
    description: "Master code refactoring techniques and code smells with step-by-step transformations."
  },
  {
    title: "System Design Interview – An Insider's Guide",
    author: "Alex Xu",
    price: 1599.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80",
    description: "Comprehensive breakdowns of large-scale web system architectures, rate limiters, and distributed queues."
  },
  {
    title: "Head First Design Patterns",
    author: "Eric Freeman & Elisabeth Robson",
    price: 999.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80",
    description: "Visually rich introduction to object-oriented design patterns including Singleton, Observer, and Factory."
  },
  {
    title: "Structure and Interpretation of Computer Programs",
    author: "Harold Abelson & Gerald Jay Sussman",
    price: 1799.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=80",
    description: "The legendary MIT text exploring functional programming, recursion, abstractions, and interpreters."
  },
  {
    title: "Introduction to Algorithms (CLRS)",
    author: "Thomas H. Cormen et al.",
    price: 2199.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1509021436468-d51039746b4b?w=600&auto=format&fit=crop&q=80",
    description: "The fundamental computer science textbook covering algorithm analysis, graph theory, and dynamic programming."
  },
  {
    title: "You Don't Know JS Yet: Scope & Closures",
    author: "Kyle Simpson",
    price: 499.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    description: "Deep dive into the core mechanics of JavaScript lexical scope, hoisting, closures, and modules."
  },
  {
    title: "Node.js Design Patterns",
    author: "Mario Casciaro & Luciano Mammino",
    price: 1399.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    description: "Master asynchronous patterns, streams, event loops, microservices, and design patterns in Node.js."
  },
  {
    title: "Database Internals: A Deep Dive into Distributed Systems",
    author: "Alex Petrov",
    price: 1699.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=600&auto=format&fit=crop&q=80",
    description: "Detailed analysis of B-Trees, LSM-Trees, storage engines, transaction isolation, and consensus algorithms."
  },
  {
    title: "Site Reliability Engineering",
    author: "Betsy Beyer et al. (Google SRE Team)",
    price: 1299.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    description: "How Google runs production systems: SLOs, error budgets, monitoring, automation, and incident handling."
  },
  {
    title: "Domain-Driven Design: Tackling Complexity in Software",
    author: "Eric Evans",
    price: 1499.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80",
    description: "Architectural blueprint for aligning software modeling with domain expertise and bounded contexts."
  },
  {
    title: "Building Microservices",
    author: "Sam Newman",
    price: 1199.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    description: "Designing, decomposing, testing, deploying, and monitoring microservices at scale."
  },
  {
    title: "High Performance Browser Networking",
    author: "Ilya Grigorik",
    price: 1099.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
    description: "What every web developer should know about TCP/IP, UDP, HTTP/2, WebSockets, and WebRTC."
  },
  {
    title: "Docker Deep Dive",
    author: "Nigel Poulton",
    price: 799.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&auto=format&fit=crop&q=80",
    description: "Master containerization, Docker images, storage drivers, networking, and multi-container orchestration."
  },
  {
    title: "Kubernetes Up & Running",
    author: "Brendan Burns, Joe Beda & Kelsey Hightower",
    price: 1299.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80",
    description: "Dive into cloud-native container orchestration with Pods, Services, Deployments, and Ingress controllers."
  },
  {
    title: "Redis in Action",
    author: "Josiah L. Carlson",
    price: 999.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    description: "Using Redis for caching, pub/sub messaging, rate limiting, queues, and persistent storage."
  },
  {
    title: "PostgreSQL: Up and Running",
    author: "Regina Obe & Leo Hsu",
    price: 899.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&auto=format&fit=crop&q=80",
    description: "Optimizing relational queries, indexes, JSONB, replication, and performance tuning in Postgres."
  },
  {
    title: "Micro Frontends in Action",
    author: "Michael Geers",
    price: 1149.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80",
    description: "Decompose monolithic web applications into resilient, team-owned frontend micro-apps."
  },
  {
    title: "React Key Concepts",
    author: "Maximilian Schwarzmüller",
    price: 799.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80",
    description: "Deep dive into virtual DOM, hooks, state synchronization, server components, and performance."
  },
  {
    title: "TypeScript Deep Dive",
    author: "Basarat Ali Syed",
    price: 699.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1516116211223-48a12787c361?w=600&auto=format&fit=crop&q=80",
    description: "Master advanced static types, generics, mapped types, utility types, and compiler internals."
  },
  {
    title: "Mastering Tailwind CSS",
    author: "Adam Wathan",
    price: 599.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80",
    description: "Utility-first CSS techniques for building responsive, pixel-perfect, production web interfaces."
  },
  {
    title: "Distributed Systems for Practitioners",
    author: "Caitie McCaffrey",
    price: 1399.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    description: "Practical guide to RPCs, eventual consistency, CAP theorem, Paxos, and Raft consensus."
  },
  {
    title: "Prisma Essentials",
    author: "Robin Wieruch",
    price: 549.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    description: "Type-safe database querying, Prisma schema migrations, seeders, and ACID transactions."
  },
  {
    title: "Enterprise Integration Patterns",
    author: "Gregor Hohpe & Bobby Woolf",
    price: 1899.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80",
    description: "Asynchronous messaging architectures, publish-subscribe, queues, and event routing."
  },
  {
    title: "Web Security for Developers",
    author: "Malcolm Marshall",
    price: 899.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
    description: "Defending against CORS, CSRF, XSS, SQL injection, HMAC tampering, and timing attacks."
  },
  {
    title: "API Design Patterns",
    author: "JJ Geewax",
    price: 1249.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    description: "REST, gRPC, and GraphQL design patterns for scalable, versioned, developer-friendly web APIs."
  },
  {
    title: "Microservices Patterns",
    author: "Chris Richardson",
    price: 1449.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    description: "Saga pattern, Event Sourcing, CQRS, and transactional outbox patterns for reliable data consistency."
  },
  {
    title: "The Art of Scalability",
    author: "Martin L. Abbott & Michael T. Fisher",
    price: 1599.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    description: "Scalable web architectures, database sharding, caching strategies, and high-availability operations."
  },
  {
    title: "Effective TypeScript",
    author: "Dan Vanderkam",
    price: 899.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1516116211223-48a12787c361?w=600&auto=format&fit=crop&q=80",
    description: "62 specific ways to improve your TypeScript code and avoid common type system pitfalls."
  },
  {
    title: "Clean Architecture",
    author: "Robert C. Martin",
    price: 999.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80",
    description: "A craftsman's guide to software structure, component boundaries, and dependency inversion."
  },
  {
    title: "Software Engineering at Google",
    author: "Titus Winters et al.",
    price: 1399.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    description: "Lessons learned from Google on code review, testing at scale, continuous integration, and culture."
  },
  {
    title: "Building Event-Driven Microservices",
    author: "Adam Bellemare",
    price: 1299.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    description: "Leveraging event streams, Kafka, Redis, and message queues for real-time reactive architectures."
  },
  {
    title: "Grokking Algorithms",
    author: "Aditya Bhargava",
    price: 699.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1509021436468-d51039746b4b?w=600&auto=format&fit=crop&q=80",
    description: "An illustrated, friendly guide for programmers and non-programmers to master core algorithms."
  },
  {
    title: "Learning Web Design",
    author: "Jennifer Robbins",
    price: 849.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80",
    description: "Beginner-friendly guide to HTML5, CSS3, typography, responsive design, and web graphics."
  },
  {
    title: "Full Stack Serverless",
    author: "Nader Dabit",
    price: 949.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    description: "Modern cloud-native applications with GraphQL, AWS Amplify, React, and serverless functions."
  },
  {
    title: "Database Performance Tuning",
    author: "Guy Harrison",
    price: 1499.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=600&auto=format&fit=crop&q=80",
    description: "Identify query bottlenecks, optimize execution plans, and tune relational database indexes."
  },
  {
    title: "Modern Full Stack Development",
    author: "Frank Zammetti",
    price: 799.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80",
    description: "Building complete web applications with Node.js, Express, React, WebSockets, and MongoDB/PostgreSQL."
  },
  {
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    price: 499.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    description: "Unearthing the beautiful, highly expressive subset of JavaScript that makes it an exceptional language."
  },
  {
    title: "Understanding Distributed Systems",
    author: "Roberto Vitillo",
    price: 899.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    description: "Core concepts of networking, security, reliability, scalability, and resilience in distributed software."
  },
  {
    title: "Pro Express.js",
    author: "Azat Mardan",
    price: 749.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    description: "Master Node.js middleware architecture, security headers, routing, session handling, and RESTful APIs."
  },
  {
    title: "Zero Trust Networks",
    author: "Evan Gilman & Doug Barth",
    price: 1199.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
    description: "Building secure systems in untrusted environments using strong authentication and fine-grained authorization."
  },
  {
    title: "Operating Systems: Three Easy Pieces",
    author: "Remzi H. Arpaci-Dusseau",
    price: 1099.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=80",
    description: "Fundamental concepts of OS design: Virtualization, Concurrency (Threads/Locks), and Persistence (File Systems)."
  },
  {
    title: "Data Pipelines with Apache Airflow",
    author: "Bas P. Harenslak",
    price: 1299.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    description: "Authoring, scheduling, and monitoring complex data workflows and ETL pipelines with Python."
  },
  {
    title: "System Performance",
    author: "Brendan Gregg",
    price: 1899.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    description: "Enterprise performance tuning, Linux kernel tracing, eBPF, CPU profiling, and memory bottleneck analysis."
  },
  {
    title: "Continuous Delivery",
    author: "Jez Humble & David Farley",
    price: 1399.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    description: "Reliable software releases through build, test, and deployment automation pipelines."
  },
  {
    title: "Pragmatic Thinking and Learning",
    author: "Andy Hunt",
    price: 699.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
    description: "Refactor your brain: cognitive science principles for software developers to boost learning efficiency."
  },
  {
    title: "Designing Distributed Systems",
    author: "Brendan Burns",
    price: 999.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    description: "Patterns and reusable components for modern cloud-native, containerized distributed applications."
  },
  {
    title: "Patterns of Enterprise Application Architecture",
    author: "Martin Fowler",
    price: 1699.0,
    stock: 10000,
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
    description: "Fundamental architectural patterns: Repository, Data Mapper, Active Record, Unit of Work, and Service Layer."
  }
];

async function main() {
  console.log("🌱 Starting PayFlow catalog database seeding...");

  // Clear existing books to avoid duplication on re-seeding
  await prisma.book.deleteMany({});

  for (const book of books) {
    await prisma.book.create({
      data: book
    });
  }

  console.log(`✅ Successfully seeded ${books.length} books into the database! All initialized with Stock = 10000.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

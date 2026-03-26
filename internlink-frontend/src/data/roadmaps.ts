// src/data/roadmaps.ts
// Curated internship-focused learning roadmaps

export interface RoadmapTopic {
  id: string;
  label: string;
  description: string;
  resource?: string; // free resource URL
  type?: "core" | "optional" | "tool";
}

export interface RoadmapPhase {
  id: string;
  label: string;
  color: string;
  topics: RoadmapTopic[];
}

export interface Roadmap {
  id: string;
  label: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  phases: RoadmapPhase[];
}

export const ROADMAPS: Roadmap[] = [
  // ── Frontend ───────────────────────────────────────────────────────────────
  {
    id: "frontend",
    label: "Frontend",
    icon: "globe",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg,#3b82f6,#06b6d4)",
    description: "Build modern, responsive web interfaces with industry-standard tools.",
    phases: [
      {
        id: "fe-1", label: "Phase 1 — The Foundation", color: "#3b82f6",
        topics: [
          { id: "fe-html", label: "HTML5 Semantics", description: "Semantic tags, forms, accessibility basics", resource: "https://developer.mozilla.org/en-US/docs/Learn/HTML", type: "core" },
          { id: "fe-css", label: "CSS3 & Flexbox/Grid", description: "Box model, layouts, animations, responsive design", resource: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", type: "core" },
          { id: "fe-js", label: "JavaScript (ES6+)", description: "Closures, async/await, array methods, DOM manipulation", resource: "https://javascript.info", type: "core" },
          { id: "fe-git", label: "Git & GitHub", description: "Branching, PRs, rebasing, conflict resolution", resource: "https://learngitbranching.js.org", type: "core" },
        ],
      },
      {
        id: "fe-2", label: "Phase 2 — Core Frameworks", color: "#6366f1",
        topics: [
          { id: "fe-react", label: "React.js", description: "Components, hooks, state management, lifecycle", resource: "https://react.dev", type: "core" },
          { id: "fe-ts", label: "TypeScript", description: "Types, interfaces, generics, type narrowing", resource: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "core" },
          { id: "fe-router", label: "React Router", description: "SPA routing, nested routes, protected routes", resource: "https://reactrouter.com/en/main", type: "core" },
          { id: "fe-fetch", label: "REST API & Fetch", description: "Axios, fetch, error handling, loading states", resource: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API", type: "core" },
        ],
      },
      {
        id: "fe-3", label: "Phase 3 — Advanced Concepts", color: "#a78bfa",
        topics: [
          { id: "fe-state", label: "State Management", description: "Context API, Zustand or Redux Toolkit basics", resource: "https://zustand-demo.pmnd.rs", type: "core" },
          { id: "fe-perf", label: "Performance", description: "Code splitting, lazy loading, memoization, Lighthouse", resource: "https://web.dev/performance/", type: "core" },
          { id: "fe-a11y", label: "Accessibility (a11y)", description: "WCAG, ARIA roles, keyboard navigation", resource: "https://www.a11yproject.com", type: "optional" },
          { id: "fe-test", label: "Testing", description: "Jest, React Testing Library, integration tests", resource: "https://testing-library.com/docs/react-testing-library/intro/", type: "optional" },
        ],
      },
      {
        id: "fe-4", label: "Phase 4 — Job-Ready Tools", color: "#10b981",
        topics: [
          { id: "fe-vite", label: "Vite / Build Tools", description: "Vite, Webpack basics, environment variables", resource: "https://vitejs.dev", type: "tool" },
          { id: "fe-tailwind", label: "Tailwind CSS", description: "Utility-first styling used in most modern startups", resource: "https://tailwindcss.com/docs", type: "tool" },
          { id: "fe-nextjs", label: "Next.js", description: "SSR, SSG, App Router, API routes", resource: "https://nextjs.org/learn", type: "tool" },
          { id: "fe-deploy", label: "Deployment", description: "Vercel, Netlify, GitHub Actions CI/CD", resource: "https://vercel.com/docs", type: "tool" },
        ],
      },
    ],
  },

  // ── Backend ────────────────────────────────────────────────────────────────
  {
    id: "backend",
    label: "Backend",
    icon: "server",
    color: "#a78bfa",
    gradient: "linear-gradient(135deg,#6366f1,#a78bfa)",
    description: "Design scalable APIs, manage databases, and build reliable server-side systems.",
    phases: [
      {
        id: "be-1", label: "Phase 1 — Fundamentals", color: "#6366f1",
        topics: [
          { id: "be-python", label: "Python (or Node.js)", description: "OOP, modules, file I/O, standard library", resource: "https://docs.python.org/3/tutorial/", type: "core" },
          { id: "be-http", label: "HTTP & Web Basics", description: "Methods, status codes, headers, cookies, sessions", resource: "https://developer.mozilla.org/en-US/docs/Web/HTTP", type: "core" },
          { id: "be-algo", label: "Data Structures & Algorithms", description: "Arrays, trees, graphs, sorting, LeetCode Easy/Medium", resource: "https://neetcode.io", type: "core" },
          { id: "be-git2", label: "Git & CLI", description: "Terminal commands, shell scripting basics", resource: "https://learngitbranching.js.org", type: "core" },
        ],
      },
      {
        id: "be-2", label: "Phase 2 — Databases", color: "#8b5cf6",
        topics: [
          { id: "be-sql", label: "SQL & PostgreSQL", description: "Joins, indexes, transactions, query optimization", resource: "https://www.postgresqltutorial.com", type: "core" },
          { id: "be-orm", label: "ORM Basics", description: "SQLAlchemy / Django ORM / Prisma", resource: "https://docs.djangoproject.com/en/stable/topics/db/", type: "core" },
          { id: "be-nosql", label: "NoSQL (MongoDB)", description: "Documents, collections, aggregation pipelines", resource: "https://www.mongodb.com/docs/manual/introduction/", type: "optional" },
          { id: "be-redis", label: "Redis & Caching", description: "Key-value store, caching strategies, pub/sub", resource: "https://redis.io/docs/getting-started/", type: "optional" },
        ],
      },
      {
        id: "be-3", label: "Phase 3 — API Design", color: "#10b981",
        topics: [
          { id: "be-rest", label: "REST API Design", description: "CRUD, versioning, pagination, error handling", resource: "https://restfulapi.net", type: "core" },
          { id: "be-auth", label: "Authentication & JWT", description: "JWT, OAuth2, password hashing, sessions", resource: "https://jwt.io/introduction/", type: "core" },
          { id: "be-django", label: "Django / FastAPI", description: "Views, serializers, middleware, DRF", resource: "https://www.django-rest-framework.org", type: "core" },
          { id: "be-graphql", label: "GraphQL (Basics)", description: "Queries, mutations, schemas, resolvers", resource: "https://graphql.org/learn/", type: "optional" },
        ],
      },
      {
        id: "be-4", label: "Phase 4 — Production Ready", color: "#f59e0b",
        topics: [
          { id: "be-docker", label: "Docker", description: "Containers, Dockerfile, docker-compose", resource: "https://docs.docker.com/get-started/", type: "core" },
          { id: "be-ci", label: "CI/CD Basics", description: "GitHub Actions, automated testing, deployment pipelines", resource: "https://docs.github.com/en/actions", type: "tool" },
          { id: "be-test2", label: "API Testing", description: "pytest, Postman, unit & integration tests", resource: "https://docs.pytest.org/en/stable/", type: "tool" },
          { id: "be-msg", label: "Message Queues", description: "RabbitMQ / Celery / SQS basics", resource: "https://docs.celeryq.dev/en/stable/getting-started/introduction.html", type: "optional" },
        ],
      },
    ],
  },

  // ── AI / ML ────────────────────────────────────────────────────────────────
  {
    id: "ai-ml",
    label: "AI / ML",
    icon: "bot",
    color: "#10b981",
    gradient: "linear-gradient(135deg,#10b981,#3b82f6)",
    description: "Master machine learning, deep learning, and practical AI engineering.",
    phases: [
      {
        id: "ml-1", label: "Phase 1 — Math & Python", color: "#10b981",
        topics: [
          { id: "ml-py", label: "Python for Data", description: "NumPy, Pandas, Matplotlib basics", resource: "https://numpy.org/learn/", type: "core" },
          { id: "ml-lin", label: "Linear Algebra", description: "Vectors, matrices, eigenvalues — Khan Academy", resource: "https://www.khanacademy.org/math/linear-algebra", type: "core" },
          { id: "ml-calc", label: "Calculus & Probability", description: "Derivatives, gradients, probability distributions", resource: "https://www.coursera.org/specializations/mathematics-machine-learning", type: "core" },
          { id: "ml-stat", label: "Statistics", description: "Mean, variance, hypothesis testing, distributions", resource: "https://www.khanacademy.org/math/statistics-probability", type: "core" },
        ],
      },
      {
        id: "ml-2", label: "Phase 2 — Core ML", color: "#3b82f6",
        topics: [
          { id: "ml-sklearn", label: "Scikit-learn", description: "Regression, classification, clustering, pipelines", resource: "https://scikit-learn.org/stable/tutorial/index.html", type: "core" },
          { id: "ml-eval", label: "Model Evaluation", description: "Accuracy, F1, ROC-AUC, cross-validation, overfitting", resource: "https://scikit-learn.org/stable/model_selection.html", type: "core" },
          { id: "ml-feat", label: "Feature Engineering", description: "Encoding, scaling, selection, PCA", resource: "https://www.kaggle.com/learn/feature-engineering", type: "core" },
          { id: "ml-kaggle", label: "Kaggle Competitions", description: "Apply skills on real datasets, earn rankings", resource: "https://www.kaggle.com/competitions", type: "optional" },
        ],
      },
      {
        id: "ml-3", label: "Phase 3 — Deep Learning", color: "#6366f1",
        topics: [
          { id: "ml-nn", label: "Neural Networks", description: "Perceptrons, backpropagation, activation functions", resource: "https://www.3blue1brown.com/topics/neural-networks", type: "core" },
          { id: "ml-torch", label: "PyTorch", description: "Tensors, autograd, training loops, GPU usage", resource: "https://pytorch.org/tutorials/beginner/basics/intro.html", type: "core" },
          { id: "ml-cnn", label: "CNNs & Vision", description: "Convolutional layers, ResNet, image classification", resource: "https://cs231n.github.io", type: "core" },
          { id: "ml-nlp", label: "NLP & Transformers", description: "RNNs, attention, BERT, HuggingFace", resource: "https://huggingface.co/learn/nlp-course", type: "core" },
        ],
      },
      {
        id: "ml-4", label: "Phase 4 — Applied AI", color: "#f59e0b",
        topics: [
          { id: "ml-llm", label: "LLMs & Prompt Engineering", description: "GPT, LangChain, RAG pipelines, fine-tuning", resource: "https://www.deeplearning.ai/short-courses/", type: "core" },
          { id: "ml-mlops", label: "MLOps Basics", description: "MLflow, model versioning, serving with FastAPI", resource: "https://mlflow.org/docs/latest/index.html", type: "tool" },
          { id: "ml-deploy", label: "Model Deployment", description: "ONNX, TensorFlow Serving, HuggingFace Spaces", resource: "https://huggingface.co/docs/hub/spaces", type: "tool" },
          { id: "ml-project", label: "Build a Portfolio Project", description: "End-to-end ML project with EDA, modelling, and a demo app", resource: "https://paperswithcode.com", type: "optional" },
        ],
      },
    ],
  },

  // ── Data Science ───────────────────────────────────────────────────────────
  {
    id: "data-science",
    label: "Data Science",
    icon: "bar-chart",
    color: "#fbbf24",
    gradient: "linear-gradient(135deg,#fbbf24,#f59e0b)",
    description: "Turn raw data into actionable insights with analytics and visualisation.",
    phases: [
      {
        id: "ds-1", label: "Phase 1 — Data Foundations", color: "#f59e0b",
        topics: [
          { id: "ds-py", label: "Python + Pandas", description: "DataFrames, cleaning, merging, groupby", resource: "https://pandas.pydata.org/docs/getting_started/index.html", type: "core" },
          { id: "ds-sql", label: "SQL (Advanced)", description: "Window functions, CTEs, subqueries, performance tuning", resource: "https://mode.com/sql-tutorial/", type: "core" },
          { id: "ds-excel", label: "Excel / Google Sheets", description: "Pivot tables, VLOOKUP, data cleaning in spreadsheets", resource: "https://support.microsoft.com/en-us/excel", type: "optional" },
          { id: "ds-stat", label: "Statistics for DS", description: "A/B testing, confidence intervals, p-values", resource: "https://www.coursera.org/learn/inferential-statistics-intro", type: "core" },
        ],
      },
      {
        id: "ds-2", label: "Phase 2 — Visualisation", color: "#ef4444",
        topics: [
          { id: "ds-plt", label: "Matplotlib & Seaborn", description: "Line charts, heatmaps, pair plots, style themes", resource: "https://seaborn.pydata.org/tutorial.html", type: "core" },
          { id: "ds-plotly", label: "Plotly & Dash", description: "Interactive charts, dashboards", resource: "https://plotly.com/python/", type: "core" },
          { id: "ds-tableau", label: "Tableau / Power BI", description: "Drag-drop dashboards used in most corporate roles", resource: "https://public.tableau.com/app/learn/how-to-videos", type: "optional" },
          { id: "ds-story", label: "Data Storytelling", description: "Communicating findings to non-technical stakeholders", resource: "https://www.storytellingwithdata.com/chart-guide", type: "core" },
        ],
      },
      {
        id: "ds-3", label: "Phase 3 — Analytics & ML", color: "#8b5cf6",
        topics: [
          { id: "ds-eda", label: "Exploratory Data Analysis", description: "Missing values, outliers, distributions, correlation", resource: "https://www.kaggle.com/learn/data-cleaning", type: "core" },
          { id: "ds-pred", label: "Predictive Modeling", description: "Regression, XGBoost, feature importance", resource: "https://www.kaggle.com/learn/intro-to-ml", type: "core" },
          { id: "ds-ts", label: "Time Series", description: "ARIMA, seasonality decomposition, forecasting", resource: "https://www.statsmodels.org/stable/tsa.html", type: "optional" },
          { id: "ds-ab", label: "A/B Testing", description: "Experiment design, sample sizing, significance tests", resource: "https://www.optimizely.com/optimization-glossary/ab-testing/", type: "core" },
        ],
      },
      {
        id: "ds-4", label: "Phase 4 — Big Data & Tools", color: "#10b981",
        topics: [
          { id: "ds-spark", label: "Apache Spark (Basics)", description: "PySpark, DataFrames, lazy evaluation", resource: "https://spark.apache.org/docs/latest/api/python/", type: "optional" },
          { id: "ds-airflow", label: "Data Pipelines / Airflow", description: "DAGs, task scheduling, ETL workflows", resource: "https://airflow.apache.org/docs/apache-airflow/stable/", type: "optional" },
          { id: "ds-cloud", label: "Cloud Data Services", description: "AWS S3/Athena, BigQuery, Snowflake basics", resource: "https://cloud.google.com/bigquery/docs", type: "tool" },
          { id: "ds-case", label: "Case Studies", description: "Practice DS case interviews: product metrics, SQL questions", resource: "https://www.stratascratch.com", type: "core" },
        ],
      },
    ],
  },

  // ── DevOps ─────────────────────────────────────────────────────────────────
  {
    id: "devops",
    label: "DevOps",
    icon: "rocket",
    color: "#f43f5e",
    gradient: "linear-gradient(135deg,#f43f5e,#f97316)",
    description: "Automate infrastructure, deployments, and build reliability at scale.",
    phases: [
      {
        id: "do-1", label: "Phase 1 — Linux & Networking", color: "#f43f5e",
        topics: [
          { id: "do-linux", label: "Linux & CLI", description: "File system, permissions, processes, bash scripting", resource: "https://linuxjourney.com", type: "core" },
          { id: "do-net", label: "Networking Basics", description: "TCP/IP, DNS, HTTP, SSH, firewalls", resource: "https://www.cloudflare.com/learning/network-layer/what-is-a-network/", type: "core" },
          { id: "do-git3", label: "Git Deep Dive", description: "Cherry-pick, bisect, hooks, monorepo strategy", resource: "https://learngitbranching.js.org", type: "core" },
          { id: "do-scrip", label: "Bash Scripting", description: "Variables, loops, cron jobs, automation scripts", resource: "https://www.shellscript.sh", type: "core" },
        ],
      },
      {
        id: "do-2", label: "Phase 2 — Containers", color: "#f97316",
        topics: [
          { id: "do-docker", label: "Docker", description: "Images, containers, volumes, networking, multi-stage builds", resource: "https://docs.docker.com/get-started/", type: "core" },
          { id: "do-compose", label: "Docker Compose", description: "Multi-container apps, override files, health checks", resource: "https://docs.docker.com/compose/", type: "core" },
          { id: "do-k8s", label: "Kubernetes", description: "Pods, deployments, services, ingress, Helm", resource: "https://kubernetes.io/docs/tutorials/", type: "core" },
          { id: "do-registry", label: "Container Registries", description: "Docker Hub, ECR, GCR, image tagging & scanning", resource: "https://hub.docker.com", type: "tool" },
        ],
      },
      {
        id: "do-3", label: "Phase 3 — CI/CD & IaC", color: "#fbbf24",
        topics: [
          { id: "do-gh", label: "GitHub Actions", description: "Workflows, jobs, secrets, matrix builds", resource: "https://docs.github.com/en/actions", type: "core" },
          { id: "do-tf", label: "Terraform", description: "Infrastructure as Code, providers, state management", resource: "https://developer.hashicorp.com/terraform/tutorials", type: "core" },
          { id: "do-ansible", label: "Ansible Basics", description: "Playbooks, roles, inventory, idempotency", resource: "https://docs.ansible.com/ansible/latest/getting_started/index.html", type: "optional" },
          { id: "do-gitops", label: "GitOps / ArgoCD", description: "Declarative deployments, sync policies", resource: "https://argo-cd.readthedocs.io/en/stable/getting_started/", type: "optional" },
        ],
      },
      {
        id: "do-4", label: "Phase 4 — Observability & Cloud", color: "#10b981",
        topics: [
          { id: "do-mon", label: "Monitoring & Alerting", description: "Prometheus, Grafana, PagerDuty SLOs", resource: "https://prometheus.io/docs/tutorials/getting_started/", type: "core" },
          { id: "do-log", label: "Logging", description: "ELK Stack, Loki, structured logging, log aggregation", resource: "https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html", type: "core" },
          { id: "do-aws", label: "AWS Fundamentals", description: "EC2, S3, RDS, IAM, VPC, Lambda basics", resource: "https://aws.amazon.com/training/", type: "core" },
          { id: "do-cert", label: "AWS Solutions Architect", description: "Most valuable entry-level DevOps certification", resource: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", type: "optional" },
        ],
      },
    ],
  },

  // ── Cybersecurity ──────────────────────────────────────────────────────────
  {
    id: "cybersec",
    label: "Cybersecurity",
    icon: "shield",
    color: "#ef4444",
    gradient: "linear-gradient(135deg,#ef4444,#7c3aed)",
    description: "Protect systems, networks, and data — one of the highest-demand fields in tech.",
    phases: [
      {
        id: "cs-1", label: "Phase 1 — Foundations", color: "#ef4444",
        topics: [
          { id: "cs-net", label: "Networking Fundamentals", description: "OSI model, TCP/IP, DNS, DHCP, HTTP/S, Wireshark", resource: "https://overthewire.org/wargames/bandit/", type: "core" },
          { id: "cs-linux", label: "Linux for Security", description: "File permissions, processes, bash, log analysis", resource: "https://tryhackme.com/r/room/linuxfundamentalspart1", type: "core" },
          { id: "cs-prog", label: "Python for Security", description: "Scripting, socket programming, automation, Scapy", resource: "https://automatetheboringstuff.com", type: "core" },
          { id: "cs-crypto", label: "Cryptography Basics", description: "Symmetric/asymmetric encryption, hashing, PKI, TLS", resource: "https://www.coursera.org/learn/crypto", type: "core" },
        ],
      },
      {
        id: "cs-2", label: "Phase 2 — Offensive Security", color: "#7c3aed",
        topics: [
          { id: "cs-recon", label: "Reconnaissance", description: "OSINT, nmap, Shodan, DNS enumeration", resource: "https://tryhackme.com/r/room/passiverecon", type: "core" },
          { id: "cs-web", label: "Web Application Hacking", description: "OWASP Top 10, SQLi, XSS, CSRF, BurpSuite", resource: "https://portswigger.net/web-security", type: "core" },
          { id: "cs-vuln", label: "Vulnerability Assessment", description: "CVEs, CVSS scoring, Nessus, OpenVAS", resource: "https://tryhackme.com", type: "core" },
          { id: "cs-pwn", label: "Exploitation Basics", description: "Metasploit, buffer overflows, privilege escalation", resource: "https://tryhackme.com/path/outline/jr-penetration-tester", type: "optional" },
        ],
      },
      {
        id: "cs-3", label: "Phase 3 — Defensive Security", color: "#0891b2",
        topics: [
          { id: "cs-siem", label: "SIEM & Log Analysis", description: "Splunk, ELK Stack, log correlation, threat hunting", resource: "https://www.splunk.com/en_us/training/free-courses/overview.html", type: "core" },
          { id: "cs-inc", label: "Incident Response", description: "IR lifecycle, evidence collection, containment, eradication", resource: "https://www.sans.org/white-papers/incident-handlers-handbook/", type: "core" },
          { id: "cs-fw", label: "Firewalls & IDS/IPS", description: "pfSense, Snort, Suricata, network segmentation", resource: "https://www.snort.org/documents", type: "optional" },
          { id: "cs-cloud-sec", label: "Cloud Security", description: "AWS IAM, GuardDuty, Security Groups, S3 policies", resource: "https://aws.amazon.com/security/", type: "optional" },
        ],
      },
      {
        id: "cs-4", label: "Phase 4 — Certs & Practice", color: "#10b981",
        topics: [
          { id: "cs-cert", label: "eJPT / CEH Certification", description: "Entry-level ethical hacking certifications", resource: "https://my.ine.com/CyberSecurity/learning-paths/a223968e-3a74-45ed-884d-2d16760b8bbd/ejpt-v2", type: "core" },
          { id: "cs-ctf", label: "CTF Competitions", description: "HackTheBox, TryHackMe, PicoCTF — build a writeup portfolio", resource: "https://www.hackthebox.com", type: "core" },
          { id: "cs-comp", label: "Compliance & GRC", description: "GDPR, ISO 27001, SOC 2 basics for enterprise roles", resource: "https://gdpr.eu", type: "optional" },
          { id: "cs-report", label: "Write a Pentest Report", description: "Full professional report for a lab target — add to portfolio", resource: "https://github.com/noraj/OSCP-Exam-Report-Template-Markdown", type: "optional" },
        ],
      },
    ],
  },

  // ── Blockchain ─────────────────────────────────────────────────────────────
  {
    id: "blockchain",
    label: "Blockchain",
    icon: "link",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg,#f59e0b,#8b5cf6)",
    description: "Build decentralised apps, smart contracts, and Web3 infrastructure.",
    phases: [
      {
        id: "bc-1", label: "Phase 1 — Core Concepts", color: "#f59e0b",
        topics: [
          { id: "bc-how", label: "How Blockchain Works", description: "Distributed ledger, consensus, immutability, nodes", resource: "https://andersbrownworth.com/blockchain/", type: "core" },
          { id: "bc-btc", label: "Bitcoin & Ethereum Basics", description: "UTXO model, accounts, gas, wallets, transactions", resource: "https://ethereum.org/en/learn/", type: "core" },
          { id: "bc-crypt", label: "Cryptography for Blockchain", description: "Public/private keys, digital signatures, Merkle trees", resource: "https://www.coursera.org/learn/cryptocurrency", type: "core" },
          { id: "bc-wallet", label: "Wallets & Tooling", description: "MetaMask, Etherscan, Hardhat setup, Remix IDE", resource: "https://remix.ethereum.org", type: "core" },
        ],
      },
      {
        id: "bc-2", label: "Phase 2 — Smart Contracts", color: "#8b5cf6",
        topics: [
          { id: "bc-sol", label: "Solidity", description: "Data types, functions, modifiers, events, mappings", resource: "https://cryptozombies.io", type: "core" },
          { id: "bc-oz", label: "OpenZeppelin", description: "ERC-20, ERC-721, access control, upgradeable contracts", resource: "https://docs.openzeppelin.com/contracts", type: "core" },
          { id: "bc-test", label: "Testing Smart Contracts", description: "Hardhat tests, Foundry, fuzzing, code coverage", resource: "https://hardhat.org/tutorial", type: "core" },
          { id: "bc-sec", label: "Smart Contract Security", description: "Re-entrancy, overflow, front-running, Slither, auditing", resource: "https://consensys.github.io/smart-contract-best-practices/", type: "optional" },
        ],
      },
      {
        id: "bc-3", label: "Phase 3 — DApp Development", color: "#06b6d4",
        topics: [
          { id: "bc-ethjs", label: "Ethers.js / Web3.js", description: "Connect frontend to contracts, read/write state, events", resource: "https://docs.ethers.org/v6/", type: "core" },
          { id: "bc-react", label: "React + Wagmi", description: "Wallet connection, hooks for blockchain reads/writes", resource: "https://wagmi.sh/react/getting-started", type: "core" },
          { id: "bc-ipfs", label: "IPFS & Decentralized Storage", description: "Pinata, NFT metadata, off-chain data patterns", resource: "https://docs.ipfs.tech/concepts/what-is-ipfs/", type: "optional" },
          { id: "bc-graph", label: "The Graph Protocol", description: "Index on-chain events, query with GraphQL subgraphs", resource: "https://thegraph.com/docs/en/", type: "optional" },
        ],
      },
      {
        id: "bc-4", label: "Phase 4 — DeFi & Web3 Ecosystem", color: "#10b981",
        topics: [
          { id: "bc-defi", label: "DeFi Protocols", description: "AMMs (Uniswap), lending (Aave), yield farming mechanics", resource: "https://docs.uniswap.org", type: "core" },
          { id: "bc-nft", label: "NFTs & Marketplaces", description: "ERC-721/1155, royalties, OpenSea, custom marketplace", resource: "https://opensea.io/learn", type: "optional" },
          { id: "bc-l2", label: "Layer 2 & Scaling", description: "Optimism, Arbitrum, zkRollups, state channels", resource: "https://docs.arbitrum.io/getting-started-users", type: "optional" },
          { id: "bc-audit", label: "Audit a DeFi Protocol", description: "Read and audit a live protocol — publish findings on GitHub", resource: "https://code4rena.com", type: "core" },
        ],
      },
    ],
  },
];


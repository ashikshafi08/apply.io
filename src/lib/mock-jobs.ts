export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "remote" | "hybrid" | "onsite";
  salary?: string;
  postedAt: string;
  source: string;
  url?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  matchScore?: number;
  matchReasons?: string[];
};

export const MOCK_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Full Stack AI/ML Engineer",
    company: "AI Execution Platform (PE-backed)",
    location: "Remote",
    type: "remote",
    postedAt: "2 days ago",
    source: "LinkedIn",
    description: `Are you an engineer who loves building real AI systems—not prototypes or slide decks?

We're working with a fast-moving AI execution platform that's redefining how private equity and operating companies transform with AI. They've built a model that combines consulting precision, startup speed, and investment ownership, and they're looking for a Full Stack AI/ML Engineer to help power it.

This is a role for someone who thrives in ambiguity, moves fast, and cares deeply about outcomes. You'll join a small, high-caliber team that embeds directly with portfolio companies, designs real production systems, and turns successful transformations into scalable products and ventures.

What you'll do:
• Design and ship production-grade AI systems inside real companies
• Build Databricks-based data pipelines, orchestration layers, and governance frameworks
• Architect retrieval-augmented generation (RAG) systems with solid context management, evaluation, and observability
• Use AI tools in your own workflow to accelerate development and raise the bar for quality
• Capture what works and help turn proven playbooks into new ventures

What makes this different:
This isn't another "AI strategy" role. You'll be part of a small team that ships production systems for private equity portfolios, spins proven solutions into companies, and earns upside from both.

If you're the kind of engineer who wants to build, own, and compound (not just code) this is worth a conversation.`,
    requirements: [
      "Strong foundation in Python, SQL, CI/CD, and modern data engineering practices",
      "Hands-on experience with Databricks (compute, orchestration, governance, or integration)",
      "Experience building or maintaining RAG and LLM-based systems",
      "Ability to operate independently (designing, provisioning, and deploying without a fully built environment)",
      "Experience in startups or lean, fast-moving teams where you wore multiple hats",
      "Exposure to lakehouse architectures, feature/vector stores, or evaluation frameworks",
    ],
    benefits: ["Medical insurance", "Vision insurance", "Dental insurance"],
    matchScore: 92,
    matchReasons: [
      "RAG & LLM experience",
      "Python expertise",
      "Startup background",
    ],
  },
  {
    id: "job-2",
    title: "AI Practice Engineer",
    company: "MongoDB",
    location: "United States (Remote)",
    type: "remote",
    salary: "$137,000 - $270,000 USD",
    postedAt: "1 week ago",
    source: "LinkedIn",
    url: "https://mongodb.com/careers",
    description: `At MongoDB, we believe data is at the core of the AI era. As AI-powered applications evolve from prototypes to mission-critical solutions, the foundation for success lies in designing systems that provide relevant and trustworthy responses. MongoDB is redefining the role of the database in this landscape, positioning our data layer as the cornerstone of modern AI applications.

MongoDB's AI Practice is at the forefront of driving customer success by transforming innovative ideas into real-world AI applications. Our customers are increasingly asking for our hands-on technical expertise with AI and modern data solutions. We're building a specialized AI engineering practice that works hand-in-hand with our most strategic customers, helping them rapidly prototype, refine, and deploy scalable AI systems that leverage MongoDB Atlas.

In this role, you will:
• Embed deeply with strategic customers, gaining a thorough understanding of their business strategy, challenges and technical requirements within the context of AI
• Architect, design, and implement end-to-end AI solutions using an iterative, experiment-driven approach
• Scope projects, define deliverables, and create actionable plans for both rapid prototypes and enterprise-scale deployments
• Hands-on develop scalable, secure, and performant AI solutions, working side-by-side with customer engineering teams
• Prototype and iterate solutions leveraging MongoDB Atlas, cloud technologies, LLMs, and generative AI technologies
• Provide technical leadership to ensure architectural alignment, quality, and successful customer outcomes
• Actively engage with emerging AI technologies to stay ahead of trends, incorporating new insights into customer solutions
• Collaborate closely with Sales teams, Solution Architects, Product, and wider Professional Services to deliver high-impact, scalable solutions

Why Join Us?
This isn't just another architecture role—it's a hands-on opportunity to shape the future of AI-driven business solutions and redefine what's possible with MongoDB and AI. You'll be working on the front lines of innovation, building AI applications that transform industries and drive real-world impact.`,
    requirements: [
      "5+ years of experience in software development, customer engineering, solution architecture, or similar roles",
      "At least 2 years dedicated to designing and implementing AI solutions",
      "Proficiency in building modern, full-stack applications with Python, Node.js, or Java",
      "Front end development with frameworks like React, Angular or Next.js",
      "Experience implementing RAG systems and LLMs for real-world applications",
      "Hands-on experience deploying scalable AI applications on cloud (AWS, Azure, GCP)",
      "Deep understanding of CI/CD, test-driven development, and microservices",
      "Willing to travel up to 30%",
    ],
    benefits: ["401(k)", "Medical insurance", "Equity", "20 weeks parental leave", "Flexible PTO"],
    matchScore: 88,
    matchReasons: [
      "RAG & LLM expertise",
      "Full-stack experience",
      "Cloud deployment skills",
    ],
  },
];

export function getJobById(id: string): Job | undefined {
  return MOCK_JOBS.find((job) => job.id === id);
}


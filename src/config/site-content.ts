export const siteContent = {
  // Analytics Configuration
  analytics: {
    googleAnalyticsId: "G-WS625DG4GT"
  },

  // Theme Configuration
  theme: {
    primaryColor: "#fe6743", // Orange HSL values for MenuProfitMax
  },

  // Brand and Logo
  brand: {
    name: "MenuProfitMax",
    logoUrl: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/1755782130350-r6386jnrv6.png",
    primaryColor: "12 99% 65%",
    footerLogoUrl: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/1755781998922-axe2nh3wpw6.png"
  },

  // Headline Section
  headline: {
    title: "Maximize Your Restaurant Profits with Smarter Menu Costing — ",
    titleHighlight: "For Free",
    get subtitle() { return `Plan & Optimize Your Menu for FREE for a whole year with ${siteContent.brand.name} (normally $5,760).`; },
    buttonText: "Get started - ",
    buttonTextLight: "It's free",
    disclaimer: "No credit card required"
  },

  // Home Page Section
  homePage: {
    title: "Smarter Menu Costing. Bigger Profits.",
    subtitle: "Track ingredient costs, compare suppliers, and maximize profit margins with real-time insights.",
    buttonText: "Get started - ",
    buttonTextLight: "It's free"
  },

  // Features Section
  features: {
    title: "Smarter Staff Management, Made Simple",
    subtitle: "Streamline your staff management with comprehensive tools designed for high-demand environments.",
    items: [
      {
        icon: "https://img.recraft.ai/ffQIm2-GN0_MzqKgyzdOdK_PQqJ7D2VLMJzEiRee3WM/rs:fit:512:512:0/raw:1/plain/abs://external/images/a917421a-e73a-4a45-b7e0-0f0b2547594f",
        title: "Smart Scheduling",
        description: "Automatically assigns shifts based on staff availability and skills."
      },
      {
        icon: "https://img.recraft.ai/ZKGB5UhTU8pID6YdiP0TYJ1JYpVbZJ2iUKvor7xTw4A/rs:fit:512:512:0/raw:1/plain/abs://external/images/cf532bd3-572d-49e4-b697-b526af91a93b",
        title: "Compliance Alerts",
        description: "Tracks labor laws and notifies managers of potential violations."
      },
      {
        icon: "https://img.recraft.ai/nohfc8uu3R_CC0Rc-c88sFslFHcZzOU4jSdjT61ZhVM/rs:fit:512:512:0/raw:1/plain/abs://external/images/70fab475-9cac-4b0d-b109-2f5948a3816c",
        title: "Mobile Access",
        description: "Allow staff to view and swap shifts conveniently from their phones."
      }
    ]
  },

  // Team Roles Section
  teamRoles: {
    title: "Empowering Teams for Seamless Operations",
    get subtitle() { return `${siteContent.brand.name} equips every role in your kitchen with the tools needed for efficient scheduling and compliance management.`; },
    roles: [
      {
        icon: "ChefHat",
        iconType: "lucide",
        title: "Kitchen Managers",
        description: "Efficiently oversee staff schedules, optimize shift assignments, and ensure compliance with labor laws."
      },
      {
        icon: "UserCheck",
        iconType: "lucide",
        title: "Shift Supervisors",
        description: "Monitor daily operations, manage shift swaps, and maintain team communication for smooth service."
      },
      {
        icon: "Users",
        iconType: "lucide",
        title: "Team Members",
        description: "Easily check schedules, swap shifts, and stay engaged through a user-friendly mobile platform."
      }
    ]
  },

  // Feature Intro Section
  featureIntro: {
    title: "AI-powered tools for a more efficient kitchen",
    description: "From smart scheduling to compliance tracking and team engagement, PrepShiftPro integrates everything you need to streamline kitchen operations into one intuitive platform — no spreadsheets, no guesswork."
  },

  // Split Screen Section
  splitScreen: {
    sections: [
      {
        id: "inventory",
        image: "https://img.recraft.ai/BELRfj0T5OciOnoJRRCmtCZOmuMM95iA5suhgwoOnLU/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/49b5be83-455c-4ed5-b10e-2693a63c384d",
        title: "Smart Scheduling",
        features: [
          "Smart assignments",
          "Availability tracking",
          "Conflict resolution"
        ],
        imageAlt: "Smart Scheduling illustration",
        description: "Automatically assigns shifts based on availability and skills. Automatically assigns shifts based on staff availability and skills for optimal coverage.\n\n"
      },
      {
        id: "supplier",
        image: "https://images.unsplash.com/photo-1715635845581-b1683792ed25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODUwNTB8MHwxfHNlYXJjaHwxfHxjb21wbGlhbmNlfGVufDB8MHx8fDE3NTM4ODQ5MDF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Compliance Alerts",
        features: [
          "Process automation",
          "Workflow optimization",
          "Smart triggers"
        ],
        imageAlt: "Compliance Alerts illustration",
        description: "Tracks labor laws and alerts managers of violations. Streamline your workflow with intelligent automation and real-time insights.\n\n"
      },
      {
        id: "analytics",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODUwNTB8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHB8ZW58MHwwfHx8MTc1Mzg4NDkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Mobile Access",
        features: [
          "Smart assignments",
          "Availability tracking",
          "Conflict resolution"
        ],
        imageAlt: "Mobile Access illustration",
        description: "Staff can view and swap shifts from their phones. Streamline your workflow with intelligent automation and real-time insights.\n\n"
      }
    ]
  },

  // All Features Section
  allFeatures: {
    title: "All features",
    ctaText: "Elevate your restaurant with the power of AI",
    get subtitle() { return `Discover everything you can do with ${siteContent.brand.name}.`; },
    financialTools: {
      title: "Financial & Analytics",
      features: [
        {
          icon: "check-circle",
          isNew: false,
          title: "Payroll Integration",
          description: "Streamline your payroll processes with seamless integration that ensures accurate and timely payments. Reduce errors and save time, allowing you to focus on what truly matters."
        },
        {
          icon: "clock",
          isNew: false,
          title: "Time Clocking",
          description: "Track employee hours with precision using our intuitive time clocking solution. Gain visibility into labor costs and optimize scheduling based on real-time data."
        },
        {
          icon: "gift",
          isNew: false,
          title: "Tip Management",
          description: "Effortlessly manage tips and gratuities with our dedicated tools that ensure fair distribution and transparency. Simplify the process and enhance employee satisfaction."
        },
        {
          icon: "settings",
          isNew: false,
          title: "POS & Third-Party Integrations",
          description: "Enhance your operational capabilities with seamless integrations to POS systems and other third-party tools. Create a cohesive ecosystem that drives efficiency and data accuracy."
        }
      ]
    },
    operationalManagement: {
      title: "Operations & Management",
      features: [
        {
          icon: "settings",
          isNew: false,
          title: "Staff Scheduling",
          description: "Effortlessly organize your workforce with intuitive scheduling tools that ensure optimal coverage and productivity. Say goodbye to manual scheduling headaches and hello to streamlined operations."
        },
        {
          icon: "users",
          isNew: false,
          title: "Team Communication & Engagement",
          description: "Foster a collaborative work environment with built-in communication tools designed to enhance team engagement and streamline dialogue. Keep everyone connected and informed, no matter where they are."
        },
        {
          icon: "check-circle",
          isNew: false,
          title: "Task Management",
          description: "Stay on top of your team's priorities with powerful task management features that allow for tracking, assigning, and completion of tasks. Empower your staff to hit their goals efficiently."
        },
        {
          icon: "book-open",
          isNew: false,
          title: "Manager Log Book",
          description: "Maintain a detailed record of operational activities with our digital manager log book. Easily track incidents, notes, and important events to ensure accountability and transparency."
        },
        {
          icon: "briefcase",
          isNew: false,
          title: "Labor Compliance & Analytics",
          description: "Navigate the complexities of labor regulations with our compliance tools that provide insights and analytics. Ensure your operations meet all legal requirements while optimizing performance."
        },
        {
          icon: "file-check",
          isNew: false,
          title: "Document & Certification Tracking",
          description: "Simplify the management of essential documents and certifications with our tracking system. Ensure your team is compliant and up-to-date with necessary qualifications effortlessly."
        }
      ]
    }
  },

  // Features Page
  featuresPage: {
    title: "Everything PrepShiftPro Offers",
    benefits: [
      {
        icon: "TrendingUp",
        title: "Increased Efficiency"
      },
      {
        icon: "DollarSign",
        title: "Cost Savings"
      },
      {
        icon: "BarChart3",
        title: "Better Insights"
      }
    ],
    features: [
      {
        items: [
          {
            icon: "https://img.recraft.ai/ffQIm2-GN0_MzqKgyzdOdK_PQqJ7D2VLMJzEiRee3WM/rs:fit:512:512:0/raw:1/plain/abs://external/images/a917421a-e73a-4a45-b7e0-0f0b2547594f",
            name: "Smart Scheduling",
            description: "Automatically assigns shifts based on staff availability and skills."
          },
          {
            icon: "https://img.recraft.ai/ZKGB5UhTU8pID6YdiP0TYJ1JYpVbZJ2iUKvor7xTw4A/rs:fit:512:512:0/raw:1/plain/abs://external/images/cf532bd3-572d-49e4-b697-b526af91a93b",
            name: "Compliance Alerts",
            description: "Tracks labor laws and notifies managers of potential violations."
          },
          {
            icon: "https://img.recraft.ai/nohfc8uu3R_CC0Rc-c88sFslFHcZzOU4jSdjT61ZhVM/rs:fit:512:512:0/raw:1/plain/abs://external/images/70fab475-9cac-4b0d-b109-2f5948a3816c",
            name: "Mobile Access",
            description: "Allow staff to view and swap shifts conveniently from their phones."
          }
        ],
        title: "Everything You Need for Stress-Free Staff Management"
      },
      {
        items: [
          {
            icon: "BarChart3",
            name: "PrepShiftPro Analytics",
            description: "Comprehensive reporting and insights tailored to your business needs"
          },
          {
            icon: "Bot",
            name: "Smart Automation",
            description: "Intelligent automation features that save time and reduce manual work"
          },
          {
            icon: "Link",
            name: "Integration Hub",
            description: "Connect with your existing tools and workflows seamlessly"
          },
          {
            icon: "Settings",
            name: "Custom Solutions",
            description: "Tailored features that adapt to your specific business requirements"
          }
        ],
        title: "Advanced Capabilities"
      }
    ],
    subtitle: "Comprehensive tools and features designed specifically for prepshiftpro users"
  },

  // Pricing Page
  pricing: {
    title: "Choose Your Plan",
    subtitle: "Flexible pricing tailored for every restaurant size.",
    plans: [
      {
        cta: "Start Free",
        name: "Free",
        price: 0,
        period: "/month",
        popular: false,
        features: [
          "Ingredient Costing: Breaks down cost per dish in real-time.",
          "Profit Margins: Instantly shows profitability of each menu item.",
          "Supplier Comparison: Compare costs across vendors.",
          "Basic inventory management & usage tracking."
        ],
        description: "Get started with Menu Profit Max for free for one year, providing essential menu costing tools."
      },
      {
        cta: "Get Started",
        name: "Standard",
        price: "99",
        period: "/month",
        popular: true,
        features: [
          "All Free plan features",
          "Real-time food & labor cost tracking.",
          "Daily controllable P&L reports.",
          "Order management & vendor ordering.",
          "Priority support included."
        ],
        description: "Unlock advanced features to optimize your menu and maximize profits."
      }
    ]
  },

  // Hero Banner
  heroBanner: {
    title: "Step into the future of kitchen operations",
    get description() { return `Join hundreds of restaurants and teams using ${siteContent.brand.name} to streamline menu management, cut costs, and enhance profits—faster.`; },
    buttonText: "Get started - ",
    buttonTextLight: "It's free"
  }
};
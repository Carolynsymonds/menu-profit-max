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
    title: "Menu Costing Made Simple",
    subtitle: "Revolutionize your kitchen operations with these powerful capabilities.",
    items: [
      {
        icon: "https://img.recraft.ai/BqenAADKfF8S9q9tCCdrBw4mRK8OgylWx7yKVwjYKMc/rs:fit:512:512:0/raw:1/plain/abs://external/images/eed240a1-4908-4f04-b433-728dd0c6a900",
        title: "Ingredient Costing",
        description: "Breaks down cost per dish in real-time."
      },
      {
        icon: "https://img.recraft.ai/X2NOxZX98Lr7s_7sgzwMV8HFwVMC5bwVefSuDVMUwu4/rs:fit:512:512:0/raw:1/plain/abs://external/images/daab277b-eb55-4e9b-ae9b-e00cf1384996",
        title: "Profit Margins",
        description: "Instantly shows profitability of each menu item."
      },
      {
        icon: "https://img.recraft.ai/8cdXz_8Q_9uGUBlV5qg9rmps1wCuriQSYSjkuJnNMwg/rs:fit:512:512:0/raw:1/plain/abs://external/images/cb502d4e-5bf9-4f68-a174-0e5f16312f35",
        title: "Supplier Comparison",
        description: "Compare costs across vendors."
      }
    ]
  },

  // Team Roles Section
  teamRoles: {
    title: "Tools for Every Role in Your Restaurant",
    subtitle: "Empower your team with specialized tools and insights.",
    roles: [
      {
        icon: "https://img.recraft.ai/qDbu5ost6-mUdXDFJhM3EMk-1Ye1O2nQKWGZlsp-5Xk/rs:fit:512:512:0/raw:1/plain/abs://external/images/09bcca6b-e0fd-4c89-b673-8f55c46bd660",
        title: "Kitchen Manager",
        description: "Oversee kitchen operations, manage inventory, and ensure food quality."
      },
      {
        icon: "https://img.recraft.ai/xhkHvsLn-ckmfDJB3mANnlwYcTBDrYvtIz6pV1Qedgg/rs:fit:512:512:0/raw:1/plain/abs://external/images/95f00e86-d7e7-4c39-8820-c71bda112b1b",
        title: "Financial Supervisor",
        description: "Monitor financial performance, manage budgets, and analyze profit margins."
      },
      {
        icon: "https://img.recraft.ai/Vs6-Cm09hzJTPE4DkTKFU2_q7aGRf3FoAoNflReV28g/rs:fit:512:512:0/raw:1/plain/abs://external/images/c9b068d0-1db2-449e-be79-6b72508ae715",
        title: "Staff Member",
        description: "Utilize tools for daily tasks, manage orders, and submit invoices."
      }
    ]
  },

  // Feature Intro Section
  featureIntro: {
    title: "Unlock the Full Potential of Your Menu",
    description: "MenuProfitMax equips foodservice businesses with powerful tools to manage costs, track profits, and ensure optimal pricing."
  },

  // Split Screen Section
  splitScreen: {
    sections: [
      {
        id: "ingredientCosting",
        image: "https://img.recraft.ai/TpqijYVA9rhIvRW2G8UupQz_ZHi-bUgiqWtGv4n6Hqs/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/56697a06-7022-420f-8fcb-82739b947a6c",
        title: "Ingredient Costing",
        features: [
          "Breaks down cost per dish in real-time",
          "Enables informed pricing decisions",
          "Improves menu profitability"
        ],
        imageAlt: "Recraft generated image for Ingredient Costing",
        description: "Get real-time insights into your ingredient costs to make informed pricing decisions."
      },
      {
        id: "profitMargins",
        image: "https://img.recraft.ai/LzzLDXRCQFc4kQ52f4aPAworfEYjqVoRzUIaDLyRQ6U/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/f06a41f4-eae2-4054-8738-82c20891c881",
        title: "Profit Margins",
        features: [
          "Instant profitability overview",
          "Quickly assess menu item success",
          "Optimize pricing strategies"
        ],
        imageAlt: "Recraft generated image for Profit Margins",
        description: "Stay informed about the profitability of each menu item to maximize your profits."
      },
      {
        id: "supplierComparison",
        image: "https://img.recraft.ai/_yPZwe7o1NT1p7KkIHC5yMe8xdMXbE9Sw0ey8W19PvM/rs:fit:1024:1024:0/raw:1/plain/abs://external/images/deaddc3e-ab8c-499a-9fba-bb5a6fba5e98",
        title: "Supplier Comparison",
        features: [
          "Compare vendor prices",
          "Reduce ingredient costs",
          "Streamline ordering process"
        ],
        imageAlt: "Recraft generated image for Supplier Comparison",
        description: "Easily compare supplier costs to ensure you're getting the best prices for your ingredients."
      }
    ]
  },

  // All Features Section
  allFeatures: {
    title: "From Invoices to Inventory — All in One Place",
    ctaText: "Explore our features",
    subtitle: "Everything you need to succeed.",
    financialTools: {
      title: "Financial Tools",
      features: [
        {
          icon: "Settings",
          isNew: false,
          title: "POS & Accounting Integrations",
          description: "Integrate with existing POS and accounting systems."
        },
        {
          icon: "Wifi",
          isNew: false,
          title: "Mobile App for Invoice Upload",
          description: "Use our mobile app to upload invoices on the go."
        }
      ]
    },
    operationalManagement: {
      title: "Complete Cost & Operations Control",
      features: [
        {
          icon: "FileText",
          isNew: false,
          title: "Automated Invoice Processing",
          description: "Simplify invoice management with automated processing."
        },
        {
          icon: "FileText",
          isNew: false,
          title: "Bill Payment & AP Automation",
          description: "Automate accounts payable and streamline bill payments."
        },
        {
          icon: "Utensils",
          isNew: false,
          title: "Real-time Food & Labor Cost Tracking",
          description: "Track food and labor costs in real-time to manage expenses."
        },
        {
          icon: "Settings",
          isNew: false,
          title: "Daily Controllable P&L Reports",
          description: "Receive daily reports for better financial control."
        },
        {
          icon: "Package",
          isNew: false,
          title: "Inventory Management & Usage Tracking",
          description: "Manage inventory and track usage efficiently."
        },
        {
          icon: "Settings",
          isNew: false,
          title: "Recipe/Menu Cost Analysis",
          description: "Analyze recipes and menus to optimize costs."
        },
        {
          icon: "ShoppingCart",
          isNew: false,
          title: "Order Management & Vendor Ordering",
          description: "Manage orders and vendor relationships seamlessly."
        },
        {
          icon: "DollarSign",
          isNew: false,
          title: "Price Alerts for Cost Changes",
          description: "Get alerts for ingredient price changes to adjust pricing."
        }
      ]
    }
  },

  // Features Page
  featuresPage: {
    title: "Everything MenuProfitMax Offers",
    benefits: [
      {
        icon: "DollarSign",
        title: "Boost Profitability"
      },
      {
        icon: "Zap",
        title: "Streamlined Operations"
      },
      {
        icon: "BarChart3",
        title: "Data-Driven Decisions"
      },
      {
        icon: "Shield",
        title: "Risk Management"
      }
    ],
    features: [
      {
        items: [
          {
            icon: "https://img.recraft.ai/BqenAADKfF8S9q9tCCdrBw4mRK8OgylWx7yKVwjYKMc/rs:fit:512:512:0/raw:1/plain/abs://external/images/eed240a1-4908-4f04-b433-728dd0c6a900",
            name: "Ingredient Costing",
            description: "Breaks down cost per dish in real-time."
          },
          {
            icon: "https://img.recraft.ai/X2NOxZX98Lr7s_7sgzwMV8HFwVMC5bwVefSuDVMUwu4/rs:fit:512:512:0/raw:1/plain/abs://external/images/daab277b-eb55-4e9b-ae9b-e00cf1384996",
            name: "Profit Margins",
            description: "Instantly shows profitability of each menu item."
          },
          {
            icon: "https://img.recraft.ai/8cdXz_8Q_9uGUBlV5qg9rmps1wCuriQSYSjkuJnNMwg/rs:fit:512:512:0/raw:1/plain/abs://external/images/cb502d4e-5bf9-4f68-a174-0e5f16312f35",
            name: "Supplier Comparison",
            description: "Compare costs across vendors."
          }
        ],
        title: "Cost Management Insights"
      },
      {
        items: [
          {
            icon: "TrendingUp",
            name: "Dynamic Pricing Strategies",
            description: "Utilize real-time market data to adjust your menu prices dynamically, ensuring maximum profitability based on demand and ingredient costs."
          },
          {
            icon: "Star",
            name: "AI-Powered Menu Recommendations",
            description: "Leverage AI to analyze customer preferences and suggest menu adjustments that enhance sales and customer satisfaction."
          },
          {
            icon: "Bell",
            name: "Automated Inventory Alerts",
            description: "Receive automated alerts for low inventory levels and upcoming expiration dates, ensuring you never run out of key ingredients."
          },
          {
            icon: "Users",
            name: "Integrated Supplier Management",
            description: "Centralize supplier information and performance analytics, allowing for optimized ordering and relationship management."
          },
          {
            icon: "Monitor",
            name: "Comprehensive Analytics Dashboard",
            description: "Access a powerful analytics dashboard that provides insights into sales trends, cost breakdowns, and profit margins for better strategic planning."
          },
          {
            icon: "Map",
            name: "Multi-Location Management",
            description: "Easily manage multiple restaurant locations with a single account, allowing for consistent menu pricing and cost analysis across all venues."
          },
          {
            icon: "FileText",
            name: "Customizable Reporting Tools",
            description: "Create tailored reports that focus on the metrics that matter most to your business, enhancing visibility into your financial health."
          },
          {
            icon: "Plug",
            name: "Seamless Third-Party Integrations",
            description: "Integrate with a variety of third-party apps and tools for a comprehensive restaurant management ecosystem that fits your unique needs."
          }
        ],
        title: "Smart Operations Suite"
      }
    ],
    subtitle: "Comprehensive tools and features designed specifically for menuprofitmax users"
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
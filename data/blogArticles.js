const articleImages = {
  sustainable: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=85",
  firstHome: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1000&q=85",
  inspection: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&q=85",
  market: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&q=85",
  investment: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1000&q=85",
  planning: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&q=85",
  ownership: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1000&q=85",
  renting: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=85",
  documents: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1000&q=85",
};

export const BLOG_ARTICLES = [
  {
    slug: "sustainable-living-urban-cities",
    category: "Investment",
    eyebrow: "Editor's pick · Sustainable living",
    title: "The Future of Sustainable Living in Urban Cities",
    excerpt: "Consider how natural light, thoughtful materials and everyday energy choices can shape a more comfortable home.",
    image: articleImages.sustainable,
    imageAlt: "Light-filled contemporary living room",
    readTime: 7,
    published: "Voks Journal",
    sections: [
      {
        heading: "A better home starts with the way it feels",
        paragraphs: [
          "A sustainable home is not defined by a single feature. It is the result of many thoughtful choices that make a space comfortable to live in while using resources more carefully.",
          "In a city, these choices matter every day. Natural light, good ventilation and durable finishes can improve the experience of a home without making it feel complicated.",
        ],
      },
      {
        heading: "Look for light, airflow and lasting materials",
        paragraphs: [
          "When you visit a property, notice how daylight moves through the rooms and whether windows can provide useful cross-ventilation. These details can make a home feel brighter and more pleasant throughout the year.",
          "Ask about the materials used for floors, fixtures and exterior finishes. Durable, repairable materials can reduce replacement over time and help a property age gracefully.",
        ],
      },
      {
        heading: "Think about the neighbourhood too",
        paragraphs: [
          "A home is part of a larger environment. Access to transport, daily services and green spaces can influence how often residents need to travel and how well a neighbourhood supports everyday life.",
          "The best choice is one that fits your priorities today and remains practical as those priorities change. Take time to compare the property, its running costs and the community around it.",
        ],
      },
    ],
  },
  {
    slug: "first-time-homebuyer-guide",
    category: "Buying",
    eyebrow: "Buying guides",
    title: "A Beginner’s Guide to Buying Your First Home",
    excerpt: "From setting your budget to preparing for a viewing, start with the questions that matter.",
    image: articleImages.firstHome,
    imageAlt: "Homeowners arriving at a bright modern house",
    readTime: 5,
    published: "Practical guide",
    sections: [
      {
        heading: "Start with a realistic budget",
        paragraphs: [
          "Before you shortlist homes, decide what you can comfortably afford. Include more than the purchase price: consider professional fees, moving costs, repairs and ongoing maintenance.",
          "A clear budget makes it easier to compare options and helps you avoid committing to a property that does not suit your finances.",
        ],
      },
      {
        heading: "Write down what matters most",
        paragraphs: [
          "Separate your must-haves from features that would simply be nice to have. Location, access to work or school, the number of bedrooms and future plans can all influence the right choice.",
          "Use this list to keep your search focused, but remain open to a home that meets your core needs in a way you had not expected.",
        ],
      },
      {
        heading: "View carefully and verify the details",
        paragraphs: [
          "During a viewing, look beyond first impressions. Check the condition of the rooms, ask about utilities and maintenance, and make a note of anything you want to investigate further.",
          "Before making a commitment, have the relevant documents and ownership details reviewed by qualified professionals. Ask questions whenever something is unclear.",
        ],
      },
    ],
  },
  {
    slug: "property-inspection-checklist",
    category: "Inspections",
    eyebrow: "Inspections",
    title: "Your Inspection Checklist: Look Beyond the Finish",
    excerpt: "A room-by-room approach to light, ventilation, water, power and everyday practicality.",
    image: articleImages.inspection,
    imageAlt: "Bright interior with natural light and wood finishes",
    readTime: 5,
    published: "Viewing checklist",
    sections: [
      {
        heading: "Check the structure and the details",
        paragraphs: [
          "Look for visible signs of damp, cracks, leaks or repairs that may need closer inspection. Open and close doors and windows, and take note of how the rooms connect.",
          "A viewing is not a substitute for a professional survey, but careful observations will help you ask better questions and decide whether to arrange one.",
        ],
      },
      {
        heading: "Test the everyday essentials",
        paragraphs: [
          "Ask how the water supply, drainage and electricity work. If possible, check taps, light switches and ventilation, and ask about any recent maintenance or known issues.",
          "Consider storage, mobile reception, noise and the amount of natural light at different times of day. Small practical details can have a big impact once you move in.",
        ],
      },
      {
        heading: "Explore the area around the property",
        paragraphs: [
          "Walk around the immediate neighbourhood and consider access, parking, security arrangements and nearby amenities. If you can, visit at another time of day to understand the area better.",
          "Write down your questions and take notes after the visit. Comparing properties is easier when you have a clear record of what you saw.",
        ],
      },
    ],
  },
  {
    slug: "q3-property-market-report",
    category: "Market",
    eyebrow: "Market · Archive",
    title: "Q3 Market Report: What to Consider When Comparing Properties",
    excerpt: "A practical framework for weighing location, condition and long-term suitability in a changing market.",
    image: articleImages.market,
    imageAlt: "Modern commercial buildings in a city",
    readTime: 4,
    published: "Historical perspective",
    sections: [
      {
        heading: "Compare like with like",
        paragraphs: [
          "Property prices can vary widely based on location, condition, size and intended use. Comparing homes with similar characteristics gives you a more useful starting point than relying on a single headline figure.",
          "Treat older market reports as historical context rather than a current forecast. Conditions change, and a past trend does not guarantee what will happen next.",
        ],
      },
      {
        heading: "Look at the whole value proposition",
        paragraphs: [
          "Consider transport, services, maintenance needs and the property's suitability for your plans. A lower initial price may come with additional work or costs that affect the overall value.",
          "Ask for current information about the specific property and seek professional advice before making a decision.",
        ],
      },
    ],
  },
  {
    slug: "planning-a-property-investment",
    category: "Investment",
    eyebrow: "Investment",
    title: "Planning a Property Investment with a Longer View",
    excerpt: "Think through your goals, holding costs and ownership responsibilities before making a move.",
    image: articleImages.investment,
    imageAlt: "Residential neighbourhood viewed from above",
    readTime: 7,
    published: "Planning guide",
    sections: [
      {
        heading: "Define the purpose of the investment",
        paragraphs: [
          "Start by deciding what you want the property to do for you. Your timeline, intended use and tolerance for ongoing work will influence which opportunities are appropriate.",
          "Be specific about your assumptions. Estimate purchase and ownership costs, and consider how your plans might change over time.",
        ],
      },
      {
        heading: "Research the property and its setting",
        paragraphs: [
          "Study the location, access, surrounding development and demand for the type of property you are considering. Visit in person and ask for details that support your assessment.",
          "Verify ownership and relevant documents with qualified professionals. Clear due diligence is an important part of making an informed decision.",
        ],
      },
      {
        heading: "Plan for ownership after the purchase",
        paragraphs: [
          "Allow for maintenance, management and periods when the property may not be used or occupied. A realistic plan accounts for both routine responsibilities and unexpected costs.",
          "Property investment involves risk, and returns are never guaranteed. Consider independent financial and legal advice before committing.",
        ],
      },
    ],
  },
  {
    slug: "questions-before-making-an-offer",
    category: "Buying",
    eyebrow: "Buying guides",
    title: "The Questions to Ask Before Making an Offer",
    excerpt: "Bring your priorities, inspection notes and due-diligence questions into one conversation.",
    image: articleImages.planning,
    imageAlt: "Notes and property plans on a desk",
    readTime: 4,
    published: "Offer preparation",
    sections: [
      {
        heading: "Understand the property's condition",
        paragraphs: [
          "Ask what is included in the sale, whether any repairs are needed and what maintenance has recently been completed. Request supporting information where available.",
          "If you have concerns from a viewing, clarify them before proceeding and consider an independent inspection.",
        ],
      },
      {
        heading: "Clarify the process and documents",
        paragraphs: [
          "Find out which documents are available, what steps follow an offer and who will be responsible for each part of the process. Ask for time to review anything you do not understand.",
          "Have qualified legal and financial professionals review the relevant details before you make a binding commitment.",
        ],
      },
    ],
  },
  {
    slug: "thoughtful-property-management",
    category: "Ownership",
    eyebrow: "Ownership",
    title: "A Thoughtful Approach to Property Management",
    excerpt: "Maintenance, tenant communication and clear records all deserve a place in your plan.",
    image: articleImages.ownership,
    imageAlt: "Contemporary home framed by a landscaped garden",
    readTime: 5,
    published: "Owner essentials",
    sections: [
      {
        heading: "Keep communication clear",
        paragraphs: [
          "Set expectations early and keep important conversations in writing. Clear communication helps owners, occupants and service providers understand what needs to happen and when.",
          "Make sure everyone knows how to report maintenance concerns and how urgent issues will be handled.",
        ],
      },
      {
        heading: "Make maintenance proactive",
        paragraphs: [
          "Regular checks can help identify small issues before they become more disruptive. Keep a schedule for essential systems and retain records of work completed.",
          "Use qualified professionals for specialist repairs and keep invoices and warranties with the property's documents.",
        ],
      },
    ],
  },
  {
    slug: "choosing-a-rental-home",
    category: "Buying",
    eyebrow: "Renting",
    title: "Choosing a Rental Home That Fits Your Routine",
    excerpt: "Balance location, monthly costs and practical details before deciding where to live.",
    image: articleImages.renting,
    imageAlt: "Modern home with a welcoming entrance",
    readTime: 4,
    published: "Renter guide",
    sections: [
      {
        heading: "Match the location to your day",
        paragraphs: [
          "Think about the journeys you make most often and what nearby services you rely on. If possible, test the route at the times you would normally travel.",
          "A convenient location can make a meaningful difference to your daily routine, so weigh it alongside the home's features.",
        ],
      },
      {
        heading: "Review costs and terms carefully",
        paragraphs: [
          "Ask for a clear breakdown of rent, deposits, utilities and any other charges. Read the tenancy terms carefully and request clarification before signing.",
          "Inspect the property and document its condition at move-in. Keep copies of agreements, receipts and communications.",
        ],
      },
    ],
  },
  {
    slug: "property-documents-to-review",
    category: "Ownership",
    eyebrow: "Ownership",
    title: "Property Documents to Review Before You Commit",
    excerpt: "Know what to ask for and why professional verification belongs in your buying process.",
    image: articleImages.documents,
    imageAlt: "Property paperwork being reviewed at a desk",
    readTime: 6,
    published: "Due-diligence guide",
    sections: [
      {
        heading: "Request the available records",
        paragraphs: [
          "Ask the seller or agent which ownership, planning and property records are available. The relevant documents can differ depending on the property and its location.",
          "Do not rely only on verbal assurances. Ask for copies and give yourself enough time to review them.",
        ],
      },
      {
        heading: "Use qualified professionals",
        paragraphs: [
          "A qualified legal professional can help verify ownership and explain the documents relevant to the transaction. Other specialists may be needed to assess the building or its intended use.",
          "This article is general information, not legal advice. Requirements vary, so seek advice suited to the specific property and transaction.",
        ],
      },
    ],
  },
];

export const BLOG_CATEGORIES = ["All articles", "Buying", "Inspections", "Investment", "Market", "Ownership"];

export function getBlogArticle(slug) {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}

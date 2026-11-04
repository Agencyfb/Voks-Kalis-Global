const CATEGORIES = [
  {
    title: "Residential",
    description: "Discover the top Residential Properties",
    image: "/category-residential.png",
    alt: "Home with a percent sign",
    href: "/marketplace?propertyType=residential",
  },
  {
    title: "Commercial",
    description: "Property used exclusively for business, trade, or income generating activities",
    image: "/category-commercial.png",
    alt: "Globe inside a briefcase",
    href: "/marketplace?propertyType=commercial",
  },
  {
    title: "Industrial",
    description: "Access Property used for manufacturing, production, logistics, and storage",
    image: "/category-industrial.png",
    alt: "Document with magnifying glass",
    href: "/marketplace?propertyType=industrial",
  },
  {
    title: "Mixed-use (Raw and Agricultural)",
    description: "Undeveloped or untitled land that serves as the baseline for future development",
    image: "/category-land.png",
    alt: "Growing chart on a hand",
    href: "/marketplace?category=lands",
  },
];

export default function Categories() {
  return (
    <section aria-label="Property types" className="mx-auto max-w-7xl px-5 pb-5 pt-5 sm:px-8 lg:px-10">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {CATEGORIES.map((category) => (
          <a
            key={category.title}
            href={category.href}
            className="group min-h-[148px] rounded-xl border border-[#E6E8EA] bg-gradient-to-br from-white to-[#F1F8FC] p-4 transition-shadow hover:shadow-md sm:p-5"
          >
            <img
              src={category.image}
              alt={category.alt}
              className="h-11 w-12 object-contain object-left"
            />
            <h2 className="mt-2 text-sm font-semibold text-brand-copper-dark">
              {category.title}
            </h2>
            <p className="mt-1 text-xs leading-[1.45] text-text-secondary">
              {category.description}
            </p>
          </a>
        ))}
      </div>

      <a
        href="/login"
        className="mx-auto mt-5 flex min-h-[42px] max-w-[374px] items-center justify-center gap-1 rounded-sm bg-[#263238] px-5 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[#37474F]"
      >
        <span className="text-brand-copper">Are your property owner?</span>
        <span>Sell/Rent for FREE</span>
      </a>
    </section>
  );
}

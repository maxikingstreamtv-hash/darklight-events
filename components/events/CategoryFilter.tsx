"use client";

type CategoryFilterProps = {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="mb-12 flex flex-wrap justify-center gap-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
            activeCategory === category
              ? "bg-white text-black"
              : "border border-white/20 bg-white/5 text-white hover:border-white/50 hover:bg-white/10"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
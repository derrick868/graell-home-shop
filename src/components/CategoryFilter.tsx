import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categorySlug: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const allCategories = [
    { id: "all", name: "All Products" },
    ...categories
  ];

  const getCategorySlug = (name: string) => {
    if (name === "All Products") return "all";
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 p-1">
          {allCategories.map((category) => {
            const categorySlug = getCategorySlug(category.name);
            const isSelected = selectedCategory === categorySlug;
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(categorySlug)}
                className={cn(
                  "whitespace-nowrap",
                  isSelected && "bg-primary text-primary-foreground"
                )}
              >
                {category.name}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CategoryFilter;
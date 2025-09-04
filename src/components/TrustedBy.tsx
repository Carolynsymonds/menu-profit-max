import { Pizza, ChefHat, Utensils, Store } from "lucide-react";

const TrustedBy = () => {
  const brandIcons = [
    { icon: Pizza, name: "Papa John's" },
    { icon: ChefHat, name: "Chipotle Mexican Grill" }, 
    { icon: Utensils, name: "Chick-fil-A" },
    { icon: Store, name: "Applebee's" }
  ];

  return (
    <div className="block md:hidden py-6 px-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4 font-medium">
          Trusted by Restaurateurs at
        </p>
        <div className="flex justify-center items-center gap-6 flex-wrap">
          {brandIcons.map((brand, index) => {
            const IconComponent = brand.icon;
            return (
              <div key={index} className="flex items-center justify-center p-2">
                <IconComponent 
                  size={24} 
                  className="text-foreground/70 hover:text-foreground transition-colors" 
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;
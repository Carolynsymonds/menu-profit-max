const TrustedBy = () => {
  const brands = [
    "Papa John's",
    "Chipotle Mexican Grill", 
    "Chick-fil-A",
    "Applebee's"
  ];

  return (
    <div className="block md:hidden py-6 px-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4 font-medium">
          Trusted by Restaurateurs at
        </p>
        <div className="space-y-2">
          {brands.map((brand, index) => (
            <div key={index} className="py-1">
              <span className="text-sm font-semibold text-foreground">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;
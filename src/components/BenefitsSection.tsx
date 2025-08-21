import { TrendingUp, BarChart3, DollarSign, Zap } from "lucide-react";
import { siteContent } from "@/config/site-content";

const iconMap = {
  TrendingUp,
  BarChart3,
  DollarSign,
  Zap
};

const BenefitsSection = () => {
  const benefits = siteContent.featuresPage.benefits;

  return (
    <div className="mt-0 mb-4">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            {benefits.map((benefit, index) => {
              const IconComponent = iconMap[benefit.icon as keyof typeof iconMap];
              return (
                <div key={index} className="flex flex-col md:flex-row items-center gap-3 md:p6 p-2 rounded-lg shadow-sm border border-primary/65">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm text-slate-900 md:text-left text-center">
                      {benefit.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsSection;
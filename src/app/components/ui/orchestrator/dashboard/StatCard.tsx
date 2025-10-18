import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  valueColor?: string;
  href?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  valueColor = "text-gray-900",
  href,
  onClick,
}) => {
  const CardContent = (
    <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm font-medium text-gray-600">
            {title}
          </p>
          <p className={`text-xl md:text-xl font-semibold ${valueColor}`}>
            {value}
          </p>
        </div>
        <div
          className={`w-8 h-8 md:w-10 md:h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {CardContent}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {CardContent}
      </button>
    );
  }

  return CardContent;
};

export default StatCard;

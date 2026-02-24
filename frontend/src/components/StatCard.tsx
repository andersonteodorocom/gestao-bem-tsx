import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

const StatCard = ({ title, value, icon: Icon }: StatCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className="p-3 rounded-lg bg-white">
            <Icon className="h-6 w-6 text-orange-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
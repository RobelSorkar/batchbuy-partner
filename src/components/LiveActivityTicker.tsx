import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, TrendingUp, Users, Package, Banknote } from "lucide-react";

interface TickerItem {
  icon: typeof Activity;
  label: string;
  value: string;
  color: string;
}

const LiveActivityTicker = () => {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      const tickerItems: TickerItem[] = [];

      // Latest batch participation
      const { data: latestParticipation } = await supabase
        .from("batches")
        .select("batch_name, funded_units, partners_joined")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (latestParticipation) {
        tickerItems.push({
          icon: Package,
          label: "Latest batch activity",
          value: `+${latestParticipation.funded_units} units in ${latestParticipation.batch_name}`,
          color: "text-primary",
        });
      }

      // Total profit distributed today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: profitData } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "profit")
        .eq("status", "completed")
        .gte("created_at", todayStart.toISOString());

      const totalProfit = profitData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      tickerItems.push({
        icon: Banknote,
        label: "Profit distributed today",
        value: totalProfit > 0 ? `৳${totalProfit.toLocaleString("en-IN")}` : "৳0",
        color: "text-green-500",
      });

      // Total active partners
      const { count: partnerCount } = await supabase
        .from("batch_participations")
        .select("user_id", { count: "exact", head: true });

      tickerItems.push({
        icon: Users,
        label: "Active partners",
        value: `${partnerCount || 0}+`,
        color: "text-primary",
      });

      // Active batches
      const { count: activeBatches } = await supabase
        .from("batches")
        .select("id", { count: "exact", head: true })
        .in("status", ["funding", "production"]);

      tickerItems.push({
        icon: TrendingUp,
        label: "Active batches",
        value: `${activeBatches || 0} running`,
        color: "text-primary",
      });

      setItems(tickerItems);
    };

    fetchActivity();
  }, []);

  if (items.length === 0) {
    // Fallback static items while loading
    return (
      <div className="bg-card/80 backdrop-blur-sm border-y border-border/50">
        <div className="container max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4 animate-pulse text-primary" />
            <span>Loading platform activity...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border-y border-border/50 overflow-hidden">
      <div className="relative">
        {/* Gradient fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-card to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card to-transparent z-10" />

        <div className="flex animate-scroll-x">
          {/* Duplicate for seamless loop */}
          {[...items, ...items].map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              className="flex items-center gap-3 px-8 py-3.5 shrink-0"
            >
              <div className="flex items-center gap-1.5">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {item.label}
                </span>
              </div>
              <span className={`text-sm font-bold whitespace-nowrap ${item.color}`}>
                {item.value}
              </span>
              <span className="text-border/50 mx-2">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveActivityTicker;

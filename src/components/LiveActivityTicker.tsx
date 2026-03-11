import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, TrendingUp, Users, Package, Banknote } from "lucide-react";

interface TickerItem {
  icon: typeof Activity;
  label: string;
  value: string;
}

const LiveActivityTicker = () => {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      const tickerItems: TickerItem[] = [];

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
        });
      }

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
      });

      const { count: partnerCount } = await supabase
        .from("batch_participations")
        .select("user_id", { count: "exact", head: true });

      tickerItems.push({
        icon: Users,
        label: "Active partners",
        value: `${partnerCount || 0}+`,
      });

      const { count: activeBatches } = await supabase
        .from("batches")
        .select("id", { count: "exact", head: true })
        .in("status", ["funding", "production"]);

      tickerItems.push({
        icon: TrendingUp,
        label: "Active batches",
        value: `${activeBatches || 0} running`,
      });

      setItems(tickerItems);
    };

    fetchActivity();
  }, []);

  if (items.length === 0) {
    return (
      <div className="bg-card/60 backdrop-blur-sm border-y border-border/40">
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
    <div className="bg-card/60 backdrop-blur-sm border-y border-border/40 overflow-hidden">
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex animate-scroll-x">
          {[...items, ...items].map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              className="flex items-center gap-3 px-8 py-3.5 shrink-0"
            >
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-bold whitespace-nowrap text-foreground">
                {item.value}
              </span>
              <span className="text-border mx-2">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveActivityTicker;

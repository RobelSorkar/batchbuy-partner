import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface ProjectCountdownProps {
  deadline: string | null;
  status: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calcTimeLeft(deadline: string): TimeLeft {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    total: diff,
  };
}

const BatchCountdown = ({ deadline, status }: BatchCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    deadline ? calcTimeLeft(deadline) : null
  );

  useEffect(() => {
    if (!deadline || status !== "funding") return;
    const timer = setInterval(() => setTimeLeft(calcTimeLeft(deadline)), 1000);
    return () => clearInterval(timer);
  }, [deadline, status]);

  if (!deadline || status !== "funding") return null;
  if (!timeLeft || timeLeft.total <= 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive font-medium">
        <AlertTriangle className="w-4 h-4" />
        <span>Funding deadline passed</span>
      </div>
    );
  }

  const urgent = timeLeft.days < 3;

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 text-xs font-medium ${urgent ? "text-destructive" : "text-muted-foreground"}`}>
        <Clock className="w-3.5 h-3.5" />
        <span>{urgent ? "Closing soon!" : "Funding closes in"}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { value: timeLeft.days, label: "Days" },
          { value: timeLeft.hours, label: "Hrs" },
          { value: timeLeft.minutes, label: "Min" },
          { value: timeLeft.seconds, label: "Sec" },
        ].map((unit) => (
          <div
            key={unit.label}
            className={`rounded-lg py-2 px-1 border ${
              urgent
                ? "bg-destructive/10 border-destructive/20"
                : "bg-muted/50 border-border/50"
            }`}
          >
            <div className={`text-lg font-display font-bold tabular-nums ${urgent ? "text-destructive" : "text-foreground"}`}>
              {String(unit.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] text-muted-foreground">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchCountdown;

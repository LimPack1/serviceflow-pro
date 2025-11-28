import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface SLAItem {
  label: string;
  value: number;
  target: number;
  status: "success" | "warning" | "danger";
}

const slaItems: SLAItem[] = [
  { label: "Temps de première réponse", value: 94, target: 90, status: "success" },
  { label: "Temps de résolution", value: 87, target: 85, status: "success" },
  { label: "Incidents critiques", value: 78, target: 95, status: "danger" },
  { label: "Satisfaction client", value: 92, target: 90, status: "success" },
];

export function SLAOverview() {
  return (
    <div className="glass-card rounded-xl p-6 border border-border animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Conformité SLA</h3>
        <p className="text-sm text-muted-foreground">
          Performance par rapport aux objectifs
        </p>
      </div>
      <div className="space-y-6">
        {slaItems.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.status === "success" && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
                {item.status === "warning" && (
                  <Clock className="h-4 w-4 text-warning" />
                )}
                {item.status === "danger" && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{item.value}%</span>
                <span className="text-xs text-muted-foreground">
                  / {item.target}%
                </span>
              </div>
            </div>
            <Progress
              value={item.value}
              className="h-2"
              style={{
                ["--progress-background" as string]:
                  item.status === "success"
                    ? "hsl(var(--success))"
                    : item.status === "warning"
                    ? "hsl(var(--warning))"
                    : "hsl(var(--destructive))",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

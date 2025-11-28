import { Plus, AlertTriangle, FileText, Monitor, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const actions = [
  {
    icon: Plus,
    label: "Nouveau ticket",
    href: "/tickets/new",
    variant: "gradient" as const,
  },
  {
    icon: AlertTriangle,
    label: "Incident urgent",
    href: "/tickets/new?type=incident&priority=critical",
    variant: "destructive" as const,
  },
  {
    icon: FileText,
    label: "Nouvel article",
    href: "/knowledge/new",
    variant: "secondary" as const,
  },
  {
    icon: Monitor,
    label: "Ajouter équipement",
    href: "/inventory/new",
    variant: "secondary" as const,
  },
];

export function QuickActions() {
  return (
    <div className="glass-card rounded-xl p-6 border border-border animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Actions rapides</h3>
        <p className="text-sm text-muted-foreground">
          Accès direct aux actions courantes
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className="h-auto py-4 flex-col gap-2"
            asChild
          >
            <Link to={action.href}>
              <action.icon className="h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}

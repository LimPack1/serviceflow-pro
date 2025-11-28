import { AppHeader } from "@/components/layout/AppHeader";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Mail,
  Clock,
  Users,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsSections = [
  {
    title: "Général",
    items: [
      {
        icon: Palette,
        title: "Apparence",
        description: "Personnaliser l'interface et le thème",
      },
      {
        icon: Bell,
        title: "Notifications",
        description: "Gérer les alertes et les emails",
      },
      {
        icon: Mail,
        title: "Intégration email",
        description: "Configuration SMTP et templates",
      },
    ],
  },
  {
    title: "ITSM",
    items: [
      {
        icon: Clock,
        title: "SLA",
        description: "Configurer les accords de niveau de service",
      },
      {
        icon: Database,
        title: "Catégories",
        description: "Gérer les catégories de tickets et services",
      },
      {
        icon: Users,
        title: "Groupes de support",
        description: "Organiser les équipes de support",
      },
    ],
  },
  {
    title: "Sécurité",
    items: [
      {
        icon: Shield,
        title: "Entra ID",
        description: "Configuration SSO et synchronisation",
      },
      {
        icon: SettingsIcon,
        title: "Permissions",
        description: "Gérer les rôles et accès",
      },
    ],
  },
];

export default function Settings() {
  return (
    <div className="min-h-screen">
      <AppHeader
        title="Paramètres"
        subtitle="Configuration de l'application"
      />
      <div className="p-6 max-w-4xl animate-fade-in">
        <div className="space-y-8">
          {settingsSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold mb-4">{section.title}</h2>
              <div className="glass-card rounded-xl border border-border divide-y divide-border">
                {section.items.map((item, index) => (
                  <button
                    key={item.title}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left",
                      index === 0 && "rounded-t-xl",
                      index === section.items.length - 1 && "rounded-b-xl"
                    )}
                  >
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

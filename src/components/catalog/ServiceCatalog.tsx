import { useState } from "react";
import {
  Monitor,
  Laptop,
  Smartphone,
  Mail,
  Key,
  Shield,
  Users,
  FolderPlus,
  Printer,
  Wifi,
  HardDrive,
  Headphones,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  estimatedDelivery: string;
  popular?: boolean;
}

const services: ServiceItem[] = [
  {
    id: "1",
    name: "Nouveau poste de travail",
    description: "Demande d'un ordinateur fixe ou portable pour un collaborateur",
    icon: Monitor,
    category: "Matériel",
    estimatedDelivery: "5 jours",
    popular: true,
  },
  {
    id: "2",
    name: "Smartphone professionnel",
    description: "Attribution d'un téléphone mobile avec forfait entreprise",
    icon: Smartphone,
    category: "Matériel",
    estimatedDelivery: "3 jours",
  },
  {
    id: "3",
    name: "Création de compte email",
    description: "Création d'une nouvelle boîte mail Microsoft 365",
    icon: Mail,
    category: "Comptes",
    estimatedDelivery: "1 jour",
    popular: true,
  },
  {
    id: "4",
    name: "Réinitialisation mot de passe",
    description: "Réinitialisation du mot de passe d'un compte utilisateur",
    icon: Key,
    category: "Comptes",
    estimatedDelivery: "1 heure",
    popular: true,
  },
  {
    id: "5",
    name: "Accès VPN",
    description: "Configuration de l'accès VPN pour le télétravail",
    icon: Shield,
    category: "Accès",
    estimatedDelivery: "1 jour",
  },
  {
    id: "6",
    name: "Création groupe AD",
    description: "Création d'un nouveau groupe Active Directory",
    icon: Users,
    category: "Accès",
    estimatedDelivery: "2 jours",
  },
  {
    id: "7",
    name: "Dossier partagé",
    description: "Création d'un nouveau dossier partagé sur le serveur de fichiers",
    icon: FolderPlus,
    category: "Accès",
    estimatedDelivery: "2 jours",
  },
  {
    id: "8",
    name: "Installation imprimante",
    description: "Configuration d'une imprimante réseau sur le poste",
    icon: Printer,
    category: "Matériel",
    estimatedDelivery: "1 jour",
  },
  {
    id: "9",
    name: "Accès WiFi invité",
    description: "Création de codes d'accès WiFi pour visiteurs",
    icon: Wifi,
    category: "Réseau",
    estimatedDelivery: "1 heure",
  },
  {
    id: "10",
    name: "Espace stockage",
    description: "Augmentation de l'espace de stockage OneDrive ou serveur",
    icon: HardDrive,
    category: "Stockage",
    estimatedDelivery: "2 jours",
  },
  {
    id: "11",
    name: "Support technique",
    description: "Assistance technique pour un problème informatique",
    icon: Headphones,
    category: "Support",
    estimatedDelivery: "4 heures",
    popular: true,
  },
  {
    id: "12",
    name: "Nouveau laptop",
    description: "Demande d'un ordinateur portable pour un collaborateur",
    icon: Laptop,
    category: "Matériel",
    estimatedDelivery: "5 jours",
  },
];

const categories = ["Tous", "Matériel", "Comptes", "Accès", "Réseau", "Stockage", "Support"];

export function ServiceCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tous" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularServices = services.filter((s) => s.popular);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Search and Categories */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Popular Services */}
      {selectedCategory === "Tous" && searchQuery === "" && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Services populaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularServices.map((service) => (
              <ServiceCard key={service.id} service={service} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Services */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {selectedCategory === "Tous" ? "Tous les services" : selectedCategory}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        {filteredServices.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Aucun service trouvé pour votre recherche.
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  featured = false,
}: {
  service: ServiceItem;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 border border-border transition-all duration-300 cursor-pointer group",
        "hover:shadow-lg hover:border-primary/30 hover:-translate-y-1",
        featured && "bg-gradient-to-br from-primary/10 to-accent/10"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-3 rounded-xl transition-colors",
            featured
              ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
              : "bg-secondary group-hover:bg-primary/20 text-foreground group-hover:text-primary"
          )}
        >
          <service.icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{service.name}</h3>
            {service.popular && !featured && (
              <Badge variant="secondary" className="text-xs">
                Populaire
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {service.description}
          </p>
          <div className="flex items-center justify-between">
            <Badge variant="outline">{service.category}</Badge>
            <span className="text-xs text-muted-foreground">
              ⏱ {service.estimatedDelivery}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

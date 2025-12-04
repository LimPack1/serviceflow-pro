import { useState } from "react";
import { useServiceCategories, useServiceItems, usePopularServices } from "@/hooks/useServiceCatalog";
import { Search, Clock, ArrowRight, Star, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Monitor, 
  Smartphone, 
  Wifi, 
  Shield, 
  Mail, 
  Users,
  HardDrive,
  Printer
} from "lucide-react";

const iconMap: Record<string, typeof Monitor> = {
  monitor: Monitor,
  smartphone: Smartphone,
  wifi: Wifi,
  shield: Shield,
  mail: Mail,
  users: Users,
  harddrive: HardDrive,
  printer: Printer
};

export default function UserCatalog() {
  const { data: categories, isLoading: loadingCategories } = useServiceCategories();
  const { data: services, isLoading: loadingServices } = useServiceItems();
  const { data: popularServices } = usePopularServices();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredServices = services?.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || service.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const getIcon = (iconName: string | null) => {
    const Icon = iconMap[iconName?.toLowerCase() || ''] || Monitor;
    return Icon;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catalogue de services</h1>
        <p className="text-muted-foreground">Parcourez et demandez les services disponibles</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Popular Services */}
      {popularServices && popularServices.length > 0 && !search && !selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Services populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {popularServices.slice(0, 6).map((service) => {
                const Icon = getIcon(service.icon);
                return (
                  <button
                    key={service.id}
                    className="flex items-center gap-3 p-4 rounded-lg border text-left hover:bg-muted/50 hover:border-primary/50 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{service.name}</p>
                      {service.estimated_time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {service.estimated_time}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories & Services */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Categories Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Catégories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingCategories ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedCategory
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span>Toutes les catégories</span>
                  <Badge variant="secondary" className="ml-2">
                    {services?.length || 0}
                  </Badge>
                </button>
                {categories?.map((category) => {
                  const count = services?.filter(s => s.category_id === category.id).length || 0;
                  const Icon = getIcon(category.icon);
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {category.name}
                      </span>
                      <Badge variant="secondary" className="ml-2">
                        {count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services List */}
        <div className="lg:col-span-3 space-y-4">
          {loadingServices ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Aucun service trouvé</p>
                <p className="text-sm">Essayez de modifier vos critères de recherche</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredServices.map((service) => {
                const Icon = getIcon(service.icon);
                return (
                  <Card key={service.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold">{service.name}</h3>
                              {service.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            {service.estimated_time && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {service.estimated_time}
                              </div>
                            )}
                            {service.requires_approval && (
                              <Badge variant="outline" className="text-xs">
                                Approbation requise
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

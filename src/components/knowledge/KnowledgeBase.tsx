import { useState } from "react";
import {
  Search,
  BookOpen,
  FileText,
  Lightbulb,
  AlertCircle,
  Eye,
  ThumbsUp,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  type: "guide" | "faq" | "troubleshooting" | "info";
  views: number;
  helpful: number;
  updatedAt: string;
}

const articles: Article[] = [
  {
    id: "1",
    title: "Comment se connecter au VPN depuis chez soi",
    excerpt:
      "Guide complet pour configurer et utiliser le VPN de l'entreprise pour le télétravail...",
    category: "Réseau",
    type: "guide",
    views: 1234,
    helpful: 89,
    updatedAt: "Il y a 2 jours",
  },
  {
    id: "2",
    title: "Résoudre les problèmes d'impression les plus courants",
    excerpt:
      "Solutions aux problèmes fréquents : bourrage papier, connexion réseau, qualité d'impression...",
    category: "Matériel",
    type: "troubleshooting",
    views: 856,
    helpful: 67,
    updatedAt: "Il y a 1 semaine",
  },
  {
    id: "3",
    title: "FAQ - Création de compte et premiers pas",
    excerpt:
      "Réponses aux questions fréquentes sur la création de compte et la prise en main des outils...",
    category: "Comptes",
    type: "faq",
    views: 2341,
    helpful: 156,
    updatedAt: "Il y a 3 jours",
  },
  {
    id: "4",
    title: "Politique de sécurité des mots de passe",
    excerpt:
      "Règles et bonnes pratiques pour la création et la gestion de vos mots de passe professionnels...",
    category: "Sécurité",
    type: "info",
    views: 567,
    helpful: 45,
    updatedAt: "Il y a 2 semaines",
  },
  {
    id: "5",
    title: "Configurer Microsoft Outlook sur mobile",
    excerpt:
      "Instructions pas à pas pour configurer votre messagerie professionnelle sur smartphone...",
    category: "Messagerie",
    type: "guide",
    views: 1890,
    helpful: 134,
    updatedAt: "Il y a 5 jours",
  },
  {
    id: "6",
    title: "Demander un accès à une ressource partagée",
    excerpt:
      "Procédure pour demander l'accès à un dossier partagé ou une application métier...",
    category: "Accès",
    type: "guide",
    views: 432,
    helpful: 28,
    updatedAt: "Il y a 1 mois",
  },
];

const categories = [
  { name: "Tous", count: articles.length },
  { name: "Réseau", count: 12 },
  { name: "Matériel", count: 8 },
  { name: "Comptes", count: 15 },
  { name: "Sécurité", count: 6 },
  { name: "Messagerie", count: 10 },
  { name: "Accès", count: 7 },
];

const typeIcons = {
  guide: BookOpen,
  faq: FileText,
  troubleshooting: AlertCircle,
  info: Lightbulb,
};

const typeLabels = {
  guide: "Guide",
  faq: "FAQ",
  troubleshooting: "Dépannage",
  info: "Information",
};

export function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tous" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularArticles = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Hero Search */}
      <div className="relative mb-8 p-8 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
        <h1 className="text-2xl font-bold mb-2">Base de connaissances</h1>
        <p className="text-muted-foreground mb-6">
          Trouvez rapidement des réponses à vos questions
        </p>
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans les articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-lg bg-background/80 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Categories */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-4 border border-border sticky top-4">
            <h2 className="font-semibold mb-4">Catégories</h2>
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                    selectedCategory === category.name
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{category.name}</span>
                  <Badge
                    variant={
                      selectedCategory === category.name ? "secondary" : "outline"
                    }
                    className="text-xs"
                  >
                    {category.count}
                  </Badge>
                </button>
              ))}
            </nav>
          </div>

          {/* Popular Articles */}
          <div className="glass-card rounded-xl p-4 border border-border mt-4">
            <h2 className="font-semibold mb-4">Articles populaires</h2>
            <div className="space-y-3">
              {popularArticles.map((article, index) => (
                <button
                  key={article.id}
                  className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <span className="text-2xl font-bold text-primary/30">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium line-clamp-2">
                      {article.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {article.views} vues
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun article trouvé pour votre recherche.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const Icon = typeIcons[article.type];

  return (
    <div className="glass-card rounded-xl p-6 border border-border transition-all duration-300 cursor-pointer group hover:shadow-lg hover:border-primary/30">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-3 rounded-xl",
            article.type === "guide" && "bg-primary/20 text-primary",
            article.type === "faq" && "bg-info/20 text-info",
            article.type === "troubleshooting" && "bg-warning/20 text-warning",
            article.type === "info" && "bg-accent/20 text-accent"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{article.category}</Badge>
            <Badge variant="secondary">{typeLabels[article.type]}</Badge>
          </div>
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views} vues
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {article.helpful} utiles
            </span>
            <span>Mis à jour {article.updatedAt}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}

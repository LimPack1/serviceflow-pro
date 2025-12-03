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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useKBArticles, useKBCategories } from "@/hooks/useKnowledgeBase";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

const typeIcons: Record<string, any> = {
  guide: BookOpen,
  faq: FileText,
  troubleshooting: AlertCircle,
  info: Lightbulb,
};

const typeLabels: Record<string, string> = {
  guide: "Guide",
  faq: "FAQ",
  troubleshooting: "Dépannage",
  info: "Information",
};

export function KnowledgeBase() {
  const { data: articles, isLoading: articlesLoading } = useKBArticles();
  const { data: categories, isLoading: categoriesLoading } = useKBCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredArticles = (articles || []).filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory =
      !selectedCategory || article.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularArticles = [...(articles || [])]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 3);

  const isLoading = articlesLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <Skeleton className="h-48 rounded-2xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Skeleton className="h-64 rounded-xl" />
          <div className="lg:col-span-3 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                  !selectedCategory
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Tous</span>
                <Badge
                  variant={!selectedCategory ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {articles?.length || 0}
                </Badge>
              </button>
              {(categories || []).map((category) => {
                const count = articles?.filter(a => a.category_id === category.id).length || 0;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{category.name}</span>
                    <Badge
                      variant={selectedCategory === category.id ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Popular Articles */}
          {popularArticles.length > 0 && (
            <div className="glass-card rounded-xl p-4 border border-border mt-4">
              <h2 className="font-semibold mb-4">Articles populaires</h2>
              <div className="space-y-3">
                {popularArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    to={`/knowledge/${article.id}`}
                    className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left block"
                  >
                    <span className="text-2xl font-bold text-primary/30">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium line-clamp-2">
                        {article.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {article.view_count} vues
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Articles List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredArticles.length === 0 && (
            <div className="text-center py-12 glass-card rounded-xl border border-border">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {articles?.length === 0 
                  ? "Aucun article dans la base de connaissances."
                  : "Aucun article trouvé pour votre recherche."}
              </p>
            </div>
          )}
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: any }) {
  const Icon = typeIcons['guide'] || BookOpen;

  return (
    <Link 
      to={`/knowledge/${article.id}`}
      className="glass-card rounded-xl p-6 border border-border transition-all duration-300 cursor-pointer group hover:shadow-lg hover:border-primary/30 block"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/20 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {article.category && (
              <Badge variant="outline">{article.category.name}</Badge>
            )}
            {article.tags && article.tags.length > 0 && (
              <Badge variant="secondary">{article.tags[0]}</Badge>
            )}
          </div>
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {article.summary}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.view_count || 0} vues
            </span>
            <span>
              Mis à jour {formatDistanceToNow(new Date(article.updated_at), { addSuffix: true, locale: fr })}
            </span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}

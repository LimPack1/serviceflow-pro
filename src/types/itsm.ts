// ITSM Type Definitions

export type TicketType = 'incident' | 'request' | 'problem' | 'change';
export type TicketStatus = 'new' | 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Ticket {
  id: string;
  number: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  subcategory?: string;
  assignee?: User;
  requester: User;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  slaBreached: boolean;
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  role: UserRole;
  groups: string[];
}

export type UserRole = 'admin' | 'agent' | 'manager' | 'user';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: User;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  isInternal: boolean;
  attachments: Attachment[];
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  status: AssetStatus;
  assignedTo?: User;
  location?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  lastUpdated: Date;
  tags: string[];
}

export type AssetType = 'computer' | 'laptop' | 'smartphone' | 'tablet' | 'server' | 'monitor' | 'printer' | 'network' | 'software' | 'other';
export type AssetStatus = 'active' | 'inactive' | 'maintenance' | 'retired' | 'lost';

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: User;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  helpful: number;
  notHelpful: number;
  status: 'draft' | 'published' | 'archived';
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  estimatedDelivery: string;
  requiresApproval: boolean;
  approvers?: string[];
  formFields: FormField[];
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'file' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  resolvedToday: number;
  avgResolutionTime: number;
  slaCompliance: number;
  ticketsByPriority: Record<TicketPriority, number>;
  ticketsByType: Record<TicketType, number>;
  ticketsTrend: { date: string; count: number }[];
}

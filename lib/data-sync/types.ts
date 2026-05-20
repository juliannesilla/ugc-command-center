// Shared types for the data-sync layer.
// Mock-only today (PS-3). Live swap procedure documented in README.

export type CampaignStatus =
  | 'PLANNING'
  | 'IN PROGRESS'
  | 'IN REVIEW'
  | 'CONTENT READY'
  | 'COMPLETE';

export interface Campaign {
  id: string;
  brand: string;
  name: string;
  status: CampaignStatus;
  dueDate: string;          // ISO yyyy-mm-dd
  assetCount: number;
  collaborators: { initials: string; tone: 'pink' | 'iris' | 'peach' | 'sky' }[];
  thumbColor: string;       // tailwind bg class for placeholder thumb
}

export type AssetType =
  | 'MP4'
  | 'PNG'
  | 'JPG'
  | 'DOCX'
  | 'PDF'
  | 'XLSX'
  | 'ZIP'
  | 'MOV';

export type AssetCategory =
  | 'Brief'
  | 'Screenshot'
  | 'Script'
  | 'Product Link'
  | 'Export'
  | 'Submitted Video'
  | 'B-Roll'
  | 'Invoice'
  | 'Brand File';

export type AssetHealth = 'ready' | 'in-progress' | 'needs-attention' | 'missing';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  category: AssetCategory;
  campaign: string;            // brand slug
  campaignLabel: string;       // pretty label
  sizeMB: number;
  uploadedAt: string;          // ISO timestamp
  uploadedBy: { initials: string; tone: 'pink' | 'iris' | 'peach' | 'sky' };
  health: AssetHealth;
}

export type WorkflowStatus = 'Active' | 'Inactive' | 'Error';

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  lastRun?: string;
  successRate7d: number;
}

export type BrandResponseStatus =
  | 'NEW'
  | 'DRAFTED'
  | 'SENT'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED';

export interface BrandResponse {
  id: string;
  brand: string;
  receivedAt: string;
  deadlineAt: string;
  status: BrandResponseStatus;
  brandFit: number; // 1-5
  preview: string;
}

export type DeadlinePriority = 'High' | 'Medium' | 'Low';

export interface Deliverable {
  id: string;
  brand: string;
  campaign: string;
  dueDate: string;
  status: 'overdue' | 'due-today' | 'due-tomorrow' | 'due-week' | 'due-next-week' | 'done';
  type: 'video' | 'photo' | 'script' | 'review';
  brandLogo?: string; // emoji / first letter
}

export interface BrandFollowup {
  id: string;
  brand: string;
  topic: string;
  lastContact: string;
  priority: DeadlinePriority;
}

export interface FilmingDate {
  id: string;
  brand: string;
  campaign: string;
  date: string;       // ISO
  daysUntil: number;
  location?: string;
}

export interface TodoItem {
  id: string;
  label: string;
  due: string;
  priority: DeadlinePriority;
}

export interface PaymentDue {
  id: string;
  brand: string;
  amount: number;
  dueDate: string;
  invoiceId: string;
  status: 'pending' | 'overdue' | 'paid';
}

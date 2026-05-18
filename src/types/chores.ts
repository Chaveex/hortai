export type ChoreType =
  | 'watering'
  | 'fertilizing'
  | 'pruning'
  | 'harvesting'
  | 'pest'
  | 'weeding'
  | 'mulching'
  | 'other';

export type ChoreStatus = 'pending' | 'completed' | 'skipped';

export type ChorePriority = 'low' | 'medium' | 'high';

export type ChoreSource = 'auto' | 'custom';

export type ChoreView = 'day' | 'week' | 'month';

export interface Chore {
  id: string;
  type: ChoreType;
  title: string;
  description?: string;
  date: string;
  plantId?: string;
  status: ChoreStatus;
  priority: ChorePriority;
  source: ChoreSource;
  autoKey?: string;
  createdAt: string;
  completedAt?: string;
  skippedAt?: string;
  notes?: string;
  recurrenceDays?: number;
}

export interface ChoreFilters {
  types: ChoreType[];
  statuses: ChoreStatus[];
  plantIds: string[];
  priorities: ChorePriority[];
  sources: ChoreSource[];
}

export interface ChoreTypeMeta {
  type: ChoreType;
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

export const CHORE_TYPE_META: Record<ChoreType, ChoreTypeMeta> = {
  watering: {
    type: 'watering',
    label: 'Arrosage',
    icon: '💧',
    color: '#1E88E5',
    backgroundColor: '#E3F2FD',
  },
  fertilizing: {
    type: 'fertilizing',
    label: 'Engrais',
    icon: '🌿',
    color: '#43A047',
    backgroundColor: '#E8F5E9',
  },
  pruning: {
    type: 'pruning',
    label: 'Taille',
    icon: '✂️',
    color: '#FB8C00',
    backgroundColor: '#FFF3E0',
  },
  harvesting: {
    type: 'harvesting',
    label: 'Récolte',
    icon: '🌾',
    color: '#D4A017',
    backgroundColor: '#FFF8E1',
  },
  pest: {
    type: 'pest',
    label: 'Traitement',
    icon: '🐛',
    color: '#E53935',
    backgroundColor: '#FFEBEE',
  },
  weeding: {
    type: 'weeding',
    label: 'Désherbage',
    icon: '🗑️',
    color: '#6D4C41',
    backgroundColor: '#EFEBE9',
  },
  mulching: {
    type: 'mulching',
    label: 'Paillis',
    icon: '🍂',
    color: '#8D6E63',
    backgroundColor: '#EFEBE9',
  },
  other: {
    type: 'other',
    label: 'Autre',
    icon: '📌',
    color: '#757575',
    backgroundColor: '#F5F5F5',
  },
};

export const CHORE_TYPES: ChoreType[] = [
  'watering',
  'fertilizing',
  'pruning',
  'harvesting',
  'pest',
  'weeding',
  'mulching',
  'other',
];

export const PRIORITY_LABELS: Record<ChorePriority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

export const STATUS_LABELS: Record<ChoreStatus, string> = {
  pending: 'À faire',
  completed: 'Fait',
  skipped: 'Ignoré',
};

export const URGENCY_BG: Record<ChorePriority, string> = {
  high: '#FFE4E1',
  medium: '#FFF3E0',
  low: '#F5F5F5',
};

export function getDefaultFilters(): ChoreFilters {
  return {
    types: [],
    statuses: [],
    plantIds: [],
    priorities: [],
    sources: [],
  };
}

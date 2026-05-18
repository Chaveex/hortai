import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, format, parseISO, addDays } from 'date-fns';
import {
  Chore,
  ChoreFilters,
  ChoreStatus,
  ChoreType,
  ChoreView,
  CHORE_TYPE_META,
  getDefaultFilters,
} from '../types/chores';
import { Plant, UserProfile, WateringRecommendation } from '../types';
import { getPlantInfo } from '../constants/plants';

interface AutoChoreInput {
  type: ChoreType;
  date: string;
  plantId?: string;
  title: string;
  description?: string;
  priority: Chore['priority'];
  recurrenceDays?: number;
}

interface ChoreStoreState {
  chores: Chore[];
  activeView: ChoreView;
  selectedDate: string;
  filters: ChoreFilters;

  setActiveView: (view: ChoreView) => void;
  setSelectedDate: (date: string) => void;
  setFilters: (filters: ChoreFilters) => void;
  resetFilters: () => void;

  addChore: (data: Omit<Chore, 'id' | 'createdAt' | 'status' | 'source'> & { source?: Chore['source']; status?: ChoreStatus }) => Chore;
  addAutoChore: (input: AutoChoreInput) => void;
  updateChore: (id: string, partial: Partial<Chore>) => void;
  deleteChore: (id: string) => void;
  completeChore: (id: string) => void;
  skipChore: (id: string) => void;
  reopenChore: (id: string) => void;

  generateAutoChores: (plants: Plant[], recommendations: WateringRecommendation[], profile: UserProfile) => void;
  cleanupOrphanChores: (plantIds: string[]) => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function dateKey(iso: string): string {
  return format(parseISO(iso), 'yyyy-MM-dd');
}

function buildAutoKey(type: ChoreType, date: string, plantId?: string): string {
  return `${type}|${date}|${plantId ?? 'global'}`;
}

export const useChoreStore = create<ChoreStoreState>()(
  persist(
    (set, get) => ({
      chores: [],
      activeView: 'day',
      selectedDate: todayKey(),
      filters: getDefaultFilters(),

      setActiveView: (view) => set({ activeView: view }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setFilters: (filters) => set({ filters }),
      resetFilters: () => set({ filters: getDefaultFilters() }),

      addChore: (data) => {
        const chore: Chore = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          status: data.status ?? 'pending',
          source: data.source ?? 'custom',
          type: data.type,
          title: data.title,
          description: data.description,
          date: data.date,
          plantId: data.plantId,
          priority: data.priority,
          autoKey: data.autoKey,
          recurrenceDays: data.recurrenceDays,
          notes: data.notes,
          completedAt: data.completedAt,
          skippedAt: data.skippedAt,
        };
        set((s) => ({ chores: [...s.chores, chore] }));
        return chore;
      },

      addAutoChore: (input) => {
        const dateOnly = dateKey(input.date);
        const autoKey = buildAutoKey(input.type, dateOnly, input.plantId);
        const existing = get().chores.find(
          (c) => c.autoKey === autoKey && c.source === 'auto'
        );
        if (existing) return;
        const chore: Chore = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          status: 'pending',
          source: 'auto',
          type: input.type,
          title: input.title,
          description: input.description,
          date: dateOnly,
          plantId: input.plantId,
          priority: input.priority,
          autoKey,
          recurrenceDays: input.recurrenceDays,
        };
        set((s) => ({ chores: [...s.chores, chore] }));
      },

      updateChore: (id, partial) => {
        set((s) => ({
          chores: s.chores.map((c) => (c.id === id ? { ...c, ...partial } : c)),
        }));
      },

      deleteChore: (id) => {
        set((s) => ({ chores: s.chores.filter((c) => c.id !== id) }));
      },

      completeChore: (id) => {
        const now = new Date().toISOString();
        set((s) => ({
          chores: s.chores.map((c) =>
            c.id === id ? { ...c, status: 'completed' as ChoreStatus, completedAt: now } : c
          ),
        }));
      },

      skipChore: (id) => {
        const now = new Date().toISOString();
        set((s) => ({
          chores: s.chores.map((c) =>
            c.id === id ? { ...c, status: 'skipped' as ChoreStatus, skippedAt: now } : c
          ),
        }));
      },

      reopenChore: (id) => {
        set((s) => ({
          chores: s.chores.map((c) =>
            c.id === id
              ? { ...c, status: 'pending' as ChoreStatus, completedAt: undefined, skippedAt: undefined }
              : c
          ),
        }));
      },

      generateAutoChores: (plants, recommendations, profile) => {
        const today = todayKey();
        const now = new Date();
        const addFn = get().addAutoChore;

        for (const plant of plants) {
          const info = getPlantInfo(plant.type);
          const plantName = plant.name || info.frenchName;
          const rec = recommendations.find((r) => r.plantId === plant.id);

          if (rec?.shouldWater) {
            addFn({
              type: 'watering',
              date: today,
              plantId: plant.id,
              title: `Arroser ${plantName}`,
              description: rec.reason,
              priority: rec.urgency,
              recurrenceDays: info.wateringFrequencyDays,
            });
          }

          const daysSincePlanting = differenceInDays(now, parseISO(plant.plantedDate));

          if (profile.fertilizerType !== 'aucun' && daysSincePlanting >= 14) {
            const fertilizerInterval = profile.fertilizerType === 'naturel' ? 21 : 30;
            const fertilizerCycle = Math.floor(daysSincePlanting / fertilizerInterval);
            const cycleDate = format(
              addDays(parseISO(plant.plantedDate), fertilizerCycle * fertilizerInterval),
              'yyyy-MM-dd'
            );
            if (
              differenceInDays(parseISO(cycleDate), now) >= -3 &&
              differenceInDays(parseISO(cycleDate), now) <= 1
            ) {
              const advice =
                profile.fertilizerType === 'naturel'
                  ? info.fertilizerSchedule.naturel
                  : info.fertilizerSchedule.industriel;
              addFn({
                type: 'fertilizing',
                date: today,
                plantId: plant.id,
                title: `Fertiliser ${plantName}`,
                description: advice,
                priority: 'low',
                recurrenceDays: fertilizerInterval,
              });
            }
          }

          if (daysSincePlanting >= info.harvestDays - 3) {
            addFn({
              type: 'harvesting',
              date: today,
              plantId: plant.id,
              title: `Récolter ${plantName}`,
              description: `Vérifiez la maturité. Récoltez régulièrement pour stimuler la production.`,
              priority: 'medium',
              recurrenceDays: 3,
            });
          }
        }
      },

      cleanupOrphanChores: (plantIds) => {
        set((s) => ({
          chores: s.chores.filter(
            (c) => !c.plantId || plantIds.includes(c.plantId)
          ),
        }));
      },
    }),
    {
      name: 'garden-chore-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        chores: state.chores,
        activeView: state.activeView,
        filters: state.filters,
      }),
    }
  )
);

export function filterChores(chores: Chore[], filters: ChoreFilters): Chore[] {
  return chores.filter((c) => {
    if (filters.types.length > 0 && !filters.types.includes(c.type)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(c.status)) return false;
    if (filters.priorities.length > 0 && !filters.priorities.includes(c.priority)) return false;
    if (filters.sources.length > 0 && !filters.sources.includes(c.source)) return false;
    if (filters.plantIds.length > 0) {
      if (!c.plantId || !filters.plantIds.includes(c.plantId)) return false;
    }
    return true;
  });
}

export function choresForDate(chores: Chore[], date: string): Chore[] {
  return chores.filter((c) => c.date === date);
}

export function choresInRange(chores: Chore[], startISO: string, endISO: string): Chore[] {
  const start = parseISO(startISO).getTime();
  const end = parseISO(endISO).getTime();
  return chores.filter((c) => {
    const t = parseISO(c.date).getTime();
    return t >= start && t <= end;
  });
}

export function groupChoresByType(chores: Chore[]): Record<ChoreType, Chore[]> {
  const out: Record<ChoreType, Chore[]> = {
    watering: [],
    fertilizing: [],
    pruning: [],
    harvesting: [],
    pest: [],
    weeding: [],
    mulching: [],
    other: [],
  };
  for (const c of chores) {
    out[c.type].push(c);
  }
  return out;
}

export function activeFilterCount(filters: ChoreFilters): number {
  return (
    filters.types.length +
    filters.statuses.length +
    filters.plantIds.length +
    filters.priorities.length +
    filters.sources.length
  );
}

export function getChoreTypeMeta(type: ChoreType) {
  return CHORE_TYPE_META[type];
}

'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Setup, Tag, Goal, Trade, DailyNote, StickyNote, Notebook, UserProfile } from './types';
import { seedSetups, seedTags, seedGoals, seedTrades, seedNotes, seedNotebooks } from './data';
import { generateId, calcWinRate, calcProfitFactor, getRecentResults } from './utils';
import { DEFAULT_TEMPLATE_HTML, DEFAULT_TEMPLATE_MARKDOWN, markdownToHtml } from './templates';

// Helper to save live user data to localStorage
function saveUserData(email: string, data: { trades: Trade[]; dailyNotes: DailyNote[]; notebooks: Notebook[]; stickyNotes: StickyNote[] }) {
  if (typeof window !== 'undefined' && email) {
    try {
      localStorage.setItem(`tradostats_user_${email.toLowerCase()}`, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving user data:', e);
    }
  }
}

// Helper to load live user data from localStorage
function loadUserData(email: string) {
  if (typeof window !== 'undefined' && email) {
    try {
      const raw = localStorage.getItem(`tradostats_user_${email.toLowerCase()}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  }
  return null;
}

// ============================================================
// STORE TYPES
// ============================================================
interface AppState {
  // Auth & Account State
  currentUser: UserProfile | null;
  isDemoMode: boolean;
  isAuthModalOpen: boolean;

  // Playbook
  setups: Setup[];
  tags: Tag[];
  goals: Goal[];

  // Notebooks & Trades
  trades: Trade[];
  dailyNotes: DailyNote[];
  stickyNotes: StickyNote[];
  notebooks: Notebook[];
  dailyNoteTemplate: string;
  dailyNoteTemplateMarkdown: string;

  // Auth Actions
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithCreds: (creds: { email: string; name?: string; password?: string }) => void;
  logout: () => void;
  loadDemoData: () => void;
  clearToFreshAccount: () => void;

  // Template Actions
  updateDailyNoteTemplate: (markdown: string, html?: string) => void;
  resetDailyNoteTemplate: () => void;
  ensureCurrentMonthTrades: () => void;

  // Playbook Actions - Setups
  addSetup: (setup: Omit<Setup, 'id' | 'createdAt'>) => void;
  updateSetup: (id: string, updates: Partial<Setup>) => void;
  deleteSetup: (id: string) => void;

  // Playbook Actions - Tags
  addTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  // Playbook Actions - Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Trade Log Actions
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;

  // Daily Notes Actions
  addDailyNote: (note: Omit<DailyNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDailyNote: (id: string, content: string) => void;
  deleteDailyNote: (id: string) => void;

  // Sticky Notes Actions
  addStickyNote: (content: string, color?: string) => void;
  updateStickyNote: (id: string, content: string) => void;
  deleteStickyNote: (id: string) => void;

  // Notebooks Actions
  addNotebook: (name: string, icon?: string) => void;
  deleteNotebook: (id: string) => void;

  // Computed helpers
  getSetupStats: (setupId: string) => {
    trades: number; wins: number; winRate: number;
    avgPnl: number; totalPnl: number; profitFactor: number;
    recentTrades: ('win' | 'loss')[];
  };
  getTagStats: (tagId: string) => {
    trades: number; wins: number; winRate: number; avgPnl: number; totalPnl: number;
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth State: Starts fresh by default. Preloaded data is ONLY for demo mode.
      currentUser: null,
      isDemoMode: false,
      isAuthModalOpen: false,

      // Initial Playbook configuration templates
      setups: seedSetups,
      tags: seedTags,
      goals: seedGoals,

      // Initial Data: FRESH SLATE (0 trades, 0 notes)
      trades: [],
      dailyNotes: [],
      stickyNotes: [],
      notebooks: [{ id: 'nb-1', name: 'General', icon: '📓', createdAt: '2026-01-01T00:00:00Z', notes: [] }],
      dailyNoteTemplate: DEFAULT_TEMPLATE_HTML,
      dailyNoteTemplateMarkdown: DEFAULT_TEMPLATE_MARKDOWN,

      // ---- Auth Actions ----
      openAuthModal: () => set({ isAuthModalOpen: true }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),

      loginWithCreds: ({ email, name }) => {
        const cleanEmail = email.trim().toLowerCase();
        const userName = name?.trim() || cleanEmail.split('@')[0];
        const user: UserProfile = {
          id: generateId(),
          email: cleanEmail,
          name: userName,
          createdAt: new Date().toISOString(),
          isDemo: false,
        };

        // Check if this user has previously logged real trades
        const existingData = loadUserData(cleanEmail);
        const userTrades = existingData?.trades || [];
        const userNotes = existingData?.dailyNotes || [];
        const userNotebooks = existingData?.notebooks || [{ id: 'nb-1', name: 'General', icon: '📓', createdAt: '2026-01-01T00:00:00Z', notes: [] }];
        const userStickyNotes = existingData?.stickyNotes || [];

        set({
          currentUser: user,
          isDemoMode: false,
          isAuthModalOpen: false,
          trades: userTrades, // Starts 100% fresh if first time login!
          dailyNotes: userNotes,
          notebooks: userNotebooks,
          stickyNotes: userStickyNotes,
        });
      },

      logout: () => {
        set({
          currentUser: null,
          isDemoMode: false,
          trades: [],
          dailyNotes: [],
          stickyNotes: [],
          notebooks: [{ id: 'nb-1', name: 'General', icon: '📓', createdAt: '2026-01-01T00:00:00Z', notes: [] }],
        });
      },

      loadDemoData: () => {
        set({
          isDemoMode: true,
          isAuthModalOpen: false,
          currentUser: {
            id: 'demo-user',
            email: 'demo.trader@tradostats.pro',
            name: 'Demo Trader',
            createdAt: '2026-01-01T00:00:00Z',
            isDemo: true,
          },
          trades: seedTrades,
          dailyNotes: seedNotes,
          notebooks: seedNotebooks,
          goals: seedGoals,
          setups: seedSetups,
          tags: seedTags,
        });
      },

      clearToFreshAccount: () => {
        const { currentUser } = get();
        if (currentUser && typeof window !== 'undefined') {
          try {
            localStorage.removeItem(`tradostats_user_${currentUser.email.toLowerCase()}`);
          } catch {}
        }
        set({
          isDemoMode: false,
          trades: [],
          dailyNotes: [],
          stickyNotes: [],
          notebooks: [{ id: 'nb-1', name: 'General', icon: '📓', createdAt: '2026-01-01T00:00:00Z', notes: [] }],
        });
      },

      // ---- Setups ----
      addSetup: (s) => set(state => ({
        setups: [...state.setups, { ...s, id: generateId(), createdAt: new Date().toISOString() }]
      })),
      updateSetup: (id, u) => set(state => ({
        setups: state.setups.map(s => s.id === id ? { ...s, ...u } : s)
      })),
      deleteSetup: (id) => set(state => ({
        setups: state.setups.filter(s => s.id !== id)
      })),

      // ---- Tags ----
      addTag: (t) => set(state => ({
        tags: [...state.tags, { ...t, id: generateId(), createdAt: new Date().toISOString() }]
      })),
      updateTag: (id, u) => set(state => ({
        tags: state.tags.map(t => t.id === id ? { ...t, ...u } : t)
      })),
      deleteTag: (id) => set(state => ({
        tags: state.tags.filter(t => t.id !== id)
      })),

      // ---- Goals ----
      addGoal: (g) => set(state => ({
        goals: [...state.goals, { ...g, id: generateId(), createdAt: new Date().toISOString() }]
      })),
      updateGoal: (id, u) => set(state => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...u } : g)
      })),
      deleteGoal: (id) => set(state => ({
        goals: state.goals.filter(g => g.id !== id)
      })),

      // ---- Trades ----
      addTrade: (t) => {
        set(state => {
          const updatedTrades = [...state.trades, { ...t, id: generateId() }];
          if (state.currentUser && !state.isDemoMode) {
            saveUserData(state.currentUser.email, {
              trades: updatedTrades,
              dailyNotes: state.dailyNotes,
              notebooks: state.notebooks,
              stickyNotes: state.stickyNotes,
            });
          }
          return { trades: updatedTrades };
        });
      },
      updateTrade: (id, u) => {
        set(state => {
          const updatedTrades = state.trades.map(t => t.id === id ? { ...t, ...u } : t);
          if (state.currentUser && !state.isDemoMode) {
            saveUserData(state.currentUser.email, {
              trades: updatedTrades,
              dailyNotes: state.dailyNotes,
              notebooks: state.notebooks,
              stickyNotes: state.stickyNotes,
            });
          }
          return { trades: updatedTrades };
        });
      },
      deleteTrade: (id) => {
        set(state => {
          const updatedTrades = state.trades.filter(t => t.id !== id);
          if (state.currentUser && !state.isDemoMode) {
            saveUserData(state.currentUser.email, {
              trades: updatedTrades,
              dailyNotes: state.dailyNotes,
              notebooks: state.notebooks,
              stickyNotes: state.stickyNotes,
            });
          }
          return { trades: updatedTrades };
        });
      },

      // ---- Daily Notes ----
      addDailyNote: (n) => {
        const now = new Date().toISOString();
        set(state => {
          const updatedNotes = [...state.dailyNotes, { ...n, id: generateId(), createdAt: now, updatedAt: now }];
          if (state.currentUser && !state.isDemoMode) {
            saveUserData(state.currentUser.email, {
              trades: state.trades,
              dailyNotes: updatedNotes,
              notebooks: state.notebooks,
              stickyNotes: state.stickyNotes,
            });
          }
          return { dailyNotes: updatedNotes };
        });
      },
      updateDailyNote: (id, content) => {
        set(state => {
          const updatedNotes = state.dailyNotes.map(n =>
            n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n
          );
          if (state.currentUser && !state.isDemoMode) {
            saveUserData(state.currentUser.email, {
              trades: state.trades,
              dailyNotes: updatedNotes,
              notebooks: state.notebooks,
              stickyNotes: state.stickyNotes,
            });
          }
          return { dailyNotes: updatedNotes };
        });
      },
      deleteDailyNote: (id) => {
        set(state => {
          const updatedNotes = state.dailyNotes.filter(n => n.id !== id);
          if (state.currentUser && !state.isDemoMode) {
            saveUserData(state.currentUser.email, {
              trades: state.trades,
              dailyNotes: updatedNotes,
              notebooks: state.notebooks,
              stickyNotes: state.stickyNotes,
            });
          }
          return { dailyNotes: updatedNotes };
        });
      },

      // ---- Sticky Notes ----
      addStickyNote: (content, color = '#131920') => {
        const now = new Date().toISOString();
        set(state => ({
          stickyNotes: [...state.stickyNotes, { id: generateId(), content, color, createdAt: now, updatedAt: now }]
        }));
      },
      updateStickyNote: (id, content) => set(state => ({
        stickyNotes: state.stickyNotes.map(n =>
          n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n
        )
      })),
      deleteStickyNote: (id) => set(state => ({
        stickyNotes: state.stickyNotes.filter(n => n.id !== id)
      })),

      // ---- Notebooks ----
      addNotebook: (name, icon = '📓') => set(state => ({
        notebooks: [...state.notebooks, { id: generateId(), name, icon, createdAt: new Date().toISOString(), notes: [] }]
      })),
      deleteNotebook: (id) => set(state => ({
        notebooks: state.notebooks.filter(n => n.id !== id)
      })),

      // ---- Daily Note Template Actions ----
      updateDailyNoteTemplate: (markdown, html) => set({
        dailyNoteTemplateMarkdown: markdown,
        dailyNoteTemplate: html || markdownToHtml(markdown),
      }),
      resetDailyNoteTemplate: () => set({
        dailyNoteTemplate: DEFAULT_TEMPLATE_HTML,
        dailyNoteTemplateMarkdown: DEFAULT_TEMPLATE_MARKDOWN,
      }),

      // Ensure recent trades exist ONLY for demo mode
      ensureCurrentMonthTrades: () => {
        const { trades, isDemoMode } = get();
        // NEVER inject demo trades into a real user account!
        if (!isDemoMode) return;
        const has2026 = trades.some(t => t.dateTime.startsWith('2026-09'));
        if (!has2026) {
          const currentMonthSeed = seedTrades.filter(t => t.dateTime.startsWith('2026-09'));
          set({ trades: [...trades, ...currentMonthSeed] });
        }
      },

      // ---- Computed ----
      getSetupStats: (setupId) => {
        const { trades } = get();
        const setupTrades = trades.filter(t => t.setupId === setupId);
        const wins = setupTrades.filter(t => t.pnl > 0);
        const losses = setupTrades.filter(t => t.pnl <= 0);
        const totalPnl = setupTrades.reduce((sum, t) => sum + t.pnl, 0);
        const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
        const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
        return {
          trades: setupTrades.length,
          wins: wins.length,
          winRate: calcWinRate(wins.length, setupTrades.length),
          avgPnl: setupTrades.length ? totalPnl / setupTrades.length : 0,
          totalPnl,
          profitFactor: calcProfitFactor(grossProfit, grossLoss),
          recentTrades: getRecentResults(setupTrades),
        };
      },

      getTagStats: (tagId) => {
        const { trades } = get();
        const tagged = trades.filter(t => t.tagIds.includes(tagId));
        const wins = tagged.filter(t => t.pnl > 0);
        const losses = tagged.filter(t => t.pnl <= 0);
        const totalPnl = tagged.reduce((sum, t) => sum + t.pnl, 0);
        const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
        const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
        return {
          trades: tagged.length,
          wins: wins.length,
          winRate: calcWinRate(wins.length, tagged.length),
          avgPnl: tagged.length ? totalPnl / tagged.length : 0,
          totalPnl,
        };
      },
    }),
    {
      name: 'tradostats-storage',
      skipHydration: true,
    }
  )
);

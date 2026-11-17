export type DRCGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C' | 'D' | 'F' | 'Unrated';
export type DRCRuleAdherence = 'Followed 100%' | 'Minor Slip' | 'Broken Rule' | 'Unrated';
export type DRCMindset = 'Patient & Calm' | 'Hesitant' | 'FOMO / Impatient' | 'Revenge' | 'Unrated';

export interface DailyReportCardData {
  grade: DRCGrade;
  ruleAdherence: DRCRuleAdherence;
  mindset: DRCMindset;
  notes?: string;
  updatedAt?: string;
}

export const DRC_GRADES: DRCGrade[] = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C', 'D', 'F'];

export function getGradeBadgeStyle(grade: DRCGrade) {
  switch (grade) {
    case 'A+':
    case 'A':
    case 'A-':
      return {
        color: '#10B981',
        bg: 'rgba(16, 185, 129, 0.16)',
        border: 'rgba(16, 185, 129, 0.35)',
        glow: 'none',
      };
    case 'B+':
    case 'B':
    case 'B-':
      return {
        color: '#EAB308',
        bg: 'rgba(234, 179, 8, 0.16)',
        border: 'rgba(234, 179, 8, 0.35)',
        glow: 'none',
      };
    case 'C':
      return {
        color: '#38BDF8',
        bg: 'rgba(56, 189, 248, 0.16)',
        border: 'rgba(56, 189, 248, 0.35)',
        glow: 'none',
      };
    case 'D':
      return {
        color: '#F97316',
        bg: 'rgba(249, 115, 22, 0.16)',
        border: 'rgba(249, 115, 22, 0.35)',
        glow: 'none',
      };
    case 'F':
      return {
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.16)',
        border: 'rgba(239, 68, 68, 0.35)',
        glow: 'none',
      };
    default:
      return {
        color: '#9CA3AF',
        bg: 'rgba(156, 163, 175, 0.1)',
        border: 'rgba(156, 163, 175, 0.25)',
        glow: 'none',
      };
  }
}

# FocusQuest - Development Context

## 🎯 Project Overview

**FocusQuest** is an enhanced version of focus-sprint-coach that adds gamification mechanics to a Pomodoro-style focus timer with emotional and energy tracking capabilities.

### Original Project
- **Base**: focus-sprint-coach
- **Core Philosophy**: Combine Pomodoro technique with qualitative check-ins to prevent burnout
- **Key Innovation**: Real-time energy tracking with visualization

### Enhancement Goal
Add gamification elements to increase user engagement and motivation while maintaining the wellness-focused approach of the original project.

---

## 🎮 Core Gamification Features

### Phase 1: Foundation (Weeks 1-2)
1. **Level & XP System**
   - Earn XP from completed focus sessions
   - Level up every 2 hours of focus time
   - Display level progress bar in UI

2. **Streak Counter**
   - Track consecutive days of usage
   - Visual streak display (🔥 icon)
   - Include "shield" protection (1 grace day)

3. **Basic Badges (5 initial)**
   - "First Quest": Complete first session
   - "Week Warrior": 7-day streak
   - "Century": 100 total focus sessions
   - "High Energy": 3 consecutive sessions with 80%+ energy
   - "Consistent": Complete sessions 5 days in a row

### Phase 2: Visual Systems (Weeks 3-4)
4. **Crystal Collection**
   - Earn 0-5 crystals per session based on energy level
   - Visual crystal counter in UI
   - Use crystals to unlock skills

5. **Unlockable Skills**
   - Deep Work Mode (50 crystals): 50-minute focus preset
   - Zen Break (30 crystals): Guided meditation timer
   - Night Owl (40 crystals): Dark theme with reduced blue light

6. **Badge Grid Panel**
   - Display all badges (locked/unlocked states)
   - Achievement toast notifications
   - Level-up animations

### Phase 3: Advanced Features (Weeks 5-6)
7. **Energy Pattern Insights**
   - Time-of-day analysis (morning person vs night owl)
   - Identify energy slump periods
   - Suggest optimal focus times

8. **Keyboard Combo System**
   - Detect rapid consecutive Space presses
   - Reward "Quick Starter" bonus crystals
   - Add fun micro-interactions

9. **Rest Quality Tracking**
   - Reward full break utilization
   - Warning for skipping 3+ breaks
   - Balance focus with recovery

---

## 🛠 Tech Stack

### Core
- **Framework**: Vite + React 19 + TypeScript
- **State Management**: Zustand with persist middleware
- **Styling**: Tailwind CSS 3.4
- **Date/Time**: Day.js
- **Charts**: Recharts

### Development
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint
- **Type Checking**: TypeScript strict mode

### Storage
- **Local**: localStorage (no backend required)
- **Schema**: JSON serialization via Zustand persist

---

## 📁 Project Structure

```
src/
├── App.tsx                          # Main layout
├── main.tsx                         # Entry point
├── components/
│   ├── TimerPanel.tsx              # Main timer UI
│   ├── SessionQueue.tsx            # Next sessions display
│   ├── SessionFeedbackModal.tsx    # Emotion/energy input
│   ├── DailyLog.tsx                # Session history
│   ├── DailyTrendsChart.tsx        # Energy visualization
│   ├── SessionInsights.tsx         # Data-driven insights
│   ├── SettingsPanel.tsx           # Preset & notification settings
│   ├── GamificationPanel.tsx       # 🆕 Levels, badges, crystals
│   └── AchievementToast.tsx        # 🆕 Notification popups
├── state/
│   └── sessionStore.ts             # 🔧 Zustand store (extended)
├── hooks/
│   └── useTimer.ts                 # Timer logic
├── constants/
│   ├── presets.ts                  # Pomodoro configurations
│   └── badges.ts                   # 🆕 Badge definitions
├── types/
│   ├── session.ts                  # Core data types
│   └── gamification.ts             # 🆕 Game data types
└── utils/
    ├── metrics.ts                  # Statistics calculations
    ├── time.ts                     # Time formatting
    └── gamification.ts             # 🆕 XP, level calculations
```

---

## 📊 Data Models

### Extended SessionStore

```typescript
interface SessionStore {
  // Original fields (preserve)
  status: TimerStatus;
  phaseQueue: SessionPhaseInstance[];
  currentIndex: number;
  remainingMs: number;
  history: SessionLogEntry[];
  pendingFeedback: SessionPhaseInstance | null;
  settings: UserSettings;
  
  // New gamification fields
  gamification: {
    level: number;
    totalXP: number;
    crystals: number;
    usedCrystals: number;
    badges: string[];          // Badge IDs
    unlockedSkills: string[];  // Skill IDs
    streak: {
      current: number;
      longest: number;
      lastActiveDate: string;
      shieldUsed: boolean;
    };
    stats: {
      totalSessions: number;
      totalFocusMinutes: number;
      totalRecoveryMinutes: number;
      averageEnergy: number;
      averageEmotion: number;
    };
  };
  
  // New actions
  earnXP: (amount: number) => void;
  awardBadge: (badgeId: string) => void;
  earnCrystals: (amount: number) => void;
  spendCrystals: (skillId: string, cost: number) => void;
  updateStreak: () => void;
  checkAchievements: () => void;
}
```

### Badge Definition

```typescript
interface Badge {
  id: string;
  icon: string;           // Emoji or icon name
  title: string;
  description: string;
  condition: (store: SessionStore) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

### Skill Definition

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number;           // Crystal cost
  icon: string;
  effect: () => void;     // What happens when unlocked
}
```

---

## 🎨 UI/UX Guidelines

### Design Principles
1. **Wellness First**: Gamification should not create pressure
2. **Subtle Animations**: Use Tailwind transitions, avoid distraction
3. **Accessible**: Clear labels, keyboard navigation, ARIA attributes
4. **Responsive**: Mobile-friendly (though desktop-first)

### Color Palette (Tailwind)
- **Primary**: Blue (focus, crystals)
- **Success**: Green (recovery, achievements)
- **Warning**: Yellow (badges, level-up)
- **Danger**: Red (burnout warnings)
- **Neutral**: Gray scale (background, text)

### Animation Standards
```tsx
// Level-up animation
<div className="animate-bounce">🎉 Level {newLevel}!</div>

// Badge unlock
<div className="animate-pulse">🏆 New Badge!</div>

// Crystal collect
<div className="animate-ping">💎</div>
```

---

## 🔧 Implementation Guidelines

### Adding New Badges

1. Define in `constants/badges.ts`:
```typescript
export const BADGES: Badge[] = [
  {
    id: 'first-quest',
    icon: '🎯',
    title: 'First Quest',
    description: 'Complete your first focus session',
    condition: (store) => store.gamification.stats.totalSessions >= 1,
    rarity: 'common'
  }
];
```

2. Check after each session in `sessionStore.ts`:
```typescript
const checkAchievements = () => {
  BADGES.forEach(badge => {
    if (!get().gamification.badges.includes(badge.id)) {
      if (badge.condition(get())) {
        awardBadge(badge.id);
      }
    }
  });
};
```

### Calculating XP

```typescript
// In sessionStore.ts
const recordFeedback = (feedback: SessionFeedback) => {
  // ... existing logic ...
  
  // Award XP based on session duration
  const xpEarned = Math.floor(feedback.durationMinutes);
  earnXP(xpEarned);
  
  // Award crystals based on energy
  const crystalsEarned = Math.floor(feedback.energy / 20);
  earnCrystals(crystalsEarned);
  
  // Check for achievements
  checkAchievements();
};
```

### Level Formula

```typescript
// In utils/gamification.ts
export function calculateLevel(totalXP: number): number {
  // 120 XP per level (2 hours of focus)
  return Math.floor(totalXP / 120);
}

export function xpToNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  return (currentLevel + 1) * 120 - currentXP;
}
```

---

## ⚠️ Critical Constraints

### Must Preserve
1. **Core timer functionality**: Do not break existing Pomodoro logic
2. **Feedback modal flow**: Keep emotion/energy tracking intact
3. **localStorage schema**: Maintain backward compatibility
4. **Keyboard shortcuts**: Preserve Space/Enter/Esc functionality

### Must Avoid
1. **Pressure mechanics**: No penalties for missed sessions
2. **Competitive features**: No leaderboards (solo focus only)
3. **Excessive notifications**: Respect user's focus time
4. **Bundle bloat**: Keep bundle size under 1MB (current: 537KB)

### Performance Targets
- Initial load: < 2s on 3G
- Timer tick: 60 FPS smooth
- localStorage writes: Debounced (max 1/sec)

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
```typescript
// Example: Badge unlock logic
describe('Badge System', () => {
  it('should unlock First Quest badge after first session', () => {
    const store = createStore();
    store.recordFeedback({...mockFeedback});
    expect(store.gamification.badges).toContain('first-quest');
  });
});
```

### Integration Tests
- Timer → Feedback → XP flow
- Streak calculation across midnight
- Crystal spending and skill unlock

### Manual Testing Checklist
- [ ] Complete full Pomodoro cycle
- [ ] Verify XP calculation
- [ ] Test streak reset at midnight
- [ ] Check badge unlock animations
- [ ] Validate localStorage persistence

---

## 📚 Reference Documentation

### Original Project
- [focus-sprint-coach README](../README.md)
- [focus-sprint-coach USER_GUIDE](../USER_GUIDE.md)

### Research Papers
- Gerdenitsch et al. (2020) - Work gamification effects
- Wharton Neuroscience Initiative (2024) - Gamification neuroscience

### Similar Apps (for inspiration)
- **Habitica**: RPG-style task management
- **Forest**: Tree-growing focus app
- **Focumon**: Monster collection + Pomodoro

### Design Resources
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [Lucide Icons](https://lucide.dev) - For badge icons

---

## 🚀 Development Roadmap

### Sprint 1 (Week 1-2): Core Gamification
- [ ] Extend sessionStore with gamification state
- [ ] Implement XP and level system
- [ ] Create streak counter logic
- [ ] Design and code 5 basic badges
- [ ] Add level display to TimerPanel

### Sprint 2 (Week 3-4): Visual Systems
- [ ] Build GamificationPanel component
- [ ] Implement crystal collection UI
- [ ] Create badge grid with unlock states
- [ ] Add achievement toast notifications
- [ ] Integrate skill unlock system

### Sprint 3 (Week 5-6): Polish & Advanced
- [ ] Energy pattern analysis
- [ ] Keyboard combo detection
- [ ] Rest quality tracking
- [ ] Burnout warnings
- [ ] Comprehensive testing

### Future Considerations
- Weekly/monthly statistics
- Custom badge creation
- Export data (CSV)
- PWA with offline support
- Cloud sync (optional)

---

## 💡 Development Tips

### Quick Dev Commands
```bash
# Start dev server
npm run dev

# Run tests in watch mode
npm test -- --watch

# Type check only
npm run build -- --mode development

# Check bundle size
npm run build && ls -lh dist/
```

### Debugging Zustand Store
```typescript
// In browser console
window.__ZUSTAND_DEV__ = true;

// Log store state
console.log(useSessionStore.getState());
```

### localStorage Inspector
```javascript
// View persisted state
JSON.parse(localStorage.getItem('focus-sprint-coach::session'));
```

---

## 🤝 Contributing Guidelines

1. **Branch naming**: `feature/badge-system`, `fix/timer-bug`
2. **Commit format**: `feat: add crystal collection UI`
3. **PR requirements**: 
   - Tests pass
   - No TypeScript errors
   - Bundle size < 1MB
4. **Code style**: Follow existing patterns, use Prettier

---

## 📞 Support & Questions

- **Issues**: Open GitHub issue with `[FocusQuest]` prefix
- **Discussions**: Use GitHub Discussions for feature ideas
- **Documentation**: Update this file when adding major features

---

**Last Updated**: 2025-11-03  
**Version**: 1.0.0-alpha  
**Status**: Active Development

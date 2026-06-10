# Implementation Plan - Well-Bell Life Management Platform

Upgrade the "Well-Bell" platform into a fully functional, highly polished, Ghibli-themed personal assistant. We will build a unified design system, centralized state manager, and integrate all required modules with rich interactivity, charts, animations, and gamification.

## User Review Required

> [!IMPORTANT]
> - All modules will run on client-side state using `localStorage`. We will build a simulated "AI Coach" and "Companion Chat" that generate tailored reflections and conversations locally using structured templates.
> - The theme will be warm and cozy (Ghibli-inspired) with soft pastel colors, floating leaf animations, and drifting clouds.
> - We will use the existing `totoro_bg.jpg` as the background, and generate additional SVGs or assets for the virtual companion.

## Proposed Changes

We will restructure all files to share the standard app layout (cozy sidebar + content card layout). A single `state.js` file will handle data persistence, sync, and gamification calculations (XP, levels, badges).

---

### Design System & Utilities

#### [MODIFY] [Style.css](file:///c:/Users/areeb/OneDrive/Music/Documents/Well-Bell/Style.css)
- Implement light/dark mode variables and transition logic.
- Add drifting cloud animations and floating leaf animations.
- Create beautiful glassmorphism classes (`.glass-card`, `.glass-panel`).
- Set up custom range inputs, switches, progress rings, and scrollbars.
- Include companion widget styles (breathing animations, speech bubbles).

#### [NEW] [state.js](file:///c:/Users/areeb/OneDrive/Music/Documents/Well-Bell/state.js)
- Set up `WellBellState` class to manage:
  - User profiles (age, weight, height, diet goals, etc.).
  - Daily metrics (water, sleep, workout completion, mood, tasks).
  - Financial transactions, habits, diary entries.
  - Companion conversation logs.
  - Gamification (XP, wellness points, level progression, badges, streak counts).
- Implement automated sync, XP increments for completing tasks, and daily resets.

---

### Home Dashboard & Modules

#### [MODIFY] [index.html](file:///c:/Users/areeb/OneDrive/Music/Documents/Well-Bell/index.html)
- Integrate the unified sidebar layout and import `state.js`.
- Display personalized welcome greeting based on time of day.
- Show current wellness score using an animated SVG progress ring.
- Implement daily quick checklist, water intake tracker, streak indicator.
- Display "Today's Life Reflection" (AI coach summary, recommendations, achievements).
- Render weekly progress overview using Chart.js.

#### [MODIFY] [Diet.html](file:///c:/Users/areeb/OneDrive/Music/Documents/Well-Bell/Diet.html)
- Standardize layout with sidebar and main grid.
- Build the onboarding profile form (collect age, goal, activity level, etc.).
- Implement Calorie/Macros tracker (pie chart/progress bars) and Food logger.
- Add daily, weekly, and monthly meal planner inputs.
- Create a Grocery List generator and healthy recipe cards.

#### [MODIFY] [Work.html](file:///c:/Users/areeb/OneDrive/Music/Documents/Well-Bell/Work.html)
- Standardize layout with sidebar.
- Implement task creation, editing, prioritization, and status filters (pending, completed, cancelled, future).
- Add project groupings and habit checklists.
- Build a beautiful Pomodoro focus timer with cozy animations and relaxing wind-down options.

#### [MODIFY] [Mental Wellbeing.html](file:///c:/Users/areeb/OneDrive/Music/Documents/Well-Bell/Mental%20Wellbeing.html)
- Standardize layout with sidebar.
- Render the virtual anime companion "Bella" (animated SVG/canvas or cute illustrated layout).
- Build the daily mood check-in slider, emotional Support Chat, stress tracker.
- Add gratitude logging and positive affirmation displays.

#### [MODIFY] [Physical Wellbeing.html](file:///c:/Users/areeb/OneDrive/Music/Documents/Well-Bell/Physical%20Wellbeing.html)
- Standardize layout with sidebar.
- Auto-generate workout plans (beginner, intermediate, advanced; home/gym; cardio, strength, stretching) using profile data.
- Build daily, weekly, and monthly schedule tracking.
- Display fitness progress charts.

#### [MODIFY] [Money Managment.html](file:///c:/Users/areeb/OneDrive/Music/Documents/Well-Bell/Money%20Managment.html)
- Standardize layout with sidebar.
- Income/expense tracking ledger with category badges.
- Savings goals tracker and investment awareness guide.
- Event budget calculators (vacations, birthday reminders, festivals).
- Local AI spending calculations: Recommended savings, Daily/Monthly limits, Completion timelines.

#### [MODIFY] [Diary.html](file:///c:/Users/areeb/OneDrive/Music/Documents/Well-Bell/Diary.html)
- Standardize layout with sidebar.
- Build diary writing layout with mood selectors and private lock simulation.
- Calendar view showing past entries and mood trends.
- Local AI reflection highlights (growth insights, weekly summary).

#### [MODIFY] [Sleep.html](file:///c:/Users/areeb/OneDrive/Music/Documents/Well-Bell/Sleep.html)
- Standardize layout with sidebar.
- Build sleep log form, bed/wake-time configuration, and bedtime routine checklist.
- Advanced metrics display: sleep debt, consistency score, sleep quality index.
- Weekly and monthly sleep history trends.

#### [MODIFY] [Me Time.html](file:///c:/Users/areeb/OneDrive/Music/Documents/Well-Bell/Me%20Time.html)
- Standardize layout with sidebar.
- Cozy relaxation timers and ambient audio mixer simulations.
- Self-care journal/log.

---

## Verification Plan

### Automated/Code Validation
- Ensure all pages load cleanly without console errors.
- Confirm state persists in `localStorage` across page navigations.
- Check responsiveness on simulated mobile, tablet, and desktop screens.

### Manual Verification
- Test interactive widgets: ticking Pomodoro timer, chat with companion Bella, budget ledger entries, and checklist completion XP rewards.

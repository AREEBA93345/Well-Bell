/**
 * Well-Bell Central State Manager
 * Handles local storage persistence, gamification (XP/Levels/Badges),
 * daily checklist synchronization, module data structures, and
 * client-side rule-based AI generators (Life Coach, Nutritionist, Financial Planner, Companion Chat).
 */

const STORAGE_KEY = 'wellbell_state_v2';

// Standard Badges Database
const BADGES_DATABASE = [
  { id: 'first_step', name: 'First Step', icon: '🌱', desc: 'Welcome to Well-Bell! Created your profile.' },
  { id: 'water_champion', name: 'Hydration Hero', icon: '💧', desc: 'Drank 3.0L or more water in one day.' },
  { id: 'productivity_guru', name: 'Focus Master', icon: '⏱️', desc: 'Completed a 25-minute Pomodoro session.' },
  { id: 'mindful_soul', name: 'Peace Seeker', icon: '🧘', desc: 'Logged 3 gratitude entries.' },
  { id: 'early_bird', name: 'Early Bird', icon: '🌅', desc: 'Logged a healthy 8-hour sleep.' },
  { id: 'gym_bunny', name: 'Iron Will', icon: '🏃', desc: 'Completed a customized workout session.' },
  { id: 'saving_guru', name: 'Thrifty Sage', icon: '🪙', desc: 'Stayed below the daily spending limit.' },
  { id: 'golden_writer', name: 'Soul Searcher', icon: '✍️', desc: 'Logged a diary entry.' }
];

const DEFAULT_STATE = {
  // Gamification
  xp: 0,
  level: 1,
  wellnessPoints: 10,
  badges: [],
  streaks: {
    dailyCheck: 0,
    diet: 0,
    work: 0,
    sleep: 0,
    lastCheckDate: ''
  },
  
  // User Profile (Diet & General)
  profile: {
    age: 25,
    gender: 'Female',
    height: 165,
    weight: 60,
    goal: 'maintain', // lose weight, maintain, gain muscle
    allergies: '',
    dietPreference: 'Veg',
    likes: 'Apples, Rice, Soup',
    dislikes: 'Broccoli, Fast Food',
    activity: 'moderate' // low, moderate, high
  },
  profileSaved: false,

  // Water & Diet Tracker
  waterIntake: 0.0, // Litres
  waterTarget: 2.5,
  meals: {
    breakfast: { eaten: false, food: '' },
    lunch: { eaten: false, food: '' },
    dinner: { eaten: false, food: '' },
    snacks: { eaten: false, food: '' }
  },
  caloriesConsumed: 0,
  proteinConsumed: 0,
  carbsConsumed: 0,
  fatConsumed: 0,
  cheatMealsThisWeek: 0,
  extraCalories: 0,
  cheatItems: [],
  dietPlan: null, // AI Generated Plan

  // Work & Productivity
  tasks: [
    { id: 1, text: 'Plan Ghibli-themed designs', status: 'pending', priority: 'high', project: 'Well-Bell', deadline: '2026-06-12', dateCreated: '2026-06-10' },
    { id: 2, text: 'Design database structure', status: 'completed', priority: 'medium', project: 'Well-Bell', deadline: '2026-06-10', dateCreated: '2026-06-10' }
  ],
  habits: [
    { id: 1, text: 'Read for 20 mins', checked: false },
    { id: 2, text: 'Meditation', checked: false },
    { id: 3, text: 'Drink water morning', checked: false },
    { id: 4, text: 'Stretch', checked: false }
  ],
  pomodorosCompleted: 0,
  focusMinutesToday: 0,

  // Mental Wellbeing (Companion & Mood)
  companionLogs: [
    { sender: 'bella', text: 'Hello, friend! I am Bella, your forest companion. How is your heart feeling today?', time: '2026-06-10 12:00' }
  ],
  moodCheckIn: {
    mood: 3, // 1-5
    stress: 3, // 1-5
    note: ''
  },
  moodHistory: [], // { date, mood, stress, notes }
  gratitudeEntries: [], // list of strings
  affirmationsShownToday: [],

  // Physical Wellbeing
  workoutCompleted: false,
  workoutHistory: [], // { date, type, duration, completed: true }
  customWorkouts: [], // auto-generated recommendations

  // Money Management
  transactions: [
    { id: 1, desc: 'Salary deposit', amount: 3000, type: 'income', category: 'Salary', date: '2026-06-01' },
    { id: 2, desc: 'Organic groceries', amount: 45, type: 'expense', category: 'Groceries', date: '2026-06-09' }
  ],
  savingsGoal: 1000,
  savingsBalance: 400,
  emergencyFundGoal: 2000,
  emergencyFundBalance: 500,
  subscriptions: [
    { id: 1, name: 'Cozy Streams', cost: 15, billDate: '25th' }
  ],
  specialBudgets: {
    vacation: { goal: 1200, current: 300 },
    birthdays: { goal: 200, current: 50 },
    festivals: { goal: 300, current: 100 },
    gifts: { goal: 150, current: 40 }
  },

  // Diary
  diaryEntries: [
    { date: '2026-06-09', content: 'Had a lovely walk in the woods today. Saw a bunny! Felt very connected to nature.', mood: '😊', unlocked: true, password: '' }
  ],

  // Sleep
  sleepLog: {
    bedtime: '22:30',
    wakeTime: '06:30',
    duration: 8.0,
    quality: 4, // 1-5
    history: []
  },
  bedtimeChecklist: {
    water: false,
    read: false,
    stretch: false,
    noScreen: false,
    meditation: false,
    planTasks: false
  },

  // Me Time
  meTimeLogs: [],
  ambientAudio: 'rain'
};

class WellBellState {
  constructor() {
    this.data = { ...DEFAULT_STATE };
    this.load();
    this.checkDailyReset();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Deep merge defaults to avoid issues when fields are added
        this.data = this.deepMerge(DEFAULT_STATE, parsed);
      } else {
        this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
        this.save();
      }
    } catch (e) {
      console.error('Failed to load state', e);
      this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      // Dispatch custom event to notify other scripts of updates
      window.dispatchEvent(new Event('wellbell_state_updated'));
    } catch (e) {
      console.error('Failed to save state', e);
    }
  }

  deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  checkDailyReset() {
    const today = new Date().toISOString().split('T')[0];
    if (this.data.streaks.lastCheckDate !== today) {
      // It's a new day! Resets daily metrics
      this.data.streaks.lastCheckDate = today;
      
      // Accumulate metrics into histories
      if (this.data.waterIntake > 0) {
        // Hydration check
        if (this.data.waterIntake >= 3.0) this.unlockBadge('water_champion');
      }

      // Reset daily trackers
      this.data.waterIntake = 0;
      this.data.workoutCompleted = false;
      this.data.meals.breakfast.eaten = false;
      this.data.meals.lunch.eaten = false;
      this.data.meals.dinner.eaten = false;
      this.data.meals.snacks.eaten = false;

      // Reset bedtime checklist
      Object.keys(this.data.bedtimeChecklist).forEach(k => {
        this.data.bedtimeChecklist[k] = false;
      });

      // Reset habits checked status for the new day
      this.data.habits.forEach(h => h.checked = false);

      this.save();
    }
  }

  // Gamification Helpers
  addXP(amount) {
    this.data.xp += amount;
    // XP needed = Level * 100
    let xpNeeded = this.data.level * 100;
    let leveledUp = false;
    while (this.data.xp >= xpNeeded) {
      this.data.xp -= xpNeeded;
      this.data.level += 1;
      leveledUp = true;
      xpNeeded = this.data.level * 100;
    }
    this.data.wellnessPoints += Math.round(amount / 5);
    this.save();
    return leveledUp;
  }

  unlockBadge(badgeId) {
    if (!this.data.badges.includes(badgeId)) {
      this.data.badges.push(badgeId);
      this.addXP(50);
      return true;
    }
    return false;
  }

  // Wellness Index Calculation
  calculatePillarScores() {
    // Diet: meals logged, water target completion, caloric control
    const waterScore = Math.min(100, Math.round((this.data.waterIntake / this.data.waterTarget) * 100)) || 0;
    const mealsLogged = Object.values(this.data.meals).filter(m => m.eaten).length;
    const mealsScore = Math.round((mealsLogged / 4) * 100);
    const dietScore = Math.round((waterScore + mealsScore) / 2);

    // Work: Task completion, habit ticking
    const totalTasks = this.data.tasks.length;
    const completedTasks = this.data.tasks.filter(t => t.status === 'completed').length;
    const taskScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
    const habitsTicked = this.data.habits.filter(h => h.checked).length;
    const totalHabits = this.data.habits.length;
    const habitScore = totalHabits > 0 ? Math.round((habitsTicked / totalHabits) * 100) : 100;
    const workScore = Math.round((taskScore + habitScore) / 2);

    // Sleep Score
    let sleepScore = Math.min(100, Math.round((this.data.sleepLog.duration / 8.0) * 100));
    const routineChecked = Object.values(this.data.bedtimeChecklist).filter(Boolean).length;
    const routineScore = Math.round((routineChecked / 6) * 100);
    sleepScore = Math.round((sleepScore * 0.7) + (routineScore * 0.3));

    // Mental: mood check-in, companion chat frequency
    const moodVal = (this.data.moodCheckIn.mood / 5) * 100;
    const gratitudeCount = Math.min(100, this.data.gratitudeEntries.length * 33);
    const mentalScore = Math.round((moodVal * 0.6) + (gratitudeCount * 0.4));

    // Physical Wellbeing
    const physicalScore = this.data.workoutCompleted ? 100 : 30;

    // Money: staying in budget
    const spendingLimit = this.calculateFinancialLimits().dailySpendLimit;
    const todaySpend = this.data.transactions
      .filter(t => t.type === 'expense' && t.date === new Date().toISOString().split('T')[0])
      .reduce((sum, t) => sum + t.amount, 0);
    const moneyScore = todaySpend <= spendingLimit ? 100 : Math.max(0, Math.round(100 - ((todaySpend - spendingLimit) / spendingLimit) * 100));

    // Diary Completed
    const today = new Date().toISOString().split('T')[0];
    const diaryLogged = this.data.diaryEntries.some(d => d.date === today);
    const diaryScore = diaryLogged ? 100 : 0;

    return {
      Diet: dietScore,
      Work: workScore,
      Mental: mentalScore,
      Physical: physicalScore,
      Money: moneyScore,
      MeTime: this.data.meTimeLogs.length > 0 ? 100 : 50,
      Diary: diaryScore,
      Sleep: sleepScore
    };
  }

  getCumulativeScore() {
    const scores = this.calculatePillarScores();
    const sum = Object.values(scores).reduce((a, b) => a + b, 0);
    return Math.round(sum / Object.keys(scores).length);
  }

  // Local AI Coaching Logic (Cozy Ghibli tone)
  generateTodayReflection() {
    const scores = this.calculatePillarScores();
    const globalScore = this.getCumulativeScore();
    const today = new Date().toISOString().split('T')[0];
    const diaryLogged = this.data.diaryEntries.some(d => d.date === today);

    let summary = `Your heart beat at a peaceful ${globalScore}% harmony today. `;
    let achievements = [];
    let improvements = [];
    let recommendations = [];

    // Check Water/Diet
    if (this.data.waterIntake >= 2.5) {
      achievements.push("You hydrated your cells beautifully like fresh morning dew in the forest.");
    } else {
      improvements.push("Hydration levels were a bit low, like dry soil awaiting rain.");
      recommendations.push("Keep a thermal flask of tea or warm water beside your desk tomorrow.");
    }

    // Check Sleep
    if (this.data.sleepLog.duration >= 7.5) {
      achievements.push("You rested deeply under the stars last night, allowing your spirit to recover.");
    } else {
      improvements.push("Rest was a bit short, making the day carry slightly heavier logs.");
      recommendations.push("Dim your lights 1 hour before bedtime and enjoy a cup of lavender-chamomile tea.");
    }

    // Check Mood
    if (this.data.moodCheckIn.mood >= 4) {
      achievements.push("Your mood was light and warm, like a sunbeam breaking through dense forest leaves.");
    } else if (this.data.moodCheckIn.mood <= 2) {
      improvements.push("Clouds gathered in your emotional sky today, bringing heavier rain.");
      recommendations.push("Take a 10-minute quiet walk outside, or ask Bella for a listening ear.");
    }

    // Check Tasks
    const completedTasksCount = this.data.tasks.filter(t => t.status === 'completed' && t.deadline === today).length;
    if (completedTasksCount > 0) {
      achievements.push(`You completed ${completedTasksCount} key tasks, laying bricks on your cozy cabin.`);
    }

    // Budget
    const spendLimits = this.calculateFinancialLimits();
    const todaySpend = this.data.transactions
      .filter(t => t.type === 'expense' && t.date === today)
      .reduce((sum, t) => sum + t.amount, 0);
    if (todaySpend === 0) {
      achievements.push("No gold leaves left your wallet today! Exceptional financial mindfulness.");
    } else if (todaySpend > spendLimits.dailySpendLimit) {
      improvements.push("Gold spend exceeded today's recommended limit.");
      recommendations.push("Review subscriptions or postpone minor purchases until the next harvest moon.");
    }

    if (achievements.length === 0) achievements.push("You woke up and tried your best today, which is a glorious achievement in itself.");
    if (improvements.length === 0) improvements.push("Nothing major! You walked in complete equilibrium.");
    if (recommendations.length === 0) recommendations.push("Close your eyes, breathe, and greet tomorrow with a cozy smile.");

    // Generate Ghibli encouragement
    const ghibliEncouragements = [
      "No matter how windy it gets, we must strive to live beautifully and support one another.",
      "Just like Totoro waiting for the bus in the rain, patience and a calm heart make everything alright.",
      "Your efforts today, small or large, have planted seeds of wonder in your personal garden.",
      "Rest is a active part of progress. Close your eyes, feel the warmth, and let the fireflies guide your dreams."
    ];
    const encouragement = ghibliEncouragements[Math.floor(Math.random() * ghibliEncouragements.length)];

    return {
      globalScore,
      summary,
      achievements,
      improvements,
      recommendations,
      encouragement
    };
  }

  // Local AI Diet Plan Engine
  generateAILocalDietPlan() {
    const p = this.data.profile;
    const baseCal = p.gender === 'Male' ? 2200 : 1800;
    const factor = p.activity === 'high' ? 1.3 : p.activity === 'moderate' ? 1.15 : 0.9;
    let targetCal = Math.round(baseCal * factor);

    if (p.goal === 'lose') targetCal -= 400;
    else if (p.goal === 'gain') targetCal += 350;

    // Macro distributions
    const proteinPct = p.goal === 'gain' ? 0.3 : 0.25;
    const carbPct = p.goal === 'lose' ? 0.4 : 0.45;
    const fatPct = 0.3;

    const proteinGrams = Math.round((targetCal * proteinPct) / 4);
    const carbGrams = Math.round((targetCal * carbPct) / 4);
    const fatGrams = Math.round((targetCal * fatPct) / 9);

    // Dynamic meals based on preference and allergies
    const prefersVeg = p.dietPreference === 'Veg';
    const isAllergic = (item) => p.allergies.toLowerCase().includes(item.toLowerCase());

    const breakfastOptions = prefersVeg 
      ? ['Warm oatmeal topped with baked apples and pumpkin seeds', 'Tofu scramble on sourdough toast with spinach', 'Cozy honey almond berry porridge']
      : ['Scrambled eggs with smoked salmon and avocado toast', 'Cozy butter-fried eggs with whole grain rolls', 'Steamed rice with grilled salmon (Ghibli Bento)'];

    const lunchOptions = prefersVeg
      ? ['Cozy chickpea curry with brown rice and leafy greens', 'Lentil stew with rustic bread and sliced pears', 'Baked sweet potatoes stuffed with avocado salsa']
      : ['Grilled chicken breast salad with walnuts and vinaigrette', 'Warm turkey stew with garden carrots and potatoes', 'Cozy tuna avocado wrap with mixed leaves'];

    const dinnerOptions = prefersVeg
      ? ['Stir-fried mushrooms and broccoli over glass noodles', 'Rich pumpkin soup with roasted seeds and fresh sourdough', 'Warm quinoa bowl with roasted squash and tahini']
      : ['Seared mackerel with miso glaze, steamed cabbage and brown rice', 'Cozy beef and carrot stew with fresh herbs', 'Grilled shrimp bowl with avocados and brown rice'];

    const recipes = [
      { name: 'Ghibli Garden Bento', ingredients: prefersVeg ? 'Brown rice, grilled tofu, seasoned spinach, sweet plums' : 'Steamed white rice, grilled salmon slice, rolled tamagoyaki, edamame', steps: 'Assemble all fresh ingredients cleanly into a bento box. Enjoy with hot green tea.' },
      { name: 'Totoro Forest Oatmeal', ingredients: 'Rolled oats, almond milk, walnuts, honey, cinnamon, apple slices', steps: 'Simmer oats in milk with cinnamon, top with fresh apple slices and walnuts.' },
      { name: 'Kiki\'s Delivery Soup', ingredients: prefersVeg ? 'Vegetable stock, red lentils, baby carrots, potatoes, warm herbs' : 'Chicken breast broth, chopped potatoes, carrots, onions, fresh bay leaves', steps: 'Boil all ingredients in a warm pot until tender. Serve steaming hot with rustic sourdough.' }
    ].filter(r => !isAllergic(r.ingredients));

    this.data.dietPlan = {
      targetCal,
      proteinGrams,
      carbGrams,
      fatGrams,
      meals: {
        breakfast: breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)],
        lunch: lunchOptions[Math.floor(Math.random() * lunchOptions.length)],
        dinner: dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)],
        snack: 'Mixed berries, walnuts, or hot matcha with a dash of honey'
      },
      recipes
    };
    this.save();
    return this.data.dietPlan;
  }

  // Local AI Workout Planner
  generateAILocalWorkoutPlan() {
    const goal = this.data.profile.goal;
    const act = this.data.profile.activity;

    let level = 'Beginner';
    if (act === 'moderate') level = 'Intermediate';
    if (act === 'high') level = 'Advanced';

    const routines = {
      Beginner: {
        stretch: '10 mins of cozy neck rolls, cat-cow, and child pose',
        main: '15 mins bodyweight squats, knee pushups, and glute bridges',
        cardio: '20 mins peaceful walk in the woods or park'
      },
      Intermediate: {
        stretch: '10 mins dynamic hamstring stretch, thread the needle, and sun salutations',
        main: '25 mins dumbbell squats, regular pushups, lunges, and plank hold',
        cardio: '25 mins brisk walking or light jogging'
      },
      Advanced: {
        stretch: '12 mins deep yogic stretching, cobra flows, and thoracic openers',
        main: '35 mins single-leg squats, pushups with rotation, pull-ups, and side planks',
        cardio: '30 mins hill sprints or cycling'
      }
    };

    const currentRoutine = routines[level];
    this.data.customWorkouts = [
      { id: 'stretch', name: 'Cozy Forest Stretch', duration: '10-12 mins', desc: currentRoutine.stretch, icon: '🧘' },
      { id: 'strength', name: `Ghibli Strength Plan (${level})`, duration: '20-35 mins', desc: currentRoutine.main, icon: '💪' },
      { id: 'cardio', name: 'Valley Wind Cardio', duration: '20-30 mins', desc: currentRoutine.cardio, icon: '🍃' }
    ];
    this.save();
    return this.data.customWorkouts;
  }

  // Local AI Budget Limits & Estimates
  calculateFinancialLimits() {
    const income = this.data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = this.data.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = income - expenses;

    // AI recommended savings (30% of income)
    const recommendedSavings = Math.round(income * 0.3) || 300;
    
    // Remaining available budget
    const monthlyBudget = Math.max(100, income - recommendedSavings);

    // Calculate Limits
    const monthlySpendLimit = Math.round(monthlyBudget) || 500;
    const dailySpendLimit = Math.round(monthlySpendLimit / 30) || 20;

    // Savings goal estimate (months needed)
    const goalRemaining = Math.max(0, this.data.savingsGoal - this.data.savingsBalance);
    const avgSavingsRate = Math.max(50, recommendedSavings);
    const goalCompletionMonths = goalRemaining > 0 ? (goalRemaining / avgSavingsRate).toFixed(1) : 0;

    return {
      income,
      expenses,
      recommendedSavings,
      dailySpendLimit,
      monthlySpendLimit,
      goalCompletionMonths
    };
  }

  // Virtual Companion Bella Conversation Engine
  respondToCompanionChat(userText) {
    const input = userText.toLowerCase();
    let reply = "";
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      reply = "Hello there! The forest leaves are singing today. It is always a pleasure to sit down and chat with you.";
    } else if (input.includes('sad') || input.includes('down') || input.includes('depressed') || input.includes('lonely')) {
      reply = "I am sending a warm forest hug your way. Just like the clouds that bring rain, sad feelings eventually wash away, leaving the soil rich and green. Let's take a deep breath together. Inhale the clean forest air... and exhale the weight.";
      this.addXP(15);
    } else if (input.includes('stress') || input.includes('anxious') || input.includes('worry') || input.includes('tired')) {
      reply = "You are carrying a very heavy backpack today, aren't you? Let's unpack it together. Remember, Totoro doesn't rush the trees to grow. Take a slow sip of tea and pause. You are doing enough.";
      this.addXP(15);
    } else if (input.includes('happy') || input.includes('good') || input.includes('excited') || input.includes('completed')) {
      reply = "Oh, how my heart leaps! Hearing you happy is like watching sunshine dance on a bubbling spring. Let's celebrate your steps today!";
      this.addXP(20);
    } else if (input.includes('diet') || input.includes('eat') || input.includes('food')) {
      reply = "Food is the fuel that keeps our inner fire burning warm. Make sure to nourish your body with wholesome, colorful ingredients today! I can help you draft a bento meal in the Diet section.";
    } else if (input.includes('exercise') || input.includes('workout') || input.includes('walk')) {
      reply = "A stroll through the woods or some light stretching does wonders for the spirit. Let's do some gentle flows together to stretch our wings!";
    } else {
      reply = "I understand. The paths of life can be winding and complex, but you don't have to walk them alone. I am right here beside you, listening with a warm cup of tea.";
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.data.companionLogs.push({ sender: 'user', text: userText, time });
    this.data.companionLogs.push({ sender: 'bella', text: reply, time });
    
    this.addXP(10);
    this.save();
    return reply;
  }
}

// Layout Injection Helper
function injectCozyLayout() {
  // 1. Inject Backgrounds & Animation Containers
  if (!document.querySelector('.forest-bg')) {
    const bg = document.createElement('div');
    bg.className = 'forest-bg';
    document.body.prepend(bg);
  }
  
  if (!document.querySelector('.clouds-container')) {
    const clouds = document.createElement('div');
    clouds.className = 'clouds-container';
    clouds.innerHTML = `
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      <div class="cloud cloud-3"></div>
    `;
    document.body.prepend(clouds);
  }

  if (!document.querySelector('.leaves-container')) {
    const leaves = document.createElement('div');
    leaves.className = 'leaves-container';
    leaves.innerHTML = `
      <div class="leaf leaf-1"></div>
      <div class="leaf leaf-2"></div>
      <div class="leaf leaf-3"></div>
      <div class="leaf leaf-4"></div>
    `;
    document.body.prepend(leaves);
  }

  // 2. Setup Active Theme
  const isLight = localStorage.getItem('wellbell_light_mode') === 'true';
  if (isLight) {
    document.body.classList.add('light-mode');
  }

  // 3. Inject and Sync Sidebar
  const aside = document.querySelector('aside');
  if (aside) {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const xpPercent = Math.round((window.stateManager.data.xp / (window.stateManager.data.level * 100)) * 100);
    const cumulativeScore = window.stateManager.getCumulativeScore();

    aside.innerHTML = `
      <div class="logo-container">
        <div class="logo-icon">🔔</div>
        <span class="logo-text">Well-Bell</span>
      </div>

      <div class="level-badge-sidebar">
        <div class="lvl-ring" id="sidebarLvlVal">${window.stateManager.data.level}</div>
        <div class="lvl-details">
          <div class="lvl-title">Level ${window.stateManager.data.level} Companion</div>
          <div class="xp-bar-bg">
            <div class="xp-bar-fill" id="sidebarXpFill" style="width: ${xpPercent}%"></div>
          </div>
        </div>
      </div>

      <nav class="nav-links">
        <a href="index.html" class="${currentFile === 'index.html' ? 'active' : ''}">🏡 Dashboard</a>
        <a href="Diet.html" class="${currentFile === 'Diet.html' ? 'active' : ''}">🍱 Diet & Water</a>
        <a href="Work.html" class="${currentFile === 'Work.html' ? 'active' : ''}">⏱️ Work & Habits</a>
        <a href="Mental Wellbeing.html" class="${currentFile === 'Mental Wellbeing.html' ? 'active' : ''}">🌸 Mental Health</a>
        <a href="Physical Wellbeing.html" class="${currentFile === 'Physical Wellbeing.html' ? 'active' : ''}">🏃 Physical Fitness</a>
        <a href="Money Managment.html" class="${currentFile === 'Money Managment.html' ? 'active' : ''}">🪙 Money Budget</a>
        <a href="Me Time.html" class="${currentFile === 'Me Time.html' ? 'active' : ''}">☕ ME Time</a>
        <a href="Diary.html" class="${currentFile === 'Diary.html' ? 'active' : ''}">✍️ Cozy Diary</a>
        <a href="Sleep.html" class="${currentFile === 'Sleep.html' ? 'active' : ''}">🌙 Sleep Cycles</a>
      </nav>

      <div class="sidebar-footer">
        <button class="theme-toggle-btn" id="themeToggleBtn">
          ${isLight ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
        <div class="wellbeing-index-card">
          <div class="wellbeing-index-title">Discipline Index</div>
          <div class="wellbeing-index-value" id="sidebarIndexVal">${cumulativeScore}%</div>
        </div>
      </div>
    `;

    // Add Theme Toggle Listener
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const lightMode = document.body.classList.toggle('light-mode');
        localStorage.setItem('wellbell_light_mode', lightMode);
        themeBtn.textContent = lightMode ? '🌙 Dark Mode' : '☀️ Light Mode';
        // Dispatch event to redraw charts if they depend on themes
        window.dispatchEvent(new Event('wellbell_theme_changed'));
      });
    }
  }
}

// Run layout injection on DOM content loaded
window.addEventListener('DOMContentLoaded', () => {
  injectCozyLayout();
});

// Bind to window for global access
window.stateManager = new WellBellState();
window.BADGES_DATABASE = BADGES_DATABASE;


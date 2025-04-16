
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/components/ui/sonner";
import { Sparkles, Trophy, Star, Medal } from "lucide-react";

type Level = {
  level: number;
  minPoints: number;
  maxPoints: number;
  title: string;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: "sparkles" | "trophy" | "star" | "medal";
  unlocked: boolean;
  points: number;
};

type GameContextType = {
  points: number;
  level: number;
  levelInfo: Level;
  streak: number;
  achievements: Achievement[];
  addPoints: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  unlockAchievement: (id: string) => void;
  checkAchievements: () => void;
  progressToNextLevel: number;
};

const levels: Level[] = [
  { level: 1, minPoints: 0, maxPoints: 100, title: "Budget Beginner" },
  { level: 2, minPoints: 100, maxPoints: 300, title: "Savings Scout" },
  { level: 3, minPoints: 300, maxPoints: 600, title: "Finance Follower" },
  { level: 4, minPoints: 600, maxPoints: 1000, title: "Money Manager" },
  { level: 5, minPoints: 1000, maxPoints: 1500, title: "Budget Boss" },
  { level: 6, minPoints: 1500, maxPoints: 2200, title: "Wealth Wizard" },
  { level: 7, minPoints: 2200, maxPoints: 3000, title: "Finance Master" },
  { level: 8, minPoints: 3000, maxPoints: 4000, title: "Economy Expert" },
  { level: 9, minPoints: 4000, maxPoints: 5500, title: "Fortune Founder" },
  { level: 10, minPoints: 5500, maxPoints: 7500, title: "Financial Freedom" },
];

const initialAchievements: Achievement[] = [
  {
    id: "first_login",
    title: "First Login",
    description: "Log in to Budget Buddy for the first time",
    icon: "sparkles",
    unlocked: false,
    points: 10,
  },
  {
    id: "add_transaction",
    title: "Transaction Tracker",
    description: "Add your first transaction",
    icon: "star",
    unlocked: false,
    points: 15,
  },
  {
    id: "create_budget",
    title: "Budget Builder",
    description: "Create your first budget category",
    icon: "trophy",
    unlocked: false,
    points: 20,
  },
  {
    id: "save_money",
    title: "Saving Star",
    description: "Save money for the first time",
    icon: "medal",
    unlocked: false,
    points: 25,
  },
  {
    id: "streak_3",
    title: "Consistency is Key",
    description: "Maintain a 3-day streak",
    icon: "sparkles",
    unlocked: false,
    points: 30,
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "trophy",
    unlocked: false,
    points: 50,
  },
  {
    id: "level_5",
    title: "Rising Star",
    description: "Reach level 5",
    icon: "star",
    unlocked: false,
    points: 100,
  },
  {
    id: "ai_assistant",
    title: "AI Apprentice",
    description: "Use the AI assistant for the first time",
    icon: "sparkles",
    unlocked: false,
    points: 20,
  },
];

const GameContext = createContext<GameContextType>({
  points: 0,
  level: 1,
  levelInfo: levels[0],
  streak: 0,
  achievements: [],
  addPoints: () => {},
  incrementStreak: () => {},
  resetStreak: () => {},
  unlockAchievement: () => {},
  checkAchievements: () => {},
  progressToNextLevel: 0,
});

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  // Initialize game data from localStorage
  useEffect(() => {
    const savedPoints = localStorage.getItem("budget_buddy_points");
    const savedLevel = localStorage.getItem("budget_buddy_level");
    const savedStreak = localStorage.getItem("budget_buddy_streak");
    const savedAchievements = localStorage.getItem("budget_buddy_achievements");
    const savedLastLogin = localStorage.getItem("budget_buddy_last_login");

    if (savedPoints) setPoints(parseInt(savedPoints));
    if (savedLevel) setLevel(parseInt(savedLevel));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
    if (savedLastLogin) setLastLogin(savedLastLogin);

    // Check for daily login and streak
    const today = new Date().toDateString();
    if (savedLastLogin !== today) {
      if (savedLastLogin) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (savedLastLogin === yesterday.toDateString()) {
          // User logged in yesterday, increment streak
          const newStreak = savedStreak ? parseInt(savedStreak) + 1 : 1;
          setStreak(newStreak);
          localStorage.setItem("budget_buddy_streak", newStreak.toString());
          
          if (newStreak === 3) {
            unlockAchievement("streak_3");
          } else if (newStreak === 7) {
            unlockAchievement("streak_7");
          }
          
          toast.success(`${newStreak} Day Streak! 🔥`, {
            description: `You've logged in for ${newStreak} days in a row!`,
          });
        } else {
          // Streak broken
          setStreak(1);
          localStorage.setItem("budget_buddy_streak", "1");
        }
      } else {
        // First login
        setStreak(1);
        localStorage.setItem("budget_buddy_streak", "1");
      }
      
      // Update last login
      localStorage.setItem("budget_buddy_last_login", today);
      setLastLogin(today);
      
      // First login achievement
      const firstLoginAchievement = achievements.find(a => a.id === "first_login");
      if (firstLoginAchievement && !firstLoginAchievement.unlocked) {
        unlockAchievement("first_login");
      }
    }
  }, []);

  // Calculate current level based on points
  useEffect(() => {
    for (let i = levels.length - 1; i >= 0; i--) {
      if (points >= levels[i].minPoints) {
        if (level !== levels[i].level) {
          setLevel(levels[i].level);
          localStorage.setItem("budget_buddy_level", levels[i].level.toString());
          
          if (levels[i].level === 5) {
            unlockAchievement("level_5");
          }
          
          // Show level up notification
          toast.success(`Level Up! 🎉`, {
            description: `You reached level ${levels[i].level}: ${levels[i].title}`,
          });
          
          // Show achievement notification
          const levelUpNotification = document.createElement("div");
          levelUpNotification.className = "achievement-notification";
          levelUpNotification.innerHTML = `
            <div class="p-3 rounded-full bg-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            </div>
            <div>
              <div class="font-bold">Level ${levels[i].level} Unlocked!</div>
              <div class="text-xs opacity-90">${levels[i].title}</div>
            </div>
          `;
          document.body.appendChild(levelUpNotification);
          
          setTimeout(() => {
            levelUpNotification.style.opacity = "0";
            setTimeout(() => {
              document.body.removeChild(levelUpNotification);
            }, 500);
          }, 3000);
        }
        break;
      }
    }
  }, [points, level]);

  // Get current level info
  const levelInfo = levels.find(l => l.level === level) || levels[0];
  
  // Calculate progress to next level
  const progressToNextLevel = level < levels.length
    ? ((points - levelInfo.minPoints) / (levelInfo.maxPoints - levelInfo.minPoints)) * 100
    : 100;

  // Add points and update localStorage
  const addPoints = (amount: number) => {
    const newPoints = points + amount;
    setPoints(newPoints);
    localStorage.setItem("budget_buddy_points", newPoints.toString());
  };

  // Increment streak
  const incrementStreak = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("budget_buddy_streak", newStreak.toString());
  };

  // Reset streak
  const resetStreak = () => {
    setStreak(1);
    localStorage.setItem("budget_buddy_streak", "1");
  };

  // Unlock achievement
  const unlockAchievement = (id: string) => {
    const achievement = achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      const updatedAchievements = achievements.map(a => 
        a.id === id ? { ...a, unlocked: true } : a
      );
      
      setAchievements(updatedAchievements);
      localStorage.setItem("budget_buddy_achievements", JSON.stringify(updatedAchievements));
      
      // Add points for unlocking achievement
      addPoints(achievement.points);
      
      // Show achievement notification
      toast.success(`Achievement Unlocked! 🏆`, {
        description: `${achievement.title}: ${achievement.description}`,
      });
      
      // Icon component based on achievement icon type
      let IconComponent = Sparkles;
      switch(achievement.icon) {
        case "trophy": IconComponent = Trophy; break;
        case "star": IconComponent = Star; break;
        case "medal": IconComponent = Medal; break;
        default: IconComponent = Sparkles;
      }
      
      // Show achievement notification
      const achievementNotification = document.createElement("div");
      achievementNotification.className = "achievement-notification";
      achievementNotification.innerHTML = `
        <div class="p-3 rounded-full bg-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
        </div>
        <div>
          <div class="font-bold">${achievement.title}</div>
          <div class="text-xs opacity-90">${achievement.description}</div>
          <div class="text-xs mt-1">+${achievement.points} points</div>
        </div>
      `;
      document.body.appendChild(achievementNotification);
      
      setTimeout(() => {
        achievementNotification.style.opacity = "0";
        setTimeout(() => {
          document.body.removeChild(achievementNotification);
        }, 500);
      }, 3000);
    }
  };

  // Check achievements based on various criteria
  const checkAchievements = () => {
    // This method can be expanded based on various triggers
    // It's called on important events to check if any achievements have been met
  };

  return (
    <GameContext.Provider
      value={{
        points,
        level,
        levelInfo,
        streak,
        achievements,
        addPoints,
        incrementStreak,
        resetStreak,
        unlockAchievement,
        checkAchievements,
        progressToNextLevel,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

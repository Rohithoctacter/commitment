import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Target, Play, CheckCircle, RefreshCw, Trophy, Heart, Lightbulb, Medal, Crown, Star } from "lucide-react";

interface GoalState {
  mode: 'setup' | 'tracking';
  goalDays: number;
  completedDays: number;
  startDate: string | null;
  lastCheckIn: string | null;
}

export default function Home() {
  const { toast } = useToast();
  const [goalInput, setGoalInput] = useState<string>("");
  const [state, setState] = useState<GoalState>({
    mode: 'setup',
    goalDays: 0,
    completedDays: 0,
    startDate: null,
    lastCheckIn: null
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('commitmentTracker');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        setState(parsedState);
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('commitmentTracker', JSON.stringify(state));
  }, [state]);

  const handleStartGoal = () => {
    const days = parseInt(goalInput);
    if (!days || days < 1 || days > 365) {
      toast({
        title: "Invalid Goal",
        description: "Please enter a number between 1 and 365 days.",
        variant: "destructive"
      });
      return;
    }

    setState({
      mode: 'tracking',
      goalDays: days,
      completedDays: 0,
      startDate: new Date().toISOString(),
      lastCheckIn: null
    });

    toast({
      title: "Goal Started!",
      description: `Your ${days}-day commitment journey has begun. Stay strong!`,
    });
  };

  const handleCheckIn = () => {
    if (state.completedDays >= state.goalDays) {
      toast({
        title: "Goal Already Complete!",
        description: "Congratulations on completing your goal. Start a new one to continue!",
      });
      return;
    }

    const newCompletedDays = state.completedDays + 1;
    const newState = {
      ...state,
      completedDays: newCompletedDays,
      lastCheckIn: new Date().toISOString()
    };

    setState(newState);
    checkMilestones(newCompletedDays);

    toast({
      title: "Day Complete! 🎉",
      description: `You've completed day ${newCompletedDays} of ${state.goalDays}. Keep going!`,
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to start a new goal? This will reset your current progress.")) {
      setState({
        mode: 'setup',
        goalDays: 0,
        completedDays: 0,
        startDate: null,
        lastCheckIn: null
      });
      setGoalInput("");
      
      toast({
        title: "Goal Reset",
        description: "Ready to start a new commitment journey!",
      });
    }
  };

  const setQuickGoal = (days: number) => {
    setGoalInput(days.toString());
  };

  const checkMilestones = (completedDays: number) => {
    const milestones = [7, 14, 21, 30, 60, 90];
    if (milestones.includes(completedDays)) {
      setTimeout(() => {
        toast({
          title: `🏆 Milestone Reached!`,
          description: `${completedDays} days completed! You're building incredible discipline.`,
        });
      }, 500);
    }
  };

  const progressPercentage = state.goalDays > 0 ? Math.round((state.completedDays / state.goalDays) * 100) : 0;
  const remainingDays = state.goalDays - state.completedDays;
  const circumference = 2 * Math.PI * 72; // radius = 72
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastCheckIn = (dateString: string | null) => {
    if (!dateString) return "No check-ins yet";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const getMilestoneMessage = () => {
    const milestones = [
      { days: 7, message: "Week 1 Complete! You're building incredible discipline. Keep going strong!" },
      { days: 14, message: "Two weeks strong! Your willpower is growing every day." },
      { days: 21, message: "21 days! You're forming lasting habits. Amazing progress!" },
      { days: 30, message: "One month achieved! This is a major milestone. You're unstoppable!" },
      { days: 60, message: "Two months! Your dedication is truly inspiring." },
      { days: 90, message: "90 days! You've built incredible mental strength. Congratulations!" }
    ];
    
    return milestones.find(m => m.days === state.completedDays);
  };

  const getAchievements = () => {
    return [
      { 
        minPercent: 0, 
        maxPercent: 10, 
        title: "Iron Beginner", 
        description: "First steps taken!", 
        color: "from-gray-400 to-gray-600",
        textColor: "text-gray-100",
        icon: Medal,
        bgColor: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      },
      { 
        minPercent: 11, 
        maxPercent: 25, 
        title: "Bronze Warrior", 
        description: "Building momentum!", 
        color: "from-amber-600 to-amber-800",
        textColor: "text-amber-100",
        icon: Star,
        bgColor: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800"
      },
      { 
        minPercent: 26, 
        maxPercent: 50, 
        title: "Silver Champion", 
        description: "Strong discipline!", 
        color: "from-slate-400 to-slate-600",
        textColor: "text-slate-100",
        icon: Trophy,
        bgColor: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
      },
      { 
        minPercent: 51, 
        maxPercent: 75, 
        title: "Gold Master", 
        description: "Incredible willpower!", 
        color: "from-yellow-400 to-yellow-600",
        textColor: "text-yellow-100",
        icon: Crown,
        bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800"
      },
      { 
        minPercent: 76, 
        maxPercent: 90, 
        title: "Platinum Elite", 
        description: "Elite self-control!", 
        color: "from-cyan-400 to-cyan-600",
        textColor: "text-cyan-100",
        icon: Star,
        bgColor: "bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900 dark:to-cyan-800"
      },
      { 
        minPercent: 91, 
        maxPercent: 99, 
        title: "Diamond Legend", 
        description: "Legendary dedication!", 
        color: "from-blue-400 to-blue-600",
        textColor: "text-blue-100",
        icon: Crown,
        bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800"
      },
      { 
        minPercent: 100, 
        maxPercent: 100, 
        title: "Platinum Diamond Master", 
        description: "Ultimate achievement!", 
        color: "from-purple-400 via-pink-500 to-purple-600",
        textColor: "text-purple-100",
        icon: Trophy,
        bgColor: "bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-800"
      }
    ];
  };

  const getCurrentAchievement = () => {
    const achievements = getAchievements();
    return achievements.find(achievement => 
      progressPercentage >= achievement.minPercent && progressPercentage <= achievement.maxPercent
    ) || achievements[0];
  };

  const getNextAchievement = () => {
    const achievements = getAchievements();
    const currentIndex = achievements.findIndex(achievement => 
      progressPercentage >= achievement.minPercent && progressPercentage <= achievement.maxPercent
    );
    return currentIndex < achievements.length - 1 ? achievements[currentIndex + 1] : null;
  };

  const renderWeekProgress = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayNumber = state.completedDays - 6 + i;
      const isCompleted = dayNumber > 0 && dayNumber <= state.completedDays;
      const isToday = dayNumber === state.completedDays + 1;
      const isFuture = dayNumber > state.completedDays + 1;
      
      days.push(
        <div
          key={i}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isCompleted
              ? "bg-success text-success-foreground"
              : isToday
              ? "border-2 border-dashed border-border bg-background text-muted-foreground"
              : isFuture
              ? "bg-muted"
              : "bg-muted"
          }`}
          title={
            isCompleted
              ? "Day completed"
              : isToday
              ? "Today"
              : "Future day"
          }
          data-testid={`day-${i}-indicator`}
        >
          {isCompleted && <CheckCircle className="w-4 h-4" />}
          {isToday && "T"}
        </div>
      );
    }
    return days;
  };

  if (state.mode === 'setup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">

        {/* Setup Card */}
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card rounded-2xl shadow-2xl border border-border fade-in backdrop-blur-sm">
            <CardContent className="p-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-semibold text-card-foreground mb-4">Set Your Goal</h2>
                <p className="text-muted-foreground text-lg">Choose how many days you want to commit to your journey</p>
              </div>

              <div className="space-y-8">
                <div>
                  <Label htmlFor="goalDays" className="block text-base font-medium text-card-foreground mb-3">
                    Number of Days
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      id="goalDays"
                      className="w-full p-6 text-center text-3xl font-bold border-2 focus:ring-4 focus:ring-primary/20"
                      placeholder="30"
                      min="1"
                      max="365"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      data-testid="input-goal-days"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg font-medium">
                      days
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="secondary"
                    className="p-4 bg-muted hover:bg-primary hover:text-primary-foreground text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                    onClick={() => setQuickGoal(7)}
                    data-testid="button-quick-7"
                  >
                    7 Days
                  </Button>
                  <Button
                    variant="secondary"
                    className="p-4 bg-muted hover:bg-primary hover:text-primary-foreground text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                    onClick={() => setQuickGoal(30)}
                    data-testid="button-quick-30"
                  >
                    30 Days
                  </Button>
                  <Button
                    variant="secondary"
                    className="p-4 bg-muted hover:bg-primary hover:text-primary-foreground text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                    onClick={() => setQuickGoal(90)}
                    data-testid="button-quick-90"
                  >
                    90 Days
                  </Button>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-foreground font-bold py-6 px-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-xl text-lg"
                  onClick={handleStartGoal}
                  data-testid="button-start-journey"
                >
                  <Play className="mr-3 h-5 w-5" />
                  Start My Journey
                </Button>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-accent/10 to-warning/10 rounded-xl border border-accent/20">
                <p className="text-base text-muted-foreground text-center">
                  <Lightbulb className="inline mr-2 h-5 w-5 text-warning" />
                  Tip: Start with a realistic goal. You can always set a new challenge later!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-base text-muted-foreground">
            <Heart className="inline mr-2 h-5 w-5 text-red-400" />
            Built with discipline in mind
          </p>
        </div>
      </div>
    );
  }

  // Tracking State - Optimized compact layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-3">
      <div className="max-w-7xl mx-auto py-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Days Set */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2" data-testid="text-total-days">
                {state.goalDays}
              </div>
              <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">Days Set</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Your commitment period</div>
            </CardContent>
          </Card>

          {/* Days Done */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2" data-testid="text-completed-days">
                {state.completedDays}
              </div>
              <div className="text-sm font-semibold text-green-700 dark:text-green-300">Days Done</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">Successfully completed</div>
            </CardContent>
          </Card>

          {/* Days Left */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2" data-testid="text-remaining-days">
                {remainingDays}
              </div>
              <div className="text-sm font-semibold text-orange-700 dark:text-orange-300">Days Left</div>
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Keep pushing forward</div>
            </CardContent>
          </Card>

          {/* Percentage Done */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="relative flex items-center justify-center mb-3">
                <svg className="progress-circle w-20 h-20" viewBox="0 0 160 160">
                  <circle 
                    className="stroke-purple-200 dark:stroke-purple-800" 
                    cx="80" 
                    cy="80" 
                    r="60" 
                    strokeWidth="8" 
                    fill="none"
                  ></circle>
                  <circle
                    className="stroke-purple-600 dark:stroke-purple-400"
                    cx="80"
                    cy="80"
                    r="60"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 - (progressPercentage / 100) * 2 * Math.PI * 60}
                    transform="rotate(-90 80 80)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                  ></circle>
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-progress-percentage">
                    {progressPercentage}%
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">Completed</div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Of your goal achieved</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Circle - Left Column */}
          <div className="lg:col-span-1">
            <Card className="bg-card rounded-xl shadow-lg border border-border flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col justify-center">
                <div className="relative flex items-center justify-center mb-4">
                  <svg className="progress-circle w-32 h-32" viewBox="0 0 160 160">
                    <circle className="progress-circle-bg" cx="80" cy="80" r="72"></circle>
                    <circle
                      className="progress-circle-fill"
                      cx="80"
                      cy="80"
                      r="72"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    ></circle>
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {state.completedDays}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">days completed</div>
                    <div className="text-xl font-semibold text-card-foreground">
                      {progressPercentage}%
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-foreground font-bold py-3 px-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-lg text-base"
                  onClick={handleCheckIn}
                  disabled={state.completedDays >= state.goalDays}
                  data-testid="button-check-in"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {state.completedDays >= state.goalDays ? "🎉 Goal Complete!" : "✅ I stayed committed yesterday!"}
                </Button>
                
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Last check-in: <span className="font-medium" data-testid="text-last-checkin">{formatLastCheckIn(state.lastCheckIn)}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Side Content - 2 Columns */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
            {/* Current Achievement */}
            <Card className={`${getCurrentAchievement().bgColor} border-2 shadow-lg flex flex-col`}>
              <CardContent className="p-6 flex-1 flex flex-col justify-center">
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getCurrentAchievement().color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    {(() => {
                      const IconComponent = getCurrentAchievement().icon;
                      return <IconComponent className={`text-2xl ${getCurrentAchievement().textColor}`} />;
                    })()}
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-3" data-testid="achievement-title">
                    {getCurrentAchievement().title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4" data-testid="achievement-description">
                    {getCurrentAchievement().description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {progressPercentage}% Complete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Achievement Preview */}
            {getNextAchievement() && (
              <Card className="bg-gradient-to-br from-muted/50 to-accent/10 border border-dashed border-muted-foreground/30 shadow-lg flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col justify-center">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-muted-foreground mb-4">🎯 Next Achievement</div>
                    <div className={`w-16 h-16 bg-gradient-to-r ${getNextAchievement()!.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg opacity-75`}>
                      {(() => {
                        const IconComponent = getNextAchievement()!.icon;
                        return <IconComponent className={`text-2xl ${getNextAchievement()!.textColor}`} />;
                      })()}
                    </div>
                    <h4 className="text-xl font-bold text-card-foreground mb-3" data-testid="next-achievement-title">
                      {getNextAchievement()!.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4" data-testid="next-achievement-description">
                      Unlock at {getNextAchievement()!.minPercent}% completion
                    </p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className={`bg-gradient-to-r ${getNextAchievement()!.color} h-2 rounded-full transition-all duration-500 opacity-50`}
                        style={{ width: `${Math.min(100, (progressPercentage / getNextAchievement()!.minPercent) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {Math.round((progressPercentage / getNextAchievement()!.minPercent) * 100)}% progress to unlock
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Motivational Quote */}
            <Card className="bg-gradient-to-br from-accent/10 to-warning/10 border border-accent/20 shadow-lg flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-4">💪</div>
                  <h3 className="text-lg font-bold text-card-foreground mb-4">Daily Motivation</h3>
                  <blockquote className="text-sm italic text-muted-foreground leading-relaxed">
                    {progressPercentage === 0 && "Every journey begins with a single step. You've got this!"}
                    {progressPercentage > 0 && progressPercentage < 25 && "Discipline is choosing between what you want now and what you want most."}
                    {progressPercentage >= 25 && progressPercentage < 50 && "You're building incredible mental strength. Keep going!"}
                    {progressPercentage >= 50 && progressPercentage < 75 && "Halfway there! Your willpower is unstoppable."}
                    {progressPercentage >= 75 && progressPercentage < 100 && "The finish line is in sight. Push through to victory!"}
                    {progressPercentage === 100 && "Congratulations! You've mastered self-discipline. You're truly inspiring!"}
                  </blockquote>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Milestone Achievement - Full Width */}
        {getMilestoneMessage() && (
          <Card className="bg-gradient-to-r from-success to-secondary shadow-lg mt-6" data-testid="milestone-message">
            <CardContent className="p-6 text-success-foreground text-center">
              <div className="flex items-center justify-center mb-3">
                <Trophy className="text-3xl mr-3" />
                <span className="font-bold text-2xl">
                  {state.completedDays === 7 && "Week 1 Complete!"}
                  {state.completedDays === 14 && "Two Weeks Strong!"}
                  {state.completedDays === 21 && "21 Days Achieved!"}
                  {state.completedDays === 30 && "One Month Complete!"}
                  {state.completedDays === 60 && "Two Months Strong!"}
                  {state.completedDays === 90 && "90 Days Mastered!"}
                </span>
              </div>
              <p className="text-base opacity-95">{getMilestoneMessage()?.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Achievement Progress Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-card shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-card-foreground mb-4">Achievement Progress</h3>
              <div className="space-y-3">
                {getAchievements().map((achievement, index) => {
                  const current = getCurrentAchievement();
                  const isUnlocked = progressPercentage >= achievement.minPercent;
                  const isCurrent = current.title === achievement.title;
                  
                  return (
                    <div key={index} className={`flex items-center space-x-3 p-2 rounded-lg ${isCurrent ? 'bg-primary/10 border border-primary/20' : isUnlocked ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted/50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUnlocked ? `bg-gradient-to-r ${achievement.color}` : 'bg-muted border-2 border-dashed'} shadow-sm`}>
                        {(() => {
                          const IconComponent = achievement.icon;
                          return <IconComponent className={`text-sm ${isUnlocked ? achievement.textColor : 'text-muted-foreground'}`} />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${isUnlocked ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                          {achievement.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isUnlocked ? '✅ Unlocked' : `Unlock at ${achievement.minPercent}%`}
                        </div>
                      </div>
                      {isCurrent && <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Current</div>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-card-foreground mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm font-medium text-card-foreground">Success Rate</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {state.goalDays > 0 ? Math.round((state.completedDays / state.goalDays) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm font-medium text-card-foreground">Days Remaining</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">{remainingDays}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm font-medium text-card-foreground">Current Streak</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{state.completedDays} days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="text-sm font-medium text-card-foreground">Days Left</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {remainingDays > 0 ? `${remainingDays} to go` : 'Complete!'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-card-foreground mb-4">Motivation Boost</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg border border-success/20">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-sm font-semibold text-card-foreground mb-1">Today's Focus</div>
                  <div className="text-xs text-muted-foreground">Stay committed to your goal</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-warning/10 to-accent/10 rounded-lg border border-warning/20">
                  <div className="text-2xl mb-2">💪</div>
                  <div className="text-sm font-semibold text-card-foreground mb-1">Strength Builder</div>
                  <div className="text-xs text-muted-foreground">Every day makes you stronger</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-100/10 to-pink-100/10 rounded-lg border border-purple-200/20">
                  <div className="text-2xl mb-2">🌟</div>
                  <div className="text-sm font-semibold text-card-foreground mb-1">You've Got This</div>
                  <div className="text-xs text-muted-foreground">Believe in your willpower</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Progress Analytics */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-card-foreground mb-4">Progress Analytics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Goal Completion</span>
                    <span className="font-semibold">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Achievement Progress</span>
                    <span className="font-semibold">
                      {getAchievements().findIndex(a => a.title === getCurrentAchievement().title) + 1} / {getAchievements().length}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${((getAchievements().findIndex(a => a.title === getCurrentAchievement().title) + 1) / getAchievements().length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-card-foreground">{Math.round((state.completedDays / state.goalDays) * 100) || 0}%</div>
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-card-foreground">{state.goalDays > 0 ? Math.ceil(state.goalDays / 7) : 0}</div>
                    <div className="text-xs text-muted-foreground">Total Weeks</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-card-foreground">{Math.ceil(remainingDays / 7)}</div>
                    <div className="text-xs text-muted-foreground">Weeks Left</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-card-foreground mb-4">Journey Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold text-card-foreground">Goal Started</div>
                    <div className="text-xs text-muted-foreground">{formatDate(state.startDate)}</div>
                  </div>
                </div>
                
                {state.completedDays > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-semibold text-card-foreground">Latest Check-in</div>
                      <div className="text-xs text-muted-foreground">{formatLastCheckIn(state.lastCheckIn)}</div>
                    </div>
                  </div>
                )}

                {remainingDays > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-semibold text-card-foreground">Goal Completion</div>
                      <div className="text-xs text-muted-foreground">
                        {remainingDays} days remaining ({new Date(Date.now() + remainingDays * 24 * 60 * 60 * 1000).toLocaleDateString()})
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold text-card-foreground">Current Achievement</div>
                    <div className="text-xs text-muted-foreground">{getCurrentAchievement().title}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips and Insights */}
        <div className="mt-6">
          <Card className="bg-gradient-to-r from-accent/5 to-warning/5 border border-accent/20 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-card-foreground mb-4 text-center">💡 Commitment Tips & Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-2xl mb-2">🧠</div>
                  <div className="text-sm font-semibold text-card-foreground mb-2">Mental Strength</div>
                  <div className="text-xs text-muted-foreground">Discipline is like a muscle - it gets stronger with practice and consistency.</div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-2xl mb-2">⏰</div>
                  <div className="text-sm font-semibold text-card-foreground mb-2">Timing Matters</div>
                  <div className="text-xs text-muted-foreground">Check in daily at the same time to build a strong habit loop.</div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-sm font-semibold text-card-foreground mb-2">Stay Focused</div>
                  <div className="text-xs text-muted-foreground">Remember your 'why' - the deeper reason behind your commitment.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer with Action Button */}
        <div className="mt-8 flex flex-col items-center space-y-4 pb-8">
          <Button
            variant="secondary"
            className="bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground font-semibold py-3 px-6 rounded-lg text-base"
            onClick={handleReset}
            data-testid="button-reset"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Start New Goal
          </Button>
          
          <p className="text-sm text-muted-foreground">
            <Heart className="inline mr-1 h-4 w-4 text-red-400" />
            Built with discipline in mind
          </p>
        </div>
      </div>
    </div>
  );
}

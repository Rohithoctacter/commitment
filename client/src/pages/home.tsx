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
        {/* Header */}
        <div className="text-center mb-8 slide-up">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Target className="text-primary-foreground text-3xl" />
          </div>
        </div>

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

  // Tracking State - Clean professional interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-12 slide-up">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Target className="text-primary-foreground text-4xl" />
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Days Set */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-3" data-testid="text-total-days">
                {state.goalDays}
              </div>
              <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">Days Set</div>
              <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">Your commitment period</div>
            </CardContent>
          </Card>

          {/* Days Done */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-3" data-testid="text-completed-days">
                {state.completedDays}
              </div>
              <div className="text-lg font-semibold text-green-700 dark:text-green-300">Days Done</div>
              <div className="text-sm text-green-600 dark:text-green-400 mt-2">Successfully completed</div>
            </CardContent>
          </Card>

          {/* Days Left */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-3" data-testid="text-remaining-days">
                {remainingDays}
              </div>
              <div className="text-lg font-semibold text-orange-700 dark:text-orange-300">Days Left</div>
              <div className="text-sm text-orange-600 dark:text-orange-400 mt-2">Keep pushing forward</div>
            </CardContent>
          </Card>

          {/* Percentage Done */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-3" data-testid="text-progress-percentage">
                {progressPercentage}%
              </div>
              <div className="text-lg font-semibold text-purple-700 dark:text-purple-300">Completed</div>
              <div className="text-sm text-purple-600 dark:text-purple-400 mt-2">Of your goal achieved</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Progress Circle */}
          <div className="flex flex-col items-center">
            <Card className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md">
              <CardContent className="p-10">
                <div className="relative flex items-center justify-center mb-8">
                  <svg className="progress-circle w-64 h-64" viewBox="0 0 160 160">
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
                    <div className="text-6xl font-bold text-primary mb-2">
                      {state.completedDays}
                    </div>
                    <div className="text-lg text-muted-foreground mb-3">days completed</div>
                    <div className="text-4xl font-semibold text-card-foreground">
                      {progressPercentage}%
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-foreground font-bold py-6 px-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-xl text-xl"
                    onClick={handleCheckIn}
                    disabled={state.completedDays >= state.goalDays}
                    data-testid="button-check-in"
                  >
                    <CheckCircle className="mr-3 h-6 w-6" />
                    {state.completedDays >= state.goalDays ? "🎉 Goal Complete!" : "✅ I stayed committed yesterday!"}
                  </Button>
                  
                  <p className="text-base text-muted-foreground mt-4">
                    Last check-in: <span className="font-medium" data-testid="text-last-checkin">{formatLastCheckIn(state.lastCheckIn)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Motivation & Progress Section */}
          <div className="space-y-8">
            {/* Current Achievement */}
            <Card className={`${getCurrentAchievement().bgColor} border-2 shadow-xl`}>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${getCurrentAchievement().color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl`}>
                    {(() => {
                      const IconComponent = getCurrentAchievement().icon;
                      return <IconComponent className={`text-3xl ${getCurrentAchievement().textColor}`} />;
                    })()}
                  </div>
                  <h3 className="text-3xl font-bold text-card-foreground mb-2" data-testid="achievement-title">
                    {getCurrentAchievement().title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-4" data-testid="achievement-description">
                    {getCurrentAchievement().description}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Current Achievement Level • {progressPercentage}% Complete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Achievement Preview */}
            {getNextAchievement() && (
              <Card className="bg-gradient-to-br from-muted/50 to-accent/10 border border-dashed border-muted-foreground/30 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-muted-foreground mb-3">🎯 Next Achievement</div>
                    <div className="flex items-center justify-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${getNextAchievement()!.color} rounded-full flex items-center justify-center shadow-lg opacity-75`}>
                        {(() => {
                          const IconComponent = getNextAchievement()!.icon;
                          return <IconComponent className={`text-xl ${getNextAchievement()!.textColor}`} />;
                        })()}
                      </div>
                      <div className="text-left">
                        <h4 className="text-xl font-bold text-card-foreground" data-testid="next-achievement-title">
                          {getNextAchievement()!.title}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid="next-achievement-description">
                          Unlock at {getNextAchievement()!.minPercent}% completion
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Motivational Quote */}
            <Card className="bg-gradient-to-br from-accent/10 to-warning/10 border border-accent/20 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-4xl mb-4">💪</div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-4">Daily Motivation</h3>
                  <blockquote className="text-xl italic text-muted-foreground leading-relaxed">
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

            {/* Milestone Achievement */}
            {getMilestoneMessage() && (
              <Card className="bg-gradient-to-r from-success to-secondary shadow-xl" data-testid="milestone-message">
                <CardContent className="p-8 text-success-foreground text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Trophy className="text-4xl mr-3" />
                    <span className="font-bold text-3xl">
                      {state.completedDays === 7 && "Week 1 Complete!"}
                      {state.completedDays === 14 && "Two Weeks Strong!"}
                      {state.completedDays === 21 && "21 Days Achieved!"}
                      {state.completedDays === 30 && "One Month Complete!"}
                      {state.completedDays === 60 && "Two Months Strong!"}
                      {state.completedDays === 90 && "90 Days Mastered!"}
                    </span>
                  </div>
                  <p className="text-lg opacity-95">{getMilestoneMessage()?.message}</p>
                </CardContent>
              </Card>
            )}

            {/* Progress History */}
            <Card className="bg-card shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-6 text-center">This Week's Progress</h3>
                <div className="flex justify-center space-x-3" data-testid="week-progress">
                  {renderWeekProgress()}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-base text-muted-foreground">
                    Goal started on <span className="font-semibold text-card-foreground" data-testid="text-start-date">{formatDate(state.startDate)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            <div className="text-center">
              <Button
                variant="secondary"
                className="bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground font-semibold py-4 px-8 rounded-xl text-lg"
                onClick={handleReset}
                data-testid="button-reset"
              >
                <RefreshCw className="mr-3 h-5 w-5" />
                Start New Goal
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground">
            <Heart className="inline mr-2 h-6 w-6 text-red-400" />
            Built with discipline in mind
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Target, Play, CheckCircle, RefreshCw, Trophy, Heart, Lightbulb } from "lucide-react";

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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="text-center mb-8 slide-up">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Target className="text-primary-foreground text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-card-foreground mb-2">Commitment Tracker</h1>
          <p className="text-muted-foreground text-lg">Build discipline, one day at a time</p>
        </div>

        {/* Setup Card */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-card rounded-xl shadow-xl border border-border fade-in">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-card-foreground mb-3">Set Your Goal</h2>
                <p className="text-muted-foreground">Choose how many days you want to commit to your journey</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="goalDays" className="block text-sm font-medium text-card-foreground mb-2">
                    Number of Days
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      id="goalDays"
                      className="w-full p-4 text-center text-2xl font-semibold"
                      placeholder="30"
                      min="1"
                      max="365"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      data-testid="input-goal-days"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      days
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="secondary"
                    className="p-3 bg-muted hover:bg-primary hover:text-primary-foreground text-sm font-medium"
                    onClick={() => setQuickGoal(7)}
                    data-testid="button-quick-7"
                  >
                    7 Days
                  </Button>
                  <Button
                    variant="secondary"
                    className="p-3 bg-muted hover:bg-primary hover:text-primary-foreground text-sm font-medium"
                    onClick={() => setQuickGoal(30)}
                    data-testid="button-quick-30"
                  >
                    30 Days
                  </Button>
                  <Button
                    variant="secondary"
                    className="p-3 bg-muted hover:bg-primary hover:text-primary-foreground text-sm font-medium"
                    onClick={() => setQuickGoal(90)}
                    data-testid="button-quick-90"
                  >
                    90 Days
                  </Button>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-secondary text-primary-foreground font-semibold py-4 px-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  onClick={handleStartGoal}
                  data-testid="button-start-journey"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start My Journey
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  <Lightbulb className="inline mr-1 h-4 w-4 text-warning" />
                  Tip: Start with a realistic goal. You can always set a new challenge later!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            <Heart className="inline mr-1 h-4 w-4 text-red-400" />
            Built with discipline in mind
          </p>
        </div>
      </div>
    );
  }

  // Tracking State
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8 slide-up">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Target className="text-primary-foreground text-2xl" />
        </div>
        <h1 className="text-3xl font-bold text-card-foreground mb-2">Commitment Tracker</h1>
        <p className="text-muted-foreground text-lg">Build discipline, one day at a time</p>
      </div>

      {/* Tracking Card */}
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-card rounded-xl shadow-xl border border-border">
          <CardContent className="p-8">
            {/* Progress Circle */}
            <div className="relative flex items-center justify-center mb-8">
              <svg className="progress-circle w-48 h-48" viewBox="0 0 160 160">
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
                <div className="text-4xl font-bold text-primary" data-testid="text-completed-days">
                  {state.completedDays}
                </div>
                <div className="text-sm text-muted-foreground">days completed</div>
                <div className="text-2xl font-semibold text-card-foreground mt-1" data-testid="text-progress-percentage">
                  {progressPercentage}%
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-card-foreground" data-testid="text-total-days">
                  {state.goalDays}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Total Days</div>
              </div>
              <div className="text-center p-4 bg-success rounded-lg text-success-foreground">
                <div className="text-2xl font-bold" data-testid="text-completed-stat">
                  {state.completedDays}
                </div>
                <div className="text-xs font-medium opacity-90">Completed</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-card-foreground" data-testid="text-remaining-days">
                  {remainingDays}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Remaining</div>
              </div>
            </div>

            {/* Check-in Button */}
            <div className="space-y-4 mb-6">
              <Button
                className="w-full bg-primary hover:bg-secondary text-primary-foreground font-semibold py-4 px-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 celebration-animation"
                onClick={handleCheckIn}
                disabled={state.completedDays >= state.goalDays}
                data-testid="button-check-in"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {state.completedDays >= state.goalDays ? "Goal Complete!" : "I stayed committed yesterday!"}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Last check-in: <span className="font-medium" data-testid="text-last-checkin">{formatLastCheckIn(state.lastCheckIn)}</span>
                </p>
              </div>
            </div>

            {/* Milestone Message */}
            {getMilestoneMessage() && (
              <div className="bg-gradient-to-r from-success to-secondary p-4 rounded-lg text-success-foreground text-center mb-6" data-testid="milestone-message">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="text-2xl mr-2" />
                  <span className="font-semibold text-lg">
                    {state.completedDays === 7 && "Week 1 Complete!"}
                    {state.completedDays === 14 && "Two Weeks Strong!"}
                    {state.completedDays === 21 && "21 Days Achieved!"}
                    {state.completedDays === 30 && "One Month Complete!"}
                    {state.completedDays === 60 && "Two Months Strong!"}
                    {state.completedDays === 90 && "90 Days Mastered!"}
                  </span>
                </div>
                <p className="text-sm opacity-90">{getMilestoneMessage()?.message}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground font-medium py-3 px-4"
                onClick={handleReset}
                data-testid="button-reset"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Start New Goal
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Goal started on <span className="font-medium" data-testid="text-start-date">{formatDate(state.startDate)}</span>
                </p>
              </div>
            </div>

            {/* Progress History */}
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-card-foreground mb-3 text-center">This Week</h3>
              <div className="flex justify-center space-x-2" data-testid="week-progress">
                {renderWeekProgress()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          <Heart className="inline mr-1 h-4 w-4 text-red-400" />
          Built with discipline in mind
        </p>
      </div>
    </div>
  );
}

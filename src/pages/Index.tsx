
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, User } from 'lucide-react';

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moodEmojis = [
    { emoji: '😊', label: 'Happy', color: 'bg-yellow-200' },
    { emoji: '😌', label: 'Calm', color: 'bg-green-200' },
    { emoji: '😠', label: 'Angry', color: 'bg-red-200' },
    { emoji: '😍', label: 'Excited', color: 'bg-blue-200' },
    { emoji: '😰', label: 'Anxious', color: 'bg-gray-200' },
    { emoji: '😢', label: 'Sad', color: 'bg-purple-200' },
  ];

  const progressData = Array.from({ length: 42 }, (_, i) => ({
    filled: Math.random() > 0.3,
    day: i + 1
  }));

  const satisfactionData = [
    { emotion: 'Happiness', percentage: 51, color: 'bg-yellow-400' },
    { emotion: 'Calmness', percentage: 72, color: 'bg-green-500' },
    { emotion: 'Anger', percentage: 23, color: 'bg-red-400' },
    { emotion: 'Excitement', percentage: 77, color: 'bg-blue-500' },
    { emotion: 'Sadness', percentage: 69, color: 'bg-yellow-300' },
    { emotion: 'Stress', percentage: 93, color: 'bg-gray-400' },
    { emotion: 'Sadness', percentage: 64, color: 'bg-purple-400' },
    { emotion: 'Stress', percentage: 108, color: 'bg-green-600' },
    { emotion: 'Stress', percentage: 101, color: 'bg-red-500' }
  ];

  return (
    <div className="min-h-screen bg-[#E8DDD4] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Greeting Card */}
          <Card className="bg-[#E8DDD4] border-none shadow-none p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-medium">Nixtio</span>
            </div>
            
            <h1 className="text-4xl font-light leading-tight mb-8">
              Hello, <span className="text-black">Nixtio</span><br />
              How do you feel<br />
              about your <span className="font-semibold">current<br />
              emotions?</span>
            </h1>

            <div>
              <h3 className="text-lg font-medium mb-4">Daily Mood Log</h3>
              <div className="flex gap-3">
                {moodEmojis.map((mood, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMood(mood.label)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110 ${
                      selectedMood === mood.label ? 'ring-2 ring-black' : ''
                    } ${mood.color}`}
                  >
                    {mood.emoji}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Progress Card */}
          <Card className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-600 mb-2">Your progress</h2>
                <div className="text-6xl font-light">89%</div>
                <p className="text-sm text-gray-500 mt-2">
                  Of the weekly<br />plan completed
                </p>
              </div>
              <button className="p-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1"></div>
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {progressData.map((day, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full ${
                    day.filled ? 'bg-teal-300' : 'border-2 border-gray-200'
                  }`}
                />
              ))}
            </div>
          </Card>

          {/* Bottom Row Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* My Strengths Card */}
            <Card className="bg-blue-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <h3 className="text-xl font-medium mb-2">My Strengths</h3>
              <p className="text-lg">&amp; Qualities</p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-6 right-6 p-2 hover:bg-blue-300/50"
              >
                <ArrowUp className="w-4 h-4 rotate-45" />
              </Button>
            </Card>

            {/* Build Confidence Card */}
            <Card className="bg-yellow-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <h3 className="text-xl font-medium mb-2">Build</h3>
              <p className="text-lg">Confidence</p>
              <div className="absolute bottom-4 left-8">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 border-2 border-black rounded-full"></div>
                  <div className="absolute top-2 left-4 w-8 h-4 border-t-2 border-black rounded-full"></div>
                  <div className="absolute top-6 left-6 w-2 h-2 bg-black rounded-full"></div>
                  <div className="absolute top-8 left-4 w-6 h-2 border-b-2 border-black rounded-full"></div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-6 right-6 p-2 hover:bg-yellow-300/50"
              >
                <ArrowUp className="w-4 h-4 rotate-45" />
              </Button>
            </Card>

            {/* Diversity Card */}
            <Card className="bg-teal-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <h3 className="text-xl font-medium mb-2">Diversity</h3>
              <p className="text-lg">&amp; Inclusion</p>
              <div className="absolute bottom-4 left-8">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 border-2 border-black rounded-full"></div>
                  <div className="absolute top-4 left-4 w-8 h-8 border-2 border-black rounded-full"></div>
                  <div className="absolute top-6 left-6 w-2 h-2 bg-black rounded-full"></div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-6 right-6 p-2 hover:bg-teal-300/50"
              >
                <ArrowUp className="w-4 h-4 rotate-45" />
              </Button>
            </Card>

            {/* Behavioral Activation Card */}
            <Card className="bg-gray-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <h3 className="text-xl font-medium mb-2">Behavioral</h3>
              <p className="text-lg">Activation</p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-6 right-6 p-2 hover:bg-gray-300/50"
              >
                <ArrowUp className="w-4 h-4 rotate-45" />
              </Button>
            </Card>
          </div>

          {/* Satisfaction Chart Card */}
          <Card className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-medium mb-1">Satisfaction</h2>
                <p className="text-sm text-gray-500">Based on daily mood log</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="font-medium">W</span>
                <span className="text-gray-400">M</span>
              </div>
            </div>

            <div className="space-y-4">
              {satisfactionData.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div 
                    className={`w-12 h-16 rounded-full ${item.color} flex items-end justify-center text-white text-xs font-medium pb-2`}
                    style={{ height: `${Math.max(item.percentage * 0.8, 20)}px` }}
                  >
                    {item.percentage}%
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 mt-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span>Happiness</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Calmness</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Anger</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Excitement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>Sadness</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span>Stress</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

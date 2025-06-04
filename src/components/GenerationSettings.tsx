
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerationSettingsProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const GenerationSettings = ({ apiKey, onApiKeyChange }: GenerationSettingsProps) => {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <Card className="bg-gray-700 border-gray-600 p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="openai-key" className="text-gray-200 font-semibold">
          OpenAI API Key
        </Label>
        <div className="relative">
          <Input
            id="openai-key"
            type={showApiKey ? "text" : "password"}
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          >
            {showApiKey ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400">
          Required for AI image generation. Your key is stored locally and never shared.
        </p>
      </div>
    </Card>
  );
};

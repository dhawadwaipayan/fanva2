
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface GenerationSettingsProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const GenerationSettings = ({ apiKey, onApiKeyChange }: GenerationSettingsProps) => {
  return (
    <Card className="bg-gray-700 border-gray-600 p-4 space-y-3">
      <div>
        <Label htmlFor="openai-key" className="text-gray-200">OpenAI API Key</Label>
        <Input
          id="openai-key"
          type="password"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 mt-1"
        />
        <p className="text-xs text-gray-400 mt-1">
          Required for AI image generation
        </p>
      </div>
    </Card>
  );
};

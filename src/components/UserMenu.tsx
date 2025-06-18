
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-200 hover:text-white"
      >
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-gray-600 text-gray-200">
            {user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:block">{user.email}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-sm text-gray-400 border-b border-gray-600">
              {user.email}
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-gray-200 hover:text-white hover:bg-gray-600 mt-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

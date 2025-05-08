'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { forceAuthReset } from '@/utils/tokenReset';

interface ResetButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  text?: string;
}

export default function ResetButton({ 
  variant = 'destructive', 
  size = 'default',
  className = '',
  text = 'Бүртгэл шинэчлэх'
}: ResetButtonProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    if (isResetting) return;
    
    setIsResetting(true);
    toast.info('Бүртгэл шинэчлэх', {
      description: 'Таны бүртгэлийг бүрэн шинэчилж байна...'
    });
    
    // Use a small timeout to allow the toast to display
    setTimeout(() => {
      try {
        forceAuthReset();
      } catch (error) {
        console.error('Error during auth reset:', error);
        toast.error('Алдаа гарлаа', {
          description: 'Бүртгэл шинэчлэхэд алдаа гарлаа. Хуудсыг дахин ачааллана уу.'
        });
        setIsResetting(false);
      }
    }, 500);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center ${className}`}
      onClick={handleReset}
      disabled={isResetting}
    >
      {isResetting ? (
        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <AlertTriangle className="h-4 w-4 mr-2" />
      )}
      {text}
    </Button>
  );
} 
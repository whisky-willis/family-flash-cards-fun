import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { checkRateLimit } from '@/lib/security';

interface RateLimitedButtonProps extends React.ComponentProps<typeof Button> {
  rateLimitKey: string;
  maxRequests?: number;
  windowMs?: number;
  onRateLimitExceeded?: () => void;
}

export const RateLimitedButton: React.FC<RateLimitedButtonProps> = ({
  rateLimitKey,
  maxRequests = 5,
  windowMs = 60000,
  onRateLimitExceeded,
  onClick,
  children,
  disabled,
  ...props
}) => {
  const [isRateLimited, setIsRateLimited] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!checkRateLimit(rateLimitKey, maxRequests, windowMs)) {
      setIsRateLimited(true);
      onRateLimitExceeded?.();
      
      // Reset rate limit status after window expires
      setTimeout(() => {
        setIsRateLimited(false);
      }, windowMs);
      
      return;
    }

    onClick?.(e);
  };

  return (
    <Button
      {...props}
      disabled={disabled || isRateLimited}
      onClick={handleClick}
    >
      {isRateLimited ? 'Rate limited' : children}
    </Button>
  );
};
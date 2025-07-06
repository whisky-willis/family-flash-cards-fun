import { useEffect } from 'react';
import { validatePassword, PasswordStrength } from '@/lib/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  onValidationChange?: (isValid: boolean) => void;
}

export const PasswordStrengthIndicator = ({
  password,
  onValidationChange
}: PasswordStrengthIndicatorProps) => {
  const strength = validatePassword(password);
  
  useEffect(() => {
    onValidationChange?.(strength.isValid);
  }, [strength.isValid, onValidationChange]);

  if (!password) return null;

  const getStrengthColor = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'Very Weak';
      case 2:
        return 'Weak';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return 'Very Weak';
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex space-x-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full transition-colors ${
              level <= strength.score
                ? getStrengthColor(strength.score)
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Strength text */}
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${
          strength.isValid ? 'text-green-600' : 'text-red-600'
        }`}>
          {getStrengthText(strength.score)}
        </span>
        {strength.isValid && (
          <span className="text-sm text-green-600">✓ Valid</span>
        )}
      </div>

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((feedback, index) => (
            <p key={index} className="text-xs text-red-600">
              • {feedback}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
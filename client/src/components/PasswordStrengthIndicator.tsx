import React, { useMemo } from 'react';
import { useLocale } from '../contexts/LocaleContext';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface StrengthResult {
  score: number;
  level: 'weak' | 'medium' | 'strong' | 'veryStrong';
  color: string;
  percent: number;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const { t } = useLocale();

  const strength = useMemo((): StrengthResult => {
    if (!password) {
      return { score: 0, level: 'weak', color: 'var(--text-disabled)', percent: 0 };
    }

    let score = 0;

    // Length checks
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character type checks
    if (/[a-z]/.test(password)) score += 1; // lowercase
    if (/[A-Z]/.test(password)) score += 1; // uppercase
    if (/[0-9]/.test(password)) score += 1; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score += 1; // special characters

    // Variety bonus
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= 8) score += 1;

    // Determine level
    if (score <= 2) {
      return { score, level: 'weak', color: 'var(--danger)', percent: 25 };
    } else if (score <= 4) {
      return { score, level: 'medium', color: 'var(--warning)', percent: 50 };
    } else if (score <= 6) {
      return { score, level: 'strong', color: 'var(--success)', percent: 75 };
    } else {
      return { score, level: 'veryStrong', color: 'var(--success)', percent: 100 };
    }
  }, [password]);

  const getLevelText = (level: StrengthResult['level']): string => {
    switch (level) {
      case 'weak': return t('account.passwordWeak');
      case 'medium': return t('account.passwordMedium');
      case 'strong': return t('account.passwordStrong');
      case 'veryStrong': return t('account.passwordVeryStrong');
    }
  };

  if (!password) {
    return (
      <div className="mt-1">
        <span className="text-xs text-muted">
          {t('account.passwordRequirements')}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted whitespace-nowrap">
          {t('account.passwordStrength')}:
        </span>
        <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${strength.percent}%`,
              backgroundColor: strength.color,
            }}
          />
        </div>
        <span 
          className="text-xs font-medium whitespace-nowrap"
          style={{ color: strength.color }}
        >
          {getLevelText(strength.level)}
        </span>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;

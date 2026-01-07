import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  showBack?: boolean;
  extra?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Shared PageHeader component for consistent page headers
 * Uses design system tokens for spacing and typography
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backUrl,
  showBack = false,
  extra,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-start gap-4">
        {/* Left side: Back button + Title */}
        <div className="flex items-start gap-4">
          {showBack && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBack}
              className="mt-1 text-muted hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-foreground m-0">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted mt-1 m-0">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Actions */}
        {extra && (
          <div className="flex items-center gap-2">
            {extra}
          </div>
        )}
      </div>

      {/* Optional additional content below header */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

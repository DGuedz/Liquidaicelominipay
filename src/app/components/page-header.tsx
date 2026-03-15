import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function PageHeader({ 
  title, 
  onBack,
  showBackButton = true 
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="px-4 pt-12 pb-6 flex items-center justify-center relative">
      {showBackButton && (
        <button 
          onClick={handleBack}
          className="absolute left-4 w-10 h-10 rounded-full bg-surface-solid flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
      )}
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
    </header>
  );
}

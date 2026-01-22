import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import schoolLogo from "@/assets/school-logo.png";

interface CrossLogoProps {
  className?: string;
  size?: number;
  clickable?: boolean;
}

export const CrossLogo = ({ className, size = 80, clickable = true }: CrossLogoProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (clickable) {
      navigate('/about');
    }
  };

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center", 
        clickable && "cursor-pointer hover:scale-105 transition-transform",
        className
      )}
      onClick={handleClick}
    >
      <img 
        src={schoolLogo}
        alt="Binmaley Catholic School Inc. Logo"
        width={size}
        height={size}
        className="glow-effect smooth-transition object-contain"
      />
    </div>
  );
};
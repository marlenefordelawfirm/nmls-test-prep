import {
  Target,
  CheckCircle2,
  Trophy,
  Flame,
  Zap,
  BookOpen,
  Star,
  GraduationCap,
  TrendingUp,
  LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  target: Target,
  check: CheckCircle2,
  trophy: Trophy,
  flame: Flame,
  zap: Zap,
  book: BookOpen,
  star: Star,
  graduation: GraduationCap,
  muscle: TrendingUp,
};

interface AchievementIconProps {
  icon: string;
  className?: string;
}

export function AchievementIcon({ icon, className = 'w-6 h-6' }: AchievementIconProps) {
  const IconComponent = iconMap[icon] || Trophy;
  return <IconComponent className={className} />;
}

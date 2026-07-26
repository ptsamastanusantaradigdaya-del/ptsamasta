import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function getIcon(name?: string | null, fallback: LucideIcon = Icons.Sparkles): LucideIcon {
  if (!name) return fallback;
  let iconName = name.trim();
  if (iconName === "leaf") iconName = "Leaf";
  if (iconName === "grad") iconName = "GraduationCap";
  if (iconName === "cart") iconName = "ShoppingCart";
  if (iconName === "spark") iconName = "Sparkles";
  
  if (iconName.length > 0) {
    iconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  }
  
  const Comp = (Icons as unknown as Record<string, LucideIcon>)[iconName];
  return Comp ?? fallback;
}

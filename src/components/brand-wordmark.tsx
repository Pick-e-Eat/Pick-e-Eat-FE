import { cn } from "@/shared/utils/cn";
import styles from "./brand-wordmark.module.css";

type BrandWordmarkProps = {
  variant?: "splash" | "menu";
  as?: "h1" | "h2";
  className?: string;
  style?: React.CSSProperties;
};

export function BrandWordmark({
  variant = "splash",
  as: Tag = "h1",
  className,
  style,
}: BrandWordmarkProps) {
  const variantClass = variant === "splash" ? styles.splash : styles.menu;

  return (
    <Tag className={cn(styles.root, variantClass, className)} style={style} aria-label="Pick & Eat">
      <img src="/logo.svg" alt="Pick & Eat" className={styles.logoImage} />
    </Tag>
  );
}

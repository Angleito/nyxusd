import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

interface NyxCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "glow" | "data" | "nft";
  hover?: boolean;
  onClick?: () => void;
}

export const NyxCard: React.FC<NyxCardProps> = ({
  children,
  className,
  variant = "default",
  hover = true,
  onClick,
}) => {
  const cardClasses = clsx(
    "nyx-card",
    {
      "nyx-card-elevated": variant === "elevated",
      "nyx-card-glow": variant === "glow",
      "nyx-card-data": variant === "data",
      "nyx-card-nft": variant === "nft",
      "nyx-card-interactive": onClick,
    },
    className
  );

  if (onClick) {
    return (
      <motion.div
        className={cardClasses}
        onClick={onClick}
        whileHover={hover ? { y: -4 } : {}}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cardClasses}
      whileHover={hover ? { y: -2 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

interface NyxCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const NyxCardHeader: React.FC<NyxCardHeaderProps> = ({ children, className }) => (
  <div className={clsx("nyx-card-header", className)}>{children}</div>
);

interface NyxCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const NyxCardTitle: React.FC<NyxCardTitleProps> = ({ children, className }) => (
  <h3 className={clsx("nyx-card-title", className)}>{children}</h3>
);

interface NyxCardSubtitleProps {
  children: React.ReactNode;
  className?: string;
}

export const NyxCardSubtitle: React.FC<NyxCardSubtitleProps> = ({ children, className }) => (
  <p className={clsx("nyx-card-subtitle", className)}>{children}</p>
);

interface NyxCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const NyxCardContent: React.FC<NyxCardContentProps> = ({ children, className }) => (
  <div className={clsx("nyx-card-content", className)}>{children}</div>
);

interface NyxCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const NyxCardFooter: React.FC<NyxCardFooterProps> = ({ children, className }) => (
  <div className={clsx("nyx-card-footer", className)}>{children}</div>
);
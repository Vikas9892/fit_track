import { CircularProgress } from "@mui/material";
import React from "react";

const Button = ({
  text,
  isLoading,
  isDisabled,
  rightIcon,
  leftIcon,
  type,
  onClick,
  flex,
  small,
  outlined,
  full,
}) => {
  const isActionDisabled = isDisabled || isLoading;

  const baseClasses = `
    rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-medium text-sm cursor-pointer
    ${full ? "w-full" : "w-fit"}
    ${flex ? "flex-1" : ""}
    ${small ? "px-7 py-2.5" : "px-7 py-4 md:px-3 md:py-2 lg:px-7 lg:py-4"}
    ${isActionDisabled ? "opacity-80 cursor-not-allowed" : "hover:shadow-lg active:scale-95"}
  `;

  const typeClasses = outlined
    ? "bg-transparent text-primary border border-primary shadow-none"
    : type === "secondary"
    ? "bg-secondary text-white border border-secondary shadow-[1px_20px_35px_0px_rgba(91,134,229,0.2)]"
    : "bg-primary text-white border border-primary shadow-[1px_20px_35px_0px_rgba(0,122,255,0.2)]";

  return (
    <div
      onClick={() => !isActionDisabled && onClick && onClick()}
      className={`${baseClasses} ${typeClasses}`}
    >
      {isLoading && (
        <CircularProgress
          size={18}
          color="inherit"
        />
      )}
      {leftIcon}
      <span>{text}{isLoading && " . . ."}</span>
      {rightIcon}
    </div>
  );
};

export default Button;

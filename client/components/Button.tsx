import { HTMLAttributes } from "react";

export default function Button({
  icon,
  children,
  className,
  disabled,
  ...rest
}: HTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      className={`bg-gray-800 text-white rounded-full p-2 px-6 ${
        icon ? "pl-4" : ""
      } flex items-center gap-1 hover:opacity-90 text-lg font-medium ${className}`}
      {...rest}
      disabled={disabled}
    >
      {icon}
      {children}
    </button>
  );
}

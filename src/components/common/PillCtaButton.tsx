import type { ButtonHTMLAttributes } from "react";

interface PillCtaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

function joinClassNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function PillCtaButton({ className, type = "button", ...props }: PillCtaButtonProps) {
  return (
    <button
      className={joinClassNames(
        "inline-flex rounded-[999px] bg-cta font-semibold text-white",
        className,
      )}
      type={type}
      {...props}
    />
  );
}

export default PillCtaButton;

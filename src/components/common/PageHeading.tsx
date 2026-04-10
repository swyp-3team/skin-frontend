import type { ReactNode } from "react";

interface PageHeadingProps {
  children: ReactNode;
  className?: string;
}

function joinClassNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function PageHeading({ children, className }: PageHeadingProps) {
  return (
    <h2
      className={joinClassNames(
        "text-page-title leading-[1.4] font-semibold tracking-tight text-slate-950",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export default PageHeading;

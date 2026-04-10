import type { ReactNode } from "react";

interface MobilePageProps {
  children: ReactNode;
  rightSlot?: ReactNode;
  title?: string;
}

function MobilePage({ children, rightSlot, title = "Layerd" }: MobilePageProps) {
  return (
    <section className="mx-auto w-full max-w-[390px] min-h-dvh bg-page-bg px-6 pb-20 pt-4">
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-app-title leading-none font-bold tracking-tight text-slate-950">
          {title}
        </h1>
        {rightSlot}
      </header>
      {children}
    </section>
  );
}

export default MobilePage;

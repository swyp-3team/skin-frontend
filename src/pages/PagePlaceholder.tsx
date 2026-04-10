interface PagePlaceholderProps {
  title: string;
  description: string;
}

function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </section>
  );
}

export default PagePlaceholder;

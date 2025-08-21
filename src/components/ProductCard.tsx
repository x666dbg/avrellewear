type Props = { image?: string; title: string; meta?: string; price: string };

export default function ProductCard({ image, title, meta, price }: Props) {
  return (
    <article className="card card-hover overflow-hidden">
      <div className="relative">
        <div className="aspect-[4/5] w-full bg-slate-100 dark:bg-slate-700/40" />
        {image && (
          <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="p-3">
        {meta && <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{meta}</div>}
        <h3 className="mt-1 text-sm font-medium line-clamp-2">{title}</h3>
        <div className="mt-2 font-semibold">{price}</div>
      </div>
    </article>
  );
}

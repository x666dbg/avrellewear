import Image from "next/image";

type Props = {
  image?: string;
  title: string;
  meta?: string;
  price: string;
};

export default function ProductCard({ image, title, meta, price }: Props) {
  return (
    <article className="card card-hover overflow-hidden">
      {/* <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-700/40"> */}
      <div className="relative aspect-[3/4] bg-neutral-100 dark:bg-neutral-700/40">
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform hover:scale-105"
            priority={false}
          />
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

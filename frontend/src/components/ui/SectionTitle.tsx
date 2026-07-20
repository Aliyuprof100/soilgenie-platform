interface Props {
  title: string;
  subtitle: string;
}

export default function SectionTitle({
  title,
  subtitle,
}: Props) {
  return (
    <div className="mb-14 text-center">

      <h2 className="text-5xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500">
        {subtitle}
      </p>

    </div>
  );
}
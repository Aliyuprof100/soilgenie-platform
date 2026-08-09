interface Props {
  title: string;
  value: string;
  color?: string;
}

export default function StatCard({
  title,
  value,
  color = "text-green-700",
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border hover:shadow-lg transition">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className={`mt-3 text-4xl font-bold ${color}`}>
        {value}
      </h2>
    </div>
  );
}
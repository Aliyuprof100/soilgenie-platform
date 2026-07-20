import Card from "./Card";

interface Props {
  number: string;
  label: string;
}

export default function StatCard({
  number,
  label,
}: Props) {
  return (
    <Card>
      <h3 className="text-5xl font-bold text-green-700">
        {number}
      </h3>

      <p className="mt-3 text-gray-500">
        {label}
      </p>
    </Card>
  );
}
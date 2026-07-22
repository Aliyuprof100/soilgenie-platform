import { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
}

export default function RoleCard({
  title,
  description,
  icon,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`
        w-full rounded-3xl border-2 p-6 text-left transition-all duration-300

        ${
          selected
            ? "border-green-600 bg-green-50 shadow-xl"
            : "border-slate-200 bg-white hover:border-green-400 hover:shadow-lg"
        }
      `}
    >
      <div className="mb-4 text-4xl">
        {icon}
      </div>

      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-2 text-slate-600">
        {description}
      </p>
    </button>
  );
}
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function PasswordInput({
  value,
  onChange,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">

      <input
        className="w-full rounded-xl border p-3 pr-12"
        type={show ? "text" : "password"}
        value={value}
        placeholder="Password"
        onChange={(e) => onChange(e.target.value)}
      />

      <button
        type="button"
        className="absolute right-4 top-4"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>

    </div>
  );
}
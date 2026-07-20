import { Menu, X, Sprout } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui";

const links = [
  { name: "Home", href: "/" },
  { name: "Solutions", href: "#solutions" },
  { name: "Device", href: "#device" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-white">
            <Sprout size={24} />
          </div>

          <div>

            <h1 className="text-xl font-bold text-slate-900">
              SoilGenie
            </h1>

            <p className="-mt-1 text-xs text-slate-500">
              AI Precision Agriculture
            </p>

          </div>

        </Link>

        {/* Desktop Menu */}

        <nav className="hidden items-center gap-8 lg:flex">

          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="font-medium text-slate-600 transition hover:text-green-700"
            >
              {link.name}
            </a>
          ))}

        </nav>

        {/* Desktop Buttons */}

        <div className="hidden items-center gap-4 lg:flex">

          <Link to="/login">
            <Button variant="secondary">
              Login
            </Button>
          </Link>

          <Link to="/register">
            <Button>
              Get Started
            </Button>
          </Link>

        </div>

        {/* Mobile Menu Button */}

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>

      </div>

      {/* Mobile Menu */}

      {open && (

        <div className="border-t bg-white lg:hidden">

          <div className="space-y-4 p-6">

            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-slate-700"
              >
                {link.name}
              </a>
            ))}

            <Link to="/login">
              <Button
                variant="secondary"
                className="w-full"
              >
                Login
              </Button>
            </Link>

            <Link to="/register">
              <Button className="mt-3 w-full">
                Get Started
              </Button>
            </Link>

          </div>

        </div>

      )}

    </header>
  );
}
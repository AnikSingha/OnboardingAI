import { ChevronDown } from "lucide-react";

function NavItem({ text }) {
    return (
      <div className="relative group">
        <button className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
          <span>{text}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    );
  }

export default NavItem
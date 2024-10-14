import Logo from "./Logo";
import NavItem from "./NavItem";

function Header() {
    return (
      <header className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto w-full">
        <Logo />
        <nav className="hidden md:flex space-x-8">
          <NavItem text="Product" />
          <NavItem text="Resource" />
          <NavItem text="Tool" />
        </nav>
        <div className="flex space-x-4">
          <button className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50">
            Sign Up
          </button>
          <button className="px-6 py-2 text-sm font-medium text-white bg-[#5468FF] rounded-full hover:bg-[#4054FF]">
            Contact Sales
          </button>
        </div>
      </header>
    );
  }

export default Header
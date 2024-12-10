import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DropdownMenu = ({ title = 'Menu', platformItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getImageSrc = () => {
    return title.toLowerCase() === 'products' 
      ? '/images/product.png' 
      : '/images/resources.png';
  };

  const handleItemClick = (item) => {
    setIsOpen(false);
    navigate(item.linkTo);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
        id={`${title ? title.toLowerCase() : 'menu'}-menu-button`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {title}
        <ChevronDown className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="fixed inset-x-0 top-20 z-50 flex justify-center px-4 sm:px-6 md:px-8">
          <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
            <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column with image */}
                <div className="hidden lg:block">
                  <div className="relative h-full w-full rounded-lg overflow-hidden">
                    <img
                      src={getImageSrc()}
                      alt={`${title} illustration`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                
                {/* Right columns with menu items */}
                <div className="lg:col-span-2 grid gap-4 grid-cols-2">
                  {platformItems.map((item, index) => (
                    <button
                      key={index}
                      className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150 w-full text-left"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white sm:h-12 sm:w-12">
                        {item.icon}
                      </div>
                      <div className="ml-4">
                        <p className="text-base font-medium text-gray-900">{item.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
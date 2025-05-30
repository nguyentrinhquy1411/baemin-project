'use client';

import { DownOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

interface TypeSelectorProps {
  onTypeChange?: (type: 'all' | 'food' | 'stall') => void;
  selectedType?: 'all' | 'food' | 'stall';
}

const TypeSelector: React.FC<TypeSelectorProps> = ({ 
  onTypeChange = () => {}, 
  selectedType = 'all' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <div className=' flex flex-col cursor-pointer justify-center items-center mb-1' onClick={toggleDropdown}>
        <span
          className=" px-1 rounded uppercase"
        >
          Phân loại
        </span>
        <div className='text-[10px] '>
          <DownOutlined />
        </div>
      </div>      {isOpen && (
        <div className="absolute mt-2 w-96 bg-white shadow-lg rounded p-4 z-10">
          <div className="grid grid-cols-1 gap-2">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="type" 
                checked={selectedType === 'all'}
                onChange={() => onTypeChange('all')}
                className="mr-2"
              />
              Tất cả
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="type" 
                checked={selectedType === 'food'}
                onChange={() => onTypeChange('food')}
                className="mr-2"
              />
              Món Ăn
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="type" 
                checked={selectedType === 'stall'}
                onChange={() => onTypeChange('stall')}
                className="mr-2"
              />
              Quán Ăn
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeSelector;

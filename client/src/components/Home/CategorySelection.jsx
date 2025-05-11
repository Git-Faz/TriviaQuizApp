import React from 'react';

const CategorySelection = ({ onSelectCategory, selectedCategory }) => {
  const categories = [
    { id: 'Computer Science', name: 'Computer Science' },
    { id: 'GK', name: 'General Knowledge' },
    { id: 'Psychology', name: 'Psychology' },
    { id: 'Movies', name: 'Movies' }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`py-2 px-4 h-15 w-auto rounded font-bold text-lg text-black text-center items-center ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-[#3bc7ff] text-black hover:bg-blue-600 hover:text-white'
          } transition`}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategorySelection;
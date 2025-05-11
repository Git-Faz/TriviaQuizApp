import React from 'react';
import { HomeBtn, LogoutBtn } from '../common/Button';
const NavigationButtons = () => {
  return (
    <div className="flex justify-between py-4">
      <HomeBtn />
      <LogoutBtn />
    </div>
  );
};

export default NavigationButtons;
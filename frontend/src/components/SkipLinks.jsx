// Skip Links Component for Keyboard Navigation
import React from 'react';
import './SkipLinks.css';

/**
 * Skip links for keyboard users to jump to main content
 * WCAG 2.4.1 - Bypass Blocks (Level A)
 */
const SkipLinks = () => {
  const handleSkipToMain = (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSkipToNav = (e) => {
    e.preventDefault();
    const navigation = document.getElementById('main-navigation');
    if (navigation) {
      navigation.focus();
      navigation.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="skip-links">
      <a href="#main-content" onClick={handleSkipToMain} className="skip-link">
        Saltar al contenido principal
      </a>
      <a href="#main-navigation" onClick={handleSkipToNav} className="skip-link">
        Saltar a la navegación
      </a>
    </div>
  );
};

export default SkipLinks;

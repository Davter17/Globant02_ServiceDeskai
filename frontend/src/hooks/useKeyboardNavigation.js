// Custom Hook for Keyboard Navigation
import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook for handling keyboard navigation in modal dialogs
 * Implements focus trap and ESC key handling
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback to close the modal
 * @param {Array} focusableSelectors - Custom focusable elements selectors
 */
export const useModalKeyboard = (isOpen, onClose, focusableSelectors = null) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  const defaultFocusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  const selectors = focusableSelectors || defaultFocusableSelectors;

  // Get all focusable elements within modal
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    
    const elements = modalRef.current.querySelectorAll(selectors.join(', '));
    return Array.from(elements);
  }, [selectors]);

  // Handle Tab key for focus trap
  const handleTabKey = useCallback((e) => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements]);

  // Handle Escape key
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Main keyboard event handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        handleTabKey(e);
      } else if (e.key === 'Escape') {
        handleEscapeKey(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleTabKey, handleEscapeKey]);

  // Focus management on modal open/close
  useEffect(() => {
    if (isOpen) {
      // Store current active element
      previousActiveElement.current = document.activeElement;

      // Focus first element in modal
      setTimeout(() => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }, 100);
    } else if (previousActiveElement.current) {
      // Restore focus when modal closes
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isOpen, getFocusableElements]);

  return modalRef;
};

/**
 * Hook for handling keyboard shortcuts
 * 
 * @param {Object} shortcuts - Object with key combinations as keys and handlers as values
 * Example: { 'ctrl+k': handleSearch, 'ctrl+n': handleNew }
 */
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = [];
      
      if (e.ctrlKey) key.push('ctrl');
      if (e.shiftKey) key.push('shift');
      if (e.altKey) key.push('alt');
      if (e.metaKey) key.push('meta');
      
      key.push(e.key.toLowerCase());
      
      const combination = key.join('+');
      
      if (shortcuts[combination]) {
        e.preventDefault();
        shortcuts[combination](e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

/**
 * Hook for handling arrow key navigation in lists
 * 
 * @param {Array} items - Array of items
 * @param {number} selectedIndex - Currently selected index
 * @param {Function} onSelect - Callback when item is selected
 */
export const useArrowNavigation = (items, selectedIndex, onSelect) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!items || items.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
          onSelect(nextIndex);
          break;
        
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
          onSelect(prevIndex);
          break;
        
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            // Trigger click on selected item
            const selectedItem = items[selectedIndex];
            if (selectedItem && selectedItem.onClick) {
              selectedItem.onClick();
            }
          }
          break;
        
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onSelect]);
};

/**
 * Hook for accessible announcements (screen readers)
 * 
 * @returns {Function} announce - Function to announce messages
 */
export const useAnnounce = () => {
  const announcerRef = useRef(null);

  useEffect(() => {
    // Create live region for announcements
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
        announcerRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message, priority = 'polite') => {
    if (!announcerRef.current) return;

    announcerRef.current.setAttribute('aria-live', priority);
    announcerRef.current.textContent = '';
    
    setTimeout(() => {
      announcerRef.current.textContent = message;
    }, 100);
  }, []);

  return announce;
};

export default {
  useModalKeyboard,
  useKeyboardShortcuts,
  useArrowNavigation,
  useAnnounce,
};

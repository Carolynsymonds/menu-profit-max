import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Custom hook for Google Analytics tracking
export const useGATracking = (pageName: string) => {
  const location = useLocation();

  // Track page view on mount and route change
  useEffect(() => {
    try {
      window.gtag?.('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: location.pathname,
      });
    } catch (e) {
      console.log('GA tracking not available');
    }
  }, [location.pathname, pageName]);

  // Track button clicks
  const trackButtonClick = (buttonName: string, buttonId?: string, additionalData?: any) => {
    try {
      window.gtag?.('event', 'button_click', {
        button_name: buttonName,
        button_id: buttonId || buttonName.toLowerCase().replace(/\s+/g, '_'),
        page_name: pageName,
        page_location: window.location.href,
        ...additionalData
      });
    } catch (e) {
      console.log('GA tracking not available');
    }
  };

  // Track file upload
  const trackFileUpload = (fileCount: number, fileType?: string) => {
    try {
      window.gtag?.('event', 'file_upload', {
        page_name: pageName,
        file_count: fileCount,
        file_type: fileType,
        page_location: window.location.href,
      });
    } catch (e) {
      console.log('GA tracking not available');
    }
  };

  // Track scroll events
  const trackScroll = (scrollDepth: number) => {
    try {
      window.gtag?.('event', 'scroll', {
        page_name: pageName,
        scroll_depth: scrollDepth,
        page_location: window.location.href,
      });
    } catch (e) {
      console.log('GA tracking not available');
    }
  };

  // Track form interactions
  const trackFormInteraction = (formName: string, action: string) => {
    try {
      window.gtag?.('event', 'form_interaction', {
        page_name: pageName,
        form_name: formName,
        form_action: action,
        page_location: window.location.href,
      });
    } catch (e) {
      console.log('GA tracking not available');
    }
  };

  return {
    trackButtonClick,
    trackFileUpload,
    trackScroll,
    trackFormInteraction
  };
};

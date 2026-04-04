import { useEffect } from 'react';

export default function useScrollToHash() {
  useEffect(() => {
    const scrollToHashTarget = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));

      if (!id) return;

      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView();
      });
    };

    scrollToHashTarget();
    window.addEventListener('hashchange', scrollToHashTarget);

    return () => {
      window.removeEventListener('hashchange', scrollToHashTarget);
    };
  }, []);
}

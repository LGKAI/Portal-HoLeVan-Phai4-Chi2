import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    // 1. Immediate reset before paint
    resetScroll();

    // 2. Next animation frame
    const rafId = requestAnimationFrame(resetScroll);

    // 3. Fallbacks after layout / async microtasks
    const timer1 = setTimeout(resetScroll, 50);
    const timer2 = setTimeout(resetScroll, 150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;

import { createElement, useEffect } from 'react';

const NAV_SCRIPT_ID = 'teachermate-service-nav';

export default function ServiceHeader() {
  useEffect(() => {
    if (document.getElementById(NAV_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement('script');
    script.id = NAV_SCRIPT_ID;
    script.src = 'https://teachermate.co.kr/service-nav.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return createElement('teachermate-nav', { active: 'Architecture' });
}

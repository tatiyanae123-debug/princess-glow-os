'use client';

import { useEffect } from 'react';

/**
 * Design Review's old meeting room was also serving as the People page.
 * Keep that existing doorway working, but land in the upgraded People world
 * rather than the legacy participant mockup.
 */
export function MeetingPeopleAlias() {
  useEffect(() => {
    const sync = () => {
      const url = new URL(window.location.href);
      if (url.searchParams.get('room') !== 'meeting') return;
      url.searchParams.set('room', 'people');
      window.history.replaceState({}, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return null;
}

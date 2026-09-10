'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getDeepRoomIdentity, type DeepRoomIdentity } from '@/lib/design/deep-room-manifest';

const TODAY_QUERY_IDENTITIES: Record<string, Pick<DeepRoomIdentity,'id'|'domain'|'material'|'enclosure'|'purpose'>> = {
  morning:{id:'today-morning',domain:'today-morning',material:'morning-light',enclosure:'open',purpose:'Progress through wake, energy, routine, commitments, food, beauty and leaving needs.'},
  'what-now':{id:'today-what-now',domain:'today',material:'temporal-editorial',enclosure:'structured',purpose:'Resolve what deserves attention now and what action comes next.'},
  focus:{id:'today-focus',domain:'today-focus',material:'quiet-focus',enclosure:'protected',purpose:'Narrow the world to the current action while keeping Glow Current and Shakti alive.'},
  meeting:{id:'today-meeting',domain:'today-between',material:'transition-field',enclosure:'structured',purpose:'Hold current commitment context, preparation and immediate next movement together.'},
  'next-up':{id:'today-next-up',domain:'today-between',material:'transition-field',enclosure:'open',purpose:'Show the next transition without turning Today into a list of widgets.'},
  later:{id:'today-later',domain:'today-between',material:'transition-field',enclosure:'open',purpose:'Keep later commitments attached to the same temporal current.'},
  tonight:{id:'today-tonight',domain:'today-evening',material:'smoky-rose',enclosure:'open',purpose:'Transition toward closure, care, reset and tomorrow preparation.'},
  tomorrow:{id:'today-tomorrow',domain:'today-evening',material:'lamp-pearl',enclosure:'open',purpose:'Preview tomorrow while remaining attached to Today.'},
  replan:{id:'today-replan',domain:'today-between',material:'future-state',enclosure:'protected',purpose:'Edit the remainder of the day as a proposed future before committing changes.'},
  'day-view':{id:'today-day-view',domain:'today',material:'temporal-editorial',enclosure:'structured',purpose:'See now, next, later, tonight and tomorrow as regions of one continuous day.'},
};

export function DeepRoomAtmosphere() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roomQuery = searchParams.get('room') ?? '';

  useEffect(() => {
    let room = getDeepRoomIdentity(pathname);
    if (pathname === '/today' && TODAY_QUERY_IDENTITIES[roomQuery]) {
      room = { ...TODAY_QUERY_IDENTITIES[roomQuery], match:'/today', world:'today' };
    }

    const body = document.body;
    const keys = ['glowWorld','glowDomain','glowMaterial','glowEnclosure','glowRoom'] as const;

    if (!room) {
      keys.forEach((key) => delete body.dataset[key]);
      return;
    }

    body.dataset.glowWorld = room.world;
    body.dataset.glowDomain = room.domain;
    body.dataset.glowMaterial = room.material;
    body.dataset.glowEnclosure = room.enclosure;
    body.dataset.glowRoom = room.id;

    return () => keys.forEach((key) => delete body.dataset[key]);
  }, [pathname, roomQuery]);

  return null;
}

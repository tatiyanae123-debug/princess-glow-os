import { LifeBodyReferenceRoom } from './life-body-reference-room';
import { LifeReferenceRoom } from './life-reference-room';

export type LifeRoomId =
  | 'body'
  | 'beauty'
  | 'closet'
  | 'food'
  | 'home'
  | 'money'
  | 'work'
  | 'relationships'
  | 'travel';

const LIFE_ROOMS: Record<LifeRoomId, true> = {
  body: true,
  beauty: true,
  closet: true,
  food: true,
  home: true,
  money: true,
  work: true,
  relationships: true,
  travel: true,
};

export function isLifeRoomId(value: string | undefined): value is LifeRoomId {
  return Boolean(value && value in LIFE_ROOMS);
}

export function LifeWing({ room, connectedCount }: { room: LifeRoomId; connectedCount: number }) {
  if (room === 'body') {
    return <LifeBodyReferenceRoom connectedCount={connectedCount} />;
  }

  return <LifeReferenceRoom room={room} connectedCount={connectedCount} />;
}

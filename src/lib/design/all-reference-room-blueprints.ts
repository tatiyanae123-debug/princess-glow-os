import { blueprintForRoom as baseBlueprintForRoom, type ReferenceRoomBlueprint } from '@/lib/design/reference-room-blueprints';
import { EXTRA_REFERENCE_ROOM_BLUEPRINTS } from '@/lib/design/reference-room-blueprints-extra';
import { DAILY_REFERENCE_ROOM_BLUEPRINTS } from '@/lib/design/reference-room-blueprints-daily';

export type { ReferenceRoomBlueprint } from '@/lib/design/reference-room-blueprints';

export function blueprintForRoom(room:string):ReferenceRoomBlueprint{
  return DAILY_REFERENCE_ROOM_BLUEPRINTS[room]??EXTRA_REFERENCE_ROOM_BLUEPRINTS[room]??baseBlueprintForRoom(room);
}

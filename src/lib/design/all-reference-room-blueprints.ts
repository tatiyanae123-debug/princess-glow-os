import { blueprintForRoom as baseBlueprintForRoom, type ReferenceRoomBlueprint } from '@/lib/design/reference-room-blueprints';
import { EXTRA_REFERENCE_ROOM_BLUEPRINTS } from '@/lib/design/reference-room-blueprints-extra';
import { DAILY_REFERENCE_ROOM_BLUEPRINTS } from '@/lib/design/reference-room-blueprints-daily';

export type { ReferenceRoomBlueprint } from '@/lib/design/reference-room-blueprints';

function simplify(spec:ReferenceRoomBlueprint):ReferenceRoomBlueprint{
  const primaryLimit = spec.layout==='calendar'?9:spec.layout==='desk'?6:spec.layout==='ritual'?8:spec.layout==='garden'?8:spec.layout==='world'?8:spec.layout==='notes'?8:spec.layout==='settings'?6:4;
  const secondaryLimit = spec.layout==='calendar'?7:spec.layout==='board'?7:spec.layout==='ritual'?5:spec.layout==='world'?6:spec.layout==='lab'?6:5;
  return {
    ...spec,
    metrics: spec.metrics.slice(0,4),
    primary: spec.primary.slice(0,primaryLimit),
    secondary: spec.secondary.slice(0,secondaryLimit),
    rail: spec.rail.slice(0,3),
  };
}

export function blueprintForRoom(room:string):ReferenceRoomBlueprint{
  const source=DAILY_REFERENCE_ROOM_BLUEPRINTS[room]??EXTRA_REFERENCE_ROOM_BLUEPRINTS[room]??baseBlueprintForRoom(room);
  return simplify(source);
}

import { AppShell } from '@/components/app-shell';
import { Batch10AllRoomsView } from '@/components/batch10/special-features-reference';
import { CorpusRoomDirectory } from '@/components/knowledge/corpus-room-directory';
export const dynamic='force-dynamic';
export default function AllRoomsPage(){return <AppShell><div className="space-y-6"><Batch10AllRoomsView/><CorpusRoomDirectory/></div></AppShell>}

import {redirect} from 'next/navigation';
export default async function CanonicalUpgradeRoute({params}:{params:Promise<{room:string;tool:string}>}){const {room,tool}=await params;redirect(`/upgrade/${encodeURIComponent(room)}/${encodeURIComponent(tool)}`)}

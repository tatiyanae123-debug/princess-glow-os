'use server';

import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { taskDependencies } from '@/db/schema/adaptive-os';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function uid(){const s=await auth();if(!s?.user?.id)redirect('/sign-in');return s.user.id;}

export async function createDependencyAction(formData:FormData){const userId=await uid();const predecessorId=String(formData.get('predecessorId')??'');const successorId=String(formData.get('successorId')??'');const dependencyType=String(formData.get('dependencyType')??'blocks');if(!predecessorId||!successorId||predecessorId===successorId)return;await db.insert(taskDependencies).values({userId,predecessorType:'task',predecessorId,successorType:'task',successorId,dependencyType});revalidatePath('/tasks');revalidatePath('/today');}

export async function deleteDependencyAction(id:string){const userId=await uid();await db.delete(taskDependencies).where(and(eq(taskDependencies.id,id),eq(taskDependencies.userId,userId)));revalidatePath('/tasks');revalidatePath('/today');}

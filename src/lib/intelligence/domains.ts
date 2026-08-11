export type DomainState<T> = {
  status: 'ready' | 'empty';
  items: T[];
  message: string;
};

export type FitnessSignal = { label: string; value: string; recordedAt?: Date };
export type BeautySignal = { label: string; value: string; recordedAt?: Date };
export type FinanceSignal = { label: string; value: number; recordedAt?: Date };
export type HomeSignal = { label: string; completed: boolean; recordedAt?: Date };

export const emptyFitnessState: DomainState<FitnessSignal> = { status: 'empty', items: [], message: 'Add fitness records to unlock fitness intelligence.' };
export const emptyBeautyState: DomainState<BeautySignal> = { status: 'empty', items: [], message: 'Add beauty inventory or routine records to unlock beauty intelligence.' };
export const emptyFinanceState: DomainState<FinanceSignal> = { status: 'empty', items: [], message: 'Add finance records to unlock cash-flow and spending intelligence.' };
export const emptyHomeState: DomainState<HomeSignal> = { status: 'empty', items: [], message: 'Add home reset records to unlock home intelligence.' };

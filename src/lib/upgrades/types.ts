export type UpgradeKind = 'route' | 'entity' | 'relations' | 'insight' | 'history' | 'planning' | 'review' | 'rules' | 'search' | 'capture';

export type UpgradeField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'select' | 'checkbox';
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

export type RoomUpgrade = {
  id: string;
  label: string;
  description: string;
  kind: UpgradeKind;
  href?: string;
  entityType?: string;
  fields?: UpgradeField[];
  scope?: string[];
  prompt?: string;
};

export type RoomUpgradeSet = {
  key: string;
  label: string;
  path: string;
  upgrades: readonly RoomUpgrade[];
};

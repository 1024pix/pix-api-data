import { UUID } from 'crypto';

export type UserCommand = {
  requestId: UUID;
  params: UserCommandParam[];
};

export type UserCommandParam = {
  name: string;
  value: string | number | boolean | string[] | number[];
};

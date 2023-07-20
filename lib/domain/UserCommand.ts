import { UUID } from 'crypto';

type UserCommand = {
  requestId: UUID;
  params: UserCommandParam[];
};

type UserCommandParam = {
  name: string;
  value: string | number | boolean | string[] | number[];
};

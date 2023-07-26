import type { UUID } from 'crypto';

export class User {
  id: UUID;
  username: string;
  hashedPassword: string;

  constructor(id: UUID, username: string, hashedPassword: string) {
    this.id = id;
    this.username = username;
    this.hashedPassword = hashedPassword;
  }
}

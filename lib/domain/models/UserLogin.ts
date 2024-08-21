import type { UUID } from 'node:crypto';

import { config } from '../../common/config.js';

class UserLogin {
  id: number;
  userId: UUID;
  failureCount: number;
  temporaryBlockedUntil: Date;
  blockedAt?: Date;
  lastLoggedAt?: Date;
  updatedAt: Date;

  constructor({
    id,
    userId,
    failureCount = 0,
    temporaryBlockedUntil,
    blockedAt,
    lastLoggedAt,
    updatedAt,
  }) {
    this.id = id;
    this.userId = userId;
    this.failureCount = failureCount;
    this.temporaryBlockedUntil = temporaryBlockedUntil;
    this.blockedAt = blockedAt;
    this.lastLoggedAt = lastLoggedAt;
    this.updatedAt = updatedAt;
  }

  failedAttempt() {
    this.incrementFailureCount();
    if (this.shouldMarkUserAsBlocked()) {
      this.markUserAsBlocked();
    }
    else if (this.shouldMarkUserAsTemporarilyBlocked()) {
      this.markUserAsTemporarilyBlocked();
    }
  }

  successfulAttempt() {
    if (this.hasFailedAtLeastOnce()) {
      this.resetUserTemporaryBlocking();
    }
    this.lastLoggedAt = new Date();
  }

  incrementFailureCount() {
    this.failureCount++;
  }

  isUserMarkedAsTemporaryBlocked() {
    const now = new Date();
    return !!this.temporaryBlockedUntil && this.temporaryBlockedUntil > now;
  }

  resetUserTemporaryBlocking() {
    this.failureCount = 0;
    this.temporaryBlockedUntil = null;
  }

  shouldMarkUserAsTemporarilyBlocked() {
    return this.failureCount % config.login.temporaryBlockingThresholdFailureCount === 0;
  }

  markUserAsTemporarilyBlocked() {
    const commonRatio = 2 ** (this.failureCount / config.login.temporaryBlockingThresholdFailureCount - 1);
    this.temporaryBlockedUntil = new Date(Date.now() + config.login.temporaryBlockingBaseTimeMs * commonRatio);
  }

  hasFailedAtLeastOnce() {
    return this.failureCount > 0 || !!this.temporaryBlockedUntil;
  }

  shouldMarkUserAsBlocked() {
    return this.failureCount >= config.login.blockingLimitFailureCount;
  }

  markUserAsBlocked() {
    this.blockedAt = new Date();
  }

  resetUserBlocking() {
    this.failureCount = 0;
    this.temporaryBlockedUntil = null;
    this.blockedAt = null;
  }

  isUserMarkedAsBlocked() {
    return !!this.blockedAt;
  }
}

export { UserLogin };

import { randomBytes } from 'node:crypto';

export function generateSensorKey(): string {
  return randomBytes(16).toString('hex');
}

import test from 'node:test';
import assert from 'node:assert/strict';

// Helper validator replicating the exact rules logic for pure verification of invariants
function isValidId(id: unknown): boolean {
  return typeof id === 'string' && id.length > 0 && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
}

function isValidGreenActivityPayload(data: Record<string, any>, authUid: string): { valid: boolean; reason?: string } {
  const requiredKeys = ['id', 'userId', 'userName', 'category', 'title', 'metricDescription', 'pointsAwarded', 'townshipId', 'createdAt'];
  const allowedKeys = ['id', 'userId', 'userName', 'category', 'title', 'metricDescription', 'pointsAwarded', 'townshipId', 'notes', 'timestamp', 'createdAt'];

  for (const k of requiredKeys) {
    if (!(k in data)) return { valid: false, reason: `Missing required key: ${k}` };
  }
  for (const k of Object.keys(data)) {
    if (!allowedKeys.includes(k)) return { valid: false, reason: `Disallowed shadow key: ${k}` };
  }
  if (data.userId !== authUid) return { valid: false, reason: 'Identity spoofing: userId != auth.uid' };
  if (!isValidId(data.id)) return { valid: false, reason: 'Invalid ID pattern' };
  if (typeof data.title !== 'string' || data.title.length === 0 || data.title.length > 150) {
    return { valid: false, reason: 'Title exceeds boundary limits' };
  }
  if (typeof data.metricDescription !== 'string' || data.metricDescription.length > 150) {
    return { valid: false, reason: 'Metric description exceeds boundary limits' };
  }
  if (typeof data.pointsAwarded !== 'number' || data.pointsAwarded < 0 || data.pointsAwarded > 1000) {
    return { valid: false, reason: 'Points awarded out of bounds' };
  }
  return { valid: true };
}

function isValidManagerNotePayload(data: Record<string, any>, authUid: string, isManager: boolean): { valid: boolean; reason?: string } {
  if (!isManager) return { valid: false, reason: 'User is not a verified township manager' };
  if (data.authorId !== authUid) return { valid: false, reason: 'Author ID mismatch' };
  if (!isValidId(data.id)) return { valid: false, reason: 'Invalid note ID' };
  if (typeof data.content !== 'string' || data.content.length === 0 || data.content.length > 1000) {
    return { valid: false, reason: 'Content exceeds boundary' };
  }
  return { valid: true };
}

test('Dirty Dozen Payload 1: Blocks spoofed resident userId in green activities', () => {
  const spoofedPayload = {
    id: 'act-123',
    userId: 'victim_resident_uid',
    userName: 'Victim User',
    category: 'tree_planting',
    title: 'Planted 2 Trees',
    metricDescription: '2 saplings',
    pointsAwarded: 100,
    townshipId: 'elmina',
    createdAt: new Date().toISOString(),
  };
  const result = isValidGreenActivityPayload(spoofedPayload, 'attacker_uid');
  assert.equal(result.valid, false);
  assert.match(result.reason!, /Identity spoofing/);
});

test('Dirty Dozen Payload 3: Blocks shadow/arbitrary field injection', () => {
  const shadowPayload = {
    id: 'act-123',
    userId: 'legit_uid',
    userName: 'Legit User',
    category: 'cycling',
    title: 'Cycled 10km',
    metricDescription: '10 km',
    pointsAwarded: 25,
    townshipId: 'elmina',
    createdAt: new Date().toISOString(),
    adminOverride: true, // injected shadow field
  };
  const result = isValidGreenActivityPayload(shadowPayload, 'legit_uid');
  assert.equal(result.valid, false);
  assert.match(result.reason!, /Disallowed shadow key/);
});

test('Dirty Dozen Payload 4: Blocks oversized denial-of-wallet string', () => {
  const oversizedPayload = {
    id: 'act-123',
    userId: 'legit_uid',
    userName: 'Legit User',
    category: 'cycling',
    title: 'Cycled 10km',
    metricDescription: 'A'.repeat(5000), // 5KB string
    pointsAwarded: 25,
    townshipId: 'elmina',
    createdAt: new Date().toISOString(),
  };
  const result = isValidGreenActivityPayload(oversizedPayload, 'legit_uid');
  assert.equal(result.valid, false);
  assert.match(result.reason!, /boundary limits/);
});

test('Dirty Dozen Payload 5: Blocks negative or malicious points injection', () => {
  const negativePointsPayload = {
    id: 'act-123',
    userId: 'legit_uid',
    userName: 'Legit User',
    category: 'cycling',
    title: 'Cycled 10km',
    metricDescription: '10 km',
    pointsAwarded: -500,
    townshipId: 'elmina',
    createdAt: new Date().toISOString(),
  };
  const result = isValidGreenActivityPayload(negativePointsPayload, 'legit_uid');
  assert.equal(result.valid, false);
  assert.match(result.reason!, /Points awarded out of bounds/);
});

test('Dirty Dozen Payload 6: Blocks non-manager from publishing manager notes', () => {
  const notePayload = {
    id: 'note-1',
    townshipId: 'elmina',
    title: 'Heat Emergency Warning',
    zoneId: 'Elmina Central Park',
    category: 'heat_advisory',
    content: 'All trails closed immediately.',
    authorId: 'resident_uid',
    authorName: 'Random Resident',
    createdAt: new Date().toISOString(),
  };
  const result = isValidManagerNotePayload(notePayload, 'resident_uid', false);
  assert.equal(result.valid, false);
  assert.match(result.reason!, /not a verified township manager/);
});

test('Dirty Dozen Payload 10: Blocks path poisoning with directory traversal or illegal chars', () => {
  assert.equal(isValidId('../../../etc/passwd'), false);
  assert.equal(isValidId('hack$id!'), false);
  assert.equal(isValidId(''), false);
  assert.equal(isValidId('valid-id_123'), true);
});

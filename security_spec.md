# Security Specification: ClimaSense AI

## 1. Data Invariants & Zero-Trust Access Control
1. **Identity & Ownership Invariant**:
   - Every `green_activities` record must have `userId == request.auth.uid`. No resident may write or log activities on behalf of another user.
   - Resident can only read their own logged green activities (`resource.data.userId == request.auth.uid`).
   - Every `reward_balances` record must have path `{userId} == request.auth.uid` and internal `userId == request.auth.uid`.
2. **Role-Based Access Invariant (Manager Authority)**:
   - Authority as a `township_manager` is verified by the existence of `/databases/$(database)/documents/managers/$(request.auth.uid)`.
   - Normal residents (`role == 'resident'`) CANNOT modify `township_configs/{townshipId}` or create/update/delete `manager_notes/{noteId}`.
   - Self-assigned privilege escalation is strictly blocked: a user creating their `/users/{userId}` profile cannot set `role: 'township_manager'` unless verified in `managers/{userId}`.
3. **Immutability Invariant**:
   - In `green_activities`, `id`, `userId`, `townshipId`, and `createdAt` are immutable after creation.
   - In `reward_balances`, `userId` is immutable.
   - In `manager_notes`, `id`, `authorId`, and `createdAt` are immutable.
4. **Structural & Bounds Invariant**:
   - String fields must satisfy strict bounds (e.g. title <= 150 chars, content <= 1000 chars, notes <= 500 chars).
   - Numerical values must be within valid physical / operational bounds (e.g. points >= 0).
   - Document ID path parameters must satisfy `isValidId(id)` regex `^[a-zA-Z0-9_\-]+$` and `<= 128` chars.
5. **PII Isolation Invariant**:
   - User profile `/users/{userId}` can only be read and written by the authenticated owner (`request.auth.uid == userId`) or a verified manager.

---

## 2. The Dirty Dozen Attack Payloads
1. **Payload 1 (Spoofed Resident Activity Log)**: An attacker submits a `green_activities` document with `userId: "victim_uid"` while authenticated as `attacker_uid`.
2. **Payload 2 (Unauthenticated Green Activity Creation)**: Unauthenticated visitor attempts to write to `green_activities`.
3. **Payload 3 (Arbitrary Field Injection in Activity)**: Attacker attempts to inject shadow keys (`{ adminOverride: true, approvedBy: "god" }`) into `green_activities`.
4. **Payload 4 (Oversized Denial-of-Wallet Payload)**: Attacker sends a 50KB string in `metricDescription` to exhaust storage/bandwidth.
5. **Payload 5 (Negative / Malicious Points Injection)**: Attacker attempts to award `-99999` or non-numeric points in an activity.
6. **Payload 6 (Resident Writing Township Manager Notes)**: Normal resident user attempts to create a document in `/manager_notes`.
7. **Payload 7 (Resident Modifying Township Thresholds)**: Normal resident user attempts to overwrite `township_configs/elmina`.
8. **Payload 8 (Self-Promotion Privilege Escalation)**: Resident tries to update their profile document `/users/{userId}` with `role: "township_manager"`.
9. **Payload 9 (Cross-User Reward Points Theft/Tamper)**: Attacker tries to modify `reward_balances/{victim_uid}` to zero out their points.
10. **Payload 10 (Path Poisoning Attack)**: Attacker uses a 2KB junk character string or directory traversal `../` as document ID.
11. **Payload 11 (Immutable Field Tamper)**: User updates `green_activities/{id}` attempting to change `createdAt` or `userId`.
12. **Payload 12 (Blanket List Leakage)**: Attacker attempts an unbounded `getDocs(collection(db, 'green_activities'))` without a `where("userId", "==", auth.uid)` filter.

---

## 3. Automated Test Blueprint
The companion `firestore.rules.test.ts` validates that every one of these malicious payloads returns `PERMISSION_DENIED`.

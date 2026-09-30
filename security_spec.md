# Security Specification: BookCycle Firestore Rules

## 1. Data Invariants
- A book document in `/books/{bookId}` must be valid according to the Book schema:
  - Required fields: `title`, `classLevel`, `subject`, `condition`, `pickupLocation`, `status`.
  - Condition must be one of `['Like New', 'Very Good', 'Good', 'Fair']`.
  - Status must be one of `['available', 'taken', 'claimed']`.
  - String sizes must be bounded: `title` <= 200, `classLevel` <= 50, `subject` <= 60, `pickupLocation` <= 200, `notes` <= 1000, `photoUrl` <= 500000.
- All users (students, parents, donors) can read book listings to find and browse available textbooks.
- Anyone can create a new valid book listing to donate a textbook.
- Updates are constrained: status transitions (e.g. marking as taken/available), or updating notes/details.
- Document IDs must be valid alphanumeric strings (`^[a-zA-Z0-9_\\-]+$`) under 128 characters.

## 2. The Dirty Dozen Payloads (Forbidden Operations)
1. Injecting an invalid condition: `{ "condition": "Broken" }`
2. Setting an invalid status: `{ "status": "deleted" }`
3. Exceeding title character bounds (> 200 characters)
4. Exceeding notes character bounds (> 1000 characters)
5. Missing required field `title`
6. Missing required field `classLevel`
7. Missing required field `subject`
8. Missing required field `pickupLocation`
9. Missing required field `status`
10. Attempting to write non-string types for `title` (e.g., number or array)
11. Injecting arbitrary shadow fields outside the allowed schema keys
12. Attempting to access or write with a poisoned path variable ID (> 128 chars or illegal characters)

## 3. Operations & Access
- `read`: Open to all visitors so students can search and browse textbooks across devices without requiring login.
- `create`: Allowed if incoming payload is a valid Book entity.
- `update`: Allowed if incoming payload conforms to valid Book schema and changes status or book fields cleanly.
- `delete`: Allowed so donors can remove their listing when desired.

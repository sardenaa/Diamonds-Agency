# Firestore Security Specification

This document defines the security boundaries, data invariants, and verification payloads for the MAS Agency application.

## 1. Data Invariants

1.  **Chat Ownership**: A user can only view, create, or update chatbot sessions where the `userId` matches their authenticated Firebase UID (`request.auth.uid`).
2.  **Message Subcollection Rules**: Chat messages can only be added to a parent chat document that is owned by the same user.
3.  **Ticket Integrity**: Users can only create or view support tickets matching their authenticated UID (`request.auth.uid`).
4.  **Staff Escalation**: Staff can read and write all tickets and ticket messages to respond to customer inquiries, but standard users cannot modify or write messages claiming to be staff.
5.  **Immutability**: Crucial structural keys (such as `userId`, `createdAt`, `userEmail`) are immutable once a document has been created.
6.  **Temporal Consistency**: All creation and update timestamps must be verified via server timestamps (`request.time`).

## 2. The Dirty Dozen (Malicious Payloads)

Here are the 12 attack vectors designed to fail authorization checks under the fortress security model:

1.  **Anonymous Chat Hijack**: Attempting to read a chat document with `request.auth == null`.
2.  **User Impersonation in Chat**: Attempting to create a chat with `userId` of another user.
3.  **Staff Message Forgery**: Attempting to write a message inside a ticket with `sender: "staff"` from a standard user account.
4.  **PII Harvesting**: Querying the `/chats` collection without specifying a where filter on `userId`.
5.  **Junk ID Poisoning**: Trying to create a chat document with a very long ID (`chatId.size() > 128` or bad characters) to cause Denial of Wallet.
6.  **Immortal Field Overwrite**: Attempting to change `createdAt` or `userId` in an existing chat.
7.  **Future Timestamps**: Submitting a client-generated future `createdAt` value instead of `request.time`.
8.  **Status Bypass**: Modifying a closed/resolved ticket status directly back to open without permissions.
9.  **Relational Break**: Creating a chat message under a non-existent chat document.
10. **Huge Content Exhaustion**: Sending a message text payload that exceeds `5000` characters.
11. **Spoofed Email Privilege**: Creating a ticket where `userEmail` does not match `request.auth.token.email`.
12. **Unauthorized Ticket Sniffing**: Attempting to get a ticket belonging to another customer.

## 3. Security Rules Draft

The corresponding `firestore.rules` matches these invariants exactly, enforcing strict checks on document sizes, keys, roles, and relational pathways.

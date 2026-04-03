import z from "zod";

export const idValueSchema = z.uuid();
export const isoTimestampSchema = z.string().datetime();

/**
 * Standard UUID primary key.
 *
 * Used as the main identifier for a record.
 */
export function idSchema() {
  return {
    id: idValueSchema,
  };
}

/**
 * Standard timestamps used on most entities.
 *
 * createdAt → when the record was created
 * updatedAt → last time the record was modified
 */
export function timestamps() {
  return {
    createdAt: autoTimestamp(),
    updatedAt: autoTimestamp(),
  };
}

/* -------------------------------------------------- */
/* TIMESTAMP HELPERS */
/* -------------------------------------------------- */

/**
 * Auto-generated timestamp.
 *
 * Use when:
 * - the value must always exist
 * - the backend/database sets the value
 *
 * Examples:
 * - createdAt
 * - updatedAt
 * - invitedAt
 */
export function autoTimestamp() {
  return isoTimestampSchema;
}

/**
 * Required timestamp provided manually.
 *
 * Use when:
 * - the value must exist
 * - the application decides the value
 *
 * Examples:
 * - inviteExpiresAt
 * - scheduledPublishAt
 */
export function manualTimestamp() {
  return isoTimestampSchema;
}

/**
 * Optional timestamp for events that may happen later.
 *
 * Starts as NULL and gets filled when the event occurs.
 *
 * Examples:
 * - acceptedAt
 * - revokedAt
 * - publishedAt
 */
export function eventTimestamp() {
  return isoTimestampSchema.nullable();
}

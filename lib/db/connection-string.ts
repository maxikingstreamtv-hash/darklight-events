const LEGACY_SSL_MODES = new Set(["require", "prefer", "verify-ca"]);

/**
 * Normalizes PostgreSQL TLS semantics in memory without logging or persisting
 * credentials. Host, database, credentials and unrelated parameters are kept.
 */
export function normalizePostgresConnectionString(connectionString: string) {
  const url = new URL(connectionString);
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("DATABASE_URL skal være en PostgreSQL connection string.");
  }
  const sslMode = url.searchParams.get("sslmode")?.toLowerCase();
  if (!sslMode || LEGACY_SSL_MODES.has(sslMode)) url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}

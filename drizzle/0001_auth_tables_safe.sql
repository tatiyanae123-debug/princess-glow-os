-- Safe, idempotent migration for Auth.js tables
-- Run this in the Neon SQL Editor from your iPhone.
-- Uses CREATE TABLE IF NOT EXISTS so it is safe to run multiple times.
-- Does NOT drop or alter any existing tables or data.

-- users
CREATE TABLE IF NOT EXISTS "users" (
  "id"             text        PRIMARY KEY,
  "name"           text,
  "email"          text        NOT NULL,
  "email_verified" timestamp,
  "image"          text,
  "created_at"     timestamp   NOT NULL DEFAULT now(),
  "updated_at"     timestamp   NOT NULL DEFAULT now(),
  CONSTRAINT "users_email_unique" UNIQUE ("email")
);

-- accounts
CREATE TABLE IF NOT EXISTS "accounts" (
  "user_id"            text    NOT NULL,
  "type"               text    NOT NULL,
  "provider"           text    NOT NULL,
  "provider_account_id" text   NOT NULL,
  "refresh_token"      text,
  "access_token"       text,
  "expires_at"         integer,
  "token_type"         text,
  "scope"              text,
  "id_token"           text,
  "session_state"      text,
  CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY ("provider", "provider_account_id"),
  CONSTRAINT "accounts_user_id_fk" FOREIGN KEY ("user_id")
    REFERENCES "users" ("id") ON DELETE CASCADE
);

-- sessions
CREATE TABLE IF NOT EXISTS "sessions" (
  "session_token" text      PRIMARY KEY,
  "user_id"       text      NOT NULL,
  "expires"       timestamp NOT NULL,
  CONSTRAINT "sessions_user_id_fk" FOREIGN KEY ("user_id")
    REFERENCES "users" ("id") ON DELETE CASCADE
);

-- verification_tokens
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" text      NOT NULL,
  "token"      text      NOT NULL,
  "expires"    timestamp NOT NULL,
  CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY ("identifier", "token")
);

-- authenticators (required by DrizzleAdapter when passkeys are in schema)
CREATE TABLE IF NOT EXISTS "authenticators" (
  "credential_id"          text    NOT NULL,
  "user_id"                text    NOT NULL,
  "provider_account_id"    text    NOT NULL,
  "credential_public_key"  text    NOT NULL,
  "counter"                integer NOT NULL,
  "credential_device_type" text    NOT NULL,
  "credential_backed_up"   boolean NOT NULL,
  "transports"             text,
  CONSTRAINT "authenticators_user_id_credential_id_pk" PRIMARY KEY ("user_id", "credential_id"),
  CONSTRAINT "authenticators_credential_id_unique" UNIQUE ("credential_id"),
  CONSTRAINT "authenticators_user_id_fk" FOREIGN KEY ("user_id")
    REFERENCES "users" ("id") ON DELETE CASCADE
);

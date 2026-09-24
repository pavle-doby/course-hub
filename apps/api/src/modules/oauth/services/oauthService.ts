import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import {
  BadRequestError,
  ErrorCodeOauth,
  type OauthApproveReq,
  type OauthApproveRes,
} from "@repo/contract";
import { env } from "api/env";
import { apiTokensService } from "api/modules/api-tokens/services/apiTokensService";

const MCP_PATH = "/apix/v1/mcp";
const OAUTH_PATH = "/apix/oauth";
const CODE_TTL_MS = 5 * 60_000;
const CLIENT_NAME_MAX_LENGTH = 80;
const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

type OauthClient = { typ: "client"; name: string; redirectUris: string[] };
type AuthCode = {
  typ: "code";
  authUserId: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  exp: number;
};

/** OAuth errors use the RFC 6749 shape (`error`, `error_description`), not `ApiError`. */
export class OauthError extends Error {
  constructor(
    readonly error: string,
    readonly description: string,
    readonly status = 400
  ) {
    super(description);
  }
}

const RegisterClientSchema = z.object({
  client_name: z.string().optional(),
  redirect_uris: z.array(z.string()).min(1),
});

const AuthorizeQuerySchema = z.object({
  response_type: z.literal("code"),
  client_id: z.string(),
  redirect_uri: z.string(),
  code_challenge: z.string().min(43).max(128),
  code_challenge_method: z.literal("S256"),
  state: z.string().optional(),
});

const TokenBodySchema = z.object({
  grant_type: z.string(),
  code: z.string(),
  code_verifier: z.string(),
  redirect_uri: z.string(),
  client_id: z.string().optional(),
});

function hmac(body: string): string {
  if (!env.OAUTH_SECRET) {
    throw new Error("OAUTH_SECRET is not set");
  }
  return createHmac("sha256", env.OAUTH_SECRET).update(body).digest("base64url");
}

// ponytail: clients and codes are HMAC-signed payloads, not DB rows. A code can be
// replayed within its 5 min TTL, but only by whoever also holds the PKCE verifier.
function sign(payload: OauthClient | AuthCode): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(body)}`;
}

function verify<T extends OauthClient | AuthCode>(value: string, typ: T["typ"]): T | undefined {
  const [body, signature] = value.split(".");
  if (!body || !signature) {
    return undefined;
  }
  const expected = Buffer.from(hmac(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return undefined;
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as T;
  return payload.typ === typ ? payload : undefined;
}

// HTTPS anywhere (claude.ai), plain HTTP only on loopback (Claude Code, local clients)
function isAllowedRedirectUri(uri: string): boolean {
  try {
    const url = new URL(uri);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" && LOOPBACK_HOSTS.includes(url.hostname))
    );
  } catch {
    return false;
  }
}

function getClient(clientId: string, redirectUri: string): OauthClient | undefined {
  const client = verify<OauthClient>(clientId, "client");
  return client?.redirectUris.includes(redirectUri) ? client : undefined;
}

function hashVerifier(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export const oauthService = {
  /** Sent in `WWW-Authenticate` so MCP clients can discover how to log in. */
  resourceMetadataUrl: (): string =>
    `${env.API_PUBLIC_URL}/.well-known/oauth-protected-resource${MCP_PATH}`,

  // RFC 9728
  getProtectedResourceMetadata: () => ({
    resource: `${env.API_PUBLIC_URL}${MCP_PATH}`,
    authorization_servers: [env.API_PUBLIC_URL],
    bearer_methods_supported: ["header"],
  }),

  // RFC 8414
  getAuthorizationServerMetadata: () => ({
    issuer: env.API_PUBLIC_URL,
    authorization_endpoint: `${env.API_PUBLIC_URL}${OAUTH_PATH}/authorize`,
    token_endpoint: `${env.API_PUBLIC_URL}${OAUTH_PATH}/token`,
    registration_endpoint: `${env.API_PUBLIC_URL}${OAUTH_PATH}/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
  }),

  // RFC 7591 dynamic client registration; the client_id carries the registration itself
  registerClient: (body: unknown) => {
    const parsed = RegisterClientSchema.safeParse(body);
    if (!parsed.success || !parsed.data.redirect_uris.every(isAllowedRedirectUri)) {
      throw new OauthError("invalid_redirect_uri", "redirect_uris must be https or loopback URLs");
    }
    const name = (parsed.data.client_name?.trim() || "MCP client").slice(0, CLIENT_NAME_MAX_LENGTH);
    const redirectUris = parsed.data.redirect_uris;
    return {
      client_id: sign({ typ: "client", name, redirectUris }),
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: name,
      redirect_uris: redirectUris,
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    };
  },

  // Validates the request, then hands the browser to the web app's consent page
  getConsentUrl: (query: unknown): string => {
    const parsed = AuthorizeQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new OauthError("invalid_request", "Missing or unsupported authorization parameters");
    }
    const { client_id, redirect_uri, code_challenge, state } = parsed.data;
    if (!getClient(client_id, redirect_uri)) {
      throw new OauthError("invalid_client", "Unknown client_id or redirect_uri");
    }
    const url = new URL("/oauth/authorize", env.WEB_APP_URL);
    url.searchParams.set("client_id", client_id);
    url.searchParams.set("redirect_uri", redirect_uri);
    url.searchParams.set("code_challenge", code_challenge);
    if (state) {
      url.searchParams.set("state", state);
    }
    return url.toString();
  },

  approve: (authUserId: string, dto: OauthApproveReq): OauthApproveRes => {
    if (!getClient(dto.clientId, dto.redirectUri)) {
      throw new BadRequestError({ code: ErrorCodeOauth.INVALID_CLIENT });
    }
    const url = new URL(dto.redirectUri);
    if (dto.approve) {
      const code = sign({
        typ: "code",
        authUserId,
        clientId: dto.clientId,
        redirectUri: dto.redirectUri,
        codeChallenge: dto.codeChallenge,
        exp: Date.now() + CODE_TTL_MS,
      });
      url.searchParams.set("code", code);
    } else {
      url.searchParams.set("error", "access_denied");
    }
    if (dto.state) {
      url.searchParams.set("state", dto.state);
    }
    return { redirectUrl: url.toString() };
  },

  // Each grant becomes a personal access token, listed and revocable in Settings → AI access
  exchangeCode: async (body: unknown) => {
    const parsed = TokenBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new OauthError("invalid_request", "Missing token parameters");
    }
    const { grant_type, code, code_verifier, redirect_uri, client_id } = parsed.data;
    if (grant_type !== "authorization_code") {
      throw new OauthError("unsupported_grant_type", "Only authorization_code is supported");
    }
    const grant = verify<AuthCode>(code, "code");
    if (
      !grant ||
      grant.exp < Date.now() ||
      grant.redirectUri !== redirect_uri ||
      (client_id && grant.clientId !== client_id) ||
      hashVerifier(code_verifier) !== grant.codeChallenge
    ) {
      throw new OauthError("invalid_grant", "Invalid or expired authorization code");
    }
    const client = verify<OauthClient>(grant.clientId, "client");
    const created = await apiTokensService.createToken(grant.authUserId, {
      name: client?.name ?? "MCP client",
    });
    return { access_token: created.token, token_type: "Bearer" };
  },
};

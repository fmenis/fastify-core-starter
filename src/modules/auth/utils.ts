import { FastifyRequest } from "fastify";
import { BaRequestOpt } from "./auth.interface.js";
import { fromNodeHeaders } from "better-auth/node";

/**
 * Translates fastify request in standard Fetch request for BA
 */
export function createFetchRequest(
  request: FastifyRequest,
  opts: BaRequestOpt = {},
): Request {
  const url = new URL(opts.baPath ?? request.url, process.env.BETTER_AUTH_URL!);
  const req = new Request(url, {
    method: request.method,
    headers: fromNodeHeaders(request.headers),
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : JSON.stringify(request.body),
  });

  return req;
}

/**
 * Map BA errors
 */
export async function throwException(response: Response): Promise<void> {
  const text = await response.text();

  //##TODO migliorare errori
  if (response.status >= 400) {
    let parsed: { message?: string; code?: string } | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // non-JSON body — fall through to a generic 500
    }

    throw Object.assign(new Error(parsed?.message ?? "An error occurred."), {
      statusCode: response.status,
      internalCode: parsed?.code ?? "UNKNOWN",
      details: {},
    });
  }
}

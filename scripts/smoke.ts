/**
 * Manual smoke check against a live deploy. Not wired into CI — the deploy
 * workflow runs an equivalent probe with retries against the canonical
 * `*.azurewebsites.net` hostname. This script is for ad-hoc operator use:
 *
 *   SMOKE_BASE_URL=https://movequest-prod.azurewebsites.net pnpm test:smoke
 *
 * Exits with code 0 on success, 1 on any probe failure.
 */

type SmokeProbe = {
  readonly url: string;
  readonly expect: (response: Response, body: string) => string | null;
};

function readBaseUrl(): string {
  const raw = process.env.SMOKE_BASE_URL;
  if (!raw) {
    throw new Error("SMOKE_BASE_URL is not set; expected something like https://<app>.azurewebsites.net");
  }
  const trimmed = raw.replace(/\/+$/, "");
  if (!/^https?:\/\//.test(trimmed)) {
    throw new Error(`SMOKE_BASE_URL must be an absolute http(s) URL, got: ${raw}`);
  }
  return trimmed;
}

function buildProbes(baseUrl: string): readonly SmokeProbe[] {
  return [
    {
      url: `${baseUrl}/api/health`,
      expect(response, body) {
        if (response.status !== 200) return `expected HTTP 200, got ${response.status}`;
        let parsed: unknown;
        try {
          parsed = JSON.parse(body);
        } catch {
          return `expected JSON body, got non-JSON: ${body.slice(0, 80)}`;
        }
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          (parsed as { status?: unknown }).status !== "ok"
        ) {
          return `expected body { status: "ok" }, got: ${body.slice(0, 120)}`;
        }
        return null;
      },
    },
    {
      url: `${baseUrl}/en`,
      expect(response, body) {
        if (response.status !== 200) return `expected HTTP 200, got ${response.status}`;
        if (!/<html[\s>]/i.test(body)) {
          return `expected HTML body containing <html>, got: ${body.slice(0, 80)}`;
        }
        return null;
      },
    },
  ];
}

async function probe(probe: SmokeProbe): Promise<string | null> {
  process.stdout.write(`  ${probe.url} ... `);
  let response: Response;
  try {
    response = await fetch(probe.url, { redirect: "manual" });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    process.stdout.write(`FAIL (${message})\n`);
    return message;
  }
  const body = await response.text();
  const failure = probe.expect(response, body);
  if (failure) {
    process.stdout.write(`FAIL (${failure})\n`);
    return failure;
  }
  process.stdout.write(`ok (${response.status})\n`);
  return null;
}

async function main(): Promise<void> {
  const baseUrl = readBaseUrl();
  console.log(`smoke: base url = ${baseUrl}`);

  const probes = buildProbes(baseUrl);
  let failed = false;
  for (const p of probes) {
    const failure = await probe(p);
    if (failure !== null) failed = true;
  }

  if (failed) {
    console.error("smoke: at least one probe failed");
    process.exitCode = 1;
    return;
  }

  console.log("smoke: all probes passed");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`smoke: ${message}`);
  process.exitCode = 1;
});

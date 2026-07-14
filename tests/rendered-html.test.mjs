import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the portfolio dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Daniel Mace — Developer<\/title>/i);
  assert.match(html, /portfolio\.md/);
  assert.match(html, /about/);
  assert.match(html, /projects/);
  assert.match(html, /toggle explorer/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders every portfolio route", async () => {
  for (const [path, title] of [
    ["/about", "About me"],
    ["/projects", "Selected projects"],
    ["/projects/northstar", "Northstar"],
    ["/writing", "Writing"],
    ["/writing/blogs", "Working notes"],
    ["/writing/blogs/this-interface-is-a-conversation", "This interface is a conversation"],
    ["/writing/essays", "Longer thoughts"],
    ["/writing/notes", "Notes"],
    ["/contact", "Let&#x27;s make contact"],
    ["/settings", "Settings"],
    ["/help", "LazyVim portfolio help"],
  ]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(
      await response.text(),
      new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      path,
    );
  }
});

test("defines the global keyboard commands", async () => {
  const shell = await readFile(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
  const commands = await readFile(new URL("../data/commands.ts", import.meta.url), "utf8");
  const explorer = await readFile(
    new URL("../components/explorer-sidebar.tsx", import.meta.url),
    "utf8",
  );
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const generatedRoutes = await readFile(
    new URL("../data/site-routes.generated.ts", import.meta.url),
    "utf8",
  );
  assert.match(shell, /event\.key === " "/);
  assert.match(shell, /setFinder\(true\)/);
  assert.match(shell, /<FuzzyFinder/);
  assert.match(shell, /event\.key === ":"/);
  assert.match(shell, /event\.key === "j"/);
  assert.match(shell, /KEY_SEQUENCE_TIMEOUT_MS = 900/);
  assert.match(shell, /COMMAND_MEMORY_TIMEOUT_MS = 1400/);
  assert.match(shell, /event\.key === "v"/);
  assert.match(shell, /countRef\.current/);
  assert.match(shell, /event\.key === "G"/);
  assert.match(shell, /event\.key === "g"/);
  assert.match(shell, /event\.key === "\/"/);
  assert.match(commands, /searchItems/);
  assert.match(commands, /siteRoutes/);
  assert.match(explorer, /tree-folder-icon/);
  assert.match(explorer, /writingSections/);
  assert.match(explorer, /useState<Set<string>>\(\(\) => new Set\(\)\)/);
  assert.match(explorer, /event\.key === "j"/);
  assert.match(explorer, /event\.key === "k"/);
  assert.match(explorer, /event\.key === "Enter"/);
  assert.match(explorer, /event\.key === "Backspace"/);
  assert.match(explorer, /current\?\.node\.kind === "folder"/);
  assert.match(explorer, /focusRequest/);
  assert.match(styles, /\.explorer\.is-open\s*{[^}]*min-width: 260px;/s);
  assert.match(styles, /\.buffer-line\[data-visual\]/);
  assert.match(styles, /\.keystroke-memory/);

  for (const route of [
    "/about",
    "/contact",
    "/help",
    "/projects",
    "/settings",
    "/writing",
    "/writing/blogs",
    "/writing/essays",
    "/writing/notes",
  ]) {
    assert.match(generatedRoutes, new RegExp(`"href": "${route}"`), route);
  }

  assert.doesNotMatch(generatedRoutes, /"href": "\/(?:blog|essays)"/);
});

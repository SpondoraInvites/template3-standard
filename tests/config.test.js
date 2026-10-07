const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const config = require("../config.js");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");

test("config carries a valid wedding datetime", () => {
  const t = new Date(config.weddingDateTime).getTime();
  assert.ok(Number.isFinite(t), "weddingDateTime must be a valid ISO datetime");
  // Unlike the premium template, this sample couple's date is allowed to
  // be in the past — the countdown then reads "just married!".
});

test("no temporary z.ai CDN photo links remain", () => {
  for (const text of [html, script, JSON.stringify(config)]) {
    assert.doesNotMatch(text, /z-cdn-media\.chatglm\.cn/);
    assert.doesNotMatch(text, /auth_key=/);
  }
});

test("every local asset referenced by the page exists", () => {
  const refs = [...html.matchAll(/(?:href|content)="(assets\/[^"]+)"/g)].map(m => m[1]);
  assert.ok(refs.length >= 2, "expected the favicon and og cover to be referenced");
  for (const ref of refs) {
    assert.ok(fs.existsSync(path.join(root, ref)), `missing file: ${ref}`);
  }
});

test("styles and behaviour live in external files", () => {
  assert.match(html, /<link rel="stylesheet" href="styles\.css">/);
  const styleBlocks = [...html.matchAll(/<style[\s>]/g)].length;
  const noscript = (html.match(/<noscript>[\s\S]*?<\/noscript>/g) || []).join("");
  const inlineStyles = styleBlocks - [...noscript.matchAll(/<style[\s>]/g)].length;
  assert.equal(inlineStyles, 0, "no inline <style> outside the noscript fallback");
  const withoutExternal = html.replace(/<script src="[^"]+"><\/script>/g, "");
  assert.doesNotMatch(withoutExternal, /<script/, "no inline <script> blocks");
});

test("config.js loads before script.js and the script consumes it", () => {
  const cfgAt = html.indexOf('src="config.js"');
  const jsAt = html.indexOf('src="script.js"');
  assert.ok(cfgAt > -1, "config.js must be loaded from index.html");
  assert.ok(jsAt > cfgAt, "config.js must load before script.js");
  assert.match(script, /window\.INVITE_CONFIG/);
});

test("the script drives countdown, calendar and RSVP from config", () => {
  assert.match(script, /new Date\(CFG\.weddingDateTime\)/);
  assert.match(script, /CFG\.calendar/);
  assert.match(script, /CFG\.rsvp\.storageKey/);
  assert.match(script, /CFG\.rsvp\.maxParty/);
});

test("the countdown can clear its interval on the first tick", () => {
  // This sample couple's date is in the past, so the first synchronous
  // tick takes the "just married!" branch — cdT must already be
  // initialised there, or clearInterval throws and the countdown
  // silently keeps showing its placeholders forever.
  const declAt = script.indexOf("let cdT");
  const clearAt = script.indexOf("clearInterval(cdT)");
  assert.ok(declAt > -1, "cdT must be declared with let before the first tick");
  assert.ok(clearAt > declAt, "clearInterval(cdT) must run only after cdT is initialised");
});

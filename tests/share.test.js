const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

test("every share button is paired with a share menu via aria-controls", () => {
  const buttons = [...html.matchAll(/data-share-button[^>]*aria-controls="([^"]+)"/g)].map(m => m[1]);
  assert.equal(buttons.length, 2, "expected the inline and the floating share button");
  for (const id of buttons) {
    assert.ok(html.includes(`id="${id}"`), `missing share menu #${id}`);
  }
});

test("share menus expose the same channels as the premium template", () => {
  const channels = ["copy", "whatsapp", "messenger", "telegram", "email"];
  const menus = html.match(/data-share-menu[\s\S]*?<\/div>/g) || [];
  assert.equal(menus.length, 2, "expected two share menus (inline + floating)");
  for (const menu of menus) {
    for (const channel of channels) {
      assert.match(menu, new RegExp(`data-share="${channel}"`), `menu lacks the ${channel} channel`);
    }
  }
});

test("the script wires buttons, menus, copy fallback and floating reveal", () => {
  assert.match(script, /data-share-button/);
  assert.match(script, /navigator\.clipboard\.writeText/);
  assert.match(script, /execCommand\(["']copy["']\)/, "legacy http copy fallback");
  assert.match(script, /wa\.me|t\.me\/share|fb-messenger|mailto:/);
  assert.match(script, /floatShare\.classList\.toggle\(["']show["']/);
});

test("the share styles exist and the hidden fallback survives noscript", () => {
  for (const rule of [".share-menu{", ".share-menu.open{", ".float-share{", ".share-menu--float{"]) {
    assert.ok(css.includes(rule), `missing CSS rule ${rule.replace("{", "")}`);
  }
  assert.match(css, /\.float-share\{[^}]*visibility\s*:\s*hidden/, "floating share starts invisible");
  // no inline <style> outside the noscript block
  const noscript = (html.match(/<noscript>[\s\S]*?<\/noscript>/g) || []).join("");
  const inline = [...html.matchAll(/<style[\s>]/g)].length - [...noscript.matchAll(/<style[\s>]/g)].length;
  assert.equal(inline, 0);
});

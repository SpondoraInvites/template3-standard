const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");
const config = require("../config.js");

const script = fs.readFileSync(require.resolve("../script.js"), "utf8");
const start = script.indexOf("const form=$('#rsvpForm')");
const end = script.indexOf("/* =========================================================\n   10. Share", start);

function setup({ whatsapp = "+880 1712-345678", attending = true, storageFails = false } = {}) {
  const elements = new Map();
  const opened = [], saved = [], toasts = [];
  function $(selector) {
    if (!elements.has(selector)) elements.set(selector, {
      value: "", textContent: "", checked: false, style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      listeners: {}, addEventListener(type, handler) { this.listeners[type] = handler; },
      focus() { this.focused = true; },
    });
    return elements.get(selector);
  }
  $("#fName").value = "  Ayesha & Ali  ";
  $("#attY").checked = attending;
  $("#gNum").textContent = "3";
  $("#fSong").value = "  Our favourite song  ";
  $("#fNotes").value = "  Vegetarian, please! 🌿  ";
  vm.runInNewContext(script.slice(start, end), {
    $, CFG: { ...config, rsvp: { ...config.rsvp, whatsapp } },
    window: { open(...args) { opened.push(args); } },
    localStorage: {
      getItem() { return null; },
      setItem(key, value) {
        if (storageFails) throw new Error("Storage disabled");
        saved.push([key, JSON.parse(value)]);
      },
    },
    toast(message) { toasts.push(message); }, setTimeout() {},
  });
  return { $, opened, saved, toasts, submit() { $("#rsvpForm").listeners.submit({ preventDefault() {} }); } };
}

test("RSVP config supplies the same sample WhatsApp recipient as template1-standard", () => {
  assert.equal(config.rsvp.whatsapp, "8801712345678");
});

test("accepting opens WhatsApp with the recipient and all reply details", () => {
  const page = setup();
  page.submit();
  assert.equal(page.opened.length, 1);
  const [url, target, features] = page.opened[0];
  const parsed = new URL(url);
  assert.equal(parsed.origin + parsed.pathname, "https://wa.me/8801712345678");
  assert.equal(parsed.searchParams.get("text"), [
    "RSVP — " + config.calendar.title,
    "Name: Ayesha & Ali",
    "Attending: Joyfully, yes (3 guests)",
    "Song: Our favourite song",
    "Message: Vegetarian, please! 🌿",
  ].join("\n"));
  assert.equal(target, "_blank");
  assert.equal(features, "noopener");
  assert.equal(page.saved[0][1].n, "Ayesha & Ali");
  assert.match(page.$("#cBody").textContent, /WhatsApp.*send/i);
  assert.match(page.toasts.at(-1), /WhatsApp.*send/i);
});

test("declining omits party size and empty optional answers", () => {
  const page = setup({ attending: false });
  page.$("#fSong").value = "  ";
  page.$("#fNotes").value = "";
  page.submit();
  const text = new URL(page.opened[0][0]).searchParams.get("text");
  assert.match(text, /Attending: Regretfully, no/);
  assert.doesNotMatch(text, /guests|Song:|Message:/);
});

test("blank names do not save a reply or open WhatsApp", () => {
  const page = setup();
  page.$("#fName").value = "  ";
  page.submit();
  assert.equal(page.opened.length, 0);
  assert.equal(page.saved.length, 0);
  assert.equal(page.$("#fName").focused, true);
});

test("an empty WhatsApp setting keeps replies local without claiming delivery", () => {
  const page = setup({ whatsapp: "" });
  page.submit();
  assert.equal(page.opened.length, 0);
  assert.equal(page.saved.length, 1);
  assert.match(page.$("#cBody").textContent, /browser/i);
  assert.doesNotMatch(page.$("#cBody").textContent, /on its way/);
});

test("WhatsApp still opens when browser storage is unavailable", () => {
  const page = setup({ storageFails: true });
  page.submit();
  assert.equal(page.opened.length, 1);
});

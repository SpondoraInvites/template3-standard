const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

function declarations(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(escaped + "\\s*\\{([^}]*)\\}"));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

test("the wax seal renders above the envelope pocket", () => {
  // The seal overlaps the env-front pocket (z-index 3); if it ever drops
  // below it the button cannot be tapped and the invitation never opens.
  assert.match(declarations(".seal-btn"), /z-index\s*:\s*6/);
  assert.match(declarations(".env-front"), /z-index\s*:\s*3/);
});

test("overlay decorations never intercept clicks", () => {
  // The petals canvas, paper grain and vignette all sit above the page;
  // any of them capturing pointer events would deaden the whole page.
  assert.match(declarations("#petals"), /pointer-events\s*:\s*none/);
  assert.match(declarations("body::after"), /pointer-events\s*:\s*none/);
  assert.match(declarations(".ov-vignette"), /pointer-events\s*:\s*none/);
});

test("the RSVP card's inner frame never blocks the form", () => {
  // .rsvp-card::after draws an inset border across the whole card; it
  // must stay click-transparent or form fields near the edges die.
  assert.match(declarations(".rsvp-card::after"), /pointer-events\s*:\s*none/);
});

test("mobile timeline nodes centre on the spine", () => {
  // The spine sits at 10px and nodes are 9px wide, so a centred node's
  // left offset must mirror the article's mobile margin-left exactly.
  // A stray offset once left the diamonds grazing the line's edge.
  const article = declarations(".entry,.entry:nth-child(even)");
  const node = declarations(".entry:nth-child(odd) .node,.entry:nth-child(even) .node");
  const margin = article.match(/margin-left\s*:\s*([\d.]+)rem/);
  assert.ok(margin, "mobile article rule should set margin-left in rem");
  assert.ok(
    node.includes(`-${margin[1]}rem`),
    "node left offset must mirror the article margin so diamonds centre on the spine",
  );
});

test("mobile timeline entries all read left-aligned", () => {
  // Desktop alternates text-align per side; the narrow mobile column
  // must reset it, or odd entries hug the right edge, far from the spine.
  const mobileStart = css.indexOf("@media(max-width:760px)");
  assert.ok(mobileStart > -1, "the mobile media query should exist");
  const mobile = css.slice(mobileStart, css.indexOf("@media (prefers-reduced-motion", mobileStart));
  assert.match(mobile, /\.entry[^{]*\{[^}]*text-align\s*:\s*left/);
});

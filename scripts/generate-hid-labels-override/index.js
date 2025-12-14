#!/usr/bin/env node
/**
 * xkb-symbols-to-hid-labels.js
 *
 * Usage:
 *   node xkb-symbols-to-hid-labels.js /usr/share/X11/xkb/symbols/it basic ./hid-labels.json > hid-labels.it.json
 *
 * Notes:
 * - Only updates output["7"][hidUsage].short / .secondary for keys explicitly present in the XKB variant.
 * - Keeps output["12"] untouched (and everything else too).
 */

import * as fs from "fs"

const [, , xkbPath, hidname, variantArg] = process.argv;
if (!xkbPath) {
    console.error("Usage: node xkb-symbols-to-hid-labels.js <xkb_symbols_file> [variant=basic] <base_hid-labels.json>");
    process.exit(1);
}

const variant = variantArg || "basic";

const xkbText = fs.readFileSync(xkbPath, "utf8");
const base = JSON.parse(fs.readFileSync("./scripts/generate-hid-labels-override/base-hid-labels.json", "utf8"));

// --- XKB key name -> HID usage id (Keyboard page 0x07) for ISO/ANSI alphanumeric area.
const XKB_TO_HID = {
    TLDE: 53,   // `~ (physical), in it becomes \ |
    AE01: 30, AE02: 31, AE03: 32, AE04: 33, AE05: 34, AE06: 35, AE07: 36, AE08: 37, AE09: 38, AE10: 39, AE11: 45, AE12: 46,
    AD01: 20, AD02: 26, AD03: 8, AD04: 21, AD05: 23, AD06: 28, AD07: 24, AD08: 12, AD09: 18, AD10: 19, AD11: 47, AD12: 48,
    AC01: 4, AC02: 22, AC03: 7, AC04: 9, AC05: 10, AC06: 11, AC07: 13, AC08: 14, AC09: 15, AC10: 51, AC11: 52,
    BKSL: 49,  // ANSI backslash key (ISO layouts often put a letter here like ù)
    LSGT: 100, // ISO "< >" key (Non-US Backslash in HID)
    AB01: 29, AB02: 27, AB03: 6, AB04: 25, AB05: 5, AB06: 17, AB07: 16, AB08: 54, AB09: 55, AB10: 56
};

// --- Minimal XKB keysym -> printable char mapping.
// Extend this map if you encounter more named keysyms.
const KEYSYM_TO_CHAR = {
    // ASCII punctuation/symbols
    backslash: "\\",
    bar: "|",
    parenleft: "(",
    parenright: ")",
    bracketleft: "[",
    braceleft: "{",
    bracketright: "]",
    braceright: "}",
    less: "<",
    greater: ">",
    minus: "-",
    underscore: "_",
    plus: "+",
    asterisk: "*",
    apostrophe: "'",
    quotedbl: "\"",
    comma: ",",
    period: ".",
    colon: ":",
    semicolon: ";",
    question: "?",
    equal: "=",
    asciicircum: "^",
    asciitilde: "~",
    grave: "`",
    at: "@",
    numbersign: "#",
    section: "§",
    degree: "°",
    sterling: "£",
    notsign: "¬",
    brokenbar: "¦",
    guillemotleft: "«",
    guillemotright: "»",
    multiply: "×",
    division: "÷",
    periodcentered: "·",

    // Italian letters
    egrave: "è",
    eacute: "é",
    agrave: "à",
    ograve: "ò",
    igrave: "ì",
    ugrave: "ù",
    ccedilla: "ç",

    // Digits (XKB uses bare numbers often)
    0: "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9"
};

function keysymToChar(sym) {
    if (!sym) return null;

    // Strip common wrappers / whitespace
    const s = sym.trim();

    // Ignore NoSymbol / void / dead keys for our "short/secondary" labels
    if (s === "NoSymbol" || s === "VoidSymbol") return null;
    if (s.startsWith("dead_")) return null;

    // Single character already?
    if (s.length === 1) return s;

    // Common named keysyms
    if (Object.prototype.hasOwnProperty.call(KEYSYM_TO_CHAR, s)) return KEYSYM_TO_CHAR[s];

    // Letters like "a" / "A" / "ntilde" might appear: handle single-letter names
    if (/^[a-zA-Z]$/.test(s)) return s;

    // Unknown keysym -> skip (keeps base label)
    return null;
}

function extractVariantBlock(text, wantedVariant) {
    // Grabs: xkb_symbols "basic" { ... };
    const re = new RegExp(
        String.raw`xkb_symbols\s+"${variant.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}"\s*\{([\s\S]*?)^\s*\}\s*;`,
        "m"
    );
    const m = text.match(re);
    return m ? m[1] : null;
}

function parseKeyDefs(blockText) {
    // Matches: key <AE02> { [ 2, quotedbl, ... ] };
    // Also handles tabs/spaces/newlines inside.
    const re = /key\s*<([A-Z0-9]+)>\s*\{\s*\[\s*([^\]]*?)\s*\]\s*\}\s*;/g;
    const out = [];
    let m;
    while ((m = re.exec(blockText)) !== null) {
        const xkbKey = m[1];
        const list = m[2]
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);

        out.push({ xkbKey, syms: list });
    }
    return out;
}

// --- Build output
const block = extractVariantBlock(xkbText, variant);
if (!block) {
    console.error(`Could not find xkb_symbols "${variant}" in ${xkbPath}`);
    process.exit(2);
}

const defs = parseKeyDefs(block);

const out = structuredClone(base);
out["7"] = out["7"] || {};

// Update only keys defined in this variant
for (const def of defs) {
    const hid = XKB_TO_HID[def.xkbKey];
    if (!hid) continue;

    const primary = keysymToChar(def.syms[0]);
    const shifted = keysymToChar(def.syms[1]);
    const altgr = keysymToChar(def.syms[2]);

    // If we couldn't derive a printable label, don't overwrite the base.
    if (primary == null && shifted == null && altgr == null) continue;

    const hidKey = String(hid);
    out["7"][hidKey] = out["7"][hidKey] || {};

    if (primary != null) out["7"][hidKey].short = primary;
    if (shifted != null) out["7"][hidKey].secondary = shifted;
    if (altgr != null) out["7"][hidKey].tertiary = altgr;
}

// Important: keep "12" exactly as in base (your requirement).
out["12"] = base["12"];

fs.writeFileSync(`./src/hid-usage-name-overrides/${hidname}.json`, JSON.stringify(out, null, 4))

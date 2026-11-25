// Date HONNÊTE de chaque adresse du plan du site (<lastmod>), 25/11/2026 (plan Google B.2).
// Avant : toutes les adresses portaient la même date (MAJ de page.js). Maintenant la date d'une page ne change que si son CONTENU UTILE
// change : empreinte (sha1) du HTML sans les dates, heures, ?v= et espaces ; mémoire donnees/lastmod.json {fichier: {empreinte, date}}.
// Page inconnue de la mémoire : la vraie date est retrouvée dans l'historique git (dernier commit au contenu utile identique) ;
// fichier jamais enregistré = page nouvelle = date du jour. Rien n'est jamais inventé. (Même méthode que robot/lastmod.py des autres sites.)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { join, dirname } from "path";

export const VERSION = 2;
const MOIS = "janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre|" +
  "جانفي|فيفري|مارس|أفريل|ماي|جوان|جويلية|أوت|سبتمبر|أكتوبر|نوفمبر|ديسمبر|يناير|فبراير|أبريل|مايو|يونيو|يوليو|أغسطس";
const DATES = [/\?v=[\w.-]+/g, /\d{4}-\d{2}-\d{2}(?:T[\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)?/g, /\d{1,2}\/\d{1,2}\/\d{4}/g,
  /(?<![\d,.])\d{1,2}:\d{2}(?::\d{2})?(?![\d,.])/g, new RegExp(`\\d{1,2}(?:er)?(?:\\s|&nbsp;|\\u00a0)+(?:${MOIS})(?:\\s|&nbsp;|\\u00a0)+\\d{4}`, "gi")];
export const MEMOIRE = "donnees/lastmod.json";

export function empreinte(html) {
  for (const r of DATES) html = html.replace(r, "");
  return createHash("sha1").update(html.replace(/\s+/g, ""), "utf8").digest("hex").slice(0, 16);
}

export function lireMemoire(root) {
  try { const m = JSON.parse(readFileSync(join(root, MEMOIRE), "utf8")); return m._version === VERSION ? m : {}; } catch { return {}; }
}

// date du plus ancien commit d'une suite ininterrompue de commits où le fichier a cette même empreinte
function dateGit(root, fichier, emp) {
  let log = [];
  try { log = execFileSync("git", ["-C", root, "log", "--format=%H %cs", "--", fichier], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n").filter(Boolean); } catch { return null; }
  let trouve = null;
  for (const l of log) {
    const [h, d] = l.split(" ");
    let c; try { c = execFileSync("git", ["-C", root, "show", `${h}:${fichier}`], { encoding: "utf8", maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "ignore"] }); } catch { break; }
    if (empreinte(c) !== emp) break;
    trouve = d;
  }
  return trouve;
}

// fichiers = { "chemin/index.html": contenu } ; renvoie la nouvelle mémoire (et l'écrit) ; jour = AAAA-MM-JJ
export function majMemoire(root, fichiers, jour) {
  const ancien = lireMemoire(root), neuf = { _version: VERSION };
  for (const f of Object.keys(fichiers).sort()) {
    const emp = empreinte(fichiers[f]), a = ancien[f];
    neuf[f] = { empreinte: emp, date: a && a.empreinte === emp ? a.date : a ? jour : (dateGit(root, f, emp) || jour) };
  }
  mkdirSync(dirname(join(root, MEMOIRE)), { recursive: true });
  writeFileSync(join(root, MEMOIRE), JSON.stringify(neuf, null, 1) + "\n");
  return neuf;
}

// date d'un fichier d'après la mémoire, si son contenu n'a pas changé ; sinon null (contenu nouveau : la mémoire sera mise à jour)
export function dateConnue(memoire, fichier, contenu) {
  const a = memoire[fichier];
  return a && contenu != null && a.empreinte === empreinte(contenu) ? a.date : null;
}
export const existe = existsSync;

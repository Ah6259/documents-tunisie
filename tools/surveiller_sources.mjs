// Robot de surveillance : vérifie que chaque source officielle citée sur le site répond toujours.
//   node tools/surveiller_sources.mjs
// Code de sortie : 0 = toutes les sources répondent ; 2 = au moins une source ne répond plus (liste dans sources_ko.txt).
// Lecture lente (3 s entre deux sites), User-Agent honnête, 3 essais par site avant de la déclarer en panne.
// Le robot ne modifie JAMAIS le site ni la date « vérifié le » : seule une personne qui a relu les textes peut la changer.
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

export const UA = "Mozilla/5.0 (compatible; DocumentsTunisie-verification/1.0; +https://ah6259.github.io/documents-tunisie/)";
const pause = ms => new Promise(r => setTimeout(r, ms));

// Une source est « en panne » si elle ne répond pas, répond par une erreur (4xx/5xx) ou renvoie une page presque vide.
export async function verifierUne(url, lireUrl, attente = 20000, essais = 3) {
  let raison = "";
  for (let i = 0; i < essais; i++) {
    try {
      const r = await lireUrl(url);
      if (r.status >= 400) raison = `erreur ${r.status}`;
      else if ((r.texte || "").replace(/\s+/g, " ").length < 200) raison = "page presque vide";
      else return { url, ok: true };
    } catch (e) { raison = "injoignable (" + (e.message || e) + ")"; }
    if (i < essais - 1) await pause(attente);
  }
  return { url, ok: false, raison };
}

export async function verifierTout(sources, lireUrl, { attente = 20000, entre = 3000 } = {}) {
  const res = [];
  for (const [cle, s] of Object.entries(sources)) {
    res.push({ cle, nom: s.fr, ...(await verifierUne(s.url, lireUrl, attente)) });
    await pause(entre);
  }
  return res;
}

async function lireReel(url) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 30000);
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: ctl.signal });
    return { status: r.status, texte: await r.text() };
  } finally { clearTimeout(t); }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const { SOURCES } = createRequire(import.meta.url)(join(root, "assets/documents.js"));
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";   // certains sites publics ont un certificat mal configuré : on vérifie seulement qu'ils répondent
  const res = await verifierTout(SOURCES, lireReel);
  for (const r of res) console.log((r.ok ? "OK    " : "PANNE ") + r.cle.padEnd(12) + r.url + (r.ok ? "" : "  -> " + r.raison));
  const ko = res.filter(r => !r.ok);
  writeFileSync(join(root, "sources_ko.txt"), ko.map(r => `- ${r.nom} (${r.url}) : ${r.raison}`).join("\n") + (ko.length ? "\n" : ""));
  process.exit(ko.length ? 2 : 0);
}

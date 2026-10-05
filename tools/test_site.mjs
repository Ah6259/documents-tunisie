// Test automatique de Documents Tunisie — à lancer après CHAQUE modification :
//   node tools/test_site.mjs            (teste le site)
//   node tools/test_site.mjs <dossier>  (teste une copie : utilisé par tools/sabotage.mjs)
// jsdom s'installe une fois par PC :  npm install --no-save --no-package-lock jsdom
import { JSDOM, VirtualConsole } from "jsdom";
import { readFileSync, existsSync, statSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { createRequire } from "module";
import { createHash } from "crypto";

const ici = dirname(fileURLToPath(import.meta.url));
const root = resolve(process.argv[2] || join(ici, ".."));
const lire = f => readFileSync(join(root, f), "utf8");
let erreurs = 0;
const muet = !!process.env.MUET;
const check = (desc, cond) => { if (!cond || !muet) console.log((cond ? "OK   " : "FAIL ") + desc); if (!cond) erreurs++; };
const req = createRequire(join(root, "tools", "x.js"));
const { DOCS, CONTRATS, CATEGORIES, SOURCES } = req(join(root, "assets/documents.js"));
const M = req(join(root, "assets/modele.js"));
const TOUS = [...DOCS, ...CONTRATS];
const ARABE = /[؀-ۿ]/;

// ---- 1. Données : chaque document est complet ---------------------------------
check("15 documents à remplir et 4 grands contrats", DOCS.length === 15 && CONTRATS.length === 4);
check("adresses (slug) uniques", new Set(TOUS.map(d => d.slug)).size === TOUS.length);
const bil = o => o && o.fr && o.ar && ARABE.test(JSON.stringify(o.ar)) && JSON.stringify(o.fr).length > 4;
for (const d of TOUS) {
  check(`${d.slug} : titre, résumé et « en bref » en français ET en arabe`, bil(d.titre) && bil(d.court) && bil(d.bref));
  check(`${d.slug} : au moins 3 étapes, chacune FR + AR`, d.etapes.length >= 3 && d.etapes.every(e => e.fr.length === 2 && e.ar.length === 2 && ARABE.test(e.ar.join(""))));
  check(`${d.slug} : pièces et « où aller » FR + AR`, d.pieces.fr.length && d.pieces.fr.length === d.pieces.ar.length && d.ou.fr.length === d.ou.ar.length && d.ou.fr.length);
  check(`${d.slug} : FAQ FR + AR`, d.faq.length >= 1 && d.faq.every(q => q.fr.length === 2 && q.ar.length === 2 && ARABE.test(q.ar.join(""))));
  check(`${d.slug} : sources officielles connues`, d.sources.length >= 1 && d.sources.every(s => SOURCES[s]));
  check(`${d.slug} : catégorie connue`, CATEGORIES.some(c => c.id === d.cat));
  check(`${d.slug} : légalisation / enregistrement / coût / délai`, ["oui", "non", "parfois", "possible"].includes(d.legal.legalisation) && d.legal.enregistrement && bil(d.legal.cout) && bil(d.legal.delai));
  check(`${d.slug} : « à vérifier » FR et AR alignés`, d.averifier.fr.length === d.averifier.ar.length);
}
for (const d of CONTRATS) check(`${d.slug} : PAS de modèle à remplir (relecture d'un avocat d'abord)`, !d.champs && !d.fr && !d.ar);
for (const d of CONTRATS) check(`${d.slug} : droits d'enregistrement non confirmés marqués « à vérifier »`, d.averifier.fr.length >= 1);
for (const d of DOCS) check(`${d.slug} : modèle français et arabe`, typeof d.fr === "function" && typeof d.ar === "function" && d.champs.length >= 5);
check("toutes les sources sont des sites officiels (.gov.tn, organismes publics)", Object.values(SOURCES).every(s => /\.(gov\.tn|tn)\//.test(s.url)));

// ---- 2. Montants en lettres (références vérifiées à la main) ---------------------
const refs = [[1, "un dinar", "دينار واحد"], [21, "vingt et un dinars", "واحد وعشرون دينارا"], [80, "quatre-vingts dinars", "ثمانون دينارا"],
  [200, "deux cents dinars", "مائتا دينار"], [650, "six cent cinquante dinars", "ستمائة وخمسون دينارا"], [1500, "mille cinq cents dinars", "ألف وخمسمائة دينار"],
  [2000, "deux mille dinars", "ألفا دينار"], [80000, "quatre-vingt mille dinars", "ثمانون ألف دينار"], [3, "trois dinars", "ثلاثة دنانير"],
  [1000000, "un million de dinars", "مليون دينار"], [2500.5, "deux mille cinq cents dinars et cinq cents millimes", "ألفان وخمسمائة دينار وخمسمائة مليم"]];
for (const [n, fr, ar] of refs) check(`${n} en lettres : « ${fr} » / « ${ar} »`, M.lettres(n, "fr") === fr && M.lettres(n, "ar") === ar);
check("montant au format tunisien : 2 500,000 DT", M.montant("2500", "fr").replace(/ /g, " ") === "2 500,000 DT");
check("date au format JJ/MM/AAAA", M.dateFR("2026-10-05") === "05/10/2026");

// ---- 3. Chaque modèle rempli : aucun champ vide, toutes les valeurs reprises ----------
const valeursEx = (d, L = "fr") => {
  const v = {};
  for (const c of d.champs) if (!c.groupe) v[c.id] = c.type === "case" ? true : Array.isArray(c.ex) ? c.ex[L === "ar" ? 1 : 0] : c.ex;
  return v;
};
const propre = (html, L) => !/mark class="vide"/.test(html) && !/undefined|null|NaN|\[object/.test(html) && !/ ,|،،|, ,/.test(html.replace(/<[^>]+>/g, ""));
for (const d of DOCS) {
  for (const L of ["fr", "ar"]) {
    const v = valeursEx(d, L), h = M.feuille(d, v, L);
    check(`${d.slug} (${L}) : modèle rempli sans trou ni « undefined »`, propre(h, L));
    const source = d[L].toString();   // les listes qui servent seulement d'aiguillage (v.is) ne sont pas recopiées
    const manquants = d.champs.filter(c => !c.groupe && c.type !== "case" && M.visible(c, v) && !(c.type === "select" && source.includes(`v.is("${c.id}"`) && !source.includes(`v("${c.id}")`))).filter(c => {
      const x = String(v[c.id]); const att = c.type === "date" ? M.dateFR(x) : c.type === "select" ? c.options.find(o => o.v === x)[L] : c.type === "montant" ? M.montant(x, L) : x;
      return !h.includes(att.replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;"));
    });
    check(`${d.slug} (${L}) : chaque information saisie apparaît dans le document${manquants.length ? " — manque : " + manquants.map(c => c.id) : ""}`, !manquants.length);
    if (L === "ar") check(`${d.slug} (ar) : document de droite à gauche, texte arabe, valeurs isolées`, h.includes('dir="rtl"') && ARABE.test(h) && h.includes("⁨"));
    // champs facultatifs vides : toujours propre
    const v2 = { ...v }; for (const c of d.champs) if (c.opt) v2[c.id] = c.type === "case" ? false : "";
    check(`${d.slug} (${L}) : sans les champs facultatifs, toujours sans trou`, propre(M.feuille(d, v2, L), L));
    // chaque choix possible de chaque liste
    let ok = true;
    for (const c of d.champs.filter(c => c.type === "select")) for (const o of c.options) if (!propre(M.feuille(d, { ...v, [c.id]: o.v }, L), L)) { ok = false; console.log("   choix en défaut :", c.id, o.v); }
    check(`${d.slug} (${L}) : tous les choix des listes donnent un document complet`, ok);
  }
  check(`${d.slug} : un champ obligatoire vide est signalé avant le PDF`, M.erreurs(d, Object.fromEntries(d.champs.filter(c => !c.groupe).map(c => [c.id, ""]))).length > 0);
  check(`${d.slug} : formulaire complet = aucune erreur`, M.erreurs(d, valeursEx(d)).length === 0);
  check(`${d.slug} : mention « modèle indicatif / ne remplace pas un avocat » sur le PDF`, M.feuille(d, valeursEx(d), "fr").includes("ne remplace pas") && M.feuille(d, valeursEx(d), "ar").includes("لا تعوض"));
}

// ---- 4. Pages chargées comme dans un navigateur ------------------------------------
async function page(chemin, lang = "fr") {
  const dossier = dirname(join(root, chemin));
  const html = lire(chemin).replace(/<script([^>]*) src="([^"?]+)(\?[^"]*)?"([^>]*)><\/script>/g,
    (_, a, src) => `<script>${readFileSync(join(dossier, src), "utf8")}</script>`);
  const vc = new VirtualConsole(); vc.on("jsdomError", e => { if (!/Not implemented/.test(e.message)) { console.log("   erreur JS :", chemin, e.message); erreurs++; } });
  const dom = new JSDOM(html, { url: `https://ah6259.github.io/documents-tunisie/${chemin.replace("index.html", "")}?lang=${lang}`,
    runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc });
  dom.window.__imprime = 0; dom.window.print = () => dom.window.__imprime++;
  await new Promise(ok => dom.window.addEventListener("load", ok));
  return dom.window;
}
const fichiers = ["index.html", "a-propos/index.html", ...TOUS.map(d => d.slug + "/index.html")];
for (const d of DOCS) {
  const w = await page(d.slug + "/index.html"), doc = w.document, f = doc.getElementById("formulaire");
  check(`${d.slug} : formulaire construit (${d.champs.filter(c => !c.groupe).length} champs)`, f && d.champs.filter(c => !c.groupe).every(c => f.elements[c.id]));
  check(`${d.slug} : aperçu affiché au chargement`, doc.querySelectorAll("#apercu .feuille").length === 1);
  doc.getElementById("telecharger").click();
  check(`${d.slug} : formulaire vide -> pas de PDF, message d'erreur`, w.__imprime === 0 && !doc.getElementById("erreurs").hidden);
  const v = valeursEx(d);
  for (const c of d.champs) if (!c.groupe) { const el = f.elements[c.id]; if (c.type === "case") el.checked = true; else el.value = v[c.id]; }
  f.dispatchEvent(new w.Event("input", { bubbles: true }));
  const ap = doc.getElementById("apercu");
  check(`${d.slug} : le formulaire remplit l'aperçu (aucun champ vide)`, !ap.querySelector("mark.vide") && ap.textContent.includes(String(v[d.champs.find(c => c.id && /nom$/.test(c.id)).id])));
  doc.querySelector('#langue-doc button[data-v="deux"]').click();
  check(`${d.slug} : « les deux » -> une page française + une page arabe`, ap.querySelectorAll(".feuille").length === 2 && ap.querySelector('.feuille[lang="ar"][dir="rtl"]'));
  doc.getElementById("telecharger").click();
  const imp = doc.getElementById("impression");
  check(`${d.slug} : PDF lancé, document final sans champ vide`, w.__imprime === 1 && imp && imp.querySelectorAll(".feuille").length === 2 && !imp.querySelector("mark.vide") && doc.getElementById("erreurs").hidden);
  check(`${d.slug} : sections étapes, pièces, où aller, FAQ, sources`, ["etapes", "pieces", "ou", "faq", "sources"].every(id => doc.getElementById(id)) && doc.querySelectorAll("#etapes .schema li").length === d.etapes.length);
  check(`${d.slug} : avertissement « non officiel, ne remplace pas un avocat »`, doc.querySelector(".avert").textContent.includes("ne remplace pas un avocat"));
  check(`${d.slug} : champs du formulaire sélectionnables (pas dans une zone protégée)`, !f.closest(".protege"));
}
{
  const w = await page(DOCS[0].slug + "/index.html", "ar"), doc = w.document;
  check("page en arabe : lang=ar, dir=rtl, bouton « Français »", doc.documentElement.lang === "ar" && doc.documentElement.dir === "rtl" && doc.querySelector(".langue").textContent === "Français");
  check("page en arabe : aperçu du document en arabe par défaut", doc.querySelector('#apercu .feuille[lang="ar"]') && !doc.querySelector('#apercu .feuille[lang="fr"]'));
  check("page en arabe : exemples des champs en arabe", ARABE.test(doc.querySelector("#formulaire input[type=text]").placeholder));
  const ar = [...doc.querySelectorAll('[data-l="ar"]')].map(x => x.innerHTML).join(" ").replace(/<[^>]+>/g, " ");
  check("textes arabes : mots latins et nombres isolés", !/[؀-ۿ][^<⁨⁩]*?[\s(،:]PDF[\s.،)]/.test(ar) && ar.includes("⁨"));
}
for (const d of CONTRATS) {
  const w = await page(d.slug + "/index.html"), doc = w.document;
  check(`${d.slug} : pas de formulaire, encart « modèle après relecture par un avocat »`, !doc.getElementById("formulaire") && /avocat/.test(doc.getElementById("modele-a-venir").textContent));
  check(`${d.slug} : section « À vérifier » visible`, !!doc.getElementById("a-verifier"));
}
{
  const w = await page("index.html"), doc = w.document;
  check("accueil : 19 cartes de documents", doc.querySelectorAll("[data-cherche]").length === 19);
  check("accueil : 6 catégories avec icône", doc.querySelectorAll(".cat svg").length === 6);
  check("accueil : 3 badges de confiance", doc.querySelectorAll(".badge-c").length === 3);
  const r = doc.getElementById("recherche");
  r.value = "procuration"; r.dispatchEvent(new w.Event("input"));
  check("accueil : la recherche « procuration » filtre", doc.querySelectorAll("[data-cherche]:not([hidden])").length === 2);
  r.value = "توكيل"; r.dispatchEvent(new w.Event("input"));
  check("accueil : la recherche en arabe « توكيل » fonctionne", doc.querySelectorAll("[data-cherche]:not([hidden])").length >= 2);
  r.value = "zzzz"; r.dispatchEvent(new w.Event("input"));
  check("accueil : « aucun document » si rien ne correspond", !doc.getElementById("aucun").hidden);
  r.value = ""; r.dispatchEvent(new w.Event("input"));
  doc.querySelector('.cat[data-cat="logement"]').click();
  check("accueil : la catégorie Logement filtre", [...doc.querySelectorAll("[data-cherche]:not([hidden])")].every(x => x.dataset.cat === "logement"));
}

// ---- 5. Règles communes : SEO, mentions, photos, sécurité ---------------------------
const V = new Set();
for (const p of fichiers) {
  const s = lire(p);
  check(`${p} : titre, description, canonical`, /<title>.{20,}<\/title>/.test(s) && /name="description" content=".{50,}"/.test(s) && s.includes('rel="canonical"'));
  check(`${p} : image d'aperçu og-image-v1.png`, s.includes("og-image-v1.png"));
  check(`${p} : meta noai, CSP, referrer`, s.includes('<meta name="robots" content="noai, noimageai">') && s.includes('http-equiv="Content-Security-Policy"') && /script-src 'self'/.test(s) && s.includes('name="referrer"'));
  check(`${p} : aucun script en ligne exécutable (CSP)`, [...s.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].every(m => /application\/ld\+json/.test(m[1])) && !/\son[a-z]+="/i.test(s) && !/\sstyle="/.test(s));
  check(`${p} : liens externes en rel="noopener"`, [...s.matchAll(/<a [^>]*href="https?:[^"]*"[^>]*>/g)].every(m => /rel="noopener/.test(m[0])));
  check(`${p} : protection (page.js) chargée`, /src="(\.\.\/)?assets\/page\.js\?v=/.test(s));
  (s.match(/\?v=([0-9a-f]+)/g) || []).forEach(x => V.add(x));
  const m = s.match(/<img class="hero-photo" src="([^"]+)"/);
  check(`${p} : photo du bandeau présente (≤ 150 Ko) et créditée`, !!m && existsSync(join(root, dirname(p), m[1])) && statSync(join(root, dirname(p), m[1])).size <= 150000 && /class="credit-photo"[^]*Wikimedia Commons/.test(s));
  check(`${p} : pas de traduction automatique (translate="no" sur <html>, meta google notranslate)`, /<html translate="no"[ >]/.test(s) && /<meta charset="utf-8">\s*<meta name="google" content="notranslate">/.test(s));
  const w = await page(p), doc = w.document, pied = doc.getElementById("pied").textContent;
  check(`${p} : translate="no" gardé par le JavaScript (français puis arabe)`, doc.documentElement.getAttribute("translate") === "no" && (doc.querySelector(".langue")?.click(), doc.documentElement.lang === "ar" && doc.documentElement.getAttribute("translate") === "no"));
  check(`${p} : en-tête avec logo, pied ©, non officiel, date`, !!doc.querySelector("#entete .logo-mark") && pied.includes("©") && pied.includes("non officiel") && /\d{2}\/\d{2}\/\d{4}/.test(pied));
  check(`${p} : dates « vérifié le » = la constante MAJ`, [...doc.querySelectorAll("[data-maj]")].every(x => x.textContent === w.eval("MAJ")));
  const ld = [...s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(x => JSON.parse(x[1]));
  if (p !== "index.html" && p !== "a-propos/index.html") check(`${p} : FAQ Google (JSON-LD) en français et en arabe`, ld.some(j => j["@type"] === "FAQPage" && j.mainEntity.length >= 2 && j.mainEntity.some(q => ARABE.test(q.name))));
}
check("même version ?v= sur toutes les pages", V.size === 1);
// les pages publiées sont à jour par rapport aux données
const gen = await import("file://" + join(root, "tools/generer.mjs").replace(/\\/g, "/"));
const attendu = gen.pages(root);
const perimees = Object.entries(attendu).filter(([f, s]) => !existsSync(join(root, f)) || lire(f).replace(/\r\n/g, "\n") !== s).map(([f]) => f);
check(`pages à jour (sinon : node tools/generer.mjs)${perimees.length ? " — " + perimees.join(", ") : ""}`, !perimees.length);
check("plan du site : 21 pages", (lire("sitemap.xml").match(/<loc>/g) || []).length === 21);

// photos : licence libre, crédit, preuves
const CREDITS = JSON.parse(lire("assets/photos/credits.json"));
const LIBRES = /^(CC0|Public domain|CC BY(-SA)? [234]\.\d)$/;
for (const [nom, c] of Object.entries(CREDITS)) {
  check(`photo ${nom} : licence libre (${c.licence}), auteur, source Commons`, LIBRES.test(c.licence) && c.auteur && /^https:\/\/commons\.wikimedia\.org\//.test(c.source) && existsSync(join(root, c.fichier)));
  check(`photo ${nom} : créditée sur la page À propos`, lire("a-propos/index.html").includes(c.source));
}
const preuves = join(root, "..", "preuves conditions d'utilisation");
if (existsSync(preuves)) {
  const dossiers = readdirSync(preuves).map(d => join(preuves, d, "photos")).filter(existsSync);
  const f = dossiers.flatMap(d => readdirSync(d));
  check("preuves des licences photos sauvegardées (API + page de chaque photo, SHA256SUMS)", Object.keys(CREDITS).every(n => f.includes(n + "_api.json") && f.includes(n + "_page.html")) && f.includes("SHA256SUMS.txt"));
} else console.log("(preuves photos non disponibles sur cette machine : vérification ignorée)");

// aucun concurrent cité (noms comparés par empreinte, pour ne pas les écrire dans ce dépôt public)
const INTERDITS = new Set("307804f8a9e7bd48 8b30fe9b5db7797d 04dcb0d6d0e1cf09 41203aefbaa81d72 bcdb95fe1947c378 9637c0327a8cede8 bab1c2c81c93ac98 bcf950015754248a e4a62b35a8e5d6c2 261d1c911c05f428 a60b2df220c8f10e 7a7fa591155e1ddf 0d27b5e9a89a7130 91566e9abbb02832 05f0fa025a3b026b 87838d7d30f0653a".split(" "));
const publics = [...fichiers, "assets/documents.js", "assets/page.js", "assets/modele.js", "README.md", "CLAUDE.md", "GUIDE.md", "sitemap.xml", "robots.txt"].filter(f => existsSync(join(root, f)));
const cites = publics.filter(f => (lire(f).toLowerCase().match(/[a-z0-9-]+/g) || []).some(m => INTERDITS.has(createHash("sha256").update(m).digest("hex").slice(0, 16))));
check(`aucun nom de concurrent sur le site ni dans le dépôt${cites.length ? " — trouvé dans " + cites.join(", ") : ""}`, !cites.length);

// robots.txt : Google oui, robots d'IA et aspirateurs non
const robots = lire("robots.txt");
const blocs = robots.split(/\n\s*\n/).map(b => ({ agents: [...b.matchAll(/User-agent:\s*(.+)/gi)].map(m => m[1].trim()), tout: /Disallow:\s*\/\s*$/m.test(b) }));
const interdit = a => blocs.some(b => b.agents.includes(a) && b.tout);
check("robots.txt : robots d'IA et aspirateurs interdits", ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-Web", "anthropic-ai", "CCBot", "Google-Extended", "Applebot-Extended", "PerplexityBot", "Bytespider", "Amazonbot", "Meta-ExternalAgent", "FacebookBot", "Diffbot", "Omgilibot", "cohere-ai", "ImagesiftBot", "HTTrack", "WebCopier", "WebZIP", "Offline Explorer", "wget", "SiteSnagger"].every(interdit));
check("robots.txt : Googlebot, Bingbot et les autres moteurs autorisés", !interdit("Googlebot") && !interdit("Bingbot") && !interdit("*") && robots.includes("sitemap.xml"));
// protection anti-copie / anti-cadre
const pj = lire("assets/page.js"), css = lire("assets/style.css");
check("anti-copie : source ajoutée au texte copié, clic droit bloqué sur les images", /addEventListener\("copy"/.test(pj) && pj.includes("Source : ") && /addEventListener\("contextmenu"/.test(pj));
check("anti-cadre (iframe d'un autre site)", /window\.top !== window\.self|window\.top === window\.self/.test(pj));
check("contenus protégés non sélectionnables, champs du formulaire libres", /\.protege\{user-select:none/.test(css) && /\.protege input,\.protege textarea/.test(css));
// aucun secret
const tout = publics.concat(".github/workflows/surveillance.yml", ".github/workflows/tests.yml", "tools/surveiller_sources.mjs").filter(f => existsSync(join(root, f))).map(lire).join("\n");
check("aucun secret (clé, jeton, mot de passe, e-mail privé)", !/(api[_-]?key|secret[_-]?key|password|passwd|token)\s*[:=]\s*["'](?!\$\{\{)[^"']{8,}/i.test(tout) && !/gh[pousr]_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30}|sk-[A-Za-z0-9]{20,}/.test(tout) && !/[a-z0-9._-]+@(yahoo|gmail|hotmail|outlook)\./i.test(tout));
check("LICENSE tous droits réservés", lire("LICENSE").includes("Tous droits réservés"));
check(".gitattributes : fins de ligne LF", /\*\s+text=auto\s+eol=lf/.test(lire(".gitattributes")));
check(".gitignore : captures et node_modules ignorés", /captures/.test(lire(".gitignore")) && /node_modules/.test(lire(".gitignore")));
check("image d'aperçu 1200×630 présente", existsSync(join(root, "assets/og-image-v1.png")) && (b => b.readUInt32BE(16) === 1200 && b.readUInt32BE(20) === 630)(readFileSync(join(root, "assets/og-image-v1.png"))));

console.log(erreurs ? `\n${erreurs} PROBLÈME(S)` : "\nTOUT PASSE");
process.exit(erreurs ? 1 : 0);

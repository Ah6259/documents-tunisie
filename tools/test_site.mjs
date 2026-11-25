// Test automatique de Documents Tunisie — à lancer après CHAQUE modification :
//   node tools/test_site.mjs            (teste le site)
//   node tools/test_site.mjs <dossier>  (teste une copie : utilisé par tools/sabotage.mjs)
// jsdom s'installe une fois par PC :  npm install --no-save --no-package-lock jsdom
import { JSDOM, VirtualConsole } from "jsdom";
import { readFileSync, existsSync, statSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { createRequire } from "module";
import { createHash, webcrypto } from "crypto";

const ici = dirname(fileURLToPath(import.meta.url));
const root = resolve(process.argv[2] || join(ici, ".."));
const lire = f => readFileSync(join(root, f), "utf8");
let erreurs = 0;
const muet = !!process.env.MUET;
const check = (desc, cond) => { if (!cond || !muet) console.log((cond ? "OK   " : "FAIL ") + desc); if (!cond) erreurs++; };
const req = createRequire(join(root, "tools", "x.js"));
const { DOCS, CONTRATS, GUIDES, CATEGORIES, SOURCES } = req(join(root, "assets/documents.js"));
const M = req(join(root, "assets/modele.js"));
const TOUS = [...DOCS, ...CONTRATS, ...GUIDES];
const ARABE = /[؀-ۿ]/;

// ---- 1. Données : chaque document est complet ---------------------------------
check("au moins 20 documents à remplir (dont 4 grands contrats) et 6 démarches expliquées (le robot de nuit peut en ajouter ; aucun ne doit disparaître)", DOCS.length >= 20 && GUIDES.length >= 6);
// grands contrats devenus modèles (demande d'Ahmed, 07/10/2026 : plus de règle « après relecture par un avocat ») — mêmes adresses qu'avant
const GRANDS = ["vente-voiture", "vente-moto", "location-maison", "bail-commercial"];
for (const slug of GRANDS) { const d = DOCS.find(x => x.slug === slug);
  check(`${slug} : modèle de contrat à remplir (formulaire + texte FR et AR), même adresse qu'avant`, !!d && d.grand === true && !d.contrat && d.champs.length > 10 && typeof d.fr === "function" && typeof d.ar === "function"); }
// lieux (règle commune § 11.11, 18/10/2026) : toute liste de gouvernorats = les 24 de La Poste, rien d'autre (dans les deux sens) ;
// la liste des commissariats régionaux de l'éducation (champ « delegation ») = un par gouvernorat, sauf Tunis et Sfax coupés en 1 et 2
// (exceptions relues à la main : ce ne sont pas des délégations administratives)
{ const OFFICIELS = ["ariana", "beja", "ben arous", "bizerte", "gabes", "gafsa", "jendouba", "kairouan", "kasserine", "kebili", "kef", "mahdia",
    "manouba", "medenine", "monastir", "nabeul", "sfax", "sidi bouzid", "siliana", "sousse", "tataouine", "tozeur", "tunis", "zaghouan"];
  const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/-/g, " ").replace(/^(la|le) /, "").trim();
  const exact = (l, att) => { const n = l.map(norm); return n.length === att.length && new Set(n).size === n.length && att.every(o => n.includes(o)) && n.every(x => att.includes(x)); };
  const CRE = [...OFFICIELS.filter(g => g !== "tunis" && g !== "sfax"), "tunis 1", "tunis 2", "sfax 1", "sfax 2"];
  const champs = TOUS.flatMap(d => (d.champs || []).map(c => [d.slug, c]));
  const gouv = champs.filter(([, c]) => c.type === "select" && /^gouv/.test(c.id)), cre = champs.filter(([, c]) => c.type === "select" && c.id === "delegation");
  check(`lieux : chaque liste « Gouvernorat » (${gouv.length}) = les 24 gouvernorats officiels, rien d'autre`, gouv.length > 0 && gouv.every(([, c]) => exact(c.options.map(o => o.fr), OFFICIELS)));
  check(`lieux : chaque liste « Commissariat régional de l'éducation » (${cre.length}) = un par gouvernorat (Tunis 1/2, Sfax 1/2), rien d'autre`, cre.every(([, c]) => exact(c.options.map(o => o.fr), CRE)));
  check("lieux : aucun autre champ ne propose une liste de lieux non vérifiée (délégation, ville, quartier)", champs.filter(([, c]) => c.type === "select" && /deleg|ville|quartier|localite|region/i.test(c.id) && c.id !== "delegation").length === 0); }
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
for (const d of GUIDES) check(`${d.slug} : explication seulement (aucun modèle à remplir), points non confirmés « à vérifier »`, d.guide === true && !d.champs && !d.fr && !d.ar && d.averifier.fr.length >= 1);
for (const d of DOCS) {
  const ids = d.champs.filter(c => !c.groupe).map(c => c.id), ex = d.exemple || {};
  check(`${d.slug} : données d'exemple (champ « exemple ») connues, choix valides, FR + AR`, d.exemple && Object.keys(ex).length >= 5 && Object.keys(ex).every(k => ids.includes(k))
    && d.champs.filter(c => c.type === "select").every(c => ["fr", "ar"].every(L => c.options.some(o => o.v === M.valeursExemple(d, L)[c.id])))
    && Object.values(ex).filter(Array.isArray).every(x => x.length === 2 && ARABE.test(x[1]) || /^[\d\s()]+$/.test(x[1])));
  check(`${d.slug} : exemple complet (aucun champ obligatoire vide), sans trou, sans vraie CIN`, ["fr", "ar"].every(L => !M.erreurs(d, M.valeursExemple(d, L)).length && !/mark class="vide"|undefined|NaN|\[object/.test(M.feuilleExemple(d, L)))
    && ["fr", "ar"].every(L => !/\b\d{8,}\b/.test(M.feuilleExemple(d, L).replace(/<[^>]+>/g, ""))));
  check(`${d.slug} : le PDF ne contient jamais « EXEMPLE »`, ["fr", "ar"].every(L => !/EXEMPLE|ex-filigrane|ex-etiquette/.test(M.feuilleExemple(d, L))));
}
check("style : [hidden]{display:none!important} (un élément caché par le JS ne réapparaît jamais à cause d'un display:flex/grid)", /\[hidden\]\{display:none!important\}/.test(lire("assets/style.css").replace(/\s+/g, "")));
check("exemple jamais imprimé (CSS : impression = #impression seulement, #exemple caché)", /body > \*:not\(#impression\)\{display:none!important\}/.test(lire("assets/style.css")) && /@media print\{#exemple\{display:none!important\}\}/.test(lire("assets/style.css")));
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
  // le PDF est le document de la personne : aucune mention du site (l'avertissement est sur la page web)
  check(`${d.slug} : aucune mention du site sur le PDF`, ["fr", "ar"].every(L => !/ah6259|Documents Tunisie|وثائق تونس|indicatif|استرشادي|github/.test(M.feuille(d, valeursEx(d), L))));
}

// ---- 4. Pages chargées comme dans un navigateur ------------------------------------
// UNE ADRESSE PAR LANGUE (21/11/2026) : l'ARABE est à l'adresse principale (décision d'Ahmed : « les Tunisiens lisent l'arabe »),
// le français sous fr/ ; ar/ = renvois. page(chemin) ouvre fr/<chemin> (page française seule), page(chemin, "ar") ouvre <chemin>, sans ?lang ;
// le bouton de langue appelle window.allerVers (noté dans w.__allerVers) au lieu de changer d'adresse.
async function page(chemin, lang = "fr") {
  if (lang !== "ar" && existsSync(join(root, "fr", chemin))) chemin = "fr/" + chemin;
  const dossier = dirname(join(root, chemin));
  // (les scripts externes, comme GoatCounter, ne sont pas chargés)
  const html = lire(chemin).replace(/<script([^>]*) src="(?!https?:)([^"?]+)(\?[^"]*)?"([^>]*)><\/script>/g,
    (_, a, src) => `<script>${readFileSync(join(dossier, src), "utf8")}</script>`);
  const vc = new VirtualConsole(); vc.on("jsdomError", e => { if (!/Not implemented/.test(e.message)) { console.log("   erreur JS :", chemin, e.message); erreurs++; } });
  const dom = new JSDOM(html, { url: `https://documents.clicvia.com/${chemin.replace("index.html", "")}${/data-langue-fixe/.test(html) ? "" : "?lang=" + lang}`,
    runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) { w.allerVers = u => { w.__allerVers = u; }; } });
  dom.window.__imprime = 0; dom.window.print = () => dom.window.__imprime++;
  await new Promise(ok => dom.window.addEventListener("load", ok));
  return dom.window;
}
const fichiers = ["index.html", "a-propos/index.html", "pass/index.html", "pass/conditions/index.html", ...TOUS.map(d => d.slug + "/index.html")];
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
  check(`${d.slug} : le PDF imprimé ne contient aucun lien d'annuaire ni avertissement de la page`, !/avocats-notaires-tunisie|mariage-tunisie|comptables-tunisie|outils-pratiques|indicatif|Important avant/.test(imp.innerHTML));
  check(`${d.slug} : le PDF imprimé ne contient pas l'exemple (ni « EXEMPLE », ni données fictives)`, !/EXEMPLE|مثال|fictive|وهمية|0XXXXXXX/.test(imp.innerHTML));
  // plus d'exemple (spécimen) sur les pages : demande d'Ahmed du 07/10/2026 (lisible et copiable sans télécharger)
  check(`${d.slug} : aucun exemple rempli (spécimen) sur la page`, !doc.getElementById("exemple") && !doc.querySelector(".ex-page, .ex-boite, .ex-filigrane"));
  check(`${d.slug} : sections étapes, pièces, où aller, FAQ, sources`, ["etapes", "pieces", "ou", "faq", "sources"].every(id => doc.getElementById(id)) && doc.querySelectorAll("#etapes .schema li").length === d.etapes.length);
  check(`${d.slug} : avertissement « non officiel, ne remplace pas un avocat »`, doc.querySelector(".avert").textContent.includes("ne remplace pas un avocat"));
  check(`${d.slug} : champs du formulaire sélectionnables (pas dans une zone protégée)`, !f.closest(".protege"));
}
{
  const w = await page(DOCS[0].slug + "/index.html", "ar"), doc = w.document;
  check("page en arabe : lang=ar, dir=rtl, bouton court « Fr » (titre « Français »)", doc.documentElement.lang === "ar" && doc.documentElement.dir === "rtl" && doc.querySelector(".langue").textContent === "Fr" && doc.querySelector(".langue").title === "Français");
  check("page en arabe : aperçu du document en arabe par défaut", doc.querySelector('#apercu .feuille[lang="ar"]') && !doc.querySelector('#apercu .feuille[lang="fr"]'));
  // (jsdom ne charge pas la feuille de style : on vérifie la structure + la règle CSS qui cache l'autre langue)
  check("page en arabe : exemples des champs en arabe", ARABE.test(doc.querySelector("#formulaire input[type=text]").placeholder));
  const ar = [...doc.querySelectorAll('[data-l="ar"]')].map(x => x.innerHTML).join(" ").replace(/<[^>]+>/g, " ");
  check("textes arabes : mots latins et nombres isolés", !/[؀-ۿ][^<⁨⁩]*?[\s(،:]PDF[\s.،)]/.test(ar) && ar.includes("⁨"));
}
for (const d of CONTRATS) {
  const w = await page(d.slug + "/index.html"), doc = w.document;
  check(`${d.slug} : pas de formulaire, encart « modèle après relecture par un avocat »`, !doc.getElementById("formulaire") && /avocat/.test(doc.getElementById("modele-a-venir").textContent));
  check(`${d.slug} : section « À vérifier » visible`, !!doc.getElementById("a-verifier"));
}
for (const d of GUIDES) {
  const w = await page(d.slug + "/index.html"), doc = w.document;
  check(`${d.slug} : pas de formulaire, encart « explication seulement », sections « À vérifier » et sources`, !doc.getElementById("formulaire") && !!doc.getElementById("explication-seulement") && !!doc.getElementById("a-verifier") && doc.querySelectorAll("#sources a").length === d.sources.length);
}
// Annuaire gratuit des avocats et notaires : grands contrats, démarches expliquées et documents à risque
const HONNEUR = ["pret-d-honneur", "demande-pret-d-honneur"];   // prêt d'honneur : annuaire des comptables + calculateur de crédit
const AVEC_ANNUAIRE = [...CONTRATS, ...GUIDES].map(d => d.slug).filter(s => !HONNEUR.includes(s)).concat("reconnaissance-de-dette");
for (const slug of AVEC_ANNUAIRE) {
  const w = await page(slug + "/index.html"), doc = w.document, docAr = (await page(slug + "/index.html", "ar")).document;
  // une adresse par langue : le lien français sur la page française, le lien arabe (?lang=ar) sur la page arabe
  const liens = [...doc.querySelectorAll('#annuaire a[href^="https://avocats.clicvia.com/"]'), ...docAr.querySelectorAll('#annuaire a[href="https://avocats.clicvia.com/?lang=ar"]')];
  check(`${slug} : lien vers l'annuaire des avocats et notaires (FR + AR, clic compté, hors du PDF)`, liens.length === 2
    && liens.every(a => a.dataset.annuaire === "lien-avocats/" + slug && /noopener/.test(a.rel)) && !doc.querySelector("#annuaire").closest("#impression, .feuille")
    && ARABE.test(docAr.getElementById("annuaire").textContent) && !docAr.querySelector("#annuaire [data-l=fr]") && !doc.querySelector("#annuaire [data-l=ar]"));
  check(`${slug} : texte neutre (pas de « meilleur », pas de classement)`, !/meilleur|top \d|أفضل/i.test(doc.getElementById("annuaire").textContent));
  let compte = null; w.goatcounter = { count: o => { compte = o; } };
  liens[0].addEventListener("click", e => e.preventDefault()); liens[0].click();
  check(`${slug} : clic sur l'annuaire compté anonymement (lien-avocats/${slug})`, compte && compte.path === "lien-avocats/" + slug && compte.event === true);
}
for (const slug of HONNEUR) {
  const w = await page(slug + "/index.html"), doc = w.document, docAr = (await page(slug + "/index.html", "ar")).document;
  const tous = sel => [...doc.querySelectorAll(sel), ...docAr.querySelectorAll(sel)];
  const compta = tous('#annuaire a[href^="https://comptables.clicvia.com/"]');
  const calc = tous('#annuaire a[href^="https://outils.clicvia.com/credit/"]');
  check(`${slug} : liens vers l'annuaire des comptables et le calculateur de crédit (FR + AR, clic compté, noopener)`, compta.length === 2 && calc.length === 2
    && compta.every(a => a.dataset.annuaire === "lien-comptables/" + slug && /noopener/.test(a.rel)) && calc.every(a => a.dataset.annuaire === "lien-outils/" + slug));
  check(`${slug} : dépôt en ligne seulement (circulaire BCT n° 2026-08) et « À vérifier » daté`, /uniquement sur la plateforme en ligne/.test(doc.body.textContent) && /Situation au \d{2}\/\d{2}\/2026/.test(doc.getElementById("a-verifier").textContent)
    && doc.querySelector('#sources a[href="https://www.bct.gov.tn/bct/siteprod/documents/Cir_2026_08_ar.pdf"]'));
}
{
  const doc = (await page("demande-pret-d-honneur/index.html")).document;
  check("demande de prêt d'honneur : encart « modèle indicatif, formulaire officiel d'abord » avant le formulaire, hors du PDF", /formulaire officiel, utilisez-le/.test(doc.getElementById("attention")?.textContent || "")
    && doc.getElementById("attention").compareDocumentPosition(doc.getElementById("remplir")) === 4 && !doc.getElementById("attention").closest(".protege"));
  const g = (await page("pret-d-honneur/index.html")).document;
  check("prêt d'honneur : la page explicative mène au modèle de lettre", !!g.querySelector('#explication-seulement a[href="../demande-pret-d-honneur/"]'));
}
{
  // traite : schéma SPÉCIMEN dessiné par nous, cases numérotées 1 à 14 + légende FR/AR (demande d'Ahmed du 07/10/2026)
  const doc = (await page("traite-lettre-de-change/index.html")).document, sec = doc.getElementById("schema");
  const img = sec && sec.querySelector("figure.schema-doc img"), svgT = existsSync(join(root, "assets/illustrations/traite-cases.svg")) ? lire("assets/illustrations/traite-cases.svg") : "";
  const nums = [...(svgT.matchAll(/text-anchor="middle">(\d+)<\/text>/g))].map(m => +m[1]);
  check("traite : schéma « Case par case » (image à nous, protégée), 14 cases expliquées en FR et AR, cases grises = banque",
    sec && sec.classList.contains("protege") && img && /^\.\.\/\.\.\/assets\/illustrations\/traite-cases\.svg\?v=/.test(img.getAttribute("src")) && img.getAttribute("alt")
    && sec.querySelectorAll("ol.cases li").length === 14 && [...sec.querySelectorAll("ol.cases li")].every(li => li.querySelector('[data-l="fr"]') && !li.querySelector('[data-l="ar"]'))
    && [...(await page("traite-lettre-de-change/index.html", "ar")).document.querySelectorAll("#schema ol.cases li")].filter(li => li.querySelector('[data-l="ar"]') && !li.querySelector('[data-l="fr"]')).length === 14
    && /Cases grises/.test(sec.textContent) && doc.getElementById("explication-seulement").compareDocumentPosition(sec) === 4);
  check("traite : le schéma est un SPÉCIMEN dessiné par nous (mention « SPÉCIMEN · نموذج », numéros 1 à 14, aucun vrai RIB ni vrai nom)",
    /SPÉCIMEN · نموذج/.test(svgT) && /Dessin original de Documents Tunisie/.test(svgT) && [...Array(14)].every((_, i) => nums.includes(i + 1)) && !/\d{6,}/.test(svgT.replace(/<[^>]+>/g, " ")));
}
check("mariage : second lien vers l'annuaire des prestataires de mariage", /href="https:\/\/mariage\.clicvia\.com\/"[^>]*data-annuaire="lien-mariage\/mariage"/.test(lire("fr/mariage/index.html")));
check("aucun PDF ne contient l'adresse des annuaires", DOCS.every(d => ["fr", "ar"].every(L => !/avocats-notaires-tunisie|mariage-tunisie|comptables-tunisie|outils-pratiques|clicvia\.com/.test(M.feuille(d, valeursEx(d), L)))));
{
  const w = await page("index.html"), doc = w.document;
  check(`accueil : ${TOUS.length} cartes de documents (une par document, contrat et démarche)`, doc.querySelectorAll("[data-cherche]").length === TOUS.length);
  check("accueil : 6 catégories avec icône", doc.querySelectorAll(".cat svg").length === 6);
  check("accueil : plus de badges sans lien ; « 1 document gratuit par jour, étapes gratuites, sans inscription » dans l'intro (FR + AR)", !doc.querySelector(".confiance, .badge-c") && /1 document gratuit par jour, étapes gratuites, sans inscription/.test(doc.querySelector(".hero").textContent) && /وثيقة مجانية كل يوم، المراحل مجانية، دون تسجيل/.test(lire("index.html")));
  check("accueil : PAS de bouton « Pass Journée » (décision d'Ahmed : le visiteur partirait), aucun lien vers pass/", !doc.querySelector('a[href^="pass/"], a[href*="/pass/"], .btn-pass, .btn-pro') && !/Pass Journée/.test(doc.body.textContent));
  // bouton vers l'annuaire « Avocats et notaires » (demande d'Ahmed du 06/10/2026) : fin de la rangée des catégories, bordure dorée
  const av = doc.querySelector(".cats > a.cat-annuaire");
  check("accueil : bouton « Avocats et notaires » / « محامون وعدول » à la fin de la rangée des catégories, avec le logo de l'annuaire (copié dans le site)",
    av && av === doc.querySelector(".cats").lastElementChild && av.getAttribute("href") === "https://avocats.clicvia.com/" && /noopener/.test(av.rel)
    && /Avocats et notaires/.test(av.textContent) && /محامون وعدول/.test(lire("index.html").match(/<a class="cat-annuaire"[\s\S]*?<\/a>/)[0]) && av.querySelector('img[src="../assets/logo-avocats-notaires.svg"]')
    && existsSync(join(root, "assets/logo-avocats-notaires.svg")) && /\.cat-annuaire\{[^}]*border:2px solid #F2B33D/.test(lire("assets/style.css")));
  { let c = null; w.goatcounter = { count: o => { c = o; } }; av.addEventListener("click", e => e.preventDefault()); av.click();
    check("accueil : clic sur « Avocats et notaires » compté anonymement (lien-site/avocats), sans filtrer les catégories", c && c.path === "lien-site/avocats" && c.event === true && !doc.querySelector(".cat.on")); }
  check("en-tête et pied de page : lien « Avocats et notaires » (logo, bordure dorée, clic compté)", !!doc.querySelector('#entete a.entete-annuaire[data-annuaire="lien-site/avocats"] img[src="../assets/logo-avocats-notaires.svg"]')
    && !!doc.querySelector('#pied a[data-annuaire="lien-site/avocats"]') && /\.entete-annuaire\{[^}]*border:2px solid #F2B33D/.test(lire("assets/style.css")));
  const r = doc.getElementById("recherche");
  r.value = "procuration"; r.dispatchEvent(new w.Event("input"));
  check("accueil : la recherche « procuration » filtre", doc.querySelectorAll("[data-cherche]:not([hidden])").length === 2);
  r.value = "توكيل"; r.dispatchEvent(new w.Event("input"));
  check("accueil : la recherche en arabe « توكيل » fonctionne", doc.querySelectorAll("[data-cherche]:not([hidden])").length >= 2);
  for (const mot of ["pret d'honneur", "crédit sans intérêts", "قرض الشرف", "قروض بدون فوائد", "décret 148", "BTS"]) {
    r.value = mot; r.dispatchEvent(new w.Event("input"));
    const vus = [...doc.querySelectorAll("[data-cherche]:not([hidden])")].map(x => x.getAttribute("href"));
    check(`accueil : la recherche « ${mot} » trouve le prêt d'honneur et son modèle`, vus.includes("pret-d-honneur/") && vus.includes("demande-pret-d-honneur/"));
  }
  r.value = "zzzzqqq"; r.dispatchEvent(new w.Event("input"));   // (« zzzz » seul = « z » au son : trouverait les mots en z)
  check("accueil : « aucun document » si rien ne correspond", !doc.getElementById("aucun").hidden);
  // VS.5 (18/10/2026) : nombre de résultats affiché = nombre de cartes visibles, avec le bon singulier / pluriel
  const cpt = doc.getElementById("compte-recherche"), visibles = () => doc.querySelectorAll("[data-cherche]:not([hidden])").length;
  check("accueil (VS.5) : recherche sans résultat → « Aucun document »", !cpt.hidden && cpt.textContent === (doc.documentElement.lang === "ar" ? "لا توجد أي وثيقة" : "Aucun document"));
  r.value = "procuration"; r.dispatchEvent(new w.Event("input"));
  const nP = visibles();
  check(`accueil (VS.5) : « procuration » → « 2 documents » (= cartes visibles)`, nP === 2 && !cpt.hidden && cpt.textContent === "2 documents");
  const un = ["reçu de loyer", "recu loyer", "lettre de change", "traite"].map(m => { r.value = m; r.dispatchEvent(new w.Event("input")); return [m, visibles(), cpt.textContent]; }).find(([, n]) => n === 1);
  check(`accueil (VS.5) : une recherche à 1 résultat → « 1 document » (au singulier)${un ? " — « " + un[0] + " »" : ""}`, !!un && un[2] === "1 document");
  r.value = "contrat"; r.dispatchEvent(new w.Event("input"));
  const nC = visibles();
  check(`accueil (VS.5) : « contrat » → « ${nC} documents » (= cartes visibles)`, nC > 2 && cpt.textContent === `${nC} documents`);
  // Recherche « au son » (règle commune § 27, 18/10/2026, demande d'Ahmed) : deux écritures d'un même nom = même résultat
  { const S = w.sonRecherche, chercher = t => { r.value = t; r.dispatchEvent(new w.Event("input")); return [...doc.querySelectorAll("[data-cherche]:not([hidden])")].map(x => x.getAttribute("href")); };
    const commun = join(root, "..", "projets-ahmed", "outils communs", "recherche-au-son", "son.js");
    check("recherche au son : assets/son.js chargé sur l'accueil (copie identique de l'outil commun quand il est présent)", !!S
      && /<script defer src="assets\/son\.js\?v=/.test(lire("index.html")) && (!existsSync(commun) || readFileSync(commun, "utf8") === lire("assets/son.js")));
    const paires = [["Djerba", "Jerba"], ["Kairouan", "Qairouan"], ["Hammamet", "Hamamet"], ["Houmt Souk", "Houmet Essouk"]];
    check("recherche au son : Djerba = Jerba, Kairouan = Qairouan, Hammamet = Hamamet, Houmt Souk = Houmet Essouk (même résultat)",
      paires.every(([a, b]) => chercher(a).join() === chercher(b).join()) &&
      paires.every(([a, b]) => S.trouve(S.cle("Commune de " + a), b) && S.trouve(S.cle("Commune de " + b), a)));
    // paires tirées des VRAIS documents : « procuration » écrit « procurration », « attestation » écrit « atestation »
    check("recherche au son : « procurration » = « procuration », « atestation » = « attestation », « demmission » = « demisssion » = « démission »",
      chercher("procurration").join() === chercher("procuration").join() && chercher("procuration").length === 2
      && chercher("atestation").join() === chercher("attestation").join() && chercher("attestation").length >= 2
      && chercher("demmission").join() === chercher("démission").join() && chercher("demisssion").join() === chercher("démission").join() && chercher("démission").length >= 1);
    check("recherche au son : une recherche absurde (« zzzzqqq ») ne trouve toujours rien", chercher("zzzzqqq").length === 0); }
  r.value = ""; r.dispatchEvent(new w.Event("input"));
  check("accueil (VS.5) : recherche vide → compteur caché", cpt.hidden);
}
{
  const w = await page("index.html", "ar"), doc = w.document;
  const r = doc.getElementById("recherche"), cpt = doc.getElementById("compte-recherche");
  r.value = "procuration"; r.dispatchEvent(new w.Event("input"));
  const n = doc.querySelectorAll("[data-cherche]:not([hidden])").length;
  check("accueil en arabe (VS.5) : compteur « عدد الوثائق: N » avec le chiffre (= cartes visibles) ; « لا توجد أي وثيقة » sans résultat", cpt.textContent === "عدد الوثائق: " + n
    && (r.value = "zzzzqqq", r.dispatchEvent(new w.Event("input")), cpt.textContent === "لا توجد أي وثيقة"));
  doc.querySelector('.cat[data-cat="logement"]').click();
  check("accueil : la catégorie Logement filtre", [...doc.querySelectorAll("[data-cherche]:not([hidden])")].every(x => x.dataset.cat === "logement"));
}


// ---- 4 bis. Pass Journée (1 PDF gratuit par jour ; Pass 7 DT = tous les documents pendant 24 h) ----------------
// Faux navigateur : horloge réglable, crypto.subtle de Node, pass.json et Formspree simulés (aucun réseau).
const EMPREINTE = async (code, sel, tours) => {
  const k = await webcrypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveBits"]);
  const b = await webcrypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(sel), iterations: tours }, k, 256);
  return Buffer.from(b).toString("hex");
};
check("vecteur commun avec le robot du dépôt privé (Python) : PBKDF2-SHA-256, 100 000 tours",
  await EMPREINTE("ABCD2345", "sel-de-test", 100000) === "517bf9a9ea3ad38b3adcbeef5808d4efe420fbf10a2b7bd9179640f4d1c7c2dd");
async function pagePass(chemin, { horloge, stockage = {}, liste = null, envois = [], emails = [], echecs = 0, retouche = null } = {}) {
  if (stockage.langue !== "ar" && existsSync(join(root, "fr", chemin))) chemin = "fr/" + chemin;   // une adresse par langue (français sous fr/)
  const dossier = dirname(join(root, chemin));
  const html = lire(chemin).replace(/<script([^>]*) src="(?!https?:)([^"?]+)(\?[^"]*)?"([^>]*)><\/script>/g,
    (_, a, src) => { const js = readFileSync(join(dossier, src), "utf8"); return `<script>${retouche ? retouche(src, js) : js}</script>`; });   // retouche : script modifié pour un essai (ex. EMAIL_AUTO = true)
  const vc = new VirtualConsole(); vc.on("jsdomError", e => { if (!/Not implemented/.test(e.message)) { console.log("   erreur JS :", chemin, e.message); erreurs++; } });
  const dom = new JSDOM(html, { url: `https://documents.clicvia.com/${chemin.replace("index.html", "")}`, runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.allerVers = u => { w.__allerVers = u; };
      try { if (!w.localStorage.getItem("langue")) w.localStorage.setItem("langue", "fr"); } catch (e) {}  // ces scénarios lisent les textes français
      const Vraie = w.Date;
      w.Date = class extends Vraie { constructor(...a) { super(...(a.length ? a : [horloge.t])); } static now() { return horloge.t; } };
      Object.defineProperty(w, "crypto", { value: webcrypto, configurable: true });
      w.TextEncoder = TextEncoder;
      w.fetch = async (url, o) => {
        if (/api-email\.clicvia\.com/.test(url)) { emails.push([url, o]); return { ok: true, status: 200, json: async () => ({ ok: true }) }; }   // e-mail automatique (A.17) : à part
        if (/formspree/.test(url)) { if (echecs > 0) { echecs--; throw new Error("réseau coupé"); } envois.push(o.body); return { ok: true, status: 200, json: async () => ({ ok: true }) }; }
        if (!liste) throw new Error("hors connexion");
        return { ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(liste)) };
      };
      for (const [k, v] of Object.entries(stockage)) w.localStorage.setItem(k, v);
      w.__imprime = 0; w.print = () => w.__imprime++;
      w.__comptes = []; w.goatcounter = { count: o => w.__comptes.push(o) };
    } });
  await new Promise(ok => dom.window.addEventListener("load", ok));
  return dom.window;
}
const stock = w => Object.fromEntries(Object.keys(w.localStorage).map(k => [k, w.localStorage.getItem(k)]));
const remplir = (w, d) => { const f = w.document.getElementById("formulaire"), v = valeursEx(d);
  for (const c of d.champs) if (!c.groupe) { const el = f.elements[c.id]; if (c.type === "case") el.checked = true; else el.value = v[c.id]; } };
const attendre = async (cond, ms = 5000) => { const t0 = Date.now(); while (!cond() && Date.now() - t0 < ms) await new Promise(r => setTimeout(r, 20)); return cond(); };
async function taperCode(w, code) {
  const f = w.document.getElementById("code-modele") || w.document.getElementById("code-pass"), st = f.querySelector(".code-status");
  f.querySelector("input[name=code]").value = code;
  f.dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await attendre(() => st.textContent && !/Vérification/.test(st.textContent));
  return st;
}
// E-mail automatique (A.17, 25/11/2026) : le JSON envoyé doit être ACCEPTÉ par le vrai verifier() du service (worker.js + sites.json du
// dépôt PRIVÉ projets-ahmed, cherché à côté de ce dépôt). Absent (GitHub) : contrôle sauté, jamais en échec.
const EMAIL_DIR = [join(ici, "../.."), join(ici, "../../projets-ahmed"), join(ici, "../../../projets-ahmed"), "/home/user/projets-ahmed"]
  .map(d => join(d, "outils communs", "email-clients")).find(d => existsSync(join(d, "worker.js")) && existsSync(join(d, "sites.json")));
let WORKER = null;
if (EMAIL_DIR) {
  const { mkdtempSync, writeFileSync } = await import("fs"), { tmpdir } = await import("os"), { pathToFileURL } = await import("url");
  const w = readFileSync(join(EMAIL_DIR, "worker.js"), "utf8"), sj = readFileSync(join(EMAIL_DIR, "sites.json"), "utf8").trim();
  if (w.includes("/*SITES_ICI*/ {}")) {
    const f = join(mkdtempSync(join(tmpdir(), "email-")), "worker.mjs"); writeFileSync(f, w.replace("/*SITES_ICI*/ {}", sj));
    WORKER = await import(pathToFileURL(f).href);
  }
}
const accepteParWorker = (j, L) => {
  if (!WORKER) { if (!muet) console.log("     (vrai verifier() du service d'e-mail introuvable : contrôle sauté)"); return true; }
  const v = WORKER.verifier(j, "https://documents.clicvia.com");
  return !!v.d && v.d.cle === "documents" && v.d.langue === L && v.d.code === j.code && v.d.prix === 7 && v.d.lien === (L === "ar" ? "https://documents.clicvia.com/pass/" : "https://documents.clicvia.com/fr/pass/");
};
// 25/11/2026 (parcours commun des Pass, règle § 70) : code de commande créé AU FORMULAIRE, « Dernière étape », mémoire « pass-commande »
const PHRASES_CODE = {
  fr: ["C'est votre numéro de commande : écrivez-le dans le motif du paiement, il nous sert à reconnaître votre paiement.", "Vous le recevez aussi par e-mail.",
       "Vous avez oublié le code dans le motif ? Ce n'est pas grave : envoyez quand même la preuve sur WhatsApp, nous retrouvons votre demande."],
  ar: ["هذا رقم طلبك: اكتبه في خانة سبب الدفع، يساعدنا على التعرّف على دفعتك.", "يصلك أيضًا عبر البريد الإلكتروني.", "نسيت الرمز في سبب الدفع؟ لا بأس: أرسل الوصل على واتساب وسنجد طلبك."] };
const sansIsol = x => String(x || "").replace(/[\u2068\u2069]/g, "").replace(/\s+/g, " ");
async function passCommande(w, code, L, nom) {
  const doc = w.document, ap = doc.getElementById("apres-pass"), txt = sansIsol(ap.textContent), brut = code.replace("-", "");
  const grand = doc.getElementById("code-commande");
  check(`${L} « Dernière étape » : le code de commande en GROS (dir="ltr"), avec la phrase « numéro de commande… motif du paiement » juste à côté`,
    !ap.hidden && grand && grand.textContent === code && grand.getAttribute("dir") === "ltr" && txt.includes(sansIsol(PHRASES_CODE[L][0]))
    && grand.parentElement.contains(ap.querySelector(".code-explication")));
  // e-mail automatique EN SERVICE (25/11/2026) : « Vous le recevez aussi par e-mail » est visible à côté du code
  const emails = [...doc.querySelectorAll(".email-auto")], nbPhrase = (doc.body.innerHTML.match(new RegExp(PHRASES_CODE[L][1].replace(/[.]/g, "\\."), "g")) || []).length;
  check(`${L} « Vous le recevez aussi par e-mail » : AFFICHÉE (e-mail automatique en service, EMAIL_AUTO = true)`,
    emails.length >= 2 && emails.every(x => !x.hidden) && nbPhrase === emails.length && emails.every(x => sansIsol(x.textContent).includes(sansIsol(PHRASES_CODE[L][1])))
    && /emailAuto: true,/.test(lire("assets/pass-reglages.js")));
  const paie = ap.querySelector(".paie"), motif = ap.querySelector(".motif-code");
  check(`${L} « Dernière étape » : paiement en 3 étapes (D17 / IZI, écrans d'exemple, ${L === "ar" ? "24321390 sans espaces" : "24 321 390"}) et MOTIF = le code`,
    paie && paie.querySelectorAll("ol.paie-etapes > li").length === 3 && paie.querySelector('img[alt="D17"]') && paie.querySelector('img[alt="IZI"]') && paie.querySelector(".aide-transfert img")
    && (L === "ar" ? /24321390/.test(paie.textContent) && !/24 321 390/.test(paie.textContent.replace(/alt="[^"]*"/g, "")) : /24 321 390/.test(paie.textContent))
    && motif && motif.textContent === code && [...ap.querySelectorAll(".motif-aide")].every(x => x.hidden));
  const wa = decodeURIComponent(ap.querySelector("a.btn-wa").href);
  check(`${L} « Dernière étape » : bouton vert WhatsApp pré-rempli AVEC le code ET le nom (le client n'a rien à recopier)`,
    wa.startsWith("https://wa.me/21624321390?text=") && !!nom && wa.includes(L === "ar" ? `هذا وصل الدفع — وثائق تونس — الرمز ${code} — ${nom} — باقة اليوم` : `Voici ma preuve de paiement — Documents Tunisie — code ${code} — ${nom} — Pass Journée 7 DT`));
  check(`${L} « Dernière étape » : ce qui se passe ensuite + filet de sécurité (code oublié dans le motif) + « Nouvelle commande »`,
    txt.includes(sansIsol(PHRASES_CODE[L][2])) && !!ap.querySelector(".ensuite") && !!ap.querySelector("button.nouvelle-commande"));
  const memo = JSON.parse(w.localStorage.getItem("pass-commande") || "null");
  check(`${L} mémoire « pass-commande » = { code, formule, date } et RIEN d'autre (ni nom, ni téléphone, ni e-mail dans le téléphone)`,
    memo && Object.keys(memo).sort().join() === "code,date,formule" && memo.code === brut && memo.formule === "Pass Journée - 7 DT - 24 heures" && /^\d{4}-\d{2}-\d{2}$/.test(memo.date)
    && !Object.values(stock(w)).some(v => /Factice|98765432|factice\.tn|عميل/.test(v)));
}
{
  const [A, B] = [DOCS[0], DOCS[1]];
  const H = { t: new Date(2026, 9, 6, 10, 0).getTime() };              // 06/10/2026 à 10:00 (heure du téléphone)
  let w = await pagePass(A.slug + "/index.html", { horloge: H }), doc = w.document;
  const lien = doc.querySelector("#remplir a.btn-pass");
  check("page de modèle : bouton « Pass Journée 7 DT : tous les documents pendant 24 heures » près du téléchargement (vers pass/, nouvel onglet)",
    lien && lien.getAttribute("href") === "../pass/" && lien.target === "_blank" && /Pass Journée 7 DT : tous les documents pendant 24 heures/.test(lien.textContent)
    && doc.getElementById("telecharger").compareDocumentPosition(lien) === 4 && /1 document PDF gratuit par jour/.test(doc.getElementById("pass-lien").textContent));
  check("page de modèle : écran de blocage caché au départ, formulaire libre, aucun exemple", doc.getElementById("pass-bloque").hidden && !doc.getElementById("exemple") && doc.getElementById("formulaire").elements.length > 3);
  check("page de modèle : l'aperçu est AVANT « Remplir le modèle », fenêtre réduite (420 px, 260 px sur téléphone), visible au départ",
    doc.getElementById("apercu-carte").compareDocumentPosition(doc.getElementById("remplir")) === 4 && !doc.getElementById("apercu").hidden
    && doc.getElementById("apercu-bloque").hidden && /\.apercu\{[^}]*max-height:420px/.test(lire("assets/style.css")) && /max-width:600px\)\{\.apercu\{max-height:260px/.test(lire("assets/style.css")));
  { const va = doc.getElementById("voir-apercu");
    check("page de modèle : bouton « Voir l'aperçu » juste après « Télécharger le PDF », qui remonte à l'aperçu (FR + AR)",
      va && va.getAttribute("href") === "#apercu-carte" && doc.getElementById("telecharger").nextElementSibling === va && /Voir l'aperçu/.test(va.textContent) && /معاينة الوثيقة/.test(lire(A.slug + "/index.html").match(/id="voir-apercu"[\s\S]*?<\/a>/)[0])); }
  remplir(w, A); doc.getElementById("telecharger").click();
  check("Pass Journée : 1er PDF du jour autorisé (gratuit)", w.__imprime === 1 && doc.getElementById("pass-bloque").hidden);
  check("le PDF ne parle ni du Pass ni du site", !/Pass|باقة|Documents Tunisie|ah6259/.test(doc.getElementById("impression").innerHTML));
  doc.getElementById("telecharger").click();
  check("Pass Journée : le MÊME modèle peut être retéléchargé le même jour (correction)", w.__imprime === 2);
  const apresA = stock(w);
  w = await pagePass(A.slug + "/index.html", { horloge: H, stockage: apresA });
  check("aperçu : toujours lisible sur le document gratuit du jour lui-même", w.document.querySelectorAll("#apercu .feuille").length === 1 && !w.document.getElementById("apercu").classList.contains("fige") && w.document.getElementById("apercu-bloque").hidden);
  w = await pagePass(B.slug + "/index.html", { horloge: H, stockage: apresA }); doc = w.document;
  {
    const ap = doc.getElementById("apercu"), avant = ap.innerHTML, tp = doc.getElementById("apercu-bloque");
    const lisible = M.feuille(B, valeursEx(B), "fr").replace(/<[^>]+>/g, " ").match(/\p{L}{6,}/gu) || [];
    check("aperçu bloqué (autre document le même jour) : la fenêtre reste, document flou et BROUILLÉ (aucun mot lisible du modèle)",
      !ap.hidden && ap.classList.contains("fige") && ap.querySelectorAll(".feuille").length === 1 && lisible.length > 10
      && lisible.every(m => !ap.textContent.includes(m)) && /\.apercu\.fige\{[^}]*filter:blur/.test(lire("assets/style.css")));
    remplir(w, B); doc.getElementById("formulaire").dispatchEvent(new w.Event("input"));
    check("aperçu bloqué : le document ne bouge plus quand on remplit le formulaire", ap.innerHTML === avant);
    check("aperçu bloqué : tampon « Pass Journée » par-dessus (payer le Pass pour télécharger et voir plusieurs documents, lien pass/, « ou revenez demain »)",
      !tp.hidden && tp.parentElement === ap.parentElement && /Pass Journée/.test(tp.textContent) && /Payez le Pass pour télécharger et voir l'aperçu de plusieurs documents/.test(tp.textContent)
      && tp.querySelector('a[href="../pass/"]') && /ou revenez demain/.test(tp.textContent));
    check("tampon : secoue comme la cloche du site de l'eau (5 secousses toutes les 12 s, 3 séries ; immobile si « réduire les animations »)",
      /\.apercu-tampon\{[^}]*animation:[^}]*tampon-secoue 12s[^}]* 3\}/.test(lire("assets/style.css")) && /2\.5%,7\.5%,12\.5%,17\.5%,22\.5%/.test(lire("assets/style.css"))
      && /prefers-reduced-motion:reduce\)\{\.apercu-tampon\{animation:none\}/.test(lire("assets/style.css")));
  }
  doc.getElementById("telecharger").click();
  const bl = doc.getElementById("pass-bloque");
  check("Pass Journée : 2e document du même jour BLOQUÉ (pas de PDF), écran « Vous avez téléchargé votre document gratuit du jour »",
    w.__imprime === 0 && !bl.hidden && /Vous avez téléchargé votre document gratuit du jour/.test(bl.textContent));
  check("écran de blocage : Pass Journée 7 DT (24 heures), « Revenez demain », « J'ai déjà un code »", /Pass Journée 7 DT : tous les documents pendant 24 heures/.test(bl.textContent)
    && /revenez demain : un nouveau document gratuit vous attend/i.test(bl.textContent) && /J'ai déjà un code/.test(bl.querySelector("summary").textContent)
    && bl.querySelector('a.btn-pro[href="../pass/"]') && bl.querySelector("form.code-form input[name=code]"));
  check("écran de blocage : compté anonymement (pass-bloque/<modèle>), sans rien de ce qui est écrit", w.__comptes.length === 1 && w.__comptes[0].path === "pass-bloque/" + B.slug && w.__comptes[0].event === true
    && !JSON.stringify(w.__comptes).includes(String(valeursEx(B)[B.champs.find(c => c.id && /nom$/.test(c.id)).id])));
  doc.getElementById("telecharger").click();
  check("écran de blocage : compté une seule fois par page ouverte", w.__imprime === 0 && w.__comptes.filter(c => /^pass-bloque/.test(c.path)).length === 1);
  check("le formulaire rempli n'est pas effacé par le blocage", doc.getElementById("formulaire").elements[B.champs.find(c => !c.groupe && c.type !== "case" && c.type !== "select").id].value !== "");
  H.t += 24 * 36e5;                                                      // le lendemain
  doc.getElementById("telecharger").click();
  check("Pass Journée : autorisé le lendemain (nouveau document gratuit), écran de blocage refermé", w.__imprime === 1 && bl.hidden);
  H.t -= 24 * 36e5;

  // codes d'accès (pass.json simulé : empreintes seulement)
  const sel = "sel-de-test-0123", tours = 1000, now = H.t;
  const liste = { sel, tours, codes: [
    { h: await EMPREINTE("ABCD2345", sel, tours), fin: new Date(now + 20 * 36e5).toISOString() },
    { h: await EMPREINTE("PXRM2345", sel, tours), fin: new Date(now - 36e5).toISOString() }] };
  w = await pagePass(B.slug + "/index.html", { horloge: H, stockage: apresA, liste }); doc = w.document;
  remplir(w, B); doc.getElementById("telecharger").click();
  let st = await taperCode(w, "zzzz-2222");
  check("code faux : refusé (« Code non reconnu »), toujours bloqué", /Code non reconnu/.test(st.textContent) && !w.PassJour.actif() && (doc.getElementById("telecharger").click(), w.__imprime === 0));
  st = await taperCode(w, "PXRM-2345");
  check("code expiré (plus de 24 heures) : refusé (« Ce code a expiré »), toujours bloqué", /Ce code a expiré/.test(st.textContent) && !w.PassJour.actif() && (doc.getElementById("telecharger").click(), w.__imprime === 0));
  st = await taperCode(w, "ABC");
  check("code mal formé : message clair", /8 caractères/.test(st.textContent));
  st = await taperCode(w, "abcd 2345");
  check("code valide (tapé en minuscules avec espace) : accepté, Pass actif, écran de blocage fermé, heure de fin affichée",
    /Code accepté/.test(st.textContent) && w.PassJour.actif() && doc.getElementById("pass-bloque").hidden && !doc.getElementById("pass-actif").hidden && /Code accepté/.test(doc.getElementById("pass-actif").textContent));
  check("aperçu : redevient lisible dès que le Pass est activé (plus de tampon)", !doc.getElementById("apercu").classList.contains("fige") && doc.querySelectorAll("#apercu .feuille").length === 1
    && doc.getElementById("apercu").textContent.includes(String(valeursEx(B)[B.champs.find(c => c.id && /nom$/.test(c.id)).id])) && doc.getElementById("apercu-bloque").hidden);
  doc.getElementById("telecharger").click();
  check("avec un code valide : PDF autorisé", w.__imprime === 1);
  check("avec le Pass : le document gratuit du jour n'est pas consommé", JSON.parse(w.localStorage.getItem("dt-gratuit-v1")).doc === A.slug);
  const avecPass = stock(w);
  check("appareil : seul le code est gardé (aucun nom, aucun téléphone)", Object.keys(avecPass).every(k => ["dt-pass-v1", "dt-gratuit-v1", "dt-pass-rappel-v1", "langue"].includes(k)));
  // 24 heures plus tard : le Pass ne marche plus, retour au gratuit
  H.t = now + 21 * 36e5;
  w = await pagePass(DOCS[2].slug + "/index.html", { horloge: H, stockage: { ...avecPass, "dt-gratuit-v1": JSON.stringify({ jour: "2026-10-07", doc: A.slug }) }, liste }); doc = w.document;
  remplir(w, DOCS[2]); doc.getElementById("telecharger").click();
  check("Pass expiré (après 24 heures) : refusé, retour au gratuit (bloqué si le document gratuit du jour est déjà pris)", !w.PassJour.actif() && w.__imprime === 0 && !doc.getElementById("pass-bloque").hidden);
  // code arrêté par Ahmed (retiré de pass.json) : effacé de l'appareil à la revérification (au plus 1 fois par heure)
  H.t = now + 2 * 36e5;
  w = await pagePass(DOCS[2].slug + "/index.html", { horloge: H, stockage: avecPass, liste: { sel, tours, codes: [] } });
  await attendre(() => !w.localStorage.getItem("dt-pass-v1"), 3000);
  check("code arrêté (retiré du site) : effacé du téléphone à la revérification", !w.localStorage.getItem("dt-pass-v1") && !w.PassJour.actif());
  // hors connexion : le code gardé reste valable jusqu'à son heure de fin
  w = await pagePass(DOCS[2].slug + "/index.html", { horloge: H, stockage: avecPass, liste: null });
  await new Promise(r => setTimeout(r, 100));
  check("hors connexion : le Pass gardé marche jusqu'à son heure de fin", w.PassJour.actif() && !w.document.getElementById("pass-actif").hidden);

  // 18/10/2026 (problème vu sur l'immobilier : code payé impossible à taper quand le téléphone gardait un autre code)
  // la case du code est TOUJOURS visible, EN HAUT de pass/, quel que soit l'état gardé ; le code tapé remplace l'ancien ;
  // aucun « essai gratuit » annoncé (ce site n'en a pas : 1 document gratuit par jour, puis Pass Journée)
  {
    H.t = now;
    const visible = (wx, el) => { for (let e = el; e; e = e.parentElement) if (e.hidden || wx.getComputedStyle(e).display === "none") return false; return !!el; };
    const ETATS = {
      "aucun code": {},
      "un autre code non payé gardé": { "dt-pass-v1": JSON.stringify({ code: "ZZZZ2222", fin: new Date(now + 5 * 36e5).toISOString(), verifie: 0 }) },
      "un code payé gardé": { "dt-pass-v1": JSON.stringify({ code: "ABCD2345", fin: new Date(now + 20 * 36e5).toISOString(), verifie: now }) },
      "un code expiré gardé": { "dt-pass-v1": JSON.stringify({ code: "PXRM2345", fin: new Date(now - 36e5).toISOString(), verifie: 0 }) }
    };
    const mal = [];
    for (const [nom, stockage] of Object.entries(ETATS)) {
      const wx = await pagePass("pass/index.html", { horloge: H, stockage }), dx = wx.document;
      const bloc = dx.getElementById("code-acces"), champ = bloc && bloc.querySelector("input[name=code]"), bouton = bloc && bloc.querySelector("button[type=submit]");
      if (!visible(wx, champ) || !visible(wx, bouton) || !(bloc.compareDocumentPosition(dx.getElementById("offre")) & 4)) mal.push(nom);
    }
    check(`Pass : case du code visible EN HAUT de pass/ (avant l'offre) dans tous les états ${mal}`, mal.length === 0);
    const wx = await pagePass("pass/index.html", { horloge: H, stockage: ETATS["un autre code non payé gardé"], liste });
    const stx = await taperCode(wx, "abcd-2345"), garde = JSON.parse(wx.localStorage.getItem("dt-pass-v1") || "{}");
    check("Pass : le code tapé REMPLACE l'ancien code gardé (nouveau code, nouvelle heure de fin, Pass actif)",
      /Code accepté/.test(stx.textContent) && garde.code === "ABCD2345" && garde.fin === liste.codes[0].fin && wx.PassJour.actif());
    const pagesPass = ["pass/index.html", "pass/conditions/index.html", "assets/pass.js"].map(lire).join(" ");
    check("Pass : aucun « essai gratuit » annoncé (ce site n'en propose pas)", !/essai gratuit|période d'essai|تجربة مجانية/i.test(pagesPass));
  }

  // page pass/ : prix, paiement, WhatsApp, formulaire, conditions
  const envois = [], emails = [];
  w = await pagePass("pass/index.html", { horloge: H, envois, emails }); doc = w.document;
  const t = doc.body.textContent;
  check("pass/ : prix 7 DT, tous les documents pendant 24 heures, valable 24 heures à partir de l'ouverture du code", /7 DT/.test(doc.querySelector(".prix-pass").textContent) && /tous les documents pendant 24 heures/.test(t) && /Valable 24 heures à partir de l'ouverture de votre code/.test(t));
  check("pass/ : bouton « Paiement » (details) avec D17 et IZI (liens vers les applications officielles, Google Play + iPhone) au 24 321 390, mode d'emploi, plus de Wafacash, motif = le code de commande", doc.querySelector("details#paiement > summary")?.textContent.includes("Paiement")
    && ["D17", "IZI", "Transfert rapide"].every(x => doc.querySelector("#paiement .paie").textContent.includes(x)) && !/Wafacash/i.test(lire("pass/index.html") + lire("pass/conditions/index.html"))
    && ["https://play.google.com/store/apps/details?id=tn.mobipost", "https://play.google.com/store/apps/details?id=tn.izi.consumer", "https://apps.apple.com/tn/app/digipostbank-d17/id1475640303", "https://apps.apple.com/tn/app/izi/id1603653941"].every(u => doc.querySelector(`#paiement .paie a[href="${u}"]`)) && /24 321 390/.test(doc.querySelector("#paiement .paie").textContent) && /Motif :\s*votre code de commande/.test(doc.querySelector("#paiement .paie").textContent));
  check("paiement : logos D17 / IZI dans les boutons, étape 2 pour les deux applications, bouton « ? » avec les deux écrans d'exemple", ["d17.png", "izi.png", "transfert-d17.svg", "transfert-izi.svg"].every(f => existsSync(join(root, "assets/paiement", f))) && /class="appli-btn"[^>]*><img src="\.\.\/assets\/paiement\/d17\.png"/.test(lire("pass/index.html")) && /class="aide-transfert"/.test(lire("pass/index.html")) && /Transfert d’argent/.test(lire("fr/pass/index.html")));
  check("paiement simple et rassurant (règle commune du 08/10/2026) : 3 étapes numérotées, phrase de confiance, description de l'offre cachée quand « Paiement » est ouvert", /<ol class="paie-etapes">/.test(lire("pass/index.html")) && /class="paie-confiance"/.test(lire("pass/index.html")) && /class="avantages[^"]*masque-si-paiement/.test(lire("pass/index.html")) && lire("assets/style.css").includes(":has(> details.paiement[open]) > .masque-si-paiement{display:none}"));
  const wa = doc.getElementById("pass-preuve");
  check("pass/ : bouton vert WhatsApp vers wa.me/21624321390 avec texte prérempli, « votre code de commande s'ouvre dès réception du paiement »", wa && wa.href.startsWith("https://wa.me/21624321390?text=") && /Pass%20Journ/.test(wa.href) && /noopener/.test(wa.rel) && /votre code de commande s'ouvre dès réception du paiement/i.test(t) && !/recevrez votre code par WhatsApp/i.test(t));
  check("pass/ : pas de renouvellement automatique, lien vers les conditions, « J'ai un code »", /Pas de renouvellement automatique/.test(t) && doc.querySelector('a[href="conditions/"]') && doc.querySelector("#code-acces form.code-form"));
  const pf = doc.getElementById("pass-form");
  check("pass/ : formulaire Formspree mwlpakqj (nom, téléphone, case conditions, champ piège)", pf.getAttribute("action") === "https://formspree.io/f/mwlpakqj" && pf.elements.nom && pf.elements.telephone && pf.elements.conditions?.type === "checkbox" && pf.elements._gotcha);
  const soumettre = () => pf.dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  pf.elements.nom.value = "Client Factice"; pf.elements.telephone.value = "123"; soumettre();
  check("pass/ : téléphone faux refusé (8 chiffres), rien n'est envoyé", envois.length === 0 && /8 chiffres/.test(doc.getElementById("pass-status").textContent));
  // -- 24/11/2026 (règle d'Ahmed) : e-mail OBLIGATOIRE (il y reçoit son code et les étapes du paiement), dans chaque langue
  for (const f of ["pass/index.html", "fr/pass/index.html"]) {
    const h = lire(f), champEmail = (h.match(/<input[^>]*name="email"[^>]*>/) || [""])[0];
    const iTel = h.indexOf('id="pass-tel"'), iMail = h.indexOf('id="pass-email"'), iCond = h.indexOf('id="pass-conditions"');
    check(`${f} : e-mail obligatoire (type="email" name="email" required, après le téléphone, avec son étiquette)`,
      /type="email"/.test(champEmail) && /\brequired\b/.test(champEmail) && /id="pass-email"/.test(champEmail) && /maxlength="200"/.test(champEmail) && /autocomplete="email"/.test(champEmail)
      && iTel > 0 && iMail > iTel && iCond > iMail && /<label[^>]*for="pass-email"/.test(h)
      && (f.startsWith("fr/") ? /E-mail<\/span>/ : /البريد الإلكتروني<\/span>/).test((h.match(/<label[^>]*for="pass-email"[\s\S]*?<\/label>/) || [""])[0]));
  }
  pf.elements.telephone.value = "+216 98 765 432"; soumettre();
  check("pass/ : e-mail vide refusé (« Indiquez votre e-mail : vous y recevez votre code et les étapes du paiement. », e-mail automatique en service), rien n'est envoyé (ni Formspree ni le service d'e-mail)",
    envois.length === 0 && emails.length === 0 && doc.getElementById("pass-status").textContent.trim() === "Indiquez votre e-mail : vous y recevez votre code et les étapes du paiement.");
  // promesse « vous y recevez votre code et les étapes du paiement » : AFFICHÉE (EMAIL_AUTO = true), FR + AR
  for (const L of ["fr", "ar"]) {
    const wp = L === "fr" ? w : await pagePass("pass/index.html", { horloge: H, stockage: { langue: "ar" } });
    const lab = wp.document.querySelector('label[for="pass-email"]'), pr = lab && lab.querySelector(".email-promesse");
    check(`${L} étiquette de l'e-mail : « ${L === "fr" ? "E-mail (vous y recevez votre code et les étapes du paiement)" : "البريد الإلكتروني (يصلك عليه رمزك وخطوات الدفع)"} » : promesse AFFICHÉE (EMAIL_AUTO = true)`,
      pr && !pr.hidden && (L === "fr" ? /vous y recevez votre code et les étapes du paiement/ : /يصلك عليه رمزك وخطوات الدفع/).test(pr.textContent));
    if (L === "ar") { const fa = wp.document.getElementById("pass-form"), emA = [];
      fa.elements.nom.value = "عميل"; fa.elements.telephone.value = "98765432"; fa.dispatchEvent(new wp.Event("submit", { bubbles: true, cancelable: true }));
      check("ar : e-mail vide refusé avec la version longue « اكتب بريدك الإلكتروني: يصلك عليه رمزك وخطوات الدفع. »",
        wp.document.getElementById("pass-status").textContent.trim() === "اكتب بريدك الإلكتروني: يصلك عليه رمزك وخطوات الدفع."); }
  }
  { // retour en arrière en un mot : EMAIL_AUTO = false -> plus aucune promesse, erreur courte, AUCUNE demande au service d'e-mail
    const envE = [], emE = [], copie = (src, js) => /pass-reglages\.js$/.test(src) ? js.replace("emailAuto: true,", "emailAuto: false,") : js;
    const we = await pagePass("pass/index.html", { horloge: H, envois: envE, emails: emE, retouche: copie }), fe = we.document.getElementById("pass-form");
    fe.elements.nom.value = "Client Factice"; fe.elements.telephone.value = "98765432";
    fe.dispatchEvent(new we.Event("submit", { bubbles: true, cancelable: true }));
    const court = we.document.getElementById("pass-status").textContent.trim() === "Indiquez votre e-mail.";
    fe.elements.email.value = "client@factice.tn"; fe.elements.conditions.checked = true;
    fe.dispatchEvent(new we.Event("submit", { bubbles: true, cancelable: true }));
    await attendre(() => !we.document.getElementById("apres-pass").hidden);
    check("EMAIL_AUTO = false (retour en arrière) : promesses cachées, erreur courte « Indiquez votre e-mail. », Formspree reçoit la demande mais RIEN ne part au service d'e-mail",
      we.document.querySelector('label[for="pass-email"] .email-promesse').hidden && court && envE.length === 1 && emE.length === 0
      && [...we.document.querySelectorAll(".email-auto")].every(x => x.hidden)); }
  pf.elements.email.value = "client@factice"; soumettre();
  check("pass/ : e-mail invalide refusé, rien n'est envoyé", envois.length === 0 && /(E-mail invalide|البريد الإلكتروني غير صحيح)/.test(doc.getElementById("pass-status").textContent));
  pf.elements.email.value = "client@factice.tn"; soumettre();
  check("pass/ : conditions non cochées refusées, rien n'est envoyé", envois.length === 0 && /conditions/.test(doc.getElementById("pass-status").textContent));
  pf.elements.conditions.checked = true; soumettre();
  await attendre(() => !doc.getElementById("apres-pass").hidden);
  const CODE_JOLI = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/, codeEnvoye = envois[0] ? envois[0].get("code") : "";
  check("pass/ : demande envoyée à Formspree avec le CODE DE COMMANDE créé au formulaire (8 caractères, même alphabet que les codes d'accès) et la ligne « pour_activer » (code + e-mail) pour le bouton GitHub",
    envois.length === 1 && envois[0].get("site") === "Documents Tunisie" && envois[0].get("telephone") === "98765432" && envois[0].get("email") === "client@factice.tn"
    && CODE_JOLI.test(codeEnvoye) && envois[0].get("pour_activer") === `action: paye ; nom: Client Factice ; telephone: 98765432 ; code: ${codeEnvoye} ; email: client@factice.tn`
    && !doc.getElementById("apres-pass").hidden && pf.hidden);
  await passCommande(w, codeEnvoye, "fr", "Client Factice");
  { const e = emails[0], j = e ? JSON.parse(e[1].body) : {};
    check("e-mail automatique (FR) : UNE demande à https://api-email.clicvia.com/inscription (POST JSON, keepalive) avec site documents, langue fr, nom, e-mail, CE code de commande et la formule exacte du formulaire",
      emails.length === 1 && e[0] === "https://api-email.clicvia.com/inscription" && e[1].method === "POST" && /application\/json/.test(e[1].headers["Content-Type"]) && e[1].keepalive === true
      && Object.keys(j).sort().join() === "code,email,formule,langue,nom,site"
      && j.site === "documents" && j.langue === "fr" && j.nom === "Client Factice" && j.email === "client@factice.tn" && j.code === codeEnvoye && j.formule === "Pass Journée - 7 DT - 24 heures");
    check("e-mail automatique (FR) : le JSON envoyé est ACCEPTÉ par le vrai verifier() du service (sites.json « documents » : origine, code XXXX-XXXX, formule, prix 7, lien fr/pass/)", accepteParWorker(j, "fr")); }
  check("CSP des pages du Pass (AR + FR) : connect-src autorise https://api-email.clicvia.com (sinon le navigateur bloque l'e-mail automatique)",
    ["pass/index.html", "fr/pass/index.html"].every(f => /connect-src[^;]*https:\/\/api-email\.clicvia\.com/.test(lire(f))));
  { // Formspree en panne au 1er essai : le client réessaie -> même code, et UN SEUL e-mail (jamais deux pour la même commande)
    const envR = [], emR = [], wr = await pagePass("pass/index.html", { horloge: H, envois: envR, emails: emR, echecs: 1 }), fr_ = wr.document.getElementById("pass-form");
    fr_.elements.nom.value = "Client Factice"; fr_.elements.telephone.value = "98765432"; fr_.elements.email.value = "client@factice.tn"; fr_.elements.conditions.checked = true;
    fr_.dispatchEvent(new wr.Event("submit", { bubbles: true, cancelable: true }));
    await attendre(() => /Échec de l'envoi/.test(wr.document.getElementById("pass-status").textContent) && !fr_.querySelector("button[type=submit]").disabled);
    fr_.dispatchEvent(new wr.Event("submit", { bubbles: true, cancelable: true }));
    await attendre(() => !wr.document.getElementById("apres-pass").hidden);
    check("Formspree en panne puis nouvel essai : même code de commande, UNE seule demande d'e-mail",
      envR.length === 1 && emR.length === 1 && JSON.parse(emR[0][1].body).code === envR[0].get("code")); }
  { // champ piège anti-robot rempli : RIEN n'est envoyé, ni à Formspree ni au service d'e-mail
    const envP = [], emP = [], wq = await pagePass("pass/index.html", { horloge: H, envois: envP, emails: emP }), fq = wq.document.getElementById("pass-form");
    fq.elements.nom.value = "Robot"; fq.elements.telephone.value = "98765432"; fq.elements.email.value = "robot@factice.tn"; fq.elements.conditions.checked = true; fq.elements._gotcha.value = "x";
    fq.dispatchEvent(new wq.Event("submit", { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 60));
    check("piège anti-robot rempli : aucune demande à Formspree ni au service d'e-mail", envP.length === 0 && emP.length === 0); }
  {
    // retour sur la page : bandeau « Votre commande en attente » + paiement + WhatsApp ; le site essaie le code tout seul
    const brut = codeEnvoye.replace("-", ""), memo = stock(w);
    let wx = await pagePass("pass/index.html", { horloge: H, stockage: memo, liste: { sel: "sel-test", tours: 1000, codes: [] } }), dx = wx.document;
    await attendre(() => /En attente de votre paiement/.test(dx.getElementById("commande-etat").textContent));
    const ba = dx.getElementById("commande-attente");
    check("retour sur pass/ : bandeau « Votre commande en attente : code … — Pass Journée 7 DT » + 3 étapes du paiement (motif = code) + WhatsApp avec le code, formulaire remplacé",
      !ba.hidden && sansIsol(dx.getElementById("commande-ligne").textContent).includes(`Votre commande en attente : code ${codeEnvoye} — Pass Journée 7 DT`)
      && ba.querySelectorAll(".paie ol.paie-etapes > li").length === 3 && ba.querySelector(".motif-code").textContent === codeEnvoye
      && decodeURIComponent(ba.querySelector("a.btn-wa").href).includes(`code ${codeEnvoye} — Pass Journée 7 DT`) && !/Factice/.test(decodeURIComponent(ba.querySelector("a.btn-wa").href)) && dx.getElementById("pass-form").hidden && !dx.getElementById("commande-deja").hidden
      && ba.compareDocumentPosition(dx.getElementById("code-acces")) === 4);
    check("retour sur pass/ (paiement pas encore reçu) : « En attente de votre paiement », commande gardée, Pass fermé",
      /En attente de votre paiement/.test(dx.getElementById("commande-etat").textContent) && !!wx.localStorage.getItem("pass-commande") && !wx.PassJour.actif());
    const ml = await pagePass(DOCS[1].slug + "/index.html", { horloge: H, stockage: memo });
    check("page de modèle : le code de commande est déjà écrit dans « J'ai déjà un code »", ml.document.querySelector("#code-modele input[name=code]").value === codeEnvoye);
    // Ahmed a appuyé sur « paye » avec ce code : empreinte publiée -> le Pass s'ouvre tout seul, la commande est effacée
    const listeOk = { sel: "sel-test", tours: 1000, codes: [{ h: await EMPREINTE(brut, "sel-test", 1000), fin: new Date(H.t + 24 * 36e5).toISOString() }] };
    wx = await pagePass("pass/index.html", { horloge: H, stockage: memo, liste: listeOk }); dx = wx.document;
    await attendre(() => wx.PassJour.actif() && !wx.localStorage.getItem("pass-commande"));
    check("code activé par le bouton GitHub : au retour, le site l'essaie tout seul -> Pass ouvert, « Paiement reçu », clé « pass-commande » effacée, bandeau caché",
      wx.PassJour.actif() && !wx.localStorage.getItem("pass-commande") && dx.getElementById("commande-attente").hidden && !dx.getElementById("pass-etat").hidden
      && /Paiement reçu/.test(dx.getElementById("pass-etat").textContent) && JSON.parse(wx.localStorage.getItem("dt-pass-v1")).code === brut && !dx.getElementById("pass-form").hidden);
    // « Nouvelle commande » efface la commande en attente
    wx = await pagePass("pass/index.html", { horloge: H, stockage: memo, liste: { sel: "sel-test", tours: 1000, codes: [] } }); dx = wx.document;
    await attendre(() => /En attente/.test(dx.getElementById("commande-etat").textContent));
    dx.querySelector("#commande-attente button.nouvelle-commande").click();
    check("« Nouvelle commande » : commande effacée du téléphone, bandeau caché, formulaire de nouveau visible",
      !wx.localStorage.getItem("pass-commande") && dx.getElementById("commande-attente").hidden && !dx.getElementById("pass-form").hidden && dx.querySelector("#paiement .motif-code").textContent.includes("votre code de commande"));
    // gardée 60 jours au plus
    const vieille = { "pass-commande": JSON.stringify({ code: brut, formule: "Pass Journée - 7 DT - 24 heures", date: "2026-08-01" }) };
    wx = await pagePass("pass/index.html", { horloge: H, stockage: vieille, liste: { sel: "sel-test", tours: 1000, codes: [] } });
    await new Promise(r => setTimeout(r, 60));
    check("commande en attente gardée 60 jours au plus (plus vieille : effacée, pas de bandeau)", !wx.localStorage.getItem("pass-commande") && wx.document.getElementById("commande-attente").hidden);
    wx = await pagePass("pass/index.html", { horloge: H, stockage: { "pass-commande": "{abîmé" } });
    check("mémoire « pass-commande » abîmée : pas de plantage, pas de bandeau", wx.document.getElementById("commande-attente").hidden && !wx.localStorage.getItem("pass-commande"));
    // codes créés par le navigateur : bon format, tous différents
    const lot = Array.from({ length: 300 }, () => w.PassCommun.nouveauCode(w.PassCommun.reglage.code.alphabet, w.PassCommun.reglage.code.longueur));
    check("codes de commande : crypto.getRandomValues, 8 caractères de l'alphabet des codes d'accès (sans O/0/I/1), 300 codes tous différents",
      lot.every(c => /^[A-HJ-NP-Z2-9]{8}$/.test(c)) && new Set(lot).size === 300 && /crypto\.getRandomValues/.test(lire("assets/pass-commun.js"))
      && /code: \{ alphabet: PASS\.alphabet, longueur: PASS\.longueur,/.test(lire("assets/pass-reglages.js")));
    // page ARABE (adresse principale) : même parcours
    const envoisAr = [], emailsAr = [];
    const wa = await pagePass("pass/index.html", { horloge: H, envois: envoisAr, emails: emailsAr, stockage: { langue: "ar" } }), pa = wa.document.getElementById("pass-form");
    pa.elements.nom.value = "عميل تجريبي"; pa.elements.telephone.value = "98765432"; pa.elements.email.value = "client@factice.tn"; pa.elements.conditions.checked = true;
    pa.dispatchEvent(new wa.Event("submit", { bubbles: true, cancelable: true }));
    await attendre(() => !wa.document.getElementById("apres-pass").hidden);
    const codeAr = envoisAr[0] ? envoisAr[0].get("code") : "";
    check("page arabe : formulaire envoyé avec le code de commande et la ligne « pour_activer »", CODE_JOLI.test(codeAr) && envoisAr[0].get("pour_activer").endsWith(`; code: ${codeAr} ; email: client@factice.tn`));
    await passCommande(wa, codeAr, "ar", "عميل تجريبي");
    { const j = emailsAr[0] ? JSON.parse(emailsAr[0][1].body) : {};
      check("e-mail automatique (AR) : UNE demande au service en langue ar, avec CE code, le nom arabe, l'e-mail et la formule exacte",
        emailsAr.length === 1 && emailsAr[0][0] === "https://api-email.clicvia.com/inscription" && j.site === "documents" && j.langue === "ar" && j.code === codeAr
        && j.nom === "عميل تجريبي" && j.email === "client@factice.tn" && j.formule === "Pass Journée - 7 DT - 24 heures");
      check("e-mail automatique (AR) : le JSON envoyé est ACCEPTÉ par le vrai verifier() du service (lien de la page arabe pass/)", accepteParWorker(j, "ar")); }
    // retour en arrière (EMAIL_AUTO = false dans assets/pass.js) : la phrase DISPARAÎT et rien ne part au service (AR + FR)
    for (const L of ["ar", "fr"]) {
      const envoisE = [], emE = [], copie = (src, js) => /pass-reglages\.js$/.test(src) ? js.replace("emailAuto: true,", "emailAuto: false,") : js;
      const we = await pagePass("pass/index.html", { horloge: H, envois: envoisE, emails: emE, stockage: { langue: L }, retouche: copie }), pe = we.document.getElementById("pass-form");
      pe.elements.nom.value = "Client Factice"; pe.elements.telephone.value = "98765432"; pe.elements.email.value = "client@factice.tn"; pe.elements.conditions.checked = true;
      pe.dispatchEvent(new we.Event("submit", { bubbles: true, cancelable: true }));
      await attendre(() => !we.document.getElementById("apres-pass").hidden);
      const ph = we.document.querySelector("#apres-pass .email-auto");
      check(`${L} EMAIL_AUTO = false (retour en arrière) : « ${PHRASES_CODE[L][1]} » reste CACHÉE et aucune demande au service d'e-mail`,
        ph && ph.hidden && envoisE.length === 1 && emE.length === 0);
    }
  }
  // plus jamais « motif : nom et téléphone », plus jamais « vous recevrez votre code par WhatsApp »
  { const tous_ = ["pass/index.html", "fr/pass/index.html", "pass/conditions/index.html", "fr/pass/conditions/index.html", "a-propos/index.html", "fr/a-propos/index.html", "assets/pass.js", "tools/generer.mjs"].map(f => sansIsol(lire(f))).join(" ");
    check("plus aucun « motif : nom et téléphone » ni « code reçu par WhatsApp » (pages du Pass, conditions, « Comment fonctionne le site ? », FAQ, script)",
      !/motif[^.<]{0,60}(nom et (votre )?t[ée]l[ée]phone|nom et le t[ée]l[ée]phone)|اسمك ورقم هاتفك|اسم المشتري ورقم هاتفه|recevrez votre code par WhatsApp|سيصلك رمزك عبر واتساب/i.test(tous_)
      && TOUS.every(d => !/motif[^.]{0,60}nom et (votre )?téléphone/i.test(JSON.stringify(d.faq || []))));
    check("pages du Pass (AR + FR) : la phrase « aussi par e-mail » est cachée dans la page (attribut hidden) et montrée par le script seulement (jamais promise sans lui)",
      ["pass/index.html", "fr/pass/index.html"].every(f => { const h = lire(f), n = (h.match(/class="email-auto"/g) || []).length;
        return n >= 2 && n === (h.match(/<span class="email-auto" data-email-auto hidden>/g) || []).length; }));
    check("pages du Pass (AR + FR) : la promesse « vous y recevez votre code… » de l'étiquette est cachée dans la page (attribut hidden) et montrée par le script seulement",
      ["pass/index.html", "fr/pass/index.html"].every(f => { const h = lire(f), n = (h.match(/class="email-promesse"/g) || []).length;
        return n === 1 && /<span class="email-promesse" data-email-auto hidden>/.test(h); }));
    check("« Comment fonctionne le site ? » (AR) : code de commande au formulaire, motif du paiement",
      /تعطيك الاستمارة حالًا\s*(<b>)?رقم طلب/.test(sansIsol(lire("a-propos/index.html")))); }
  const cond = (await pagePass("pass/conditions/index.html", { horloge: H })).document.body.textContent;
  check("conditions : vendeur « l'éditeur du site », pas de renouvellement automatique, aucune période payée remboursée, INPDP, 24 heures",
    /vendu par l'éditeur du site/.test(cond) && /Aucun renouvellement automatique/.test(cond) && /Aucune période payée n'est remboursée/.test(cond) && /INPDP/.test(cond) && /24 heures à partir de l'ouverture de votre code/.test(cond) && /motif le code de commande/.test(cond) && /envoyez quand même la preuve sur WhatsApp/.test(cond));
  check("conditions : aucun nom de société, prix non annoncés TTC, aucun numéro de déclaration inventé", !/\b(SARL|SUARL|S\.A\.|société|TTC|déclaration n°)/i.test(cond));
  // -- 20/10/2026 (demande d'Ahmed) : rappel de fin du Pass (merci, heure de fin, Renouveler, Donner mon avis), puis message après la fin
  {
    const RH = { t: new Date(2026, 9, 20, 9, 0).getTime() }, T0 = RH.t;
    const garde = (finMs, extra = {}) => ({ "dt-pass-v1": JSON.stringify({ code: "ABCD2345", fin: new Date(finMs).toISOString(), verifie: T0 }), ...extra });
    const voir = async (stockage, chemin = DOCS[0].slug + "/index.html") => { const wx = await pagePass(chemin, { horloge: RH, stockage }); await new Promise(r => setTimeout(r, 40)); return wx; };
    const z = n => String(n).padStart(2, "0"), lisible = ms => { const d = new Date(ms); return z(d.getDate()) + "/" + z(d.getMonth() + 1) + "/" + d.getFullYear() + " à " + z(d.getHours()) + ":" + z(d.getMinutes()); };
    let wx = await voir(garde(T0 + 20 * 36e5)), dx = wx.document;
    check("rappel du Pass : rien quand il reste 20 heures sur 24", !dx.getElementById("rappel-pass"));
    wx = await voir(garde(T0 + 5 * 36e5)); dx = wx.document;
    let b = dx.getElementById("rappel-pass");
    check("rappel du Pass : bandeau dans le dernier quart (5 heures restantes) : merci + « se termine le JJ/MM/AAAA à HH:MM »",
      !!b && /Merci pour votre inscription/.test(b.textContent) && b.textContent.includes("se termine le " + lisible(T0 + 5 * 36e5)));
    const ren = b && b.querySelector("a.rappel-renouveler"), av = b && b.querySelector("a.rappel-avis"), x = b && b.querySelector("button.rappel-fermer");
    check("rappel du Pass : vrai bouton « Renouveler mon Pass » (../pass/#offre), lien « Donner mon avis » (formulaire Votre avis de l'accueil), croix",
      !!ren && ren.getAttribute("href") === "../pass/#offre" && /id="offre"/.test(lire("pass/index.html")) && !!av && av.getAttribute("href") === "../#avis" && /id="avis"/.test(lire("index.html")) && !!x && x.type === "button");
    x.click();
    check("rappel du Pass : la croix ferme le bandeau", !dx.getElementById("rappel-pass"));
    const memo = wx.localStorage.getItem("dt-pass-rappel-v1");
    wx = await voir(garde(T0 + 4 * 36e5, { "dt-pass-rappel-v1": memo }));
    check("rappel du Pass : une fois par jour au plus", !wx.document.getElementById("rappel-pass"));
    wx = await voir(garde(T0 + 4 * 36e5, { "dt-pass-rappel-v1": JSON.stringify({ ...JSON.parse(memo), vu: "2026-10-19" }) }));
    check("rappel du Pass : de nouveau possible un autre jour", !!wx.document.getElementById("rappel-pass"));
    wx = await voir(garde(T0 + 3 * 36e5), "pass/index.html");
    check("rappel du Pass : aussi sur la page pass/ (lien Renouveler vers #offre de la même page)", !!wx.document.getElementById("rappel-pass") && wx.document.querySelector("#rappel-pass a.rappel-renouveler").getAttribute("href") === "../pass/#offre");
    wx = await voir(garde(T0 - 2 * 36e5)); dx = wx.document; b = dx.getElementById("rappel-pass");
    check("rappel du Pass : après la fin, « Votre Pass Journée est terminé — merci ! » avec Renouveler et Donner mon avis, code effacé",
      !!b && /est terminé — merci/.test(b.textContent) && !!b.querySelector("a.rappel-renouveler") && !!b.querySelector("a.rappel-avis") && !wx.localStorage.getItem("dt-pass-v1"));
    wx = await voir({ "dt-pass-rappel-v1": wx.localStorage.getItem("dt-pass-rappel-v1") });
    check("rappel du Pass : message de fin montré une seule fois", !wx.document.getElementById("rappel-pass"));
    wx = await voir(garde(T0 + 2 * 36e5, { langue: "ar" })); b = wx.document.getElementById("rappel-pass");
    check("rappel du Pass : en arabe (شكرًا على اشتراكك، جدّد باقتي)", !!b && /شكرًا على اشتراكك/.test(b.textContent) && /جدّد باقتي/.test(b.textContent));
    wx = await voir({ "dt-pass-v1": "{abîmé", "dt-pass-rappel-v1": "{abîmé" });
    check("rappel du Pass : stockage abîmé = pas de plantage, pas de bandeau", !wx.document.getElementById("rappel-pass"));
  }
  // pass.json public : empreintes et heures de fin seulement
  let pj = {}; try { pj = JSON.parse(lire("donnees/pass.json")); } catch (e) {}
  check("donnees/pass.json : sel, tours, codes = empreinte (64 hex) + heure de fin UTC, aucune donnée personnelle",
    typeof pj.sel === "string" && pj.sel.length >= 16 && pj.tours >= 100000 && Array.isArray(pj.codes)
    && pj.codes.every(c => Object.keys(c).sort().join() === "fin,h" && /^[0-9a-f]{64}$/.test(c.h) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?Z$/.test(c.fin))
    && Object.keys(pj).every(k => ["_lisez_moi", "maj", "sel", "tours", "codes"].includes(k)));
  check("Pass Journée : chargé sur toutes les pages de modèle, jamais sur l'accueil, les guides ou les grands contrats",
    DOCS.every(d => /assets\/pass\.js\?v=/.test(lire(d.slug + "/index.html")) && /id="pass-bloque"/.test(lire(d.slug + "/index.html")))
    && ![...CONTRATS, ...GUIDES].some(d => /pass\.js|btn-pass/.test(lire(d.slug + "/index.html"))) && !/pass\.js|btn-pass/.test(lire("index.html")));
}

// ---- 5. Règles communes : SEO, mentions, photos, sécurité ---------------------------
// Tuiles « icône + petit texte » qui ont l'air de boutons mais ne mènent nulle part (supprimées le 06/10/2026, demande d'Ahmed)
const tuilesSansLien = doc => [...doc.body.querySelectorAll("*")].filter(el => {
  if (/^(a|button|label|summary|svg|h[1-6]|b|strong|em|small|i|option|select|input|textarea|form|header|footer|nav|main|figure|img|section|article)$/i.test(el.tagName)) return false;
  if (el.closest("a,button,label,summary,header,footer,nav,form,svg,[hidden],template")) return false;
  const f = el.firstElementChild;
  if (!f || f.tagName.toLowerCase() !== "svg" || el.querySelector("a,button,input,select,textarea")) return false;
  const t = el.textContent.replace(/\s+/g, " ").trim();
  return t.length > 0 && t.length < 90;
}).map(el => el.textContent.replace(/\s+/g, " ").trim().slice(0, 40));
const V = new Set();
for (const p of [...fichiers, ...fichiers.map(f => "fr/" + f)]) {   // une adresse par langue : pages arabes (racine) ET pages françaises (fr/)
  const s = lire(p), enAr = !p.startsWith("fr/"), base = enAr ? p : p.slice(3), L = enAr ? "ar" : "fr";
  check(`${p} : titre, description, canonical`, /<title>.{20,}<\/title>/.test(s) && /name="description" content=".{50,}"/.test(s) && s.includes('rel="canonical"'));
  check(`${p} : image d'aperçu og-image-v3.jpg (type JPEG)`, s.includes("og-image-v3.jpg") && s.includes('<meta property="og:image:type" content="image/jpeg">') && !s.includes("og-image-v1.png"));
  check(`${p} : meta noai, CSP, referrer`, s.includes('<meta name="robots" content="noai, noimageai">') && s.includes('http-equiv="Content-Security-Policy"') && /script-src 'self' https:\/\/gc\.zgo\.at;/.test(s) && s.includes('name="referrer"'));
  check(`${p} : statistiques GoatCounter (sans cookies) chargées, CSP compatible`,
    s.includes('<script data-goatcounter="https://prix-eaux-tunisie.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>')
    && /connect-src[^;]*https:\/\/prix-eaux-tunisie\.goatcounter\.com/.test(s) && /img-src[^;]*https:\/\/prix-eaux-tunisie\.goatcounter\.com/.test(s));
  check(`${p} : aucun script en ligne exécutable (CSP)`, [...s.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].every(m => /application\/ld\+json/.test(m[1])) && !/\son[a-z]+="/i.test(s) && !/\sstyle="/.test(s));
  check(`${p} : liens externes en rel="noopener"`, [...s.matchAll(/<a [^>]*href="https?:[^"]*"[^>]*>/g)].every(m => /rel="noopener/.test(m[0])));
  check(`${p} : protection (page.js) chargée`, /src="(\.\.\/)*assets\/page\.js\?v=/.test(s));
  (s.match(/\?v=([0-9a-f]+)/g) || []).forEach(x => V.add(x));
  const m = s.match(/<img class="hero-photo" src="([^"]+)"/);
  check(`${p} : photo du bandeau présente (≤ 150 Ko) et créditée`, !!m && existsSync(join(root, dirname(p), m[1])) && statSync(join(root, dirname(p), m[1])).size <= 150000 && /class="credit-photo"[^]*Wikimedia Commons/.test(s));
  check(`${p} : pas de traduction automatique (translate="no" sur <html>, meta google notranslate)`, /<html translate="no"[ >]/.test(s) && /<meta charset="utf-8">\s*<meta name="google" content="notranslate">/.test(s));
  { const morts = tuilesSansLien(new JSDOM(s).window.document); check(`${p} : aucune carte avec une icône sans lien (pas de faux bouton)${morts.length ? " → " + morts.join(" | ") : ""}`, !morts.length); }
  const w = await page(base, L), doc = w.document, pied = doc.getElementById("pied").textContent;
  const autre = "https://documents.clicvia.com/" + (enAr ? "fr/" : "") + base.replace(/index\.html$/, "");
  check(`${p} : langue de l'adresse (lang="${L}", dir ${enAr ? "rtl" : "ltr"}), translate="no" gardé, bouton de langue → ${autre.slice(30)}`,
    doc.documentElement.lang === L && doc.documentElement.dir === (enAr ? "rtl" : "ltr") && doc.documentElement.getAttribute("translate") === "no"
    && doc.querySelector(".langue").textContent === (enAr ? "Fr" : "ع") && (doc.querySelector(".langue").click(), !!w.__allerVers && new w.URL(w.__allerVers, w.location.href).href === autre)
    && doc.documentElement.lang === L);
  check(`${p} : en-tête avec logo et lien « Avocats et notaires », pied ©, ${enAr ? "غير رسمي" : "non officiel"}, date`, !!doc.querySelector("#entete .logo-mark") && !!doc.querySelector("#entete a.entete-annuaire[href^=\"https://avocats.clicvia.com/\"] img") && pied.includes("©") && pied.includes(enAr ? "غير رسمي" : "non officiel") && /\d{2}\/\d{2}\/\d{4}/.test(pied));
  // liens vers les pages communes « Confidentialité » et « Conditions d'utilisation » de clicvia.com (17/11/2026), dans la langue de la page
  { const a = (u, t) => [...doc.querySelectorAll("#pied nav a")].some(x => x.getAttribute("href") === u && x.textContent.trim() === t);
    check(`${p} : pied : liens « Confidentialité » et « Conditions d'utilisation » (adresse dans la langue de la page)`, enAr
      ? a("https://clicvia.com/ar/confidentialite/", "الخصوصية") && a("https://clicvia.com/ar/conditions/", "شروط الاستعمال")
      : a("https://clicvia.com/confidentialite/", "Confidentialité") && a("https://clicvia.com/conditions/", "Conditions d'utilisation")); }
  check(`${p} : bouton « Partager » dans l'en-tête (« ${enAr ? "شارك هذه الصفحة" : "Partager cette page"} »)`, doc.querySelector(`#entete button.partager[aria-label="${enAr ? "شارك هذه الصفحة" : "Partager cette page"}"] svg`));
  check(`${p} : liens du logo et du pied vers les pages de la même langue`, new w.URL(doc.querySelector("#entete a.logo").getAttribute("href"), w.location.href).href === "https://documents.clicvia.com/" + (enAr ? "" : "fr/")
    && [...doc.querySelectorAll("#pied nav a")].filter(x => !/^https?:/.test(x.getAttribute("href"))).every(x => { const q = new w.URL(x.getAttribute("href"), w.location.href).pathname;
      return q.startsWith(enAr ? "/" : "/fr/") && !q.startsWith("/ar/") && (!enAr || !q.startsWith("/fr/")); }));
  check(`${p} : dates « vérifié le » = la constante MAJ`, [...doc.querySelectorAll("[data-maj]")].every(x => x.textContent === w.eval("MAJ")));
  const ld = [...s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(x => JSON.parse(x[1]));
  if (!/^(index\.html|a-propos\/|pass\/)/.test(base)) check(`${p} : FAQ Google (JSON-LD) dans la langue de la page (${enAr ? "arabe" : "français"} seulement)`, ld.some(j => j["@type"] === "FAQPage" && j.mainEntity.length >= 1 && j.mainEntity.every(q => ARABE.test(q.name) === enAr)));
}
// UNE ADRESSE PAR LANGUE (21/11/2026, règle commune § 8 point 9 ; tools/langues.mjs) : chaque page publique existe en ARABE à son
// adresse principale (décision d'Ahmed du 21/11/2026 : « les Tunisiens lisent l'arabe ») et en français sous fr/, chacune écrite dans
// SA langue, qui se citent (hreflang, x-default = arabe) ; les adresses ar/ du matin du 21/11 renvoient vers l'adresse principale.
{ const SITE = "https://documents.clicvia.com/", titresAr = new Set(), pb = [];
  const existe = (de, href) => { const u = new URL(href, SITE + de); if (u.origin + "/" !== SITE) return true;
    const f = u.pathname.slice(1); return existsSync(join(root, f.endsWith("/") || f === "" ? f + "index.html" : f)); };
  for (const p of fichiers) {
    const fr = lire("fr/" + p), ar = lire(p), ch = p.replace(/index\.html$/, ""), dFr = new JSDOM(fr).window.document, dAr = new JSDOM(ar).window.document;
    const hl = d => Object.fromEntries([...d.querySelectorAll('link[rel="alternate"][hreflang]')].map(l => [l.getAttribute("hreflang"), l.getAttribute("href")]));
    const att = { ar: SITE + ch, fr: SITE + "fr/" + ch, "x-default": SITE + ch };
    if (JSON.stringify(hl(dFr)) !== JSON.stringify(att) || JSON.stringify(hl(dAr)) !== JSON.stringify(att)) pb.push(p + " : hreflang");
    if (dFr.querySelector('link[rel="canonical"]')?.href !== att.fr || dAr.querySelector('link[rel="canonical"]')?.href !== att.ar) pb.push(p + " : canonical");
    if (dAr.querySelector('meta[property="og:url"]')?.content !== att.ar || dFr.querySelector('meta[property="og:url"]')?.content !== att.fr
      || dAr.querySelector('meta[property="og:locale"]')?.content !== "ar_AR" || dFr.querySelector('meta[property="og:locale"]')?.content !== "fr_FR") pb.push(p + " : og:url / og:locale");
    if (dFr.documentElement.lang !== "fr" || dAr.documentElement.lang !== "ar" || dAr.documentElement.dir !== "rtl" || dFr.documentElement.dataset.langueFixe !== "fr" || dAr.documentElement.dataset.langueFixe !== "ar") pb.push(p + " : lang / dir / langue fixe");
    if (dFr.querySelector('[data-l="ar"]') || dAr.querySelector('[data-l="fr"]')) pb.push(p + " : texte de l'autre langue resté dans la page");
    const ldAr = [...dAr.querySelectorAll('script[type="application/ld+json"]')].map(x => JSON.parse(x.textContent));
    if (ldAr.some(j => j.inLanguage && j.inLanguage !== "ar")) pb.push(p + " : JSON-LD de la page arabe pas en arabe");
    const titreAr = dAr.title, descAr = dAr.querySelector('meta[name="description"]')?.content || "";
    if (!ARABE.test(titreAr) || titreAr.length > 70 || titresAr.has(titreAr) || ARABE.test(dFr.title)) pb.push(p + " : titre (« " + titreAr + " »)");
    titresAr.add(titreAr);
    if (!ARABE.test(descAr) || descAr.length < 40 || descAr.length > 165) pb.push(p + " : description arabe (" + descAr.length + ")");
    // texte visible (hors scripts) : page arabe surtout en arabe, page française sans arabe (sauf les noms propres isolés)
    const txt = d => { const c = d.body.cloneNode(true); c.querySelectorAll("script,style").forEach(x => x.remove()); return c.textContent; };
    const nAr = t => (t.match(/[؀-ۿ]/g) || []).length, nLat = t => (t.match(/[A-Za-zÀ-ÿ]/g) || []).length;
    if (nAr(txt(dAr)) < 3 * nLat(txt(dAr).replace(/https?:\S+|[A-Za-z0-9.-]+\.(com|tn)\S*/g, ""))) pb.push(p + " : page arabe trop peu arabe");
    if (nAr(txt(dFr)) > nLat(txt(dFr)) / 20) pb.push(p + " : page française avec trop d'arabe");
    for (const [d, de] of [[dFr, "fr/" + ch], [dAr, ch]])
      for (const x of d.querySelectorAll("a[href], img[src], link[href], script[src]")) {
        const h = x.getAttribute("href") ?? x.getAttribute("src");
        if (/^(#|mailto:|tel:|https?:\/\/(?!documents\.clicvia\.com))/.test(h)) continue;
        if (!existe(de, h)) pb.push(de + " : lien mort « " + h + " »");
        const u = new URL(h, SITE + de);
        if (x.tagName === "A" && u.origin + "/" === SITE && (u.pathname.endsWith("/") || u.pathname === "/") && !/^\/video\//.test(u.pathname)
          && (u.pathname.startsWith("/fr/") !== (d === dFr) || u.pathname.startsWith("/ar/"))) pb.push(de + " : lien vers une page de l'autre langue « " + h + " »");
      }
    // ancienne adresse ar/<chemin> (matin du 21/11/2026) : renvoi vers l'adresse principale, jamais indexé, sans script (CSP)
    const rv = existsSync(join(root, "ar", p)) ? lire("ar/" + p) : "", dR = new JSDOM(rv).window.document;
    const ref = dR.querySelector('meta[http-equiv="refresh"]')?.content || "", cible = (ref.match(/^0; url=(.+)$/) || [])[1];
    if (!rv || !/noindex/.test(dR.querySelector('meta[name="robots"]')?.content || "") || dR.querySelector('link[rel="canonical"]')?.href !== att.ar
      || !cible || new URL(cible, SITE + "ar/" + ch).href !== att.ar || dR.querySelector("script") || dR.querySelector(`a[href="${cible}"]`) === null) pb.push("ar/" + p + " : renvoi vers l'adresse principale");
  }
  check(`une adresse par langue : ${fichiers.length} pages arabes (adresse principale) + ${fichiers.length} pages françaises (fr/), hreflang ar / fr / x-default (= arabe) réciproques, canonical, og:url, og:locale, une seule langue par page, titres arabes uniques ≤ 70, descriptions arabes 40-165, liens internes valides dans la même langue, anciennes adresses ar/ = renvois noindex${pb.length ? " — " + pb.slice(0, 6).join(" | ") : ""}`, !pb.length);
  const sm = lire("sitemap.xml");
  check("une adresse par langue : plan du site avec chaque page arabe (racine) ET sa page française (fr/), sans les renvois ar/", fichiers.filter(p => p !== "pass/conditions/index.html").every(p => { const c = p.replace(/index\.html$/, ""); return sm.includes(`<loc>${SITE}${c}</loc>`) && sm.includes(`<loc>${SITE}fr/${c}</loc>`); })
    && !sm.includes(SITE + "ar/"));
  // anciens liens « ?lang=fr » (partagés avant le 21/11/2026) : renvoyés vers la page française fr/… ; jamais pour un robot ni sans demande
  { const ancien = async (q, opts = {}) => { const html = lire(DOCS[0].slug + "/index.html").replace(/<script([^>]*) src="(?!https?:)([^"?]+)(\?[^"]*)?"([^>]*)><\/script>/g,
        (_, a, src) => `<script>${readFileSync(join(root, DOCS[0].slug, src), "utf8")}</script>`);
      const dom = new JSDOM(html, { url: SITE + DOCS[0].slug + "/" + q + "#remplir", runScripts: "dangerously", pretendToBeVisual: true, referrer: opts.referrer,
        beforeParse(w) { w.allerVers = u => { w.__allerVers = u; }; if (opts.langue) w.localStorage.setItem("langue", opts.langue); if (opts.robot) Object.defineProperty(w.navigator, "webdriver", { get: () => true }); } });
      await new Promise(ok => dom.window.addEventListener("load", ok)); return dom.window; };
    let w = await ancien("?lang=fr");
    check("une adresse par langue : ancien lien « ?lang=fr » → page française fr/… (ancre gardée)", w.__allerVers && new w.URL(w.__allerVers, w.location.href).href === SITE + "fr/" + DOCS[0].slug + "/#remplir");
    w = await ancien("?lang=ar");
    check("une adresse par langue : ancien lien « ?lang=ar » → reste à l'adresse principale (arabe)", !w.__allerVers && w.document.documentElement.lang === "ar");
    w = await ancien("", { langue: "fr" });
    check("une adresse par langue : lien partagé ou Google (sans page du site avant) : la page arabe reste arabe, même si le français a été choisi avant", !w.__allerVers && w.document.documentElement.lang === "ar");
    w = await ancien("", { langue: "fr", referrer: SITE + "fr/" });
    check("une adresse par langue : visiteur venu d'une page du site qui avait choisi le français → page française", w.__allerVers && new w.URL(w.__allerVers, w.location.href).href === SITE + "fr/" + DOCS[0].slug + "/#remplir");
    w = await ancien("", { langue: "fr", referrer: SITE + "ar/" + DOCS[0].slug + "/" });
    check("une adresse par langue : arrivé par une ancienne adresse ar/ (renvoi) → reste en arabe, même si le français a été choisi avant", !w.__allerVers);
    w = await ancien("?lang=fr", { robot: true });
    check("une adresse par langue : jamais de renvoi pour un robot (Google lit chaque adresse telle quelle)", !w.__allerVers); }
}
// Page 404 commune (17/11/2026, règle commune § 58 point 14 ; modèle : outils communs/page-404 de projets-ahmed) : sinon GitHub montre sa page anglaise
check("page 404 commune à la racine publiée : 404.html (nom du site, couleur) + 404.js qui cherche la page (« Recherche de la page »)",
  existsSync(join(root, "404.html")) && existsSync(join(root, "404.js")) && lire("404.html").includes("<title>Page introuvable — Documents Tunisie</title>")
  && lire("404.html").includes('<script src="/404.js"></script>') && lire("404.js").includes("Recherche de la page"));
check("À propos : la page introuvable et les liens Confidentialité / Conditions sont expliqués (FR + AR)", lire("fr/a-propos/index.html").includes("Page introuvable, confidentialité, conditions") && lire("a-propos/index.html").includes("صفحة غير موجودة، الخصوصية، الشروط"));
// « Comment ça marche ? » de l'accueil (Ahmed, 22/10/2026) : les 3 étapes illustrées restent sur UNE rangée au téléphone,
// numéro 1-2-3 en pastille sur l'icône (titres courts, 2 lignes au plus à 390 px : mesuré dans Chromium le 22/10/2026)
{ const d = new JSDOM(lire("index.html")).window.document, css = lire("assets/style.css");
  const et = [...(d.querySelector("#comment .comment")?.children || [])];
  check("accueil : « Comment ça marche ? » = 3 étapes numérotées 1-2-3 (pastille sur l'icône)", et.length === 3 && et.every((e, i) => e.querySelector(".ic .num")?.textContent === String(i + 1) && !!e.querySelector(".ic svg")));
  check("accueil : les 3 étapes sur une seule rangée au téléphone (grille de 3 colonnes, jamais remise en 1 colonne)", /\.comment\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/.test(css) && !/\.comment\{[^}]*grid-template-columns:(1fr|repeat\(1,)/.test(css.replace(/^\.comment\{display:grid;grid-template-columns:repeat\(3[^\n]*/m, ""))); }
// « Les étapes » des pages de modèles et démarches (Ahmed, 22/10/2026 : étapes « sur une ligne de gauche à droite ») : petite rangée
// 1-2-3… AJOUTÉE au-dessus de la liste détaillée (rien retiré). Mesuré dans Chromium à 390 px le 22/10/2026 : 4-5 étapes tiennent sur
// une ligne, 6-7 défilent dans la rangée (jamais la page), titres courts en 2 lignes au plus, aucun mot coupé, FR et AR.
{ const { ETAPES_COURTES } = req(join(root, "assets/documents.js")), css = lire("assets/style.css");
  for (const d of TOUS) {
    const doc = new JSDOM(lire("fr/" + d.slug + "/index.html")).window.document;
    const det = [...doc.querySelectorAll("#etapes ol.schema > li")], cases = [...doc.querySelectorAll("#etapes nav.rangee-etapes ol > li")];
    const casesAr = [...new JSDOM(lire(d.slug + "/index.html")).window.document.querySelectorAll("#etapes nav.rangee-etapes ol > li")];   // page arabe (adresse principale)
    const rangee = doc.querySelector("#etapes nav.rangee-etapes");
    check(`${d.slug} : rangée des étapes au-dessus de la liste détaillée, autant de cases que d'étapes (${d.etapes.length})`, !!rangee && cases.length === d.etapes.length && det.length === d.etapes.length && !!(rangee.compareDocumentPosition(doc.querySelector("#etapes ol.schema")) & 4));
    check(`${d.slug} : rangée numérotée 1..n, chaque case = vrai lien vers son étape détaillée (#etape-N existe)`, cases.every((li, i) => { const a = li.querySelector("a[href]"); return a && a.getAttribute("href") === "#etape-" + (i + 1) && li.querySelector(".num")?.textContent === String(i + 1) && det[i]?.id === "etape-" + (i + 1); }));
    check(`${d.slug} : chaque case a un titre court en français ET en arabe (ETAPES_COURTES), liste détaillée inchangée (titre + explication)`, d.etapes.every((e, i) => { const c = ETAPES_COURTES[e.fr[0]], t = cases[i]?.querySelector(".t"); return c && c[0].length <= 20 && c[1].length <= 20 && ARABE.test(c[1]) && t?.querySelector('[data-l="fr"]')?.textContent === c[0] && !!casesAr[i]?.querySelector('.t [data-l="ar"]') && det[i].querySelector("h3") && det[i].querySelector("p")?.textContent.length > 10; }));
    check(`${d.slug} : « Glissez » seulement pour 6-7 étapes`, !!doc.querySelector(".rangee-glisser") === d.etapes.length >= 6 && (d.etapes.length < 6 || !!doc.querySelector(".rangee-glisser.n" + d.etapes.length)));
  }
  check("titres courts : aucun titre court inutilisé (une étape renommée = son titre court mis à jour)", Object.keys(ETAPES_COURTES).every(k => TOUS.some(d => d.etapes.some(e => e.fr[0] === k))));
  check("rangée des étapes : une seule ligne (flex sans retour à la ligne), défilement DANS la rangée, cases de 64 px au moins, « Glissez » pour 6 et 7 étapes",
    /\.rangee-etapes\{[^}]*overflow-x:auto/.test(css) && /\.rangee-etapes ol\{[^}]*display:flex;width:fit-content;min-width:100%/.test(css) && !/\.rangee-etapes[^{]*\{[^}]*flex-wrap:wrap/.test(css)
    && /\.rangee-etapes li\{flex:1 0 0;min-width:64px/.test(css) && /\.rangee-glisser\.n6\{display:block\}/.test(css) && /\.rangee-glisser\.n7\{display:block\}/.test(css)); }
// bouton Partager : sans menu de partage du téléphone (navigator.share), WhatsApp s'ouvre avec l'adresse de la page (sans ?lang ni #)
for (const p of ["index.html", DOCS[0].slug + "/index.html"]) {
  const w = await page(p), doc = w.document, ouverts = [];
  w.open = (...a) => { ouverts.push(a); return null; };
  const b = doc.querySelector("#entete button.partager");
  check(`${p} : bouton « Partager » (aria-label « Partager cette page »)`, b && b.getAttribute("aria-label") === "Partager cette page" && !w.navigator.share);
  b?.click(); await new Promise(ok => setTimeout(ok, 0));
  // partage par lien (demande d'Ahmed) : page vidéo du site + adresse du site, dans la langue de la page (arabe par défaut)
  const lg = doc.documentElement.lang, q = lg === "ar" ? "" : "?lang=" + lg;
  const adresse = "https://documents.clicvia.com/video/" + q, siteLg = "https://documents.clicvia.com/" + (lg === "ar" ? "" : "fr/");   // une adresse par langue
  check(`${p} : sans navigator.share, le clic ouvre wa.me avec la page vidéo + l'adresse du site`, ouverts.length === 1 && ouverts[0][0].startsWith("https://wa.me/?text=")
    && decodeURIComponent(ouverts[0][0].slice(20)).endsWith(" " + adresse) && decodeURIComponent(ouverts[0][0]).includes("Le site : " + siteLg + "\n") && ouverts[0][1] === "_blank");
}
check("même version ?v= sur toutes les pages", V.size === 1);
// les pages publiées sont à jour par rapport aux données
const gen = await import("file://" + join(root, "tools/generer.mjs").replace(/\\/g, "/"));
const attendu = gen.pages(root);
const perimees = Object.entries(attendu).filter(([f, s]) => !existsSync(join(root, f)) || lire(f).replace(/\r\n/g, "\n") !== s).map(([f]) => f);
check(`pages à jour (sinon : node tools/generer.mjs)${perimees.length ? " — " + perimees.join(", ") : ""}`, !perimees.length);
check("plan du site : au moins 29 pages (dont pass/ et la page vidéo)", (lire("sitemap.xml").match(/<loc>/g) || []).length >= 29 && lire("sitemap.xml").includes("documents.clicvia.com/pass/</loc>") && lire("sitemap.xml").includes("documents.clicvia.com/video/</loc>"));

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
const INTERDITS = new Set("307804f8a9e7bd48 8b30fe9b5db7797d 04dcb0d6d0e1cf09 41203aefbaa81d72 bcdb95fe1947c378 9637c0327a8cede8 bab1c2c81c93ac98 bcf950015754248a e4a62b35a8e5d6c2 261d1c911c05f428 a60b2df220c8f10e 7a7fa591155e1ddf 0d27b5e9a89a7130 91566e9abbb02832 05f0fa025a3b026b 87838d7d30f0653a 5415e774c52855a1 5835225ddbea8004 e2cbdee30c0107da e907a5ee176e59be".split(" "));
// noms de domaine complets (un mot seul comme « diwan » est aussi un nom de rue de Tunis, présent dans un crédit photo)
const INTERDITS_DOM = new Set("5d2ae528dda2bff3 e7d3434bfa09866c bac2e4bd95794e67 f8b6c6201a5d83e5 d0b96f4152cb3bef 89209bfe25390a67".split(" "));
const empreinte = m => createHash("sha256").update(m).digest("hex").slice(0, 16);
const publics = [...fichiers, "assets/documents.js", "assets/page.js", "assets/modele.js", "assets/pass.js", "donnees/pass.json", "README.md", "CLAUDE.md", "GUIDE.md", "sitemap.xml", "robots.txt"].filter(f => existsSync(join(root, f)));
const cites = publics.filter(f => { const s = lire(f).toLowerCase();
  return (s.match(/[a-z0-9-]+/g) || []).some(m => INTERDITS.has(empreinte(m))) || (s.match(/[a-z0-9-]+\.[a-z]{2,4}/g) || []).some(m => INTERDITS_DOM.has(empreinte(m))); });
check(`aucun nom de concurrent sur le site ni dans le dépôt${cites.length ? " — trouvé dans " + cites.join(", ") : ""}`, !cites.length);

// robots.txt : Google oui, robots d'IA et aspirateurs non
const robots = lire("robots.txt");
const blocs = robots.split(/\n\s*\n/).map(b => ({ agents: [...b.matchAll(/User-agent:\s*(.+)/gi)].map(m => m[1].trim()), tout: /Disallow:\s*\/\s*$/m.test(b) }));
const interdit = a => blocs.some(b => b.agents.includes(a) && b.tout);
check("robots.txt : robots d'IA et aspirateurs interdits", ["GPTBot", "ClaudeBot", "Claude-Web", "anthropic-ai", "CCBot", "Google-Extended", "Applebot-Extended", "Bytespider", "Amazonbot", "Meta-ExternalAgent", "FacebookBot", "Diffbot", "Omgilibot", "cohere-ai", "ImagesiftBot", "HTTrack", "WebCopier", "WebZIP", "Offline Explorer", "wget", "SiteSnagger"].every(interdit));
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
// taille d'une image JPEG : lue dans son en-tête SOF (marqueurs FFC0 à FFC2)
const tailleJpeg = b => { for (let o = 2; o < b.length - 9;) { const m = b[o + 1], n = b.readUInt16BE(o + 2);
  if (m >= 0xC0 && m <= 0xC2) return [b.readUInt16BE(o + 7), b.readUInt16BE(o + 5)]; o += 2 + n; } return [0, 0]; };
const ogJpg = existsSync(join(root, "assets/og-image-v3.jpg")) ? readFileSync(join(root, "assets/og-image-v3.jpg")) : Buffer.alloc(4);
check("image d'aperçu 1200×630 présente", (([l, h]) => l === 1200 && h === 630)(tailleJpeg(ogJpg)));
// manifeste : id UNIQUE = chemin du site (sinon Chrome croit le site « déjà installé » : tous les sites partagent ah6259.github.io)
let man = {}; try { man = JSON.parse(lire("manifest.webmanifest")); } catch (e) {}
check("manifeste présent, id unique = chemin du site, start_url/scope ./, icônes 192, 512 et maskable existantes",
  man.id === "/" && man.start_url === "./" && man.scope === "./" && man.display === "standalone" && !!man.name && !!man.short_name
  && ["192x192", "512x512"].every(t => man.icons?.some(i => i.sizes === t)) && man.icons?.some(i => i.purpose === "maskable")
  && man.icons.every(i => existsSync(join(root, i.src))) && existsSync(join(root, "assets/icons/apple-touch-icon.png")));
check("toutes les pages : lien vers le manifeste, icône iPhone et theme-color", fichiers.every(p => { const s = lire(p), r = "../".repeat(p.split("/").length - 1);
  return s.includes(`<link rel="manifest" href="${r}manifest.webmanifest">`) && s.includes(`<link rel="apple-touch-icon" href="${r}assets/icons/apple-touch-icon.png">`) && s.includes('<meta name="theme-color"'); }));
check(`image d'aperçu JPEG < 250 Ko (sinon WhatsApp n'affiche qu'une petite vignette) : ${Math.round(ogJpg.length / 1024)} Ko`, ogJpg[0] === 0xFF && ogJpg[1] === 0xD8 && ogJpg.length < 250000);

// 25/10/2026 (RÈGLE d'Ahmed, règle commune § 44 : « la page Comment fonctionne le site doit être mise à jour chaque fois qu'on modifie le site ») :
// chaque fonction visible du site (repère dans le code ou les pages) doit être expliquée dans a-propos/ ; nouvelle fonction = une ligne ici + son explication FR + AR dans tools/generer.mjs
{ const brut = lire("fr/a-propos/index.html"), ap = brut.replace(/<[^>]+>/g, " ").replace(/[\u00a0\u2068\u2069]/g, " ").replace(/\s+/g, " ");
  const acc = lire("index.html"), js = lire("assets/page.js") + lire("assets/modele.js") + lire("assets/pass.js") + lire("tools/generer.mjs");
  const FONCTIONS = [
    ["recherche (au son, nombre de résultats) et catégories", /afficherCompte/.test(js) && /id="recherche"/.test(acc), /Chercher un document : la case de recherche[^.]*au son[^.]*nombre de documents/],
    ["remplir un modèle, aperçu et PDF", /voir-apercu/.test(js), /Remplir un modèle : vous remplissez le formulaire, l'aperçu[^.]*Télécharger le PDF/],
    ["grands contrats", existsSync(join(root, "vente-voiture/index.html")), /Les grands contrats : vente de voiture/],
    ["rangée des étapes et détail", /rangee-etapes/.test(js), /Les étapes après la signature : une rangée d'étapes numérotées/],
    ["démarches expliquées", /GUIDES/.test(js), /Démarches expliquées : explication seulement/],
    ["schéma case par case", /id="schema"/.test(js), /Schéma « case par case »/],
    ["sources citées et « à vérifier »", true, /Sources citées : chaque page donne ses sources officielles/],
    ["annuaires gratuits et calculateur de crédit", /cat-annuaire/.test(acc) && /outils\.clicvia\.com\/credit/.test(js), /Annuaires gratuits : liens vers nos annuaires[^.]*calculateur de crédit/],
    ["langue FR / AR", /\.langue/.test(js), /Français \/ arabe : le bouton de langue/],
    ["une adresse par langue (arabe à l'adresse principale, français sous fr/)", existsSync(join(root, "fr/index.html")) && /data-langue-fixe/.test(js), /Une adresse par langue : chaque page existe en arabe à l'adresse principale[\s\S]{0,80}en français sous « fr\/ »/],
    ["bouton Partager", /\.partager/.test(js), /Partager : le bouton rond/],
    ["Votre avis", /id="avis"/.test(acc), /Votre avis : un formulaire/],
    ["recherches sans résultat comptées", /recherche-vide/.test(js), /Documents demandés : un mot cherché sans résultat/],
    ["installation et hors connexion", existsSync(join(root, "sw.js")), /Installer sur le téléphone/],
    ["vidéo de présentation", existsSync(join(root, "video/index.html")), /Vidéo de présentation : courte vidéo/],
    ["1 PDF gratuit par jour et Pass Journée (prix, code)", existsSync(join(root, "pass/index.html")), /1 document PDF est gratuit chaque jour[\s\S]*Pass Journée \(payant, 7 DT\)[\s\S]*code/],
    ["rappel de fin du Pass", /afficherRappel/.test(js), /Peu avant la fin du Pass, un bandeau vous prévient/],
    ["code de commande créé au formulaire (motif du paiement) et commande en attente", /pass-commande/.test(js), /le formulaire vous donne tout de suite un code de commande ?, à écrire dans le motif du paiement[\s\S]{0,200}le site l'active tout seul/],
    ["e-mail de confirmation automatique du Pass (A.17, 25/11/2026)", /emailAuto: true,/.test(lire("assets/pass-reglages.js")), /E-mail de confirmation : dans la minute qui suit[\s\S]*Resend\) ; rien n'est gardé/],
    ["vie privée", true, /Ce que vous écrivez dans les formulaires reste dans votre téléphone/],
    ["mises à jour automatiques", existsSync(join(root, "tools/surveiller_sources.mjs")), /Mises à jour automatiques : un robot vérifie chaque mois/],
    ["site indépendant", true, /Ce site est indépendant/]];
  const manque = FONCTIONS.filter(([, sur, re]) => sur && !re.test(ap)).map(([n]) => n);
  check("« Comment fonctionne le site ? » (AR) : بريد التأكيد (e-mail de confirmation) + خدمة الإرسال لدينا (Resend)",
    /بريد التأكيد: خلال دقيقة من إرسال الاستمارة/.test(sansIsol(lire("a-propos/index.html")).replace(/<[^>]+>/g, "")) && /بريد التأكيد يُرسل عبر خدمة الإرسال لدينا \(Resend\)؛ ولا يُحفظ شيء\./.test(sansIsol(lire("a-propos/index.html")).replace(/<[^>]+>/g, "")));
  check(`page « Comment fonctionne le site ? » à jour : titre et chaque fonction du site expliquée (${FONCTIONS.length} fonctions)` + (manque.length ? " — manque : " + manque.join(", ") : ""),
    manque.length === 0 && /<h1>[^]*?Comment fonctionne le site \?[^]*?<\/h1>/.test(brut) && /<h1>[^]*?كيف يعمل الموقع؟[^]*?<\/h1>/.test(lire("a-propos/index.html"))
    && /عنوان لكل لغة[\s\S]{0,80}هو العنوان الرئيسي[\s\S]{0,120}تحت «⁨fr\/⁩»/.test(lire("a-propos/index.html"))
    && /a-propos\/">\$\{T\("Comment fonctionne le site \?"/.test(lire("assets/page.js")) && /id="lien-fonctionnement"/.test(acc)); }
check("langue par défaut = ARABE (décision d'Ahmed), seule une langue fr/ar enregistrée est reprise (mémoire partagée entre sites)", (() => { const js = readFileSync(join(root, "assets/page.js"), "utf8"); return /let langue = "ar"/.test(js) && js.includes("/^(fr|ar)$/.test(") && js.includes('langue = gardee || "ar"'); })());
// 25/11/2026 (PASS.1, module commun du parcours d'achat, règle commune § 70.8) : assets/pass-commun.js = COPIE EXACTE du module de
// projets-ahmed (« outils communs/pass-commun/pass-commun.js », recopié par synchroniser.py) ; assets/pass-reglages.js = ce qui est propre au site
{ const copie = readFileSync(join(root, "assets/pass-commun.js")), emp = createHash("sha256").update(copie).digest("hex");
  const attendue = existsSync(join(root, "assets/pass-commun.empreinte")) ? lire("assets/pass-commun.empreinte").trim() : "";
  check("module commun du Pass : assets/pass-commun.js NON modifié dans le site (empreinte écrite par synchroniser.py)", emp === attendue);
  // dépôt général à côté (variable PROJETS_AHMED, puis ../projets-ahmed…) ; absent sur GitHub : comparaison sautée
  const PROJ = [process.env.PROJETS_AHMED, join(root, "../projets-ahmed"), join(root, "../../projets-ahmed"), join(root, "../.."), "/home/user/projets-ahmed"]
    .filter(Boolean).find(x => existsSync(join(x, "outils communs/pass-commun/pass-commun.js")));
  if (PROJ) check("module commun du Pass : copie identique au module de projets-ahmed (sinon : python3 synchroniser.py)",
    readFileSync(join(PROJ, "outils communs/pass-commun/pass-commun.js")).equals(copie));
  else console.log("(comparaison avec le module de projets-ahmed sautée : dépôt absent, normal sur GitHub)");
  const scripts = h => (h.match(/<script defer src="[^"]*assets\/[^"?]+/g) || []).map(x => x.replace(/^.*assets\//, ""));
  const sp = scripts(lire("pass/index.html")), sf = scripts(lire("fr/pass/index.html"));
  check("module commun du Pass : pass/ et fr/pass/ chargent pass.js, puis pass-commun.js, puis pass-reglages.js (seulement ces pages)",
    [sp, sf].every(x => x.indexOf("pass.js") >= 0 && x.indexOf("pass.js") < x.indexOf("pass-commun.js") && x.indexOf("pass-commun.js") === x.indexOf("pass-reglages.js") - 1)
    && !/pass-commun\.js/.test(lire("index.html") + lire("procuration/index.html") + lire("pass/conditions/index.html"))
    && !/brancherFormulairePass|nouveauCodeCommande|envoyerEmail|reprendreCommande/.test(lire("assets/pass.js")));
  const h = { t: Date.parse("2026-10-09T10:00:00Z") }, wm = await pagePass("pass/index.html", { horloge: h });
  check(`module commun du Pass : branché sur le formulaire (version ${wm.PassCommun && wm.PassCommun.version}), réglage du site « documents »`,
    !!wm.PassCommun && wm.PassCommun.reglage && wm.PassCommun.reglage.site === "documents" && wm.document.getElementById("pass-form").getAttribute("data-branche") === "1"); }

console.log(erreurs ? `\n${erreurs} PROBLÈME(S)` : "\nTOUT PASSE");
process.exit(erreurs ? 1 : 0);

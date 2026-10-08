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
async function page(chemin, lang = "fr") {
  const dossier = dirname(join(root, chemin));
  // (les scripts externes, comme GoatCounter, ne sont pas chargés)
  const html = lire(chemin).replace(/<script([^>]*) src="(?!https?:)([^"?]+)(\?[^"]*)?"([^>]*)><\/script>/g,
    (_, a, src) => `<script>${readFileSync(join(dossier, src), "utf8")}</script>`);
  const vc = new VirtualConsole(); vc.on("jsdomError", e => { if (!/Not implemented/.test(e.message)) { console.log("   erreur JS :", chemin, e.message); erreurs++; } });
  const dom = new JSDOM(html, { url: `https://ah6259.github.io/documents-tunisie/${chemin.replace("index.html", "")}?lang=${lang}`,
    runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc });
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
  check("page en arabe : lang=ar, dir=rtl, bouton « Français »", doc.documentElement.lang === "ar" && doc.documentElement.dir === "rtl" && doc.querySelector(".langue").textContent === "Français");
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
  const w = await page(slug + "/index.html"), doc = w.document;
  const liens = [...doc.querySelectorAll('#annuaire a[href^="https://ah6259.github.io/avocats-notaires-tunisie/"]')];
  check(`${slug} : lien vers l'annuaire des avocats et notaires (FR + AR, clic compté, hors du PDF)`, liens.length === 2
    && liens.every(a => a.dataset.annuaire === "lien-avocats/" + slug && /noopener/.test(a.rel)) && !doc.querySelector("#annuaire").closest("#impression, .feuille"));
  check(`${slug} : texte neutre (pas de « meilleur », pas de classement)`, !/meilleur|top \d|أفضل/i.test(doc.getElementById("annuaire").textContent));
  let compte = null; w.goatcounter = { count: o => { compte = o; } };
  liens[0].addEventListener("click", e => e.preventDefault()); liens[0].click();
  check(`${slug} : clic sur l'annuaire compté anonymement (lien-avocats/${slug})`, compte && compte.path === "lien-avocats/" + slug && compte.event === true);
}
for (const slug of HONNEUR) {
  const w = await page(slug + "/index.html"), doc = w.document;
  const compta = [...doc.querySelectorAll('#annuaire a[href^="https://ah6259.github.io/comptables-tunisie/"]')];
  const calc = [...doc.querySelectorAll('#annuaire a[href^="https://ah6259.github.io/outils-pratiques-tunisie/credit/"]')];
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
    sec && sec.classList.contains("protege") && img && /^\.\.\/assets\/illustrations\/traite-cases\.svg\?v=/.test(img.getAttribute("src")) && img.getAttribute("alt")
    && sec.querySelectorAll("ol.cases li").length === 14 && [...sec.querySelectorAll("ol.cases li")].every(li => li.querySelector('[data-l="fr"]') && li.querySelector('[data-l="ar"]'))
    && /Cases grises/.test(sec.textContent) && doc.getElementById("explication-seulement").compareDocumentPosition(sec) === 4);
  check("traite : le schéma est un SPÉCIMEN dessiné par nous (mention « SPÉCIMEN · نموذج », numéros 1 à 14, aucun vrai RIB ni vrai nom)",
    /SPÉCIMEN · نموذج/.test(svgT) && /Dessin original de Documents Tunisie/.test(svgT) && [...Array(14)].every((_, i) => nums.includes(i + 1)) && !/\d{6,}/.test(svgT.replace(/<[^>]+>/g, " ")));
}
check("mariage : second lien vers l'annuaire des prestataires de mariage", /href="https:\/\/ah6259\.github\.io\/mariage-tunisie\/"[^>]*data-annuaire="lien-mariage\/mariage"/.test(lire("mariage/index.html")));
check("aucun PDF ne contient l'adresse des annuaires", DOCS.every(d => ["fr", "ar"].every(L => !/avocats-notaires-tunisie|mariage-tunisie|comptables-tunisie|outils-pratiques/.test(M.feuille(d, valeursEx(d), L)))));
{
  const w = await page("index.html"), doc = w.document;
  check(`accueil : ${TOUS.length} cartes de documents (une par document, contrat et démarche)`, doc.querySelectorAll("[data-cherche]").length === TOUS.length);
  check("accueil : 6 catégories avec icône", doc.querySelectorAll(".cat svg").length === 6);
  check("accueil : plus de badges sans lien ; « 1 document gratuit par jour, étapes gratuites, sans inscription » dans l'intro (FR + AR)", !doc.querySelector(".confiance, .badge-c") && /1 document gratuit par jour, étapes gratuites, sans inscription/.test(doc.querySelector(".hero").textContent) && /وثيقة مجانية كل يوم، المراحل مجانية، دون تسجيل/.test(doc.querySelector(".hero").textContent));
  check("accueil : PAS de bouton « Pass Journée » (décision d'Ahmed : le visiteur partirait), aucun lien vers pass/", !doc.querySelector('a[href^="pass/"], a[href*="/pass/"], .btn-pass, .btn-pro') && !/Pass Journée/.test(doc.body.textContent));
  // bouton vers l'annuaire « Avocats et notaires » (demande d'Ahmed du 06/10/2026) : fin de la rangée des catégories, bordure dorée
  const av = doc.querySelector(".cats > a.cat-annuaire");
  check("accueil : bouton « Avocats et notaires » / « محامون وعدول » à la fin de la rangée des catégories, avec le logo de l'annuaire (copié dans le site)",
    av && av === doc.querySelector(".cats").lastElementChild && av.getAttribute("href") === "https://ah6259.github.io/avocats-notaires-tunisie/" && /noopener/.test(av.rel)
    && /Avocats et notaires/.test(av.textContent) && /محامون وعدول/.test(av.textContent) && av.querySelector('img[src="assets/logo-avocats-notaires.svg"]')
    && existsSync(join(root, "assets/logo-avocats-notaires.svg")) && /\.cat-annuaire\{[^}]*border:2px solid #F2B33D/.test(lire("assets/style.css")));
  { let c = null; w.goatcounter = { count: o => { c = o; } }; av.addEventListener("click", e => e.preventDefault()); av.click();
    check("accueil : clic sur « Avocats et notaires » compté anonymement (lien-site/avocats), sans filtrer les catégories", c && c.path === "lien-site/avocats" && c.event === true && !doc.querySelector(".cat.on")); }
  check("en-tête et pied de page : lien « Avocats et notaires » (logo, bordure dorée, clic compté)", !!doc.querySelector('#entete a.entete-annuaire[data-annuaire="lien-site/avocats"] img[src="assets/logo-avocats-notaires.svg"]')
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
  r.value = "zzzz"; r.dispatchEvent(new w.Event("input"));
  check("accueil : « aucun document » si rien ne correspond", !doc.getElementById("aucun").hidden);
  r.value = ""; r.dispatchEvent(new w.Event("input"));
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
async function pagePass(chemin, { horloge, stockage = {}, liste = null, envois = [] } = {}) {
  const dossier = dirname(join(root, chemin));
  const html = lire(chemin).replace(/<script([^>]*) src="(?!https?:)([^"?]+)(\?[^"]*)?"([^>]*)><\/script>/g,
    (_, a, src) => `<script>${readFileSync(join(dossier, src), "utf8")}</script>`);
  const vc = new VirtualConsole(); vc.on("jsdomError", e => { if (!/Not implemented/.test(e.message)) { console.log("   erreur JS :", chemin, e.message); erreurs++; } });
  const dom = new JSDOM(html, { url: `https://ah6259.github.io/documents-tunisie/${chemin.replace("index.html", "")}`, runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      try { if (!w.localStorage.getItem("langue")) w.localStorage.setItem("langue", "fr"); } catch (e) {}  // ces scénarios lisent les textes français
      const Vraie = w.Date;
      w.Date = class extends Vraie { constructor(...a) { super(...(a.length ? a : [horloge.t])); } static now() { return horloge.t; } };
      Object.defineProperty(w, "crypto", { value: webcrypto, configurable: true });
      w.TextEncoder = TextEncoder;
      w.fetch = async (url, o) => {
        if (/formspree/.test(url)) { envois.push(o.body); return { ok: true, status: 200, json: async () => ({ ok: true }) }; }
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
      va && va.getAttribute("href") === "#apercu-carte" && doc.getElementById("telecharger").nextElementSibling === va && /Voir l'aperçu/.test(va.textContent) && /معاينة الوثيقة/.test(va.textContent)); }
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
  check("appareil : seul le code est gardé (aucun nom, aucun téléphone)", Object.keys(avecPass).every(k => ["dt-pass-v1", "dt-gratuit-v1", "langue"].includes(k)));
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

  // page pass/ : prix, paiement, WhatsApp, formulaire, conditions
  const envois = [];
  w = await pagePass("pass/index.html", { horloge: H, envois }); doc = w.document;
  const t = doc.body.textContent;
  check("pass/ : prix 7 DT, tous les documents pendant 24 heures, valable 24 heures à partir de l'envoi du code", /7 DT/.test(doc.querySelector(".prix-pass").textContent) && /tous les documents pendant 24 heures/.test(t) && /Valable 24 heures à partir de l'envoi de votre code/.test(t));
  check("pass/ : bouton « Paiement » (details) avec D17 et IZI (liens vers les applications officielles, Google Play + iPhone) au 24 321 390, mode d'emploi, plus de Wafacash, motif = nom + téléphone", doc.querySelector("details#paiement > summary")?.textContent.includes("Paiement")
    && ["D17", "IZI", "Transfert rapide"].every(x => doc.querySelector("#paiement .paie").textContent.includes(x)) && !/Wafacash/i.test(lire("pass/index.html") + lire("pass/conditions/index.html"))
    && ["https://play.google.com/store/apps/details?id=tn.mobipost", "https://play.google.com/store/apps/details?id=tn.izi.consumer", "https://apps.apple.com/tn/app/digipostbank-d17/id1475640303", "https://apps.apple.com/tn/app/izi/id1603653941"].every(u => doc.querySelector(`#paiement .paie a[href="${u}"]`)) && /24 321 390/.test(doc.querySelector("#paiement .paie").textContent) && /votre nom et votre téléphone/.test(doc.querySelector("#paiement .paie").textContent));
  const wa = doc.getElementById("pass-preuve");
  check("pass/ : bouton vert WhatsApp vers wa.me/21624321390 avec texte prérempli, « vous recevrez votre code par WhatsApp »", wa && wa.href.startsWith("https://wa.me/21624321390?text=") && /Pass%20Journ/.test(wa.href) && /noopener/.test(wa.rel) && /vous recevrez votre code par WhatsApp/i.test(t));
  check("pass/ : pas de renouvellement automatique, lien vers les conditions, « J'ai un code »", /Pas de renouvellement automatique/.test(t) && doc.querySelector('a[href="conditions/"]') && doc.querySelector("#code-acces form.code-form"));
  const pf = doc.getElementById("pass-form");
  check("pass/ : formulaire Formspree mwlpakqj (nom, téléphone, case conditions, champ piège)", pf.getAttribute("action") === "https://formspree.io/f/mwlpakqj" && pf.elements.nom && pf.elements.telephone && pf.elements.conditions?.type === "checkbox" && pf.elements._gotcha);
  const soumettre = () => pf.dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  pf.elements.nom.value = "Client Factice"; pf.elements.telephone.value = "123"; soumettre();
  check("pass/ : téléphone faux refusé (8 chiffres), rien n'est envoyé", envois.length === 0 && /8 chiffres/.test(doc.getElementById("pass-status").textContent));
  pf.elements.telephone.value = "+216 98 765 432"; soumettre();
  check("pass/ : conditions non cochées refusées, rien n'est envoyé", envois.length === 0 && /conditions/.test(doc.getElementById("pass-status").textContent));
  pf.elements.conditions.checked = true; soumettre();
  await attendre(() => !doc.getElementById("apres-pass").hidden);
  check("pass/ : demande envoyée à Formspree (site, ligne « pour_activer » prête pour le bouton GitHub), écran de paiement affiché",
    envois.length === 1 && envois[0].get("site") === "Documents Tunisie" && envois[0].get("telephone") === "98765432" && envois[0].get("pour_activer") === "action: paye ; nom: Client Factice ; telephone: 98765432"
    && !doc.getElementById("apres-pass").hidden && pf.hidden);
  check("pass/ : message WhatsApp de la preuve complété avec le nom et le téléphone", decodeURIComponent(doc.getElementById("pass-preuve-apres").href).includes("Client Factice — 98765432"));
  const cond = (await pagePass("pass/conditions/index.html", { horloge: H })).document.body.textContent;
  check("conditions : vendeur « l'éditeur du site », pas de renouvellement automatique, aucune période payée remboursée, INPDP, 24 heures",
    /vendu par l'éditeur du site/.test(cond) && /Aucun renouvellement automatique/.test(cond) && /Aucune période payée n'est remboursée/.test(cond) && /INPDP/.test(cond) && /24 heures à partir de l'envoi de votre code/.test(cond));
  check("conditions : aucun nom de société, prix non annoncés TTC, aucun numéro de déclaration inventé", !/\b(SARL|SUARL|S\.A\.|société|TTC|déclaration n°)/i.test(cond));
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
for (const p of fichiers) {
  const s = lire(p);
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
  const w = await page(p), doc = w.document, pied = doc.getElementById("pied").textContent;
  check(`${p} : translate="no" gardé par le JavaScript (français puis arabe)`, doc.documentElement.getAttribute("translate") === "no" && (doc.querySelector(".langue")?.click(), doc.documentElement.lang === "ar" && doc.documentElement.getAttribute("translate") === "no"));
  check(`${p} : en-tête avec logo et lien « Avocats et notaires », pied ©, non officiel, date`, !!doc.querySelector("#entete .logo-mark") && !!doc.querySelector("#entete a.entete-annuaire[href^=\"https://ah6259.github.io/avocats-notaires-tunisie/\"] img") && pied.includes("©") && pied.includes("non officiel") && /\d{2}\/\d{2}\/\d{4}/.test(pied));
  check(`${p} : bouton « Partager » dans l'en-tête (arabe : « شارك هذه الصفحة »)`, doc.querySelector('#entete button.partager[aria-label="شارك هذه الصفحة"] svg'));
  check(`${p} : dates « vérifié le » = la constante MAJ`, [...doc.querySelectorAll("[data-maj]")].every(x => x.textContent === w.eval("MAJ")));
  const ld = [...s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(x => JSON.parse(x[1]));
  if (!/^(index\.html|a-propos\/|pass\/)/.test(p)) check(`${p} : FAQ Google (JSON-LD) en français et en arabe`, ld.some(j => j["@type"] === "FAQPage" && j.mainEntity.length >= 2 && j.mainEntity.some(q => ARABE.test(q.name))));
}
// bouton Partager : sans menu de partage du téléphone (navigator.share), WhatsApp s'ouvre avec l'adresse de la page (sans ?lang ni #)
for (const p of ["index.html", DOCS[0].slug + "/index.html"]) {
  const w = await page(p), doc = w.document, ouverts = [];
  w.open = (...a) => { ouverts.push(a); return null; };
  const b = doc.querySelector("#entete button.partager");
  check(`${p} : bouton « Partager » (aria-label « Partager cette page »)`, b && b.getAttribute("aria-label") === "Partager cette page" && !w.navigator.share);
  b?.click(); await new Promise(ok => setTimeout(ok, 0));
  // partage par lien (demande d'Ahmed) : page vidéo du site + adresse du site, dans la langue de la page (arabe par défaut)
  const lg = doc.documentElement.lang, q = lg === "ar" ? "" : "?lang=" + lg;
  const adresse = "https://ah6259.github.io/documents-tunisie/video/" + q;
  check(`${p} : sans navigator.share, le clic ouvre wa.me avec la page vidéo + l'adresse du site`, ouverts.length === 1 && ouverts[0][0].startsWith("https://wa.me/?text=")
    && decodeURIComponent(ouverts[0][0].slice(20)).endsWith(" " + adresse) && decodeURIComponent(ouverts[0][0]).includes("https://ah6259.github.io/documents-tunisie/" + q) && ouverts[0][1] === "_blank");
}
check("même version ?v= sur toutes les pages", V.size === 1);
// les pages publiées sont à jour par rapport aux données
const gen = await import("file://" + join(root, "tools/generer.mjs").replace(/\\/g, "/"));
const attendu = gen.pages(root);
const perimees = Object.entries(attendu).filter(([f, s]) => !existsSync(join(root, f)) || lire(f).replace(/\r\n/g, "\n") !== s).map(([f]) => f);
check(`pages à jour (sinon : node tools/generer.mjs)${perimees.length ? " — " + perimees.join(", ") : ""}`, !perimees.length);
check("plan du site : au moins 29 pages (dont pass/ et la page vidéo)", (lire("sitemap.xml").match(/<loc>/g) || []).length >= 29 && lire("sitemap.xml").includes("/documents-tunisie/pass/</loc>") && lire("sitemap.xml").includes("/documents-tunisie/video/</loc>"));

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
// taille d'une image JPEG : lue dans son en-tête SOF (marqueurs FFC0 à FFC2)
const tailleJpeg = b => { for (let o = 2; o < b.length - 9;) { const m = b[o + 1], n = b.readUInt16BE(o + 2);
  if (m >= 0xC0 && m <= 0xC2) return [b.readUInt16BE(o + 7), b.readUInt16BE(o + 5)]; o += 2 + n; } return [0, 0]; };
const ogJpg = existsSync(join(root, "assets/og-image-v3.jpg")) ? readFileSync(join(root, "assets/og-image-v3.jpg")) : Buffer.alloc(4);
check("image d'aperçu 1200×630 présente", (([l, h]) => l === 1200 && h === 630)(tailleJpeg(ogJpg)));
// manifeste : id UNIQUE = chemin du site (sinon Chrome croit le site « déjà installé » : tous les sites partagent ah6259.github.io)
let man = {}; try { man = JSON.parse(lire("manifest.webmanifest")); } catch (e) {}
check("manifeste présent, id unique = chemin du site, start_url/scope ./, icônes 192, 512 et maskable existantes",
  man.id === "/documents-tunisie/" && man.start_url === "./" && man.scope === "./" && man.display === "standalone" && !!man.name && !!man.short_name
  && ["192x192", "512x512"].every(t => man.icons?.some(i => i.sizes === t)) && man.icons?.some(i => i.purpose === "maskable")
  && man.icons.every(i => existsSync(join(root, i.src))) && existsSync(join(root, "assets/icons/apple-touch-icon.png")));
check("toutes les pages : lien vers le manifeste, icône iPhone et theme-color", fichiers.every(p => { const s = lire(p), r = "../".repeat(p.split("/").length - 1);
  return s.includes(`<link rel="manifest" href="${r}manifest.webmanifest">`) && s.includes(`<link rel="apple-touch-icon" href="${r}assets/icons/apple-touch-icon.png">`) && s.includes('<meta name="theme-color"'); }));
check(`image d'aperçu JPEG < 250 Ko (sinon WhatsApp n'affiche qu'une petite vignette) : ${Math.round(ogJpg.length / 1024)} Ko`, ogJpg[0] === 0xFF && ogJpg[1] === 0xD8 && ogJpg.length < 250000);

check("langue par défaut = ARABE (décision d'Ahmed), seule une langue fr/ar enregistrée est reprise (mémoire partagée entre sites)", (() => { const js = readFileSync(join(root, "assets/page.js"), "utf8"); return /let langue = "ar";/.test(js) && js.includes("/^(fr|ar)$/.test(") && js.includes(': "") || "ar"'); })());
console.log(erreurs ? `\n${erreurs} PROBLÈME(S)` : "\nTOUT PASSE");
process.exit(erreurs ? 1 : 0);

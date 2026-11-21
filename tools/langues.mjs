// UNE ADRESSE PAR LANGUE (21/11/2026, règle commune § 8 point 9 ; méthode de robot/langues.py d'Alerte Concours et de
// tools/construire.py de Code de la route).
// Avant : chaque page contenait tout le texte en français ET en arabe (spans data-l, l'autre langue cachée par le style),
// sous lang="fr" ; Google voyait une page « française » à moitié arabe (« hreflang : aucun » au contrôle commun).
// Maintenant, à partir de la page bilingue fabriquée par tools/generer.mjs :
//   - <chemin> (français) : sans les textes arabes ;
//   - ar/<chemin> (arabe) : sans les textes français, lang="ar" dir="rtl", titre (H1 arabe + nom du site) et description
//     (1er paragraphe arabe) en arabe, fichiers (style, scripts, images, données) pris à la racine, pages restant dans ar/ ;
//   - les deux pages se citent (hreflang fr / ar / x-default = fr) et ont chacune leur canonical ;
//   - data-langue-fixe : la langue est celle de l'adresse ; le bouton de langue mène à l'autre adresse (assets/page.js).
// NE JAMAIS MODIFIER ar/ À LA MAIN : tout est refait par node tools/generer.mjs.
export const URL_SITE = "https://documents.clicvia.com/";
export const NOM_AR = "وثائق تونس";
const ARABE = /[؀-ۿ]/;
const BALISE = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)(\/?)>/gs;
const VIDES = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const desc_ = s => String(s).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");

export function titreSeo(t, maxi = 70, suffixe = "") {
  t = String(t).replace(/\s+/g, " ").trim();
  const place = maxi - suffixe.length;
  if (t.length <= place) return t + suffixe;
  for (const sep of [" : ", " — ", " (", " – ", "، ", ", ", ": "]) { const i = t.lastIndexOf(sep, place); if (i >= 25) return t.slice(0, i).replace(/[\s,;:—(،-]+$/, "") + suffixe; }
  return t.slice(0, place - 1).replace(/\s+\S*$/, "").replace(/[\s,;:—(،-]+$/, "") + "…" + suffixe;
}
export function descSeo(d, maxi = 165) {
  d = String(d).replace(/\s+/g, " ").trim();
  if (d.length <= maxi) return d;
  const c = d.slice(0, maxi), i = Math.max(c.lastIndexOf(". "), c.lastIndexOf("؟ "), c.lastIndexOf("! "));
  return i >= 60 ? c.slice(0, i + 1).trim() : c.slice(0, maxi - 1).replace(/\s+\S*$/, "").replace(/[\s,;:—(،-]+$/, "") + "…";
}

/** Enlève chaque élément data-l="<autre>" (et tout ce qu'il contient). Les scripts et styles ne sont jamais lus. */
export function retirerLangue(page, autre) {
  const sortie = []; let i = 0, saut = 0;
  const cible = `data-l="${autre}"`;
  BALISE.lastIndex = 0;
  for (let m; (m = BALISE.exec(page));) {
    if (m.index < Math.max(i, saut)) continue;
    const ferme = m[1], nom = m[2].toLowerCase(), attrs = m[3];
    if ((nom === "script" || nom === "style") && !ferme) { const f = page.indexOf("</" + nom, m.index + m[0].length); saut = f < 0 ? page.length : f; continue; }
    if (ferme || !attrs.includes(cible)) continue;
    sortie.push(page.slice(i, m.index));
    let j;
    if (VIDES.has(nom) || m[4]) j = m.index + m[0].length;
    else {
      let prof = 1; j = page.length;
      const re = new RegExp(BALISE.source, "gs"); re.lastIndex = m.index + m[0].length;
      for (let n; (n = re.exec(page));) {
        if (n[2].toLowerCase() !== nom || n[4]) continue;
        prof += n[1] ? -1 : 1;
        if (prof === 0) { j = n.index + n[0].length; break; }
      }
    }
    i = j;
    // les éléments retirés sont presque toujours des jumeaux collés (<span fr><span ar>) : on n'ajoute rien à leur place
    BALISE.lastIndex = j;
  }
  sortie.push(page.slice(i));
  return sortie.join("");
}

const texte = f => desc_(f.replace(/<[^>]+>/g, " ")).replace(/[⁦-⁩]/g, "").replace(/\s+/g, " ").trim();

/** Titre (H1) et description (1er paragraphe arabe d'au moins 40 caractères après le H1) d'une page bilingue. */
export function textesArabes(page) {
  const h1 = page.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
  const titre = h1 && h1[1].includes('data-l="ar"') ? texte(retirerLangue(h1[1], "fr")) : "";
  let desc = "";
  const debut = h1 ? h1.index + h1[0].length : 0;
  for (const m of page.slice(debut).matchAll(/<(p|span|div|li)\b[^>]*data-l="ar"[^>]*>([\s\S]*?)<\/\1>/g)) {
    const t = texte(m[2]);
    if (t.length >= 40 && !/clicvia\.com/.test(t)) { desc = t; break; }
  }
  if (desc && desc.length < 50 && titre) desc = titre + " — " + desc;
  return { titre, desc };
}

function resoudre(chemin, rel) {
  const parts = chemin.split("/").slice(0, -1).filter(Boolean);
  for (const x of rel.split("/")) { if (x === "" || x === ".") continue; if (x === "..") parts.pop(); else parts.push(x); }
  return parts.join("/") + (parts.length && (rel.endsWith("/") || ["", ".", ".."].includes(rel)) ? "/" : "");
}

/** Adresse relative vue depuis ar/<chemin> : une page qui existe en arabe reste dans ar/, tout le reste est pris à la racine. */
function unNiveau(url, chemin, miroir) {
  if (!url || /^([a-z][a-z0-9+.-]*:|\/\/|\/|#|\?)/i.test(url)) return url;
  const p = url.split("#")[0].split("?")[0];
  if ((p === "" || p.endsWith("/") || p === "." || p === "..") && miroir.has(resoudre(chemin, p))) return url;
  return "../" + url;
}

function jsonLd(page, L, chemin, titreAr) {
  return page.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>\n?/g, (tout, corps) => {
    const j = JSON.parse(corps);
    if (j["@type"] === "FAQPage") {
      j.mainEntity = j.mainEntity.filter(q => ARABE.test(q.name) === (L === "ar"));
      if (!j.mainEntity.length) return "";
      if (L === "ar") j.inLanguage = "ar";
    } else if (j["@type"] === "WebSite") {
      j.inLanguage = L;
      if (L === "ar") { j.name = NOM_AR; j.url = URL_SITE + "ar/"; }
    } else if (j["@type"] === "BreadcrumbList" && L === "ar") {
      j.itemListElement = j.itemListElement.map((x, i, a) => ({ ...x, name: i === 0 ? NOM_AR : i === a.length - 1 && titreAr ? titreAr : x.name,
        item: String(x.item).replace(URL_SITE, URL_SITE + "ar/") }));
    }
    return `<script type="application/ld+json">${JSON.stringify(j)}</script>\n`;
  });
}

const teteLangues = chemin => `<link rel="alternate" hreflang="fr" href="${URL_SITE}${chemin}">\n<link rel="alternate" hreflang="ar" href="${URL_SITE}ar/${chemin}">\n<link rel="alternate" hreflang="x-default" href="${URL_SITE}${chemin}">`;

/** fichier = « pass/index.html » ; miroir = dossiers des pages qui existent dans les deux langues ("" = accueil).
 *  Renvoie { fr, ar } : la page française seule et la page arabe seule. */
export function versions(page, fichier, miroir) {
  const chemin = fichier.replace(/index\.html$/, "");
  const prof = chemin.split("/").filter(Boolean).length;
  const m = page.match(/<html translate="no" lang="fr" dir="ltr" data-racine="([^"]*)">/);
  if (!m) throw new Error(`${fichier} : balise <html translate="no" lang="fr" dir="ltr" data-racine> attendue`);
  const racine = m[1];
  const { titre: titreAr0, desc: descAr0 } = textesArabes(page);
  const titreAr = titreAr0 || NOM_AR, descAr = descSeo(descAr0 || titreAr);
  const vers_ar = "../".repeat(prof) + "ar/" + chemin, vers_fr = "../".repeat(prof + 1) + chemin;

  /* ---- français ---- */
  let fr = retirerLangue(page, "ar");
  fr = fr.replace(m[0], `<html translate="no" lang="fr" dir="ltr" data-racine="${racine}" data-langue-fixe="fr" data-autre-langue="${vers_ar}">`);
  fr = fr.replace('<link rel="canonical"', teteLangues(chemin) + '\n<link rel="canonical"');
  // titre et description : jamais de morceau arabe sur la page française (« … – نماذج وثائق تونسية »)
  fr = fr.replace(/<title>([\s\S]*?)<\/title>/, (_, t) => `<title>${t.replace(/\s+[–—|]\s+[^–—|]*[؀-ۿ][^–—|]*$/, "")}</title>`);
  fr = fr.replace(/(<meta property="og:title" content=")([^"]*)(")/, (_, a, t, b) => a + t.replace(/\s+[–—|]\s+[^–—|]*[؀-ۿ][^–—|]*$/, "") + b);
  fr = fr.replace(/(<meta (?:name="description"|property="og:description") content=")([^"]*)(")/g, (_, a, d, b) => a + d.replace(/…+/g, "…") + b);
  fr = jsonLd(fr, "fr", chemin);

  /* ---- arabe ---- */
  let ar = retirerLangue(page, "fr");
  ar = ar.replace(/\b(href|src|srcset|action|poster)="([^"]*)"/g, (_, nom, val) => `${nom}="${nom === "srcset"
    ? val.split(",").map(s => s.trim()).filter(Boolean).map(s => [unNiveau(s.split(/\s+/)[0], chemin, miroir), ...s.split(/\s+/).slice(1)].join(" ")).join(", ")
    : unNiveau(val, chemin, miroir)}"`);
  ar = ar.replace(m[0], `<html translate="no" lang="ar" dir="rtl" data-racine="../${racine}" data-site="${racine}" data-langue-fixe="ar" data-autre-langue="${vers_fr}">`);
  const urlAr = URL_SITE + "ar/" + chemin;
  ar = ar.replace(/<link rel="canonical" href="[^"]*">/, teteLangues(chemin) + `\n<link rel="canonical" href="${urlAr}">`);
  ar = ar.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${urlAr}">`);
  ar = ar.replace('<meta property="og:locale" content="fr_FR"><meta property="og:locale:alternate" content="ar_AR">',
    '<meta property="og:locale" content="ar_AR"><meta property="og:locale:alternate" content="fr_FR">');
  const t = titreSeo(titreAr, 70, titreAr === NOM_AR ? "" : " | " + NOM_AR);
  ar = ar.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(t)}</title>`);
  ar = ar.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(t)}">`);
  ar = ar.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(descAr)}">`);
  ar = ar.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(descAr)}">`);
  ar = ar.replace('<meta property="og:site_name" content="Documents Tunisie">', `<meta property="og:site_name" content="${NOM_AR}">`);
  ar = ar.replace('<meta name="apple-mobile-web-app-title" content="Documents TN">', `<meta name="apple-mobile-web-app-title" content="${NOM_AR}">`);
  ar = jsonLd(ar, "ar", chemin, titreAr);
  return { fr, ar };
}

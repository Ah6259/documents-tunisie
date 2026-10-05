// Fabrique toutes les pages HTML du site à partir des données (assets/documents.js) :
//   node tools/generer.mjs
// À relancer après chaque modification des données, des textes ou des fichiers assets/ (le ?v= change tout seul).
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

export function pages(root) {
  const lire = f => readFileSync(join(root, f), "utf8");
  const req = createRequire(join(root, "tools", "x.js"));
  delete req.cache[req.resolve(join(root, "assets/documents.js"))];
  const { DOCS, CONTRATS, CATEGORIES, SOURCES, LEG_SUPPR } = req(join(root, "assets/documents.js"));
  const CREDITS = JSON.parse(lire("assets/photos/credits.json"));
  const MAJ = lire("assets/page.js").match(/const MAJ = "([\d/]+)"/)[1];
  const URL = "https://ah6259.github.io/documents-tunisie/";
  // ?v= : empreinte des fichiers communs (fins de ligne normalisées, pour que Windows et GitHub soient d'accord)
  const V = createHash("sha256").update(["assets/style.css", "assets/page.js", "assets/modele.js", "assets/documents.js"]
    .map(f => lire(f).replace(/\r\n/g, "\n")).join("\n")).digest("hex").slice(0, 10);

  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // dans un texte arabe, les mots latins et les nombres sont isolés (U+2068…U+2069) pour garder le bon ordre de lecture
  const isoler = ar => String(ar).replace(/[A-Za-z0-9][A-Za-z0-9 .,'%/()+-]*[A-Za-z0-9)%]|[A-Za-z0-9]/g, m => "⁨" + m + "⁩");
  const bi = (fr, ar) => `<span data-l="fr">${esc(fr)}</span><span data-l="ar">${esc(isoler(ar))}</span>`;
  const svg = (d, cls = "") => `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ""}>${d}</svg>`;
  const ICONES = {
    remplir: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
    imprimer: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    signer: '<path d="M3 17c3-4 5-4 6-1s3 2 5-2 4-3 7 0"/><path d="M3 21h18"/>',
    municipalite: '<path d="M9 3h6v5l-1 3h-4L9 8z"/><path d="M4 14h16v4H4z"/><path d="M6 21h12"/>',
    recette: '<circle cx="12" cy="12" r="8.5"/><path d="M14.6 9.4c-.6-.8-1.5-1.2-2.6-1.2-1.5 0-2.6.8-2.6 1.9 0 2.8 5.4 1.4 5.4 4 0 1.1-1.1 1.9-2.8 1.9-1.1 0-2.1-.5-2.7-1.3M12 6.4v1.8M12 15.9v1.7"/>',
    attt: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h6M7 14h4"/><circle cx="16.5" cy="12" r="2"/>',
    remettre: '<path d="M4 4h16v12H4z"/><path d="M4 12h4l1.5 2h5L16 12h4"/><path d="M8 20h8"/>',
    poste: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    ecole: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    garder: '<path d="M3 6h6l2 2h10v11H3z"/>',
    verifier: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    horloge: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    liste: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    lieu: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    alerte: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17v.01"/>',
    livre: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3"/><path d="M20 4v14h-7"/>',
    pdf: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/>',
    cadenas: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    bouclier: '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/>',
    langues: '<path d="M4 5h9M8.5 3v2M6 5c0 4 3 7 6 8M11 5c0 3-2.5 7-6.5 9"/><path d="M13 21l4-10 4 10M14.5 17.5h5"/>',
    loupe: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>'
  };
  const WHATSAPP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>';
  const cat = id => CATEGORIES.find(c => c.id === id);
  const OUI = { oui: ["Oui", "نعم", "oui"], non: ["Non", "لا", "non"], parfois: ["Si on vous la demande", "عند الطلب", "oui"], possible: ["Facultatif", "اختياري", "oui"] };
  const CSP = "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests";

  function tete({ titre, desc, chemin, racine, scripts, jsonld }) {
    return `<!doctype html>
<html lang="fr" dir="ltr" data-racine="${racine}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="robots" content="noai, noimageai">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${URL}${chemin}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Documents Tunisie">
<meta property="og:title" content="${esc(titre)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${URL}${chemin}">
<meta property="og:locale" content="fr_TN"><meta property="og:locale:alternate" content="ar_TN">
<meta property="og:image" content="${URL}assets/og-image-v1.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${racine}assets/logo.svg" type="image/svg+xml">
<meta name="theme-color" content="#8C2B3A">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&amp;family=Noto+Kufi+Arabic:wght@400;600;700;800&amp;family=Noto+Naskh+Arabic:wght@400;700&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="${racine}assets/style.css?v=${V}">
${scripts.map(s => `<script defer src="${racine}assets/${s}?v=${V}"></script>`).join("\n")}
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
</head>`;
  }
  const corpsDebut = (attrs = "") => `<body${attrs}>
<header class="entete" id="entete"></header>
<div class="alerte-age" id="alerte-age" hidden><div class="wrap"></div></div>`;
  const pied = `<footer id="pied"></footer>\n</body>\n</html>\n`;
  function hero({ photo, racine, fil, h1, intro, pastilles = [] }) {
    const c = CREDITS[photo];
    return `<section class="hero">
  <img class="hero-photo" src="${racine}${c.fichier}" alt="" width="1400" height="588">
  <div class="wrap">
    ${fil ? `<p class="fil">${fil}</p>` : ""}
    <h1>${h1}</h1>
    <p class="intro">${intro}</p>
    <div class="pastilles">${pastilles.join("")}<span class="maj">${bi("Vérifié le", "تم التثبت في")}&nbsp;<span data-maj>${MAJ}</span></span></div>
  </div>
  <p class="credit-photo" dir="ltr">Photo / صورة : ${esc(c.auteur)}, <a href="${esc(c.source)}" rel="noopener noreferrer" target="_blank">${esc(c.licence)}</a>, Wikimedia Commons</p>
</section>`;
  }
  const sourcesHTML = keys => `<ul class="sources">${keys.map(k => `<li><a href="${SOURCES[k].url}" rel="noopener noreferrer" target="_blank">${bi(SOURCES[k].fr, SOURCES[k].ar)}</a></li>`).join("")}</ul>`;
  const listeBi = o => o.fr.length ? `<ul class="liste" data-l="fr">${o.fr.map(x => `<li>${esc(x)}</li>`).join("")}</ul><ul class="liste" data-l="ar">${o.ar.map(x => `<li>${esc(isoler(x))}</li>`).join("")}</ul>` : "";
  const h2 = (ic, fr, ar) => `<h2><span class="ic">${svg(ICONES[ic])}</span>${bi(fr, ar)}</h2>`;
  const elision = t => (/^[aeiouéèêh]/i.test(t) ? "d'" : "de ") + t.charAt(0).toLowerCase() + t.slice(1);

  const out = {};
  const tous = [...DOCS, ...CONTRATS];

  /* ---------------- pages des documents ---------------- */
  for (const d of tous) {
    const k = cat(d.cat), racine = "../";
    const titre = d.contrat
      ? `${d.titre.fr.replace(" : les étapes", "")} en Tunisie : les étapes (légalisation, enregistrement) – ${d.titre.ar.split(":")[0]}`
      : `Modèle ${elision(d.titre.fr)} en Tunisie (PDF, français et arabe) – ${d.titre.ar}`;
    const desc = `${d.bref.fr.length > 150 ? d.bref.fr.slice(0, d.bref.fr.lastIndexOf(" ", 147)) + "…" : d.bref.fr} ${d.titre.ar}.`;
    const faq = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: d.faq.flatMap(q => ["fr", "ar"].map(L => ({
      "@type": "Question", name: q[L][0], acceptedAnswer: { "@type": "Answer", text: q[L][1] } }))) };
    const fil = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Documents Tunisie", item: URL },
      { "@type": "ListItem", position: 2, name: d.titre.fr, item: URL + d.slug + "/" }] };
    const L = d.legal;
    const fait = (ic, frT, arT, val) => `<div class="fait"><b>${svg(ICONES[ic])}${bi(frT, arT)}</b><span class="val">${val}</span></div>`;
    const oui = x => `<span class="${OUI[x][2]}">${bi(OUI[x][0], OUI[x][1])}</span>`;
    const pastilles = [
      `<span class="pastille">${bi("Légalisation : ", "التعريف بالإمضاء: ")}${bi(OUI[L.legalisation][0], OUI[L.legalisation][1])}</span>`,
      d.contrat ? `<span class="pastille">${bi("Enregistrement : oui", "التسجيل: نعم")}</span>` : `<span class="pastille">${bi("PDF gratuit", "PDF مجاني")}</span>`];
    let s = tete({ titre, desc, chemin: d.slug + "/", racine, scripts: d.contrat ? ["page.js"] : ["documents.js", "page.js", "modele.js"], jsonld: [faq, fil] });
    s += corpsDebut(d.contrat ? ` data-contrat="${d.slug}"` : ` data-doc="${d.slug}"`) + "\n";
    s += hero({ photo: k.photo, racine, fil: `<a href="../">${bi("Accueil", "الرئيسية")}</a> › ${bi(k.fr, k.ar)}`,
      h1: d.contrat ? bi(d.titre.fr, d.titre.ar) : bi(`Modèle ${elision(d.titre.fr)}`, `نموذج ${d.titre.ar}`),
      intro: bi(d.court.fr, d.court.ar), pastilles });
    s += `\n<main class="wrap chevauche">
<section class="carte" id="bref">
  ${h2("info", "En bref", "باختصار")}
  <p class="bref">${bi(d.bref.fr, d.bref.ar)}</p>
  <div class="faits">
    ${fait("municipalite", "Légalisation", "التعريف بالإمضاء", oui(L.legalisation))}
    ${fait("recette", "Enregistrement", "التسجيل", oui(L.enregistrement))}
    ${fait("liste", "Coût", "الكلفة", bi(L.cout.fr, L.cout.ar))}
    ${fait("horloge", "Délai", "الأجل", bi(L.delai.fr, L.delai.ar))}
  </div>
  ${L.legalisation !== "non" ? `<p class="note">${bi(LEG_SUPPR.fr, LEG_SUPPR.ar)}</p>` : ""}
</section>\n`;
    if (d.contrat) {
      const utiles = DOCS.filter(x => x.cat === d.cat);
      s += `<section class="carte contrat-bientot" id="modele-a-venir">
  ${h2("cadenas", "Modèle de contrat : bientôt", "نموذج العقد: قريبا")}
  <p>${bi("Modèle disponible après relecture par un avocat. Un contrat de ce type engage beaucoup : en attendant, faites rédiger ou relire votre contrat par un avocat.",
           "النموذج متوفر بعد مراجعته من قبل محام. هذا النوع من العقود التزام هام: في الأثناء، اطلب من محام تحرير عقدك أو مراجعته.")}</p>
  ${utiles.length ? `<p>${bi("Documents utiles déjà disponibles :", "وثائق مفيدة متوفرة الآن:")}</p><ul class="liste">${utiles.map(x => `<li><a href="../${x.slug}/">${bi(x.titre.fr, x.titre.ar)}</a></li>`).join("")}</ul>` : ""}
</section>\n`;
    } else {
      s += `<section class="carte" id="remplir">
  ${h2("remplir", "Remplir le modèle", "تعمير النموذج")}
  <p class="conseil">${bi("Langue du document :", "لغة الوثيقة:")}</p>
  <div class="choix" id="langue-doc" data-nom="langue-doc"><button type="button" data-v="fr">Français</button><button type="button" data-v="ar">العربية</button><button type="button" data-v="deux">${bi("Les deux", "الاثنتان")}</button></div>
  <p class="conseil">${bi("Pour un document en arabe, écrivez les noms et adresses en arabe. Rien n'est envoyé : tout reste dans votre téléphone.", "لوثيقة بالعربية، اكتب الأسماء والعناوين بالعربية. لا يُرسل أي شيء: كل شيء يبقى في هاتفك.")}</p>
  <form id="formulaire" novalidate autocomplete="off"></form>
  <noscript><p>${bi("Activez JavaScript pour remplir le modèle.", "فعّل JavaScript لتعمير النموذج.")}</p></noscript>
  <p class="erreurs" id="erreurs" role="alert" hidden></p>
  <button class="bouton" type="button" id="telecharger">${svg(ICONES.pdf)}${bi("Télécharger le PDF", "تحميل ملف PDF")}</button>
  <p class="aide-pdf">${bi("Dans la fenêtre qui s'ouvre, choisissez « Enregistrer au format PDF ».", "في النافذة التي تظهر، اختر « حفظ بصيغة PDF ».")}</p>
</section>
<section class="carte" id="apercu-carte">
  ${h2("liste", "Aperçu du document", "معاينة الوثيقة")}
  <div class="apercu protege" id="apercu" aria-live="polite"></div>
</section>
<p class="avert">${bi("Modèle indicatif — ce site n'est pas officiel et ne remplace pas un avocat. Relisez le document avant de le signer.", "نموذج استرشادي — هذا الموقع ليس رسميا ولا يعوض المحامي. أعد قراءة الوثيقة قبل إمضائها.")}</p>\n`;
    }
    s += `<section class="carte protege" id="etapes">
  ${h2("liste", "Les étapes", "المراحل")}
  <ol class="schema">${d.etapes.map(e => `<li><span class="ic">${svg(ICONES[e.ic])}</span><div><h3>${bi(e.fr[0], e.ar[0])}</h3><p>${bi(e.fr[1], e.ar[1])}</p></div></li>`).join("")}</ol>
</section>
<div class="deux-col">
<section class="carte protege" id="pieces">${h2("garder", "Pièces à fournir", "الوثائق المطلوبة")}${listeBi(d.pieces)}</section>
<section class="carte protege" id="ou">${h2("lieu", "Où aller", "إلى أين تتوجه")}${listeBi(d.ou)}</section>
</div>
${d.pieges && d.pieges.fr.length ? `<section class="carte protege" id="pieges">${h2("alerte", "Pièges à éviter", "أخطاء يجب تجنبها")}${listeBi(d.pieges)}</section>` : ""}
${d.averifier.fr.length ? `<section class="carte averifier" id="a-verifier">${h2("verifier", "À vérifier", "يُتثبت منه")}<p class="note"><span class="etiquette">${bi("À vérifier", "يُتثبت منه")}</span> ${bi("Ces points n'ont pas encore été confirmés par un texte officiel : renseignez-vous sur place avant d'agir.", "هذه النقاط لم يتم تأكيدها بعد بنص رسمي: استفسر بعين المكان قبل القيام بأي إجراء.")}</p>${listeBi(d.averifier)}</section>` : ""}
<section class="carte" id="faq">
  ${h2("question", "Questions fréquentes", "أسئلة متكررة")}
  ${d.faq.map(q => `<details data-l="fr"><summary>${esc(q.fr[0])}</summary><p>${esc(q.fr[1])}</p></details><details data-l="ar"><summary>${esc(isoler(q.ar[0]))}</summary><p>${esc(isoler(q.ar[1]))}</p></details>`).join("\n  ")}
</section>
<section class="carte" id="sources">
  ${h2("livre", "Sources officielles", "المصادر الرسمية")}
  ${sourcesHTML(d.sources)}
  <p class="note">${bi("Vérifié le", "تم التثبت في")} <span data-maj>${MAJ}</span>. ${bi("Ce site n'est pas officiel. Les textes de loi font foi.", "هذا الموقع ليس رسميا. النصوص القانونية هي المرجع.")}</p>
</section>
<p><a class="partage" id="partage" href="https://wa.me/" rel="noopener noreferrer" target="_blank" data-fr="${esc(d.titre.fr + " : modèle gratuit et étapes")}" data-ar="${esc(d.titre.ar + ": نموذج مجاني والمراحل")}">${WHATSAPP}${bi("Partager sur WhatsApp", "مشاركة عبر واتساب")}</a></p>
<h2 class="titre-section">${bi("Dans la même catégorie", "في نفس الصنف")}</h2>
<div class="docs">${tous.filter(x => x.cat === d.cat && x.slug !== d.slug).map(x => carteDoc(x, "../")).join("")}</div>
</main>
${pied}`;
    out[d.slug + "/index.html"] = s;
  }

  function carteDoc(x, racine) {
    const k = cat(x.cat);
    return `<a class="carte doc" href="${racine}${x.slug}/" data-cat="${x.cat}" data-cherche="${esc([x.titre.fr, x.titre.ar, x.court.fr, x.court.ar, k.fr, k.ar].join(" "))}"><span class="ic">${svg(k.svg)}</span><span><h3>${bi(x.titre.fr, x.titre.ar)}</h3><p>${bi(x.court.fr, x.court.ar)}</p></span></a>`;
  }

  /* ---------------- accueil ---------------- */
  {
    const faq = { "@context": "https://schema.org", "@type": "WebSite", name: "Documents Tunisie", url: URL, inLanguage: ["fr", "ar"] };
    let s = tete({ titre: "Documents Tunisie — modèles gratuits à remplir (PDF, français et arabe) – نماذج وثائق تونسية",
      desc: "Modèles tunisiens gratuits à remplir sur téléphone : procuration, attestation de travail, demande de congé, autorisation de voyage… PDF en français et en arabe, avec les étapes officielles. نماذج مجانية بالعربية.",
      chemin: "", racine: "", scripts: ["page.js"], jsonld: [faq] });
    s += corpsDebut() + "\n";
    s += hero({ photo: "accueil", racine: "", h1: bi("Modèles de documents tunisiens, gratuits, à remplir sur téléphone", "نماذج وثائق تونسية مجانية، تُعمّر من الهاتف"),
      intro: bi("Remplissez, téléchargez le PDF en français ou en arabe, puis suivez les étapes officielles : municipalité, recette des finances, ATTT…",
                "عمّر النموذج، حمّل ملف PDF بالعربية أو بالفرنسية، ثم اتبع المراحل الرسمية: البلدية، القباضة المالية، الوكالة الفنية للنقل البري…") });
    s += `\n<main class="wrap chevauche">
<div class="recherche">${svg(ICONES.loupe)}<input type="search" id="recherche" aria-label="Rechercher un document" autocomplete="off"></div>
<div class="confiance">
  <div class="badge-c">${svg(ICONES.bouclier)}${bi("Gratuit, sans inscription", "مجاني، دون تسجيل")}</div>
  <div class="badge-c">${svg(ICONES.cadenas)}${bi("Vos données restent sur votre téléphone", "معطياتك تبقى في هاتفك")}</div>
  <div class="badge-c">${svg(ICONES.langues)}${bi("Français et arabe", "بالعربية والفرنسية")}</div>
</div>
<div class="cats">${CATEGORIES.map(k => `<button type="button" class="cat" data-cat="${k.id}">${svg(k.svg)}${bi(k.fr, k.ar)}</button>`).join("")}</div>
<p class="vide-recherche" id="aucun" hidden>${bi("Aucun document trouvé. Essayez un autre mot.", "لم يتم العثور على أي وثيقة. جرّب كلمة أخرى.")}</p>
<section class="bloc-docs"><h2 class="titre-section">${bi("Les documents les plus demandés", "الوثائق الأكثر طلبا")}</h2>
<div class="docs">${[...DOCS].sort((a, b) => a.rang - b.rang).map(x => carteDoc(x, "")).join("")}</div></section>
<section class="bloc-docs"><h2 class="titre-section">${bi("Les grands contrats : toutes les étapes", "العقود الكبرى: كل المراحل")}</h2>
<p class="conseil">${bi("Étapes, pièces et frais tout de suite ; modèle à remplir après relecture par un avocat.", "المراحل والوثائق والمعاليم الآن؛ النموذج بعد مراجعته من قبل محام.")}</p>
<div class="docs">${CONTRATS.map(x => carteDoc(x, "")).join("")}</div></section>
<section class="carte" id="comment">
  ${h2("info", "Comment ça marche ?", "كيف يعمل الموقع؟")}
  <div class="comment">
    <div><span class="ic">${svg(ICONES.remplir)}</span>${bi("1. Remplissez le formulaire", "1. عمّر الاستمارة")}</div>
    <div><span class="ic">${svg(ICONES.pdf)}</span>${bi("2. Téléchargez le PDF", "2. حمّل ملف PDF")}</div>
    <div><span class="ic">${svg(ICONES.municipalite)}</span>${bi("3. Suivez les étapes", "3. اتبع المراحل")}</div>
  </div>
</section>
<section class="carte" id="confiance">
  ${h2("bouclier", "Pourquoi nous faire confiance ?", "لماذا تثق بنا؟")}
  <ul class="sources" data-l="fr"><li>Les étapes viennent des <b>sources officielles</b> (ministères, ATTT, CNSS…), citées sur chaque page.</li><li>Ce qui n'est pas encore confirmé est marqué <b>« à vérifier »</b>, jamais inventé.</li><li>Le PDF est fabriqué <b>dans votre téléphone</b> : rien n'est envoyé ni enregistré.</li></ul>
  <ul class="sources" data-l="ar"><li>المراحل مأخوذة من <b>المصادر الرسمية</b> (الوزارات، الوكالة الفنية للنقل البري، الضمان الاجتماعي…)، ومذكورة في كل صفحة.</li><li>ما لم يتم تأكيده بعد يحمل عبارة <b>« يُتثبت منه »</b>، ولا نخترع أي معلومة.</li><li>يُصنع ملف ⁨PDF⁩ <b>في هاتفك</b>: لا يُرسل ولا يُحفظ أي شيء.</li></ul>
  <p class="note"><a href="a-propos/">${bi("Notre méthode, nos sources et nos limites →", "← منهجيتنا ومصادرنا وحدودنا")}</a></p>
</section>
<p class="avert">${bi("Site non officiel : les modèles sont indicatifs et ne remplacent pas un avocat.", "موقع غير رسمي: النماذج استرشادية ولا تعوض المحامي.")}</p>
</main>
${pied}`;
    out["index.html"] = s;
  }

  /* ---------------- à propos ---------------- */
  {
    let s = tete({ titre: "À propos et méthode — Documents Tunisie", desc: "Comment sont faits les modèles de Documents Tunisie : sources officielles, vérification, limites, données personnelles, crédits photos.",
      chemin: "a-propos/", racine: "../", scripts: ["page.js"], jsonld: [] });
    s += corpsDebut() + "\n";
    s += hero({ photo: "administration", racine: "../", fil: `<a href="../">${bi("Accueil", "الرئيسية")}</a>`, h1: bi("À propos et méthode", "من نحن والمنهجية"),
      intro: bi("Ce que fait ce site, d'où viennent les informations et ce qu'il ne fait pas.", "ما يقدمه هذا الموقع، ومن أين تأتي المعلومات، وما لا يقوم به.") });
    s += `\n<main class="wrap chevauche">
<section class="carte">${h2("info", "Ce que fait ce site", "ما يقدمه الموقع")}
  <p data-l="fr">Documents Tunisie propose des <b>modèles gratuits</b> de documents courants (procurations, attestations, demandes, reçus…) à remplir sur téléphone, en <b>français et en arabe</b>, et explique <b>les étapes</b> après la signature : légalisation, enregistrement, administration à contacter, pièces à apporter.</p>
  <p data-l="ar">يقدم موقع وثائق تونس <b>نماذج مجانية</b> لوثائق متداولة (توكيلات، شهائد، مطالب، وصولات…) تُعمّر من الهاتف، <b>بالعربية والفرنسية</b>، ويشرح <b>المراحل</b> بعد الإمضاء: التعريف بالإمضاء، التسجيل، الإدارة المعنية، الوثائق المطلوبة.</p>
</section>
<section class="carte">${h2("livre", "Méthode et sources officielles", "المنهجية والمصادر الرسمية")}
  <p data-l="fr">Les textes des modèles sont <b>écrits par nous</b> à partir des textes de loi et des sites officiels ; ils ne sont copiés d'aucun autre site. Chaque page cite ses sources et sa date de vérification (<span data-maj>${MAJ}</span>). Un robot vérifie chaque mois que ces sources répondent toujours.</p>
  <p data-l="ar">نصوص النماذج <b>من تحريرنا</b> انطلاقا من النصوص القانونية والمواقع الرسمية، ولم تُنقل من أي موقع آخر. كل صفحة تذكر مصادرها وتاريخ التثبت (<span data-maj>${MAJ}</span>). يتثبت روبوت كل شهر من أن هذه المصادر لا تزال متاحة.</p>
  ${sourcesHTML(Object.keys(SOURCES))}
</section>
<section class="carte averifier">${h2("alerte", "Limites", "الحدود")}
  <ul class="liste" data-l="fr"><li>Ce site <b>n'est pas officiel</b> et ne remplace pas un avocat, un notaire ou l'administration.</li><li>Les montants et délais non confirmés sont marqués <b>« à vérifier »</b>.</li><li>Les contrats importants (vente de véhicule, location, bail commercial) n'auront de modèle qu'<b>après relecture par un avocat</b>.</li><li>Les documents délivrés par l'administration (certificat de résidence, non gage…) ne sont pas des modèles : demandez-les à l'administration.</li></ul>
  <ul class="liste" data-l="ar"><li>هذا الموقع <b>ليس رسميا</b> ولا يعوض المحامي أو عدل الإشهاد أو الإدارة.</li><li>المبالغ والآجال غير المؤكدة تحمل عبارة <b>« يُتثبت منه »</b>.</li><li>العقود الهامة (بيع عربة، كراء، كراء تجاري) لن يكون لها نموذج إلا <b>بعد مراجعتها من قبل محام</b>.</li><li>الوثائق التي تسلمها الإدارة (شهادة الإقامة، عدم الرهن…) ليست نماذج: اطلبها من الإدارة.</li></ul>
</section>
<section class="carte">${h2("cadenas", "Vos données personnelles", "معطياتك الشخصية")}
  <p data-l="fr">Ce que vous écrivez dans les formulaires <b>reste dans votre téléphone</b> : le document et le PDF sont fabriqués par votre navigateur. Rien n'est envoyé, rien n'est enregistré, il n'y a pas de compte. Seul votre choix de langue est gardé dans votre navigateur.</p>
  <p data-l="ar">ما تكتبه في الاستمارات <b>يبقى في هاتفك</b>: الوثيقة وملف ⁨PDF⁩ يصنعهما متصفحك. لا يُرسل أي شيء ولا يُحفظ، ولا يوجد حساب. فقط اختيارك للغة يُحفظ في متصفحك.</p>
</section>
<section class="carte" id="credits">${h2("info", "Crédits photos", "مصادر الصور")}
  <ul class="sources">${Object.values(CREDITS).map(c => `<li>${esc(c.titre)} — ${esc(c.auteur)}, <a href="${esc(c.licence_url || c.source)}" rel="noopener noreferrer" target="_blank">${esc(c.licence)}</a>, <a href="${esc(c.source)}" rel="noopener noreferrer" target="_blank">Wikimedia Commons</a> (${bi("recadrée et compressée", "مقصوصة ومضغوطة")})</li>`).join("")}</ul>
  <p class="note">${bi("Icônes et logo : dessins originaux de Documents Tunisie.", "الأيقونات والشعار: رسوم أصلية لموقع وثائق تونس.")}</p>
</section>
<section class="carte">${h2("bouclier", "Droits", "الحقوق")}
  <p>${bi("© 2026 Documents Tunisie — tous droits réservés. Les textes, modèles et la présentation de ce site ne peuvent être copiés sans autorisation. Les noms et marques cités appartiennent à leurs propriétaires.", "© 2026 وثائق تونس — جميع الحقوق محفوظة. لا يجوز نسخ نصوص الموقع ونماذجه وتصميمه دون ترخيص. الأسماء والعلامات المذكورة على ملك أصحابها.")}</p>
</section>
</main>
${pied}`;
    out["a-propos/index.html"] = s;
  }

  /* ---------------- plan du site ---------------- */
  const urls = ["", ...DOCS.map(d => d.slug + "/"), ...CONTRATS.map(d => d.slug + "/"), "a-propos/"];
  const [j, m, a] = MAJ.split("/");
  out["sitemap.xml"] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${URL}${u}</loc><lastmod>${a}-${m}-${j}</lastmod></url>`).join("\n")}
</urlset>
`;
  return out;
}

// lancé directement : écrit les fichiers
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const p = pages(root);
  for (const [f, s] of Object.entries(p)) { mkdirSync(dirname(join(root, f)), { recursive: true }); writeFileSync(join(root, f), s); }
  console.log(Object.keys(p).length + " fichiers écrits");
}

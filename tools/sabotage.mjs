// Preuve que le test attrape les erreurs : on abîme volontairement une COPIE du site, une erreur à la fois,
// et le test doit échouer à chaque fois.   node tools/sabotage.mjs
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const ici = dirname(fileURLToPath(import.meta.url)), site = join(ici, "..");
const changer = (dossier, f, de, vers) => {
  const p = join(dossier, f), s = readFileSync(p, "utf8");
  if (!s.includes(de)) throw new Error(`sabotage impossible : « ${de} » absent de ${f}`);
  writeFileSync(p, s.replace(de, vers));
};
const SABOTAGES = [
  ["modèle arabe qui oublie le nom du mandataire", d => changer(d, "assets/documents.js", "<p>أوكل بمقتضى هذا ${idAR(v, \"d_\")}،</p>", "<p>أوكل بمقتضى هذا،</p>")],
  ["faute de frappe dans un champ (le document affiche « undefined »)", d => changer(d, "assets/documents.js", "N° d'immatriculation : ${v(\"immat\")}", "N° d'immatriculation : ${v.immat}")],
  ["montant en lettres faux (80 = « quatre-vingt »)", d => changer(d, "assets/modele.js", 'u === 0 ? "quatre-vingts"', 'u === 0 ? "quatre-vingt"')],
  ["bail commercial : loyer en lettres cassé (le contrat afficherait une erreur)", d => changer(d, "assets/documents.js", 'À la signature, le locataire remet au bailleur', 'À la signature, le locataire remet au bailleur ${v.lettre("x")}')],
  ["étape sans traduction arabe", d => changer(d, "assets/documents.js", 'ar: ["الاحتفاظ بالأصل داخل العربة", "مع البطاقة الرمادية وشهادة التأمين. احتفظ بنسخة في منزلك."]', 'ar: ["Garder l\'original"]')],
  ["source non officielle ajoutée", d => changer(d, "assets/documents.js", 'url: "https://www.intt.tn/"', 'url: "https://www.exemple.com/"')],
  ["nom d'un concurrent dans le README", d => changer(d, "README.md", "# Documents Tunisie", "# Documents Tunisie (inspiré de " + [..."nt.ecitsujolla"].reverse().join("") + ")")],  // nom écrit à l'envers : jamais en clair dans ce dépôt
  ["robots.txt qui laisse passer GPTBot", d => changer(d, "robots.txt", "User-agent: GPTBot\n", "")],
  ["robots.txt qui bloque Google", d => changer(d, "robots.txt", "User-agent: Googlebot\nAllow: /", "User-agent: Googlebot\nDisallow: /")],
  ["meta noai retirée d'une page", d => changer(d, "tools/generer.mjs", '<meta name="robots" content="noai, noimageai">', "")],
  ["script en ligne ajouté (interdit par la CSP)", d => changer(d, "tools/generer.mjs", "</head>`;", "<script>alert(1)</script></head>`;")],
  ["anti-copie retiré", d => changer(d, "assets/page.js", 'document.addEventListener("copy"', 'document.addEventListener("copie"')],
  ["page non régénérée après une modification des données", d => changer(d, "assets/documents.js", "Autoriser une autre personne à conduire votre voiture.", "Autoriser quelqu'un à conduire votre voiture.")],
  ["crédit photo retiré d'une page", d => changer(d, "tools/generer.mjs", '<p class="credit-photo" dir="ltr">', '<p class="x">')],
  ["mention du site ajoutée en bas du PDF", d => changer(d, "assets/modele.js", "${doc[L](lecteur(doc, val, L))}</article>", "${doc[L](lecteur(doc, val, L))}<p>Documents Tunisie (documents.clicvia.com)</p></article>")],
  ["lien de l'annuaire des avocats ajouté dans le PDF", d => changer(d, "assets/modele.js", "${doc[L](lecteur(doc, val, L))}</article>", "${doc[L](lecteur(doc, val, L))}<p>https://avocats.clicvia.com/</p></article>")],
  ["encart de l'annuaire des avocats retiré des pages", d => changer(d, "tools/generer.mjs", "s += encartAnnuaire(d);", "")],
  ["prêt d'honneur : avertissement « modèle indicatif, dépôt en ligne seulement » retiré", d => changer(d, "assets/documents.js", "  attention: { fr:", "  attention0: { fr:")],
  ["prêt d'honneur : mots-clés de recherche (قرض الشرف, pret d'honneur…) oubliés", d => changer(d, "tools/generer.mjs", "x.motscles ? x.motscles.fr", "x.motscles0 ? x.motscles.fr")],
  ["clé secrète oubliée dans le code", d => changer(d, "assets/page.js", 'const SITE =', 'const api_key = "AIzaSyD-1234567890abcdefghijklmnopqrstu";\nconst SITE =')],
  ["exemple (spécimen) remis sur les pages de modèle", d => changer(d, "tools/generer.mjs", '<section class="carte" id="remplir">', '<section class="carte" id="exemple"></section>\n<section class="carte" id="remplir">')],
  ["exemple vidé (plus de données d'exemple, que des « ……… »)", d => changer(d, "assets/modele.js", "function feuilleExemple(doc, L) { return feuille(doc, valeursExemple(doc, L), L); }", "function feuilleExemple(doc, L) { return feuille(doc, {}, L); }")],
  ["étiquette « EXEMPLE » ajoutée dans le PDF", d => changer(d, "assets/modele.js", '<article class="feuille" lang="${L}"', '<article class="feuille" lang="${L}" data-x="EXEMPLE"')],
  ["règle [hidden] retirée (les éléments cachés par le JS restent visibles)", d => changer(d, "assets/style.css", "[hidden]{display:none!important}", "")],
  ["carte avec icône sans lien remise sur l'accueil (faux bouton)", d => changer(d, "tools/generer.mjs", '<div class="cats">', '<div class="x">${svg(ICONES.bouclier)}Gratuit</div><div class="cats">')],
  ["formulaire qui lance le PDF même vide", d => changer(d, "assets/modele.js", "if (err.length) {", "if (false) {")],
  // Pass Journée (06/10/2026)
  ["Pass Journée : 2e PDF du même jour autorisé (contrôle retiré)", d => changer(d, "assets/modele.js", 'P.acces(doc.slug) === "bloque"', 'P.acces(doc.slug) === "bloquee"')],
  ["Pass Journée : document gratuit du jour jamais noté (gratuit illimité)", d => changer(d, "assets/pass.js", "localStorage.setItem(PASS.cleGratuit,", "localStorage.setItem(\"autre-cle\",")],
  ["Pass Journée : heure de fin non contrôlée (code expiré accepté)", d => changer(d, "assets/pass.js", "const encore = iso => Date.parse(iso) > Date.now();", "const encore = iso => Date.parse(iso) > 0;")],
  ["Pass Journée : le Pass consomme aussi le document gratuit du jour", d => changer(d, "assets/pass.js", 'if (accesPdf(slug) !== "gratuit") return;', "")],
  ["Pass Journée : écran de blocage non compté dans les statistiques", d => changer(d, "assets/pass.js", 'path: "pass-bloque/" + slug', 'path: "blocage/" + slug')],
  ["Pass Journée : bouton mis sur l'accueil (décision d'Ahmed : jamais)", d => changer(d, "tools/generer.mjs", '<section class="carte" id="comment">', '<p><a class="btn-pass" href="pass/">Pass Journée 7 DT</a></p>\n<section class="carte" id="comment">')],
  ["Pass Journée : nom du client publié dans pass.json (dépôt public)", d => changer(d, "donnees/pass.json", '"codes": []', '"codes": [{"h": "' + "a".repeat(64) + '", "fin": "2026-10-07T10:00:00Z", "nom": "Client"}]')],
  ["Pass Journée : conditions qui annoncent des prix TTC", d => changer(d, "tools/generer.mjs", '"7 DT pour 24 heures, en dinars tunisiens.', '"7 DT TTC pour 24 heures, en dinars tunisiens.')],
  ["Pass Journée : mention du Pass ajoutée dans le PDF", d => changer(d, "assets/modele.js", "${doc[L](lecteur(doc, val, L))}</article>", "${doc[L](lecteur(doc, val, L))}<p>Pass Journée</p></article>")],
  // lien vers l'annuaire Avocats et notaires (06/10/2026)
  ["bouton « Avocats et notaires » retiré de la rangée des catégories de l'accueil", d => changer(d, "tools/generer.mjs", "${LIEN_AVOCATS}</div>", "</div>")],
  // une adresse par langue (21/11/2026, tools/langues.mjs)
  ["une adresse par langue : lien hreflang vers la page française retiré", d => changer(d, "tools/langues.mjs", '<link rel="alternate" hreflang="fr" href="${URL_SITE}fr/${chemin}">\\n', "")],
  ["une adresse par langue : x-default vers la page française au lieu de l'arabe", d => changer(d, "tools/langues.mjs", 'hreflang="x-default" href="${URL_SITE}${chemin}"', 'hreflang="x-default" href="${URL_SITE}fr/${chemin}"')],
  ["une adresse par langue : la page arabe (adresse principale) garde le texte français", d => changer(d, "tools/langues.mjs", 'let ar = retirerLangue(page, "fr");', "let ar = page;")],
  ["une adresse par langue : le bouton de langue ne change plus d'adresse", d => changer(d, "assets/page.js", 'FIXE ? aller(FIXE === "ar" ? "fr" : "ar") : appliquer', "appliquer")],
  ["une adresse par langue : pages françaises (fr/) absentes du plan du site", d => changer(d, "tools/generer.mjs", 'pages_.flatMap(u => [u, "fr/" + u])', "pages_")],
  ["une adresse par langue : anciennes adresses ar/ qui ne renvoient plus vers l'adresse principale", d => changer(d, "tools/langues.mjs", '<meta http-equiv="refresh" content="0; url=${vers}">', "")],
  ["une adresse par langue : renvoi ar/ indexable", d => changer(d, "tools/langues.mjs", '<meta name="robots" content="noindex, follow">', "")],
  // parcours commun des Pass (25/11/2026, règle § 70) : code de commande créé au formulaire
  ["Pass : code de commande non envoyé à Formspree", d => changer(d, "assets/pass.js", 'donnees.set("code", joliCode(commande.code));', "")],
  ["Pass : ligne « pour_activer » sans le code", d => changer(d, "assets/pass.js", '" ; code: " + joliCode(commande.code) + " ; email: "', '" ; email: "')],
  ["Pass : code de commande au mauvais format (chiffres 0-9)", d => changer(d, "assets/pass.js", "PASS.alphabet[b % PASS.alphabet.length]", '"0123456789"[b % 10]')],
  ["Pass : motif du paiement remis à « nom et téléphone »", d => changer(d, "tools/generer.mjs", '${bi("votre code de commande", "رقم طلبك")}</strong>', '${bi("votre nom et votre téléphone", "اسمك ورقم هاتفك")}</strong>')],
  ["Pass : motif qui ne reprend pas le code de la commande", d => changer(d, "assets/pass.js", 'x.textContent = joliCode(c.code); x.setAttribute("dir", "ltr");\n  });', '});')],
  ["Pass : message WhatsApp sans le code", d => changer(d, "assets/pass.js", '"Voici ma preuve de paiement — Documents Tunisie — code " + joliCode(c.code) + n + " — "', '"Voici ma preuve de paiement — Documents Tunisie — "')],
  ["Pass : phrase « numéro de commande… motif du paiement » retirée", d => changer(d, "tools/generer.mjs", "C'est votre numéro de commande : écrivez-le dans le motif du paiement, il nous sert à reconnaître votre paiement.", "Votre code.")],
  ["Pass : « Vous le recevez aussi par e-mail » affichée alors que l'e-mail automatique n'existe pas", d => changer(d, "assets/pass.js", "const EMAIL_AUTO = false;", "const EMAIL_AUTO = true;")],
  ["Pass : phrase de l'e-mail jamais montrée même avec EMAIL_AUTO = true", d => changer(d, "assets/pass.js", "x.hidden = !EMAIL_AUTO;", "x.hidden = true;")],
  ["Pass : message WhatsApp sans le nom du client", d => changer(d, "assets/pass.js", 'const n = nom ? " — " + nom : "";', 'const n = "";')],
  ["Pass : nom du client gardé dans « pass-commande »", d => changer(d, "assets/pass.js", "      ecrireCommande(commande);\n", "      ecrireCommande(commande); try { localStorage.setItem(PASS.cleCommande, JSON.stringify({ ...commande, nom: val(\"nom\") })); } catch (e) {}\n")],
  ["Pass : étiquette de l'e-mail qui promet l'envoi du code (EMAIL_AUTO = false)", d => changer(d, "tools/generer.mjs", '<span class="email-promesse" hidden>', '<span class="email-promesse">')],
  ["Pass : erreur « e-mail vide » qui promet l'envoi du code (EMAIL_AUTO = false)", d => changer(d, "assets/pass.js", 'else dire("err", "Indiquez votre e-mail.", "اكتب بريدك الإلكتروني.");', 'else dire("err", "Indiquez votre e-mail : vous y recevez votre code et les étapes du paiement.", "اكتب بريدك الإلكتروني: يصلك عليه رمزك وخطوات الدفع.");')],
  ["Pass : phrase de l'e-mail sans la protection « cachée par défaut »", d => changer(d, "tools/generer.mjs", '<span class="email-auto" hidden>', '<span class="email-auto">')],
  ["Pass : filet de sécurité (code oublié dans le motif) retiré", d => changer(d, "tools/generer.mjs", "Ce n'est pas grave : envoyez quand même la preuve sur WhatsApp, nous retrouvons votre demande.", "")],
  ["Pass : commande non gardée sur le téléphone", d => changer(d, "assets/pass.js", "      ecrireCommande(commande);\n", "")],
  ["Pass : téléphone du client gardé dans « pass-commande »", d => { changer(d, "assets/pass.js", "JSON.stringify({ code: c.code, formule: c.formule, date: c.date })", "JSON.stringify(c)"); changer(d, "assets/pass.js", "      ecrireCommande(commande);\n", "      ecrireCommande({ ...commande, telephone: tel });\n"); }],
  ["Pass : le site n'essaie plus le code tout seul au retour", d => changer(d, "assets/pass.js", "const r = await activerCode(c.code);", 'const r = { etat: "inconnu" };')],
  ["Pass : bandeau de la commande en attente jamais affiché", d => changer(d, "assets/pass.js", "  attente.hidden = false;\n", "")],
  ["Pass : code activé mais commande jamais effacée", d => changer(d, "assets/pass.js", "  if (r.etat === \"ok\" || r.etat === \"expire\") {\n    oublierCommande();", "  if (r.etat === \"ok\" || r.etat === \"expire\") {")],
  ["Pass : commande gardée plus de 60 jours", d => changer(d, "assets/pass.js", "if (age <= PASS.joursCommande)", "if (age <= 9999)")],
  ["Pass : « Nouvelle commande » n'efface rien", d => changer(d, "assets/pass.js", "      oublierCommande();\n      const i =", "      const i =")],
  ["Pass : « Comment fonctionne le site ? » sans le code de commande", d => changer(d, "tools/generer.mjs", "le formulaire vous donne tout de suite un <b>code de commande</b>, à écrire dans le motif du paiement D17 ou IZI", "paiement D17 ou IZI")],
  ["lien « Avocats et notaires » retiré de l'en-tête", d => changer(d, "assets/page.js", '<a class="entete-annuaire"', '<a class="x"')],
];
let rates = 0;
for (const [nom, saboter] of SABOTAGES) {
  const copie = mkdtempSync(join(tmpdir(), "sabotage-"));
  cpSync(site, copie, { recursive: true, filter: s => !/node_modules|captures|\.git$/.test(s) });
  try {
    saboter(copie);
    // comme un développeur qui a bien régénéré les pages : l'erreur doit être attrapée par la vérification concernée
    if (!/non régénérée/.test(nom)) spawnSync(process.execPath, [join(copie, "tools", "generer.mjs")], { encoding: "utf8" });
    const r = spawnSync(process.execPath, [join(ici, "test_site.mjs"), copie], { encoding: "utf8", env: { ...process.env, MUET: "1" } });
    const attrape = r.status !== 0;
    if (!attrape) rates++;
    console.log((attrape ? "ATTRAPÉ   " : "RATÉ !!!  ") + nom + (attrape ? "  (" + (r.stdout.match(/^FAIL .*/m) || [""])[0].slice(5, 90) + ")" : ""));
  } catch (e) { rates++; console.log("ERREUR    " + nom + " : " + e.message); }
  rmSync(copie, { recursive: true, force: true });
}
console.log(rates ? `\n${rates} sabotage(s) NON détecté(s)` : `\nLes ${SABOTAGES.length} sabotages ont tous été détectés.`);
process.exit(rates ? 1 : 0);

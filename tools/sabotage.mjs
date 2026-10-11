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
  ["lien de l'annuaire des avocats ajouté dans le PDF", d => changer(d, "assets/modele.js", "${doc[L](lecteur(doc, val, L))}</article>", "${doc[L](lecteur(doc, val, L))}<p>https://ah6259.github.io/avocats-notaires-tunisie/</p></article>")],
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

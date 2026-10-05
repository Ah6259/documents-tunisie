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
  ["contrat de vente de voiture publié sans relecture d'avocat", d => changer(d, "assets/documents.js", 'slug: "vente-voiture", cat: "vehicules", contrat: true,', 'slug: "vente-voiture", cat: "vehicules", contrat: true, fr: v => "", ar: v => "",')],
  ["étape sans traduction arabe", d => changer(d, "assets/documents.js", 'ar: ["الاحتفاظ بالأصل داخل العربة", "مع البطاقة الرمادية وشهادة التأمين. احتفظ بنسخة في منزلك."]', 'ar: ["Garder l\'original"]')],
  ["source non officielle ajoutée", d => changer(d, "assets/documents.js", 'url: "https://www.intt.tn/"', 'url: "https://www.exemple.com/"')],
  ["nom d'un concurrent dans le README", d => changer(d, "README.md", "# Documents Tunisie", "# Documents Tunisie (inspiré d'idaraty.tn)")],
  ["robots.txt qui laisse passer GPTBot", d => changer(d, "robots.txt", "User-agent: GPTBot\n", "")],
  ["robots.txt qui bloque Google", d => changer(d, "robots.txt", "User-agent: Googlebot\nAllow: /", "User-agent: Googlebot\nDisallow: /")],
  ["meta noai retirée d'une page", d => changer(d, "tools/generer.mjs", '<meta name="robots" content="noai, noimageai">', "")],
  ["script en ligne ajouté (interdit par la CSP)", d => changer(d, "tools/generer.mjs", "</head>`;", "<script>alert(1)</script></head>`;")],
  ["anti-copie retiré", d => changer(d, "assets/page.js", 'document.addEventListener("copy"', 'document.addEventListener("copie"')],
  ["page non régénérée après une modification des données", d => changer(d, "assets/documents.js", "Autoriser une autre personne à conduire votre voiture.", "Autoriser quelqu'un à conduire votre voiture.")],
  ["crédit photo retiré d'une page", d => changer(d, "tools/generer.mjs", '<p class="credit-photo" dir="ltr">', '<p class="x">')],
  ["mention du site ajoutée en bas du PDF", d => changer(d, "assets/modele.js", "${doc[L](lecteur(doc, val, L))}</article>", "${doc[L](lecteur(doc, val, L))}<p>Documents Tunisie (ah6259.github.io/documents-tunisie)</p></article>")],
  ["clé secrète oubliée dans le code", d => changer(d, "assets/page.js", 'const SITE =', 'const api_key = "AIzaSyD-1234567890abcdefghijklmnopqrstu";\nconst SITE =')],
  ["formulaire qui lance le PDF même vide", d => changer(d, "assets/modele.js", "if (err.length) {", "if (false) {")],
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

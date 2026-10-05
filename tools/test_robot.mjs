// Scénarios de panne du robot de surveillance (sans Internet) :  node tools/test_robot.mjs
import { verifierUne, verifierTout } from "./surveiller_sources.mjs";

let erreurs = 0;
const check = (d, c) => { console.log((c ? "OK   " : "FAIL ") + d); if (!c) erreurs++; };
const page = "<html>" + "contenu officiel ".repeat(30) + "</html>";
const o = { attente: 0, entre: 0 };

check("site qui répond normalement -> OK", (await verifierUne("u", async () => ({ status: 200, texte: page }), 0)).ok);
let r = await verifierUne("u", async () => ({ status: 404, texte: "introuvable" }), 0);
check("page disparue (404) -> panne signalée", !r.ok && r.raison.includes("404"));
r = await verifierUne("u", async () => { throw new Error("ENOTFOUND"); }, 0);
check("site injoignable -> panne signalée", !r.ok && r.raison.startsWith("injoignable"));
r = await verifierUne("u", async () => ({ status: 200, texte: "  " }), 0);
check("réponse vide -> panne signalée", !r.ok && r.raison.includes("vide"));
r = await verifierUne("u", async () => ({ status: 503, texte: page }), 0);
check("serveur en maintenance (503) -> panne signalée", !r.ok && r.raison.includes("503"));
let n = 0;
r = await verifierUne("u", async () => (++n < 3 ? { status: 503, texte: "" } : { status: 200, texte: page }), 0);
check("panne passagère puis retour au 3e essai -> OK (pas de fausse alerte)", r.ok && n === 3);
n = 0;
await verifierUne("u", async () => { n++; return { status: 500, texte: "" }; }, 0);
check("3 essais au maximum par site", n === 3);
const res = await verifierTout({ a: { fr: "A", url: "a" }, b: { fr: "B", url: "b" } }, async u => (u === "b" ? { status: 410, texte: "" } : { status: 200, texte: page }), o);
check("plusieurs sources : seule la source en panne est listée", res.length === 2 && res[0].ok && !res[1].ok && res[1].nom === "B");

console.log(erreurs ? `\n${erreurs} PROBLÈME(S)` : "\nTOUT PASSE");
process.exit(erreurs ? 1 : 0);

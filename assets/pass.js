/* Pass Journée (partie payante, accord écrit d'Ahmed du 06/10/2026, même logique que le Pass Examen du Code de la route).
   Chargé par les pages de modèle (après modele.js) et par les pages pass/ et pass/conditions/.

   Règle : 1 document PDF gratuit par jour et par appareil (compté sur l'appareil, localStorage dans un try).
   - Le 1er téléchargement du jour est gratuit ; retélécharger LE MÊME modèle le même jour reste permis (correction d'une faute).
   - Un AUTRE modèle le même jour : écran « Vous avez téléchargé votre document gratuit du jour » → Pass Journée 7 DT
     (tous les documents pendant 24 heures) ou « Revenez demain ». Les pages, l'exemple, le formulaire et l'aperçu restent libres.
   - Le PDF ne porte jamais de mention du site (inchangé, voir modele.js).

   Code d'accès (site statique, pas de serveur) :
   - Ahmed active un client depuis l'application GitHub (dépôt PRIVÉ Ah6259/documents-pass, bouton « pass »).
     Le robot publie ici, dans donnees/pass.json, SEULEMENT l'empreinte du code (PBKDF2-SHA-256 salée) et l'heure de fin
     (UTC, 24 heures après l'activation). Aucun nom, aucun téléphone dans ce dépôt public.
   - Le visiteur tape son code UNE fois : le navigateur calcule l'empreinte (crypto.subtle), la cherche dans pass.json,
     vérifie l'heure de fin, puis garde le code sur l'appareil (localStorage, toujours dans try/catch).
   - Revérification au plus une fois par heure (seulement si un code est gardé) : code arrêté ou expiré = effacé ;
     pas de réseau = on garde jusqu'à l'heure de fin connue. Sans code gardé : aucun appel réseau. */
const PASS = {
  prix: 7,                                    // DT
  heures: 24,
  donnees: "donnees/pass.json",
  cle: "dt-pass-v1",                          // code gardé sur l'appareil
  cleGratuit: "dt-gratuit-v1",                // { jour, doc } : document gratuit du jour
  alphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", // sans O/0 ni I/1 (faciles à confondre)
  longueur: 8,
  whatsapp: "21624321390"
};

/* ---- dates ---- */
function jourLocal(d) {
  d = d || new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
// « 07/10/2026 à 14:35 » (heure du téléphone)
function finLisible(iso) {
  const t = Date.parse(iso);
  if (!(t > 0)) return "";
  const d = new Date(t), z = n => String(n).padStart(2, "0");
  const date = z(d.getDate()) + "/" + z(d.getMonth() + 1) + "/" + d.getFullYear(), h = z(d.getHours()) + ":" + z(d.getMinutes());
  return T(date + " à " + h, "⁨" + date + "⁩ على الساعة ⁨" + h + "⁩");
}
const encore = iso => Date.parse(iso) > Date.now();

/* ---- code gardé sur l'appareil ---- */
function normaliserCode(s) { return String(s || "").toUpperCase().replace(/[\s\-_.]/g, ""); }
function formeCodeOk(c) { return c.length === PASS.longueur && [...c].every(x => PASS.alphabet.includes(x)); }
function lirePass() {
  try {
    const p = JSON.parse(localStorage.getItem(PASS.cle) || "null");
    if (p && typeof p.code === "string" && Date.parse(p.fin) > 0) return p;
  } catch (e) {}
  return null;
}
function ecrirePass(p) {
  try { if (p) localStorage.setItem(PASS.cle, JSON.stringify(p)); else localStorage.removeItem(PASS.cle); } catch (e) {}
}
function passActif() { const p = lirePass(); return !!p && encore(p.fin); }

/* ---- 1 document gratuit par jour, compté sur l'appareil ---- */
function lireGratuit() {
  try { const g = JSON.parse(localStorage.getItem(PASS.cleGratuit) || "null"); if (g && g.jour && g.doc) return g; } catch (e) {}
  return null;
}
// "pass" = Pass Journée actif ; "gratuit" = téléchargement permis sans Pass ; "bloque" = document gratuit du jour déjà pris
function accesPdf(slug) {
  if (passActif()) return "pass";
  const g = lireGratuit();
  return !g || g.jour !== jourLocal() || g.doc === slug ? "gratuit" : "bloque";
}
// après un téléchargement : sans Pass, ce modèle devient le document gratuit du jour
function noterPdf(slug) {
  const b = document.getElementById("pass-bloque");
  if (b) b.hidden = true;                     // téléchargement permis (Pass, ou nouveau jour) : l'écran de blocage disparaît
  const lien = document.getElementById("pass-lien");
  if (lien) lien.hidden = passActif();
  if (accesPdf(slug) !== "gratuit") return;
  try { localStorage.setItem(PASS.cleGratuit, JSON.stringify({ jour: jourLocal(), doc: slug })); } catch (e) {}
}

/* ---- vérification d'un code ---- */
async function empreinteCode(code, sel, tours) {
  const enc = new TextEncoder();
  const cle = await crypto.subtle.importKey("raw", enc.encode(code), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode(sel), iterations: tours }, cle, 256);
  return Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2, "0")).join("");
}
async function chargerListePass() {
  const racine = document.documentElement.dataset.racine || "";
  const r = await fetch(racine + PASS.donnees, { cache: "no-store" });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const d = await r.json();
  if (!d || typeof d.sel !== "string" || !Array.isArray(d.codes) || !(d.tours > 0)) throw new Error("liste illisible");
  return d;
}
// résultat : { etat: "ok" | "expire" | "inconnu" | "forme" | "reseau" | "impossible", fin, code }
async function verifierCode(saisie) {
  const code = normaliserCode(saisie);
  if (!formeCodeOk(code)) return { etat: "forme", code };
  if (!(window.crypto && window.crypto.subtle) || typeof fetch !== "function") return { etat: "impossible", code };
  let liste, h;
  try { liste = await chargerListePass(); } catch (e) { return { etat: "reseau", code }; }
  try { h = await empreinteCode(code, liste.sel, liste.tours); } catch (e) { return { etat: "impossible", code }; }
  const trouve = liste.codes.find(c => c && c.h === h);
  if (!trouve) return { etat: "inconnu", code };
  if (!encore(trouve.fin)) return { etat: "expire", fin: trouve.fin, code };
  return { etat: "ok", fin: trouve.fin, code };
}
function annoncerPass() { document.dispatchEvent(new Event("pass")); }
async function activerCode(saisie) {
  const r = await verifierCode(saisie);
  if (r.etat === "ok") { ecrirePass({ code: r.code, fin: r.fin, verifie: Date.now() }); annoncerPass(); }
  return r;
}
// Code déjà gardé : revérifié au plus une fois par heure (code arrêté = effacé)
async function reverifierPass() {
  const p = lirePass();
  if (!p) return;
  if (!encore(p.fin)) { ecrirePass(null); annoncerPass(); return; }
  if (Date.now() - (p.verifie || 0) < 36e5) return;
  const r = await verifierCode(p.code);
  if (r.etat === "ok") ecrirePass({ code: p.code, fin: r.fin, verifie: Date.now() });
  else if (r.etat === "inconnu" || r.etat === "expire" || r.etat === "forme") { ecrirePass(null); annoncerPass(); }
  // "reseau" / "impossible" : on garde le code jusqu'à l'heure de fin connue
}

/* ---- page de modèle : écran de blocage et bouton « Pass Journée » près du téléchargement ---- */
let blocageCompte = false;
function bloquerPdf(slug) {
  const b = document.getElementById("pass-bloque");
  if (!b) return;
  b.hidden = false;
  const lien = document.getElementById("pass-lien");
  if (lien) lien.hidden = true;               // le même bouton est déjà dans l'écran de blocage
  try { b.scrollIntoView({ block: "center" }); b.focus({ preventScroll: true }); } catch (e) {}
  // statistique anonyme : seulement le nom du modèle (pour mesurer la demande), une fois par page ouverte
  if (blocageCompte) return;
  blocageCompte = true;
  try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "pass-bloque/" + slug, title: "Pass Journée : blocage sur " + slug, event: true }); } catch (e) {}
}
function majEtatPass() {
  const actif = passActif(), p = lirePass();
  const lien = document.getElementById("pass-lien"), ok = document.getElementById("pass-actif");
  if (lien) lien.hidden = actif;
  if (ok) {
    ok.hidden = !actif;
    if (actif) ok.textContent = T("Pass Journée actif : tous les documents jusqu'au " + finLisible(p.fin) + ".", "باقة اليوم مفعّلة: كل الوثائق إلى غاية " + finLisible(p.fin) + ".");
  }
  const b = document.getElementById("pass-bloque");
  if (b && actif) b.hidden = true;
  const etat = document.getElementById("pass-etat");
  if (etat) {
    etat.hidden = !actif;
    if (actif) etat.textContent = T("Votre Pass Journée est actif sur ce téléphone jusqu'au " + finLisible(p.fin) + " : tous les documents sont disponibles.", "باقة اليوم مفعّلة على هذا الهاتف إلى غاية " + finLisible(p.fin) + ": كل الوثائق متاحة.");
  }
}

/* ---- page pass/ : formulaire de demande (Formspree) ---- */
function telephoneTn(v) {
  let n = String(v || "").replace(/\D/g, "");
  if (n.length === 11 && n.indexOf("216") === 0) n = n.slice(3);
  return n.length === 8 ? n : "";
}
function brancherFormulairePass() {
  const form = document.getElementById("pass-form");
  if (!form || form.dataset.branche) return;
  form.dataset.branche = "1";
  const statut = document.getElementById("pass-status"), bouton = form.querySelector("button[type=submit]");
  const apres = document.getElementById("apres-pass");
  const dire = (classe, fr, ar) => { statut.className = classe; statut.textContent = T(fr, ar); };
  const champ = n => form.querySelector('[name="' + n + '"]');
  const val = n => { const x = champ(n); return x ? String(x.value || "").trim() : ""; };
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (bouton.disabled) return;
    const tel = telephoneTn(val("telephone"));
    if (!val("nom")) { dire("err", "Indiquez votre nom.", "اكتب اسمك."); champ("nom").focus(); return; }
    if (!tel) { dire("err", "Téléphone : 8 chiffres, par exemple 24 321 390.", "الهاتف: ⁨8⁩ أرقام، مثال ⁨24 321 390⁩."); champ("telephone").focus(); return; }
    if (!champ("conditions").checked) { dire("err", "Cochez « J'accepte les conditions du Pass Journée ».", "يجب الموافقة على شروط باقة اليوم."); return; }
    const fini = () => {
      // message WhatsApp de la preuve de paiement : on ajoute le nom et le téléphone (= motif du paiement)
      document.querySelectorAll("a.btn-wa[data-texte]").forEach(a =>
        a.setAttribute("href", "https://wa.me/" + PASS.whatsapp + "?text=" + encodeURIComponent(a.getAttribute("data-texte") + val("nom") + " — " + tel)));
      form.hidden = true;
      if (apres) { apres.hidden = false; try { apres.scrollIntoView({ block: "start" }); } catch (x) {} }
    };
    if (val("_gotcha")) { fini(); return; }                // champ piège rempli = robot : rien n'est envoyé
    champ("page").value = location.href.split("#")[0];
    const donnees = new FormData(form);
    donnees.set("telephone", tel);
    // ligne prête à recopier dans le bouton GitHub « pass » (dépôt privé documents-pass)
    donnees.set("pour_activer", "action: paye ; nom: " + val("nom") + " ; telephone: " + tel);
    bouton.disabled = true;
    dire("", "Envoi…", "جارٍ الإرسال…");
    fetch(form.getAttribute("action"), { method: "POST", body: donnees, headers: { "Accept": "application/json" } })
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        dire("ok", "Merci ! Votre demande a bien été envoyée.", "شكرًا! تم إرسال طلبك.");
        fini();
      })
      .catch(() => dire("err", "Échec de l'envoi — vérifiez votre connexion et réessayez, ou écrivez-nous sur WhatsApp au 24 321 390.",
        "تعذّر الإرسال — تحقّق من الاتصال وأعد المحاولة، أو راسلنا عبر واتساب على ⁨24 321 390⁩."))
      .then(() => { bouton.disabled = false; });
  });
}

/* ---- « J'ai déjà un code » (page pass/ et écran de blocage des pages de modèle) ---- */
function brancherCodes() {
  document.querySelectorAll("form.code-form").forEach(form => {
    if (form.dataset.branche) return;
    form.dataset.branche = "1";
    const statut = form.querySelector(".code-status"), bouton = form.querySelector("button[type=submit]");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (bouton.disabled) return;
      const champ = form.querySelector("input[name=code]");
      bouton.disabled = true;
      statut.className = "code-status"; statut.textContent = T("Vérification…", "جارٍ التثبت…");
      const r = await activerCode(champ.value);
      bouton.disabled = false;
      const surModele = !!document.getElementById("telecharger");
      const M = {
        ok: ["Code accepté : Pass Journée actif sur ce téléphone jusqu'au " + finLisible(r.fin) + "." + (surModele ? " Appuyez de nouveau sur « Télécharger le PDF »." : ""),
             "تم قبول الرمز: باقة اليوم مفعّلة على هذا الهاتف إلى غاية " + finLisible(r.fin) + "." + (surModele ? " اضغط من جديد على « تحميل ملف PDF »." : "")],
        forme: ["Le code a 8 caractères (lettres et chiffres), par exemple ABCD-EF23.", "الرمز يتكون من ⁨8⁩ حروف وأرقام، مثال ⁨ABCD-EF23⁩."],
        inconnu: ["Code non reconnu. Vérifiez-le ; si vous venez de le recevoir, réessayez dans 10 minutes.", "رمز غير معروف. تثبّت منه؛ إن وصلك للتو، أعد المحاولة بعد ⁨10⁩ دقائق."],
        expire: ["Ce code a expiré le " + finLisible(r.fin) + " (un Pass Journée dure 24 heures).", "انتهت صلاحية هذا الرمز في " + finLisible(r.fin) + " (باقة اليوم صالحة ⁨24⁩ ساعة)."],
        reseau: ["Pas de connexion : vérifiez Internet et réessayez.", "لا يوجد اتصال: تحقّق من الإنترنت وأعد المحاولة."],
        impossible: ["Votre navigateur ne peut pas vérifier le code : mettez-le à jour ou essayez Chrome.", "متصفحك لا يستطيع التثبت من الرمز: حدّثه أو جرّب ⁨Chrome⁩."]
      }[r.etat];
      statut.className = "code-status " + (r.etat === "ok" ? "ok" : "err");
      statut.textContent = T(M[0], M[1]);
      if (r.etat === "ok") {
        champ.value = "";
        // sur une page de modèle, le message reste visible même si l'écran de blocage se ferme
        const info = document.getElementById("pass-actif");
        if (surModele && info) { majEtatPass(); info.textContent = statut.textContent; }
      }
    });
  });
}

window.PassJour = { acces: accesPdf, noter: noterPdf, bloquer: bloquerPdf, actif: passActif, activer: activerCode };
document.addEventListener("pass", majEtatPass);
document.addEventListener("langue", majEtatPass);
document.addEventListener("DOMContentLoaded", () => {
  brancherFormulairePass();
  brancherCodes();
  majEtatPass();
  reverifierPass().catch(() => {});
});

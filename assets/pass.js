/* Pass Journée (partie payante, accord écrit d'Ahmed du 06/10/2026, même logique que le Pass Examen du Code de la route).
   Chargé par les pages de modèle (après modele.js) et par les pages pass/ et pass/conditions/.

   Règle : 1 document PDF gratuit par jour et par appareil (compté sur l'appareil, localStorage dans un try).
   - Le 1er téléchargement du jour est gratuit ; retélécharger LE MÊME modèle le même jour reste permis (correction d'une faute).
   - Un AUTRE modèle le même jour : écran « Vous avez téléchargé votre document gratuit du jour » → Pass Journée 7 DT
     (tous les documents pendant 24 heures) ou « Revenez demain ». Les pages, l'exemple, le formulaire et l'aperçu restent libres.
   - Le PDF ne porte jamais de mention du site (inchangé, voir modele.js).

   Code de commande (25/11/2026, parcours commun des Pass, règle § 70) :
   - Dès que le formulaire de pass/ est valide, le navigateur crée le code (crypto.getRandomValues, MÊME alphabet et MÊME
     longueur que les codes d'accès : 8 caractères) ; il part à Formspree (champ « code » + ligne « pour_activer ») et s'affiche
     en gros (« Dernière étape ») : c'est le motif du paiement et il est dans le message WhatsApp de la preuve.
   - Le téléphone garde la commande (localStorage « pass-commande » = { code, formule, date } : ni nom, ni téléphone, ni e-mail),
     60 jours au plus. En revenant sur pass/ : bandeau « Votre commande en attente » + paiement + WhatsApp, et le site essaie
     le code tout seul (même vérification que « J'ai un code ») : activé = Pass ouvert et commande effacée.
   - Ahmed active CE code avec le bouton « pass » du dépôt privé (case « code » ou ligne « pour_activer » collée).

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
  whatsapp: "21624321390",
  cleCommande: "pass-commande",               // commande en attente : { code, formule, date } seulement
  joursCommande: 60
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
  let codeEnCours = "";                       // même code si l'envoi échoue et que le client réessaie
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (bouton.disabled) return;
    const tel = telephoneTn(val("telephone"));
    if (!val("nom")) { dire("err", "Indiquez votre nom.", "اكتب اسمك."); champ("nom").focus(); return; }
    if (!tel) { dire("err", "Téléphone : 8 chiffres, par exemple 24 321 390.", "الهاتف: ⁨8⁩ أرقام، مثال ⁨24 321 390⁩."); champ("telephone").focus(); return; }
    const email = val("email");
    // la promesse « vous y recevez votre code… » n'est dite que si l'e-mail automatique est en service (EMAIL_AUTO)
    if (!email) { if (EMAIL_AUTO) dire("err", "Indiquez votre e-mail : vous y recevez votre code et les étapes du paiement.", "اكتب بريدك الإلكتروني: يصلك عليه رمزك وخطوات الدفع.");
                  else dire("err", "Indiquez votre e-mail.", "اكتب بريدك الإلكتروني."); if (champ("email")) champ("email").focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { dire("err", "E-mail invalide : vérifiez-le.", "البريد الإلكتروني غير صحيح: تثبّت منه."); champ("email").focus(); return; }
    if (!champ("conditions").checked) { dire("err", "Cochez « J'accepte les conditions du Pass Journée ».", "يجب الموافقة على شروط باقة اليوم."); return; }
    // code de commande créé ICI, au formulaire valide (motif du paiement, message WhatsApp, puis code d'accès)
    if (!codeEnCours) codeEnCours = nouveauCodeCommande();
    const commande = { code: codeEnCours, formule: val("formule") || FORMULE, date: jourLocal() };
    const fini = () => {
      ecrireCommande(commande);
      codeEnCours = "";
      montrerCommande(commande, val("nom"));   // le nom va SEULEMENT dans le message WhatsApp (jamais dans le téléphone)
      form.hidden = true;
      const attente = document.getElementById("commande-attente"), deja = document.getElementById("commande-deja");
      if (attente) attente.hidden = true;     // la « Dernière étape » ci-dessous dit déjà tout
      if (deja) deja.hidden = true;
      if (apres) { apres.hidden = false; try { apres.scrollIntoView({ block: "start" }); } catch (x) {} }
    };
    if (val("_gotcha")) { fini(); return; }                // champ piège rempli = robot : rien n'est envoyé
    champ("page").value = location.href.split("#")[0];
    const donnees = new FormData(form);
    donnees.set("telephone", tel);
    donnees.set("email", email);
    donnees.set("code", joliCode(commande.code));
    // ligne prête à coller dans le bouton GitHub « pass » (dépôt privé documents-pass, case « ligne »)
    donnees.set("pour_activer", "action: paye ; nom: " + val("nom") + " ; telephone: " + tel + " ; code: " + joliCode(commande.code) + " ; email: " + email);
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

/* ---- code de commande (créé au formulaire) et commande en attente gardée sur le téléphone ---- */
const FORMULE = "Pass Journée - 7 DT - 24 heures";
// e-mail automatique (code + étapes du paiement) : PAS ENCORE en service. Tant que c'est false, la phrase
// « Vous le recevez aussi par e-mail » reste cachée (elle serait fausse). Passer à true le jour où l'e-mail part vraiment.
const EMAIL_AUTO = false;
function joliCode(c) { return c.slice(0, 4) + "-" + c.slice(4); }
function nouveauCodeCommande() {
  const t = new Uint8Array(PASS.longueur);
  try { crypto.getRandomValues(t); } catch (e) { for (let k = 0; k < t.length; k++) t[k] = Math.floor(Math.random() * 256); }
  return Array.from(t, b => PASS.alphabet[b % PASS.alphabet.length]).join("");   // 32 caractères : 256 % 32 = 0, aucun biais
}
function lireCommande() {
  try {
    const c = JSON.parse(localStorage.getItem(PASS.cleCommande) || "null");
    if (c && typeof c.code === "string" && formeCodeOk(c.code) && /^\d{4}-\d{2}-\d{2}$/.test(c.date || "")) {
      const age = (Date.now() - Date.parse(c.date + "T00:00:00")) / 864e5;
      if (age <= PASS.joursCommande) return { code: c.code, formule: String(c.formule || FORMULE), date: c.date };
    }
    if (c !== null) localStorage.removeItem(PASS.cleCommande);   // abîmée ou trop vieille (plus de 60 jours)
  } catch (e) { try { localStorage.removeItem(PASS.cleCommande); } catch (x) {} }
  return null;
}
function ecrireCommande(c) {
  try { if (c) localStorage.setItem(PASS.cleCommande, JSON.stringify({ code: c.code, formule: c.formule, date: c.date }));
        else localStorage.removeItem(PASS.cleCommande); } catch (e) {}
}
function formuleLisible(f) { return f === FORMULE ? T("Pass Journée 7 DT (24 heures)", "باقة اليوم ⁨7⁩ د (⁨24⁩ ساعة)") : f; }
// message WhatsApp de la preuve : code + nom (nom tapé dans le formulaire ; au retour sur la page il n'est pas connu :
// la mémoire « pass-commande » ne garde jamais le nom) + formule
function texteWhatsApp(c, nom) {
  const n = nom ? " — " + nom : "";
  return T("Voici ma preuve de paiement — Documents Tunisie — code " + joliCode(c.code) + n + " — " + formuleLisible(c.formule),
           "هذا وصل الدفع — وثائق تونس — الرمز " + joliCode(c.code) + n + " — " + formuleLisible(c.formule));
}
// remplit la page avec le code : grand code, motif du paiement, liens WhatsApp, case « J'ai un code »
function montrerCommande(c, nom) {
  document.querySelectorAll(".code-commande").forEach(x => { x.textContent = joliCode(c.code); x.setAttribute("dir", "ltr"); });
  document.querySelectorAll(".motif-code").forEach(x => {
    if (!x.dataset.origine) x.dataset.origine = x.innerHTML;
    x.textContent = joliCode(c.code); x.setAttribute("dir", "ltr");
  });
  document.querySelectorAll(".motif-aide").forEach(x => { x.hidden = true; });
  document.querySelectorAll(".email-auto").forEach(x => { x.hidden = !EMAIL_AUTO; });
  document.querySelectorAll("a.btn-wa").forEach(a => {
    if (!a.dataset.origine) a.dataset.origine = a.getAttribute("href");
    a.setAttribute("href", "https://wa.me/" + PASS.whatsapp + "?text=" + encodeURIComponent(texteWhatsApp(c, nom)));
  });
  const ligne = document.getElementById("commande-ligne");
  if (ligne) {
    ligne.textContent = T("Votre commande en attente : code ", "طلبك في الانتظار: الرمز ");
    const b = document.createElement("b");
    b.className = "code-commande"; b.dir = "ltr"; b.textContent = joliCode(c.code);
    ligne.appendChild(b);
    ligne.appendChild(document.createTextNode(" — " + formuleLisible(c.formule)));
  }
  document.querySelectorAll("form.code-form input[name=code]").forEach(x => { if (!x.value) x.value = joliCode(c.code); });
}
function oublierCommande() {
  ecrireCommande(null);
  document.querySelectorAll(".motif-code").forEach(x => { if (x.dataset.origine) x.innerHTML = x.dataset.origine; x.removeAttribute("dir"); });
  document.querySelectorAll(".motif-aide").forEach(x => { x.hidden = false; });
  document.querySelectorAll("a.btn-wa").forEach(a => { if (a.dataset.origine) a.setAttribute("href", a.dataset.origine); });
  document.querySelectorAll(".code-commande").forEach(x => { x.textContent = ""; });
  document.querySelectorAll("form.code-form input[name=code]").forEach(x => { x.value = ""; });
  const form = document.getElementById("pass-form");
  ["commande-attente", "apres-pass", "commande-deja"].forEach(id => { const x = document.getElementById(id); if (x) x.hidden = true; });
  if (form) form.hidden = false;
}
// page pass/ : au retour, bandeau de la commande en attente, et le site essaie le code tout seul
async function reprendreCommande() {
  const c = lireCommande();
  if (!c) return;
  const p = lirePass();
  if (p && p.code === c.code && encore(p.fin)) { ecrireCommande(null); return; }   // déjà ouverte sur ce téléphone
  montrerCommande(c);
  const attente = document.getElementById("commande-attente");
  if (!attente) return;                       // pages de modèle : le code est seulement prérempli dans « J'ai déjà un code »
  const form = document.getElementById("pass-form"), deja = document.getElementById("commande-deja"), etat = document.getElementById("commande-etat");
  attente.hidden = false;
  if (form) form.hidden = true;
  if (deja) deja.hidden = false;
  if (etat) etat.textContent = T("Vérification de votre paiement…", "جارٍ التثبت من دفعتك…");
  const r = await activerCode(c.code);       // même vérification que la case « J'ai un code »
  if (r.etat === "ok" || r.etat === "expire") {
    oublierCommande();
    if (r.etat === "ok") {
      const pe = document.getElementById("pass-etat");
      if (pe) { majEtatPass(); pe.textContent = T("Paiement reçu : votre code " + joliCode(c.code) + " est ouvert. ", "وصل الدفع: رمزك " + joliCode(c.code) + " مفعّل. ") + pe.textContent; }
    }
    return;
  }
  if (etat) etat.textContent = r.etat === "reseau"
    ? T("Pas de connexion : impossible de vérifier votre paiement maintenant. Réessayez plus tard.", "لا يوجد اتصال: تعذّر التثبت من دفعتك الآن. أعد المحاولة لاحقًا.")
    : T("En attente de votre paiement : dès qu'il est reçu, votre code s'ouvre et votre Pass Journée démarre (revenez sur cette page).",
        "في انتظار دفعتك: بمجرد وصولها يُفعَّل رمزك وتبدأ باقة اليوم (عد إلى هذه الصفحة).");
}
function brancherNouvelleCommande() {
  document.querySelectorAll("button.nouvelle-commande").forEach(b => {
    if (b.dataset.branche) return;
    b.dataset.branche = "1";
    b.addEventListener("click", () => {
      oublierCommande();
      const i = document.getElementById("inscription");
      try { if (i) i.scrollIntoView({ block: "start" }); } catch (e) {}
    });
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

/* ---- rappel de fin du Pass (demande d'Ahmed, octobre 2026) ----
   Pas de Telegram ni d'e-mail : la page elle-même remercie le client et lui rappelle la fin.
   - Pass valide qui finit bientôt : 7 jours ou moins ; un Pass Journée (24 heures, début connu) : son dernier quart,
     donc les 6 dernières heures -> petit bandeau, au plus une fois par jour.
   - Pass terminé (au plus 30 jours après la fin) -> message « Votre Pass Journée est terminé — merci ! », une seule fois.
   Mémoire sur l'appareil : PASS.cleRappel = { fin, vu (jour du dernier bandeau), finVu (message de fin montré) }. */
PASS.cleRappel = "dt-pass-rappel-v1";
function lireRappel() { try { const r = JSON.parse(localStorage.getItem(PASS.cleRappel) || "null"); return r && typeof r === "object" ? r : {}; } catch (e) { return {}; } }
function ecrireRappel(r) { try { localStorage.setItem(PASS.cleRappel, JSON.stringify(r)); } catch (e) {} }
// note l'heure de fin AVANT la revérification (qui efface un code expiré) : le message de fin reste possible
function noterFinPass() {
  const p = lirePass(), r = lireRappel();
  if (p && p.fin !== r.fin) ecrireRappel({ fin: p.fin, vu: r.vu || "", finVu: false });
}
// { type: "proche" | "fini", fin } ou null
function etatRappel() {
  const r = lireRappel(), maintenant = Date.now();
  if (passActif()) {
    const fin = lirePass().fin, reste = Date.parse(fin) - maintenant, duree = PASS.heures * 36e5;   // début = fin - 24 heures
    const proche = duree < 30 * 864e5 ? reste <= duree / 4 : reste <= 7 * 864e5;
    return proche && r.vu !== jourLocal() ? { type: "proche", fin } : null;
  }
  const t = Date.parse(r.fin);
  if (t > 0 && t <= maintenant && !r.finVu && maintenant - t <= 30 * 864e5) return { type: "fini", fin: r.fin };
  return null;
}
let rappelMontre = null;
function dessinerRappel() {
  const ancien = document.getElementById("rappel-zone");
  if (ancien) ancien.remove();
  const e = rappelMontre, main = document.querySelector("main");
  if (!e || !main) return;
  const site = window.racinePages ? window.racinePages() : (document.documentElement.dataset.racine || "");   // dossier des pages (fr/… en français)
  const b = document.createElement("aside");
  b.className = "rappel-pass" + (e.type === "fini" ? " fini" : "");
  b.id = "rappel-pass";
  b.setAttribute("role", "status");
  b.innerHTML = '<button type="button" class="rappel-fermer" aria-label="' + T("Fermer", "إغلاق") + '">×</button>' +
    (e.type === "proche"
      ? "<p><b>" + T("Merci pour votre inscription !", "شكرًا على اشتراكك!") + "</b> " +
        T("Votre Pass Journée se termine le " + finLisible(e.fin) + ".", "تنتهي باقة اليوم في " + finLisible(e.fin) + ".") + "</p>"
      : "<p><b>" + T("Votre Pass Journée est terminé — merci !", "انتهت باقة اليوم — شكرًا لك!") + "</b> " +
        T("Il a pris fin le " + finLisible(e.fin) + ".", "انتهت في " + finLisible(e.fin) + ".") + "</p>") +
    '<p class="rappel-actions"><a class="btn-pro rappel-renouveler" href="' + site + 'pass/#offre">' + T("Renouveler mon Pass", "جدّد باقتي") + "</a>" +
    '<a class="rappel-avis" href="' + site + '#avis">' + T("Donner mon avis", "أعطِ رأيك") + "</a></p>";
  // tout en haut, sous l'en-tête (avant le grand bandeau de la page) : vu sans faire défiler
  const zone = document.createElement("div");
  zone.className = "wrap rappel-zone";
  zone.id = "rappel-zone";
  zone.appendChild(b);
  b.querySelector(".rappel-fermer").addEventListener("click", () => { rappelMontre = null; zone.remove(); });
  const avant = document.querySelector("body > .hero") || main;
  avant.parentNode.insertBefore(zone, avant);
}
function afficherRappel() {
  const e = etatRappel();
  if (!e) return;
  const r = lireRappel();
  if (e.type === "proche") r.vu = jourLocal(); else r.finVu = true;
  ecrireRappel(r);
  rappelMontre = e;
  dessinerRappel();
}
document.addEventListener("langue", () => { if (rappelMontre) dessinerRappel(); });

window.PassJour = { acces: accesPdf, noter: noterPdf, bloquer: bloquerPdf, actif: passActif, activer: activerCode, commande: lireCommande };
document.addEventListener("pass", majEtatPass);
document.addEventListener("langue", majEtatPass);
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".email-promesse").forEach(x => { x.hidden = !EMAIL_AUTO; });   // étiquette de l'e-mail : promesse seulement si EMAIL_AUTO
  brancherFormulairePass();
  brancherCodes();
  brancherNouvelleCommande();
  majEtatPass();
  noterFinPass();
  reverifierPass().catch(() => {}).then(() => { noterFinPass(); afficherRappel(); return reprendreCommande(); }).catch(() => {});
});

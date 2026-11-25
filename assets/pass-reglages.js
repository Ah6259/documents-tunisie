/* Réglage de Documents Tunisie pour le parcours commun du Pass (assets/pass-commun.js, copie du module de projets-ahmed :
   « outils communs/pass-commun/ » ; NE PAS modifier pass-commun.js ici, voir son LISEZMOI.md). Page pass/ (arabe, adresse principale)
   et fr/pass/ (français), chargé après assets/pass.js (codes d'accès, Pass Journée ouvert) dont il reprend PASS, T, joliCode,
   formuleLisible, lirePass, encore, activerCode, majEtatPass, remettreCommande…
   Ici seulement ce qui est PROPRE à ce site : nom, formule unique (Pass Journée), format du code (8 caractères sans O/0/I/1, affiché
   ABCD-EF23 : celui des codes déjà vendus, PASS.alphabet / PASS.longueur), textes de ce site, ligne « pour_activer » du bouton « pass »
   du dépôt privé documents-pass, bandeau du retour (en haut de la page). Fichier externe : aucun script en ligne (CSP). */
(function () {
  var PC = window.PassCommun;
  if (!PC) return;
  PC.brancher({
    site: "documents",                              // clé du site dans email-clients/sites.json (e-mail automatique)
    type: "pass-code",                              // code tapé sur le site (« J'ai un code »)
    langues: ["ar", "fr"],                          // arabe = adresse principale
    nomSite: { fr: "Documents Tunisie", ar: "وثائق تونس" },
    // E-mail automatique (A.17) EN SERVICE depuis le 25 novembre 2026 ; false = phrases [data-email-auto] cachées et rien envoyé
    emailAuto: true,
    ids: { form: "pass-form", statut: "pass-status", apres: "apres-pass", attente: "commande-attente", nouvelle: "nouvelle-commande" },
    code: { alphabet: PASS.alphabet, longueur: PASS.longueur, affiche: function (brut) { return joliCode(brut); } },
    // formule du message WhatsApp (comme avant : nombres isolés en arabe)
    formules: { "Pass Journée - 7 DT - 24 heures": { fr: "Pass Journée 7 DT (24 heures)", ar: "باقة اليوم ⁨7⁩ د (⁨24⁩ ساعة)" } },
    formuleDefaut: FORMULE,                         // formule unique (champ caché « formule »)
    etapes: ["nom", "telephone", "email", "conditions"],
    textes: {
      telephone: { fr: "Téléphone : 8 chiffres, par exemple 24 321 390.", ar: "الهاتف: ⁨8⁩ أرقام، مثال ⁨24 321 390⁩." },
      emailInvalide: { fr: "E-mail invalide : vérifiez-le.", ar: "البريد الإلكتروني غير صحيح: تثبّت منه." },
      conditions: { fr: "Cochez « J'accepte les conditions du Pass Journée ».", ar: "يجب الموافقة على شروط باقة اليوم." },
      merci: { fr: "Merci ! Votre demande a bien été envoyée.", ar: "شكرًا! تم إرسال طلبك." },
      echecReessayer: { fr: "Échec de l'envoi — vérifiez votre connexion et réessayez, ou écrivez-nous sur WhatsApp au 24 321 390.",
                        ar: "تعذّر الإرسال — تحقّق من الاتصال وأعد المحاولة، أو راسلنا عبر واتساب على ⁨24 321 390⁩." },
      verification: { fr: "Vérification de votre paiement…", ar: "جارٍ التثبت من دفعتك…" },
      attentePaiement: { fr: "En attente de votre paiement : dès qu'il est reçu, votre code s'ouvre et votre Pass Journée démarre (revenez sur cette page).",
                         ar: "في انتظار دفعتك: بمجرد وصولها يُفعَّل رمزك وتبدأ باقة اليوم (عد إلى هذه الصفحة)." },
      attenteImpossible: { fr: "Pas de connexion : impossible de vérifier votre paiement maintenant. Réessayez plus tard.",
                           ar: "لا يوجد اتصال: تعذّر التثبت من دفعتك الآن. أعد المحاولة لاحقًا." }
    },
    focusNouvelle: false,
    // le deuxième bouton « Nouvelle commande » (bandeau du retour) fait comme le premier
    brancher: function () {
      var b = document.getElementById("nouvelle-commande-attente"), n = document.getElementById("nouvelle-commande");
      if (b && n) b.addEventListener("click", function () { n.click(); });
    },
    // la commande en attente n'est regardée qu'APRÈS la revérification du Pass déjà gardé (window.PASS_PRET de pass.js)
    attendreRetour: function () {
      return new Promise(function (ok) {
        function suite() { Promise.resolve(window.PASS_PRET).then(ok, ok); }
        if (window.PASS_PRET || document.readyState === "complete") suite(); else document.addEventListener("DOMContentLoaded", suite);
      });
    },
    // remplit en plus : motif du paiement = le code, ligne « Votre commande en attente », case « J'ai un code » déjà remplie
    apresRemplir: function (x) {
      document.querySelectorAll(".code-commande").forEach(function (e) { e.textContent = x.code; e.setAttribute("dir", "ltr"); });
      document.querySelectorAll(".motif-code").forEach(function (e) {
        if (!e.dataset.origine) e.dataset.origine = e.innerHTML;
        e.textContent = x.code; e.setAttribute("dir", "ltr");
      });
      document.querySelectorAll(".motif-aide").forEach(function (e) { e.hidden = true; });
      var ligne = document.getElementById("commande-ligne");
      if (ligne) {
        ligne.textContent = T("Votre commande en attente : code ", "طلبك في الانتظار: الرمز ");
        var b = document.createElement("b");
        b.className = "code-commande"; b.dir = "ltr"; b.textContent = x.code;
        ligne.appendChild(b);
        ligne.appendChild(document.createTextNode(" — " + formuleLisible(x.formule || FORMULE)));
      }
      document.querySelectorAll("form.code-form input[name=code]").forEach(function (e) { if (!e.value) e.value = x.code; });
    },
    auRetour: function () { var deja = document.getElementById("commande-deja"); if (deja) deja.hidden = false; },
    apresEnvoi: function () { var deja = document.getElementById("commande-deja"); if (deja) deja.hidden = true; },
    formspree: function (d, c) {
      d.set("email", c.email);
      d.set("code", c.code);
    },
    // ligne prête à coller dans le bouton GitHub « pass » (dépôt privé documents-pass, case « ligne »)
    pourActiver: function (c) { return "action: paye ; nom: " + c.nom + " ; telephone: " + c.tel + " ; code: " + c.code + " ; email: " + c.email; },
    dejaActif: function (cmd) { var p = lirePass(); return !!(p && p.code === cmd.code && encore(p.fin)); },
    // même vérification que la case « J'ai un code » ; seul « reseau » est dit « pas de connexion »
    essayerCode: function (code) {
      return activerCode(code).then(function (r) {
        return r.etat === "ok" || r.etat === "expire" || r.etat === "reseau" ? r : { etat: "inconnu", code: r.code };
      });
    },
    passOuvert: function (r) {
      remettreCommande();
      if (r.etat !== "ok") return;
      var pe = document.getElementById("pass-etat");
      if (pe) { majEtatPass(); pe.textContent = T("Paiement reçu : votre code " + joliCode(r.code) + " est ouvert. ", "وصل الدفع: رمزك " + joliCode(r.code) + " مفعّل. ") + pe.textContent; }
    },
    nouvelle: function () {
      remettreCommande();
      var i = document.getElementById("inscription");
      try { if (i) i.scrollIntoView({ block: "start" }); } catch (e) {}
    }
  });
})();

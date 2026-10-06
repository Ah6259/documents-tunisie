/* Documents Tunisie — langue (français / arabe), en-tête et pied communs, protection légère, recherche de l'accueil */
const MAJ = "05/10/2026";   // date UNIQUE de la dernière vérification des fiches (changée par le robot surveillance.yml)
const SITE = "https://ah6259.github.io/documents-tunisie/";

/* --- anti-cadre : le site ne s'affiche pas dans la page d'un autre site --- */
(function () {
  if (window.top === window.self) return;
  let memeSite = false;
  try { memeSite = window.top.location.hostname === window.location.hostname; } catch (e) { memeSite = false; }
  if (!memeSite) { try { window.top.location.href = window.location.href; } catch (e) { document.documentElement.hidden = true; } }
})();

(function () {
  const html = document.documentElement;
  const racine = html.dataset.racine || "";
  // ARABE par défaut (décision d'Ahmed : la plupart des documents se font en arabe en Tunisie) ; le choix du visiteur est gardé
  let langue = "ar";
  try { langue = localStorage.getItem("langue") || "ar"; } catch (e) {}
  const demande = new URLSearchParams(location.search).get("lang");
  if (demande === "ar" || demande === "fr") langue = demande;
  window.T = (fr, ar) => html.lang === "ar" ? ar : fr;

  function cadre() {
    const e = document.getElementById("entete");
    if (e) e.innerHTML = `
      <div class="wrap">
        <a class="logo" href="${racine || "./"}">
          <img class="logo-mark" src="${racine}assets/logo.svg" alt="" width="34" height="34">
          <span class="logo-nom">${T("Documents Tunisie", "وثائق تونس")}
            <small>${T("1 PDF gratuit par jour · français et arabe", "PDF مجاني كل يوم · بالعربية والفرنسية")}</small></span>
        </a>
        <a class="entete-annuaire" href="https://ah6259.github.io/avocats-notaires-tunisie/${html.lang === "ar" ? "?lang=ar" : ""}" rel="noopener noreferrer" target="_blank" data-annuaire="lien-site/avocats" aria-label="${T("Avocats et notaires (annuaire gratuit)", "محامون وعدول (دليل مجاني)")}"><img src="${racine}assets/logo-avocats-notaires.svg" alt="" width="22" height="22"><span>${T("Avocats et notaires", "محامون وعدول")}</span></a>
        <button class="partager" type="button" aria-label="${T("Partager cette page", "شارك هذه الصفحة")}" title="${T("Partager", "شارك")}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg></button>
        <button class="langue" type="button">${T("العربية", "Français")}</button>
      </div>`;
    const p = document.getElementById("pied");
    if (p) p.innerHTML = `
      <div class="wrap">
        <div class="pied-logo"><img src="${racine}assets/logo.svg" alt="" width="24" height="24"> ${T("Documents Tunisie", "وثائق تونس")}</div>
        <nav>
          <a href="${racine || "./"}">${T("Tous les documents", "كل الوثائق")}</a>
          <a href="${racine}vente-voiture/">${T("Vendre une voiture", "بيع سيارة")}</a>
          <a href="${racine}location-maison/">${T("Louer un logement", "كراء مسكن")}</a>
          <a href="https://ah6259.github.io/avocats-notaires-tunisie/" rel="noopener noreferrer" target="_blank" data-annuaire="lien-site/avocats">${T("Avocats et notaires", "محامون وعدول")}</a>
          <a href="${racine}a-propos/">${T("À propos et méthode", "من نحن والمنهجية")}</a>
          <a href="${racine}#avis">${T("Votre avis", "رأيك")}</a>
        </nav>
        <p>${T(`Informations vérifiées le ${MAJ} à partir des sources officielles citées sur chaque page.`, `معلومات تم التثبت منها في ${MAJ} انطلاقا من المصادر الرسمية المذكورة في كل صفحة.`)}</p>
        <p>${T("Site non officiel : modèles indicatifs qui ne remplacent pas un avocat. Le PDF est fabriqué dans votre téléphone : aucune donnée n'est envoyée.",
               "موقع غير رسمي: نماذج استرشادية لا تعوض المحامي. يُصنع ملف PDF في هاتفك: لا تُرسل أي معطيات.")}</p>
        <p>${T("Les noms et marques cités appartiennent à leurs propriétaires.", "الأسماء والعلامات المذكورة على ملك أصحابها.")}</p>
        <p>© 2026 Documents Tunisie — ${T("tous droits réservés.", "جميع الحقوق محفوظة.")}</p>
      </div>`;
    document.querySelectorAll(".langue").forEach(b => b.addEventListener("click", () => appliquer(html.lang === "ar" ? "fr" : "ar")));
    // bouton Partager (demande d'Ahmed) : menu de partage du téléphone, sinon WhatsApp avec le lien de la page
    document.querySelectorAll(".partager").forEach(b => b.addEventListener("click", async () => {
      const url = location.href.split("#")[0].replace(/[?&]lang=(fr|ar)/, ""), titre = document.title.split(" | ")[0];
      try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "partage" + location.pathname.replace("/documents-tunisie/", "/"), title: "Partage", event: true }); } catch (e) {}
      return window.partagerLien();
    }));
    document.querySelectorAll("[data-maj]").forEach(x => x.textContent = MAJ);
    // fiche « âgée » : plus de 12 mois depuis la vérification (selon la date du visiteur)
    const [j, m, a] = MAJ.split("/").map(Number);
    const age = (Date.now() - new Date(a, m - 1, j).getTime()) / 864e5;
    const vieux = document.getElementById("alerte-age");
    if (vieux) { vieux.hidden = age <= 365; vieux.querySelector(".wrap").textContent = T("Information à revérifier : la dernière vérification date de plus d'un an.", "معلومات يجب إعادة التثبت منها: آخر تثبت يعود إلى أكثر من سنة."); }
  }

  function appliquer(l) {
    html.lang = l; html.dir = l === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("langue", l); } catch (e) {}
    cadre();
    document.dispatchEvent(new Event("langue"));
  }
  document.addEventListener("DOMContentLoaded", () => appliquer(langue));
})();

/* --- protection légère : images, contenus de valeur, texte copié --- */
document.addEventListener("contextmenu", e => { if (e.target.closest && e.target.closest("img, .hero, .feuille, .protege")) e.preventDefault(); });
document.addEventListener("dragstart", e => { if (e.target.closest && e.target.closest("img, .protege")) e.preventDefault(); });
document.addEventListener("copy", e => {
  const el = document.activeElement;
  if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;          // les champs du formulaire restent libres
  const sel = String(window.getSelection ? window.getSelection() : "");
  if (!sel || !e.clipboardData) return;
  const source = location.href.split("?")[0].split("#")[0];
  e.clipboardData.setData("text/plain", sel + "\n\nSource : " + source + " — © Documents Tunisie, tous droits réservés.");
  e.preventDefault();
});

/* --- boutons de choix (un seul actif) --- */
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest(".choix button");
  if (!b) return;
  b.parentNode.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
});

/* --- lien vers un annuaire gratuit : clic compté anonymement (seulement le nom de la page, rien d'autre) --- */
document.addEventListener("click", e => {
  const a = e.target.closest && e.target.closest("a[data-annuaire]");
  if (!a) return;
  try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: a.dataset.annuaire, title: "Annuaire : " + a.dataset.annuaire, event: true }); } catch (err) {}
});

function lienWhatsApp(texte) { return "https://wa.me/?text=" + encodeURIComponent(texte + " " + location.href.split("?")[0]); }

/* --- accueil : recherche et catégories --- */
document.addEventListener("DOMContentLoaded", () => {
  const champ = document.getElementById("recherche");
  if (!champ) return;
  const cartes = [...document.querySelectorAll("[data-cherche]")];
  const sansAccent = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[إأآا]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
  let cat = "";
  function filtrer() {
    const mots = sansAccent(champ.value.trim()).split(/\s+/).filter(Boolean);
    let n = 0;
    for (const c of cartes) {
      const t = sansAccent(c.dataset.cherche);
      const ok = (!cat || c.dataset.cat === cat) && mots.every(m => t.includes(m));
      c.hidden = !ok; if (ok) n++;
    }
    document.getElementById("aucun").hidden = n > 0;
    document.querySelectorAll(".bloc-docs").forEach(b => b.hidden = !b.querySelector("[data-cherche]:not([hidden])"));
    noterSiVide(n);
  }
  /* Recherche sans résultat : on note le mot cherché (anonyme, statistique GoatCounter), pour ajouter les documents
     manquants. Seulement après 2 s sans frappe, une fois par mot ; les chiffres sont retirés (jamais de n° CIN/téléphone). */
  const notes = new Set(); let minuteur;
  function noterSiVide(n) {
    clearTimeout(minuteur);
    const mot = sansAccent(champ.value).replace(/[0-9]+/g, " ").replace(/[^\p{L} '-]+/gu, " ").replace(/\s+/g, " ").trim().slice(0, 40);
    if (n > 0 || cat || mot.length < 3 || notes.has(mot)) return;
    minuteur = setTimeout(() => {
      notes.add(mot);
      try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "recherche-vide/" + mot.replace(/ /g, "-"), title: "Recherche sans résultat : " + mot, event: true }); } catch (e) {}
    }, 2000);
  }
  champ.addEventListener("input", filtrer);
  document.querySelectorAll(".cat").forEach(b => b.addEventListener("click", () => {
    cat = cat === b.dataset.cat ? "" : b.dataset.cat;
    document.querySelectorAll(".cat").forEach(x => x.classList.toggle("on", x.dataset.cat === cat));
    filtrer();
  }));
  const placeholder = () => champ.placeholder = T("Rechercher : procuration, congé…", "ابحث: توكيل، عطلة، كراء…");
  document.addEventListener("langue", placeholder); placeholder();
});

/* --- bouton Partager sur WhatsApp --- */
document.addEventListener("DOMContentLoaded", () => {
  const a = document.getElementById("partage");
  if (!a) return;
  const maj = () => a.href = lienWhatsApp(T(a.dataset.fr, a.dataset.ar));
  document.addEventListener("langue", maj); maj();
});

/* Installation sur le téléphone : service worker PRUDENT (sw.js : réseau d'abord pour les pages et les données).
   Seulement en https (jamais en file: pendant les tests locaux). */
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => {
    try { navigator.serviceWorker.register("/documents-tunisie/sw.js", { scope: "/documents-tunisie/" }).catch(() => {}); } catch (e) { /* rien : le site marche sans */ }
  });
}

/* >>> vidéo de présentation : page video/ partagée par le bouton « Partager » (outil vidéos d'Ahmed) */
window.VIDEO_SITE = {"base": "/documents-tunisie/", "defaut": "ar", "nom": {"fr": "Documents Tunisie", "ar": "وثائق تونس"}};
/* Bouton « Partager » (demande d'Ahmed, octobre 2026) : partage un LIEN vers la page vidéo du site (qui montre la vidéo
   de présentation, avec un gros bouton « Ouvrir le site ») + l'adresse du site dans le texte. WhatsApp et Facebook
   affichent l'aperçu de la page vidéo (grande image, vidéo lisible sur Facebook). Menu de partage du téléphone, sinon WhatsApp.
   Espace professionnels des annuaires : page « video-pro/ ». Réglages : window.VIDEO_SITE (juste au-dessus). */
(function () {
  var S = window.VIDEO_SITE, ORIGINE = "https://ah6259.github.io";
  function langue() { return document.documentElement.lang || S.defaut; }
  function M(o) { return o[langue()] || o[S.defaut] || o.fr; }
  // page vidéo à partager (et page du site correspondante) selon la page où l'on est
  window.pageVideo = function () {
    var chemin = location.pathname, pro = false;
    for (var i = 0; i < (S.pro || []).length; i++) if (chemin.indexOf(S.base + S.pro[i]) === 0) pro = true;
    var l = langue(), q = l !== S.defaut ? "?lang=" + l : "";
    return { page: ORIGINE + S.base + (pro ? "video-pro/" : "video/") + q, site: ORIGINE + S.base + (pro ? S.site_pro : "") + q + (pro ? (S.ancre_pro || "") : ""),
             titre: M(pro ? S.titre_pro : S.nom) };
  };
  window.partagerLien = function (titre, site) {
    var v = window.pageVideo(), t = titre || v.titre;
    if (site) v.site = site;
    var texte = t + "\n" + M({ fr: "Le site : ", ar: "الموقع: ", en: "The website: " }) + v.site + "\n" + M({ fr: "Regardez la vidéo :", ar: "شاهد الفيديو:", en: "Watch the video:" });
    function whatsapp() { window.open("https://wa.me/?text=" + encodeURIComponent(texte + " " + v.page), "_blank", "noopener"); return "whatsapp"; }
    if (navigator.share) {
      return navigator.share({ title: t, text: texte, url: v.page }).then(function () { return "lien"; }, function (e) {
        return e && e.name === "AbortError" ? "annule" : whatsapp();
      });
    }
    return Promise.resolve(whatsapp());
  };
  // page vidéo : textes dans la langue de la page (data-vfr / data-var / data-ven), vidéo de la langue (data-src-fr…)
  function traduire() {
    var l = langue();
    var el = document.querySelectorAll("[data-vfr]");
    for (var i = 0; i < el.length; i++) { var t = el[i].getAttribute("data-v" + l) || el[i].getAttribute("data-v" + S.defaut); if (t && el[i].textContent !== t) el[i].textContent = t; }
    var v = document.querySelector(".video-lecteur");
    if (v) {
      var s = v.getAttribute("data-src-" + l) || v.getAttribute("data-src-defaut") || v.getAttribute("src");
      if (!v.getAttribute("data-src-defaut")) v.setAttribute("data-src-defaut", v.getAttribute("src"));
      if (v.getAttribute("src") !== s) v.setAttribute("src", s);
      if (!v.getAttribute("data-poster-defaut")) v.setAttribute("data-poster-defaut", v.getAttribute("poster"));
      var po = v.getAttribute("data-poster-" + l) || v.getAttribute("data-poster-defaut");
      if (v.getAttribute("poster") !== po) v.setAttribute("poster", po);
    }
    // lien discret « Vidéo de présentation » en bas de l'accueil et de À propos -> la page vidéo
    var p = location.pathname.replace(/index\.html$/, "");
    if (p === S.base || p === S.base + "a-propos/") {
      var b = document.getElementById("lien-video");
      if (!b) {
        b = document.createElement("p"); b.id = "lien-video"; b.className = "lien-video"; b.appendChild(document.createElement("a"));
        var m = document.querySelector("main"); if (m) m.insertAdjacentElement("afterend", b); else document.body.appendChild(b);
      }
      b.firstChild.href = S.base + "video/" + (l !== S.defaut ? "?lang=" + l : "");
      b.firstChild.textContent = M({ fr: "Vidéo de présentation", ar: "الفيديو التقديمي", en: "Presentation video" });
    }
  }
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest && e.target.closest("[data-partager-video]");
    if (!b) return;
    e.preventDefault();
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "partage" + location.pathname.replace(S.base, "/"), title: "Partage", event: true }); } catch (x) {}
    window.partagerLien();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(traduire, 0); }); else setTimeout(traduire, 0);
  document.addEventListener("langue", function () { setTimeout(traduire, 0); });
  try { new MutationObserver(function () { setTimeout(traduire, 0); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (x) {}
})();
/* <<< vidéo de présentation */

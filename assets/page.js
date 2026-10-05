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
  let langue = "fr";
  try { langue = localStorage.getItem("langue") || ((navigator.language || "").startsWith("ar") ? "ar" : "fr"); } catch (e) {}
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
            <small>${T("Modèles gratuits · français et arabe", "نماذج مجانية · بالعربية والفرنسية")}</small></span>
        </a>
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

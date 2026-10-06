/* Documents Tunisie — moteur des modèles : formulaire -> aperçu -> PDF (impression du navigateur).
   Tout se passe dans le téléphone : aucune donnée n'est envoyée ni enregistrée. */
(function (racine) {
  const FSI = "⁨", PDI = "⁩";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- nombres en lettres ---------- */
  const U = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize",
    "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const DIZ = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];
  function fr99(n) {
    if (n < 20) return U[n];
    const d = Math.floor(n / 10), u = n % 10;
    if (d === 7) return u === 1 ? "soixante et onze" : "soixante-" + U[10 + u];
    if (d === 9) return "quatre-vingt-" + U[10 + u];
    if (d === 8) return u === 0 ? "quatre-vingts" : "quatre-vingt-" + U[u];
    return DIZ[d] + (u === 0 ? "" : u === 1 ? " et un" : "-" + U[u]);
  }
  function fr999(n) {
    const c = Math.floor(n / 100), r = n % 100;
    let s = c === 1 ? "cent" : c > 1 ? U[c] + " cent" + (r === 0 ? "s" : "") : "";
    if (r) s += (s ? " " : "") + fr99(r);
    return s;
  }
  function lettresFR(n) {
    if (n === 0) return "zéro";
    const mi = Math.floor(n / 1e6), th = Math.floor(n / 1000) % 1000, r = n % 1000, p = [];
    if (mi) p.push(fr999(mi) + " million" + (mi > 1 ? "s" : ""));
    if (th) p.push(th === 1 ? "mille" : fr999(th).replace(/(cent|vingt)s$/, "$1") + " mille");
    if (r) p.push(fr999(r));
    return p.join(" ");
  }
  const A1 = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
  const A10 = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const AD = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const AC = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
  function ar99(n) { if (n < 10) return A1[n]; if (n < 20) return A10[n - 10]; const u = n % 10; return u ? A1[u] + " و" + AD[Math.floor(n / 10)] : AD[n / 10]; }
  function ar999(n) { return [AC[Math.floor(n / 100)], ar99(n % 100)].filter(Boolean).join(" و"); }
  function arEchelle(k, un, deux, pluriel, acc) {           // 1 ألف, 2 ألفان, 3-10 آلاف, 11-99 ألفا, sinon ألف
    if (k === 1) return un; if (k === 2) return deux;
    const r = k % 100;
    return ar999(k) + " " + (k <= 10 ? pluriel : r >= 11 ? acc : un);
  }
  function lettresAR(n) {
    if (n === 0) return "صفر";
    const mi = Math.floor(n / 1e6), th = Math.floor(n / 1000) % 1000, r = n % 1000, p = [];
    if (mi) p.push(arEchelle(mi, "مليون", "مليونان", "ملايين", "مليونا"));
    if (th) p.push(arEchelle(th, "ألف", "ألفان", "آلاف", "ألفا"));
    if (r) p.push(ar999(r));
    return p.join(" و");
  }
  function nomAR(n, un, deux, pluriel, acc) {                // accord du nom compté (دينار / مليم)
    if (n === 1) return un + " واحد"; if (n === 2) return deux;
    const r = n % 100;
    // devant le nom compté : « ألف دينار », « ألفا دينار », « مائتا دينار », « مليون دينار »
    const mots = lettresAR(n).replace(/ألفان$/, "ألفا").replace(/ ألفا$/, " ألف").replace(/مائتان$/, "مائتا")
      .replace(/مليونان$/, "مليونا").replace(/ مليونا$/, " مليون");
    return mots + " " + (r >= 3 && r <= 10 ? pluriel : r >= 11 ? acc : un);
  }
  function lettres(x, L) {
    const mill = Math.round(x * 1000), d = Math.floor(mill / 1000), m = mill % 1000;
    if (L === "ar") {
      const s = [];
      if (d || !m) s.push(d === 1 ? "دينار واحد" : d === 2 ? "ديناران" : nomAR(d, "دينار", "ديناران", "دنانير", "دينارا"));
      if (m) s.push(nomAR(m, "مليم", "مليمان", "مليمات", "مليما"));
      return s.join(" و");
    }
    const s = [];
    if (d || !m) s.push(lettresFR(d) + (d >= 1e6 && d % 1e6 === 0 ? " de dinars" : d > 1 ? " dinars" : " dinar"));
    if (m) s.push(lettresFR(m) + (m > 1 ? " millimes" : " millime"));
    return s.join(" et ");
  }

  /* ---------- formats ---------- */
  const nombre = s => Number(String(s).replace(/\s/g, "").replace(",", "."));
  function montant(x, L) {
    const [e, d] = nombre(x).toFixed(3).split(".");
    return e.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "," + d + (L === "ar" ? " د.ت" : " DT");
  }
  function dateFR(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ""); return m ? `${m[3]}/${m[2]}/${m[1]}` : iso; }
  function aujourdhui() { const d = new Date(), z = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; }

  /* ---------- lecture des valeurs pour un modèle ---------- */
  function visible(ch, val) { return !ch.si || val[ch.si[0]] === ch.si[1]; }
  function lecteur(doc, val, L) {
    const champ = id => doc.champs.find(c => c.id === id);
    const brut = id => {
      const c = champ(id); if (!c || !visible(c, val)) return "";
      const x = val[id]; if (x === true) return "oui"; if (x === false || x == null) return "";
      return String(x).trim();
    };
    const vide = id => { const c = champ(id); return `<mark class="vide">${esc(c ? c[L] : id)}</mark>`; };
    const v = id => {
      const c = champ(id), x = brut(id);
      if (!x) return vide(id);
      let t = x;
      if (c.type === "date") t = dateFR(x);
      else if (c.type === "select") { const o = c.options.find(o => o.v === x); t = o ? o[L] : x; }
      else if (c.type === "montant") t = montant(x, L);
      return FSI + esc(t).replace(/\n/g, "<br>") + PDI;
    };
    v.has = id => !!brut(id);
    v.is = (id, x) => brut(id) === x;
    v.lettres = id => { const x = brut(id); return x && nombre(x) > 0 ? lettres(nombre(x), L) : vide(id); };
    return v;
  }
  // le PDF ne porte aucune mention du site : c'est le document de la personne
  function feuille(doc, val, L) {
    return `<article class="feuille" lang="${L}" dir="${L === "ar" ? "rtl" : "ltr"}">${doc[L](lecteur(doc, val, L))}</article>`;
  }

  /* ---------- exemple affiché avant le formulaire (données fictives, jamais dans le PDF) ----------
     ordre : doc.exemple[id] (valeur ou [fr, ar]) -> c.ex du champ -> valeur générique tirée du libellé */
  function valeursExemple(doc, L) {
    const v = {}, ex = doc.exemple || {}, i = L === "ar" ? 1 : 0;
    for (const c of doc.champs) {
      if (c.groupe) continue;
      let x = c.id in ex ? ex[c.id] : c.ex;
      if (Array.isArray(x)) x = x[i];
      if (x === undefined || x === null || x === "") {
        x = c.type === "case" ? false : c.type === "select" ? c.options[0].v : c.type === "date" ? "2026-10-05"
          : c.type === "montant" ? "1000" : c[L];
      }
      v[c.id] = x;
    }
    return v;
  }
  function feuilleExemple(doc, L) { return feuille(doc, valeursExemple(doc, L), L); }

  /* ---------- contrôle avant le PDF ---------- */
  function erreurs(doc, val) {
    const e = [];
    for (const c of doc.champs) {
      if (c.groupe || c.opt || c.type === "case" || !visible(c, val)) continue;
      const x = String(val[c.id] == null ? "" : val[c.id]).trim();
      if (!x) { e.push({ id: c.id, raison: "vide" }); continue; }
      if (c.type === "montant" && !(nombre(x) > 0)) e.push({ id: c.id, raison: "montant" });
      if (c.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(x)) e.push({ id: c.id, raison: "date" });
    }
    return e;
  }

  const api = { lettres, lettresFR, lettresAR, montant, dateFR, lecteur, feuille, erreurs, visible, valeursExemple, feuilleExemple };
  if (typeof module !== "undefined") { module.exports = api; return; }
  window.Modele = api;

  /* =================== dans le navigateur =================== */
  document.addEventListener("DOMContentLoaded", () => {
    const slug = document.body.dataset.doc;
    const doc = slug && (typeof DOCS !== "undefined" ? DOCS : []).find(d => d.slug === slug);
    const form = document.getElementById("formulaire");
    if (!doc || !form) return;
    const T = (fr, ar) => document.documentElement.lang === "ar" ? ar : fr;
    let langueDoc = null;          // null = suit la langue du site

    // construction du formulaire
    form.innerHTML = doc.champs.map(c => {
      if (c.groupe) return `<h3 class="f-groupe"><span data-l="fr">${esc(c.fr)}</span><span data-l="ar">${esc(c.ar)}</span></h3>`;
      const lab = `<span data-l="fr">${esc(c.fr)}</span><span data-l="ar">${esc(c.ar)}</span>` +
        (c.opt && c.type !== "case" ? ` <small class="facultatif"><span data-l="fr">(facultatif)</span><span data-l="ar">(اختياري)</span></small>` : "");
      let champ;
      const attrs = `id="f-${c.id}" name="${c.id}"`;
      if (c.type === "select") champ = `<select ${attrs}>${c.options.map(o => `<option value="${esc(o.v)}">${esc(o.fr)}</option>`).join("")}</select>`;
      else if (c.type === "textarea") champ = `<textarea ${attrs} rows="3" maxlength="600"></textarea>`;
      else if (c.type === "date") champ = `<input type="date" ${attrs}${c.aujourdhui ? ` value="${aujourdhui()}"` : ""}>`;
      else if (c.type === "case") return `<div class="champ" data-champ="${c.id}"><label class="case"><input type="checkbox" ${attrs}> ${lab}</label></div>`;
      else champ = `<input type="text" ${attrs} maxlength="${c.max || 160}" autocomplete="off"${c.type === "montant" ? ' inputmode="decimal"' : c.mode ? ` inputmode="${c.mode}"` : ""}>`;
      return `<div class="champ" data-champ="${c.id}"><label for="f-${c.id}">${lab}</label>${champ}<p class="f-err" hidden></p></div>`;
    }).join("");

    const valeurs = () => {
      const v = {};
      for (const c of doc.champs) {
        if (c.groupe) continue;
        const el = form.elements[c.id];
        v[c.id] = c.type === "case" ? el.checked : el.value;
      }
      return v;
    };
    const langues = () => {
      const l = langueDoc || document.documentElement.lang;
      return l === "deux" ? ["fr", "ar"] : [l];
    };
    function textes() {
      for (const c of doc.champs) {
        if (c.groupe) continue;
        const el = form.elements[c.id];
        const ex = Array.isArray(c.ex) ? c.ex : [c.ex, c.ex];
        if (c.type === "select") [...el.options].forEach((o, i) => o.textContent = T(c.options[i].fr, c.options[i].ar));
        else if (c.type !== "date" && c.type !== "case") el.placeholder = T("Ex. : ", "مثال: ") + T(ex[0], ex[1]);
      }
      document.querySelectorAll("#langue-doc button").forEach(b => b.classList.toggle("on", b.dataset.v === (langueDoc || document.documentElement.lang)));
    }
    function majApercu() {
      const v = valeurs();
      for (const c of doc.champs) if (!c.groupe) form.querySelector(`[data-champ="${c.id}"]`).hidden = !visible(c, v);
      document.getElementById("apercu").innerHTML = langues().map(L => feuille(doc, v, L)).join("");
    }
    form.addEventListener("input", majApercu);
    form.addEventListener("change", majApercu);
    document.getElementById("langue-doc").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      langueDoc = b.dataset.v; textes(); majApercu();
    });
    document.addEventListener("langue", () => { textes(); majApercu(); });

    // téléchargement : contrôle, puis impression « Enregistrer en PDF »
    const boite = document.getElementById("erreurs");
    document.getElementById("telecharger").addEventListener("click", () => {
      // Pass Journée (assets/pass.js) : 1 PDF gratuit par jour ; un autre modèle le même jour = écran de blocage
      const P = window.PassJour;
      if (P && P.acces(doc.slug) === "bloque") { P.bloquer(doc.slug); return; }
      const v = valeurs(), err = erreurs(doc, v);
      form.querySelectorAll(".f-err").forEach(p => { p.hidden = true; p.textContent = ""; });
      form.querySelectorAll(".invalide").forEach(x => x.classList.remove("invalide"));
      if (err.length) {
        for (const e of err) {
          const c = doc.champs.find(x => x.id === e.id), bloc = form.querySelector(`[data-champ="${e.id}"]`);
          bloc.classList.add("invalide");
          const p = bloc.querySelector(".f-err");
          p.textContent = e.raison === "vide" ? T("À remplir", "يجب تعميره") : e.raison === "montant" ? T("Montant en chiffres, par exemple 1500", "المبلغ بالأرقام، مثلا 1500") : T("Date incomplète", "تاريخ غير مكتمل");
          p.hidden = false;
        }
        boite.textContent = T(`Il manque ${err.length} information(s) avant de fabriquer le PDF.`, `تنقص ${err.length} معلومة (معلومات) قبل صنع ملف PDF.`);
        boite.hidden = false;
        const premier = form.elements[err[0].id];
        if (premier && premier.focus) premier.focus();
        return;
      }
      boite.hidden = true;
      let imp = document.getElementById("impression");
      if (!imp) { imp = document.createElement("div"); imp.id = "impression"; document.body.appendChild(imp); }
      imp.innerHTML = langues().map(L => feuille(doc, v, L)).join("");
      const titre = document.title;
      const nomFichier = (v[doc.champs.find(c => /nom$/.test(c.id || "")).id] || "").replace(/[^\p{L}\p{N}]+/gu, "-");
      document.title = doc.slug + (nomFichier ? "-" + nomFichier : "");
      window.addEventListener("afterprint", () => { document.title = titre; }, { once: true });
      // statistique anonyme : seulement le nom du modèle (documents les plus demandés), jamais ce qui est écrit
      try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "pdf-" + doc.slug, title: "PDF : " + doc.slug, event: true }); } catch (e) {}
      if (P) P.noter(doc.slug);             // ce modèle devient le document gratuit du jour (sauf avec le Pass)
      window.print();
      setTimeout(() => { document.title = titre; }, 1500);
    });

    textes(); majApercu();
  });
})();

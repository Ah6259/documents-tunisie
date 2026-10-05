/* Documents Tunisie — DONNÉES (un objet par document). Corriger un texte, une étape ou une source ici,
   puis lancer `node tools/generer.mjs` (pages) et `node tools/test_site.mjs` (tests).
   Modèles : fonctions fr(v) / ar(v). v("id") = valeur saisie (isolée), v.has("id"), v.is("id","valeur"), v.lettres("id"). */

const SOURCES = {
  legislation: { fr: "Portail national de la législation (textes de loi, codes)", ar: "البوابة الوطنية للتشريع", url: "http://www.legislation.tn/" },
  portail: { fr: "Portail officiel du gouvernement tunisien (démarches administratives)", ar: "البوابة الرسمية للحكومة التونسية", url: "https://www.tunisie.gov.tn/" },
  finances: { fr: "Ministère des Finances (recettes des finances, enregistrement)", ar: "وزارة المالية (القباضات المالية، التسجيل)", url: "https://www.finances.gov.tn/" },
  attt: { fr: "Agence technique des transports terrestres (ATTT)", ar: "الوكالة الفنية للنقل البري", url: "http://www.attt.com.tn/" },
  interieur: { fr: "Ministère de l'Intérieur (passeports, frontières)", ar: "وزارة الداخلية", url: "https://www.interieur.gov.tn/" },
  education: { fr: "Ministère de l'Éducation", ar: "وزارة التربية", url: "https://www.education.gov.tn/" },
  social: { fr: "Ministère des Affaires sociales (droit du travail)", ar: "وزارة الشؤون الاجتماعية", url: "https://www.social.gov.tn/" },
  cnss: { fr: "Caisse nationale de sécurité sociale (CNSS)", ar: "الصندوق الوطني للضمان الاجتماعي", url: "https://www.cnss.tn/" },
  aneti: { fr: "Agence nationale pour l'emploi et le travail indépendant (ANETI)", ar: "الوكالة الوطنية للتشغيل والعمل المستقل", url: "https://www.emploi.nat.tn/" },
  intt: { fr: "Instance nationale des télécommunications (INT)", ar: "الهيئة الوطنية للاتصالات", url: "https://www.intt.tn/" },
  bct: { fr: "Banque centrale de Tunisie", ar: "البنك المركزي التونسي", url: "https://www.bct.gov.tn/" },
  rne: { fr: "Registre national des entreprises (RNE)", ar: "السجل الوطني للمؤسسات", url: "https://www.registre-entreprises.tn/" }
};

const CATEGORIES = [
  { id: "travail", fr: "Travail", ar: "الشغل", photo: "travail",
    svg: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>' },
  { id: "famille", fr: "Famille", ar: "العائلة", photo: "famille",
    svg: '<circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.6c3 .2 6 2.2 6 5.4"/>' },
  { id: "logement", fr: "Logement", ar: "السكن", photo: "logement",
    svg: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>' },
  { id: "vehicules", fr: "Véhicules", ar: "العربات", photo: "vehicules",
    svg: '<path d="M3 17v-4l2.2-5h13.6l2.2 5v4z"/><path d="M3 13h18"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>' },
  { id: "administration", fr: "Administration et école", ar: "الإدارة والمدرسة", photo: "administration",
    svg: '<path d="M3 21h18M4 10h16M12 3l9 5H3z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/>' },
  { id: "argent", fr: "Argent et banque", ar: "المال والبنك", photo: "argent",
    svg: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9h.01M18 15h.01"/>' }
];

/* ---- listes communes ---- */
const DEST = [
  { v: "dir", fr: "Monsieur le Directeur", ar: "السيد المدير" },
  { v: "dire", fr: "Madame la Directrice", ar: "السيدة المديرة" },
  { v: "ger", fr: "Monsieur le Gérant", ar: "السيد المسير" },
  { v: "gere", fr: "Madame la Gérante", ar: "السيدة المسيرة" },
  { v: "drh", fr: "Monsieur le Directeur des ressources humaines", ar: "السيد مدير الموارد البشرية" },
  { v: "drhe", fr: "Madame la Directrice des ressources humaines", ar: "السيدة مديرة الموارد البشرية" }
];
const QUALITE_PARENT = [
  { v: "pere", fr: "le père", ar: "الأب" },
  { v: "mere", fr: "la mère", ar: "الأم" },
  { v: "tuteur", fr: "le tuteur légal / la tutrice légale", ar: "الولي الشرعي" }
];
const MOIS = ["janvier|جانفي", "février|فيفري", "mars|مارس", "avril|أفريل", "mai|ماي", "juin|جوان", "juillet|جويلية",
  "août|أوت", "septembre|سبتمبر", "octobre|أكتوبر", "novembre|نوفمبر", "décembre|ديسمبر"]
  .map((m, i) => ({ v: String(i + 1), fr: m.split("|")[0], ar: m.split("|")[1] }));
const DELEGATIONS = ["Ariana|أريانة", "Béja|باجة", "Ben Arous|بن عروس", "Bizerte|بنزرت", "Gabès|قابس", "Gafsa|قفصة",
  "Jendouba|جندوبة", "Kairouan|القيروان", "Kasserine|القصرين", "Kébili|قبلي", "Le Kef|الكاف", "Mahdia|المهدية",
  "La Manouba|منوبة", "Médenine|مدنين", "Monastir|المنستير", "Nabeul|نابل", "Sfax 1|صفاقس 1", "Sfax 2|صفاقس 2",
  "Sidi Bouzid|سيدي بوزيد", "Siliana|سليانة", "Sousse|سوسة", "Tataouine|تطاوين", "Tozeur|توزر", "Tunis 1|تونس 1",
  "Tunis 2|تونس 2", "Zaghouan|زغوان"].map(d => ({ v: d.split("|")[0], fr: d.split("|")[0], ar: d.split("|")[1] }));
const NIVEAUX = [
  ["1re année de l'enseignement primaire", "السنة الأولى من التعليم الابتدائي"],
  ["2e année de l'enseignement primaire", "السنة الثانية من التعليم الابتدائي"],
  ["3e année de l'enseignement primaire", "السنة الثالثة من التعليم الابتدائي"],
  ["4e année de l'enseignement primaire", "السنة الرابعة من التعليم الابتدائي"],
  ["5e année de l'enseignement primaire", "السنة الخامسة من التعليم الابتدائي"],
  ["6e année de l'enseignement primaire", "السنة السادسة من التعليم الابتدائي"],
  ["7e année de l'enseignement de base", "السنة السابعة من التعليم الأساسي"],
  ["8e année de l'enseignement de base", "السنة الثامنة من التعليم الأساسي"],
  ["9e année de l'enseignement de base", "السنة التاسعة من التعليم الأساسي"],
  ["1re année de l'enseignement secondaire", "السنة الأولى من التعليم الثانوي"],
  ["2e année de l'enseignement secondaire", "السنة الثانية من التعليم الثانوي"],
  ["3e année de l'enseignement secondaire", "السنة الثالثة من التعليم الثانوي"],
  ["4e année de l'enseignement secondaire", "السنة الرابعة من التعليم الثانوي"]
].map((n, i) => ({ v: String(i + 1), fr: n[0], ar: n[1] }));

/* ---- fabriques de champs ---- */
const c = (id, fr, ar, ex, plus) => Object.assign({ id, type: "text", fr, ar, ex }, plus || {});
const groupe = (fr, ar) => ({ groupe: true, fr, ar });
const nom = (id, ex) => c(id, "Nom et prénom", "الاسم واللقب", ex || ["Mohamed Ben Salah", "محمد بن صالح"]);
const cin = id => c(id, "N° de carte d'identité (CIN)", "عدد بطاقة التعريف الوطنية", "01234567", { mode: "numeric", max: 12 });
const adresse = (id, ex) => c(id, "Adresse", "العنوان", ex || ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"]);
const date = (id, fr, ar, plus) => Object.assign({ id, type: "date", fr, ar, ex: "2026-10-05" }, plus || {});
const choix = (id, fr, ar, options, plus) => Object.assign({ id, type: "select", fr, ar, options, ex: options[0].v }, plus || {});
const fin = () => [groupe("Lieu et date", "المكان والتاريخ"),
  c("lieu", "Fait à (ville)", "حرر بـ (المدينة)", ["Tunis", "تونس"]), date("date", "Date", "التاريخ", { aujourdhui: true })];

/* ---- morceaux de texte communs ---- */
const idFR = (v, p, role) => `${v(p + "nom")}, titulaire de la carte d'identité nationale n° ${v(p + "cin")}, demeurant à ${v(p + "adresse")}${role ? ", " + role : ""}`;
const idAR = (v, p, role) => `${v(p + "nom")}، صاحب(ة) بطاقة التعريف الوطنية عدد ${v(p + "cin")}، القاطن(ة) بـ${v(p + "adresse")}${role ? "، " + role : ""}`;
const faitFR = v => `<p class="d-fait">Fait à ${v("lieu")}, le ${v("date")}.</p>`;
const faitAR = v => `<p class="d-fait">حرر بـ${v("lieu")} في ${v("date")}</p>`;
const signe = (...cases) => `<div class="d-signes">${cases.map(x => `<div class="d-signe">${x}</div>`).join("")}</div>`;
const salutFR = (appel) => `<p>Je vous prie d'agréer, ${appel}, l'expression de mes salutations distinguées.</p>`;
const salutAR = `<p>وتقبلوا مني فائق عبارات الاحترام والتقدير.</p>`;
const expediteur = (v, lignes) => `<div class="d-exp">${lignes.filter(Boolean).join("<br>")}</div>`;
const LEG_SUPPR = {
  fr: "Le gouvernement a annoncé fin 2024 la suppression progressive de la légalisation pour certains documents : demandez à l'organisme qui recevra votre document s'il l'exige encore.",
  ar: "أعلنت الحكومة في أواخر 2024 عن الحذف التدريجي للتعريف بالإمضاء بالنسبة إلى بعض الوثائق: اسأل الجهة التي ستتسلم الوثيقة إن كانت لا تزال تشترطه."
};
const ETAPE_LEGAL = {
  ic: "municipalite",
  fr: ["Légaliser la signature", "À la municipalité (bureau de légalisation), en personne, avec votre CIN originale. Vous signez devant l'agent."],
  ar: ["التعريف بالإمضاء", "بالبلدية (مكتب التعريف بالإمضاء)، شخصيا، مع بطاقة التعريف الأصلية. تمضي أمام العون."]
};
const ETAPE_REMPLIR = {
  ic: "remplir",
  fr: ["Remplir le modèle", "Sur cette page : le PDF est fabriqué dans votre téléphone, rien n'est envoyé."],
  ar: ["تعمير النموذج", "في هذه الصفحة: يُصنع ملف PDF في هاتفك، ولا يُرسل أي شيء."]
};
const ETAPE_IMPRIMER = (nb) => ({
  ic: "imprimer",
  fr: ["Imprimer et signer", nb ? `Imprimez ${nb} exemplaires. Ne signez pas avant d'être devant l'agent si la signature doit être légalisée.` : "Imprimez, relisez, puis signez à la main."],
  ar: ["الطباعة والإمضاء", nb ? `اطبع ${nb} نظائر. لا تمض قبل أن تكون أمام العون إذا كان الإمضاء يستوجب التعريف به.` : "اطبع الوثيقة، أعد قراءتها، ثم أمضها بخط يدك."]
});
const LEG_OU = {
  fr: "Municipalité (ou arrondissement municipal) : bureau de légalisation des signatures.",
  ar: "البلدية (أو الدائرة البلدية): مكتب التعريف بالإمضاء."
};

const DOCS = [
/* ======================================================================= 1 */
{
  slug: "procuration-conduite-vehicule", cat: "vehicules", rang: 1,
  titre: { fr: "Procuration de conduite d'un véhicule", ar: "توكيل سياقة سيارة" },
  court: { fr: "Autoriser une autre personne à conduire votre voiture.", ar: "الترخيص لشخص آخر بسياقة سيارتك." },
  bref: { fr: "Le propriétaire d'un véhicule autorise une autre personne à le conduire et à le présenter aux contrôles routiers. La signature du propriétaire est légalisée à la municipalité.",
          ar: "يرخص مالك العربة لشخص آخر في سياقتها وتقديمها عند المراقبة على الطرقات. يُعرَّف بإمضاء المالك بالبلدية." },
  legal: { legalisation: "oui", enregistrement: "non",
           cout: { fr: "Modèle gratuit. Frais de légalisation éventuels : à vérifier à la municipalité.", ar: "النموذج مجاني. معاليم التعريف بالإمضاء إن وجدت: يُتثبت منها بالبلدية." },
           delai: { fr: "Aucun délai légal ; gardez l'original dans le véhicule.", ar: "لا أجل قانوني؛ احتفظ بالأصل داخل العربة." } },
  champs: [
    groupe("Le propriétaire (celui qui donne la procuration)", "المالك (الموكِّل)"), nom("m_nom"), cin("m_cin"), adresse("m_adresse"),
    groupe("Le conducteur autorisé", "السائق المرخص له (الوكيل)"), nom("d_nom", ["Sami Trabelsi", "سامي الطرابلسي"]), cin("d_cin"), adresse("d_adresse", ["5 avenue Habib Bourguiba, Sousse", "5 شارع الحبيب بورقيبة، سوسة"]),
    groupe("Le véhicule", "العربة"),
    c("marque", "Marque", "النوع (العلامة)", ["Peugeot", "بيجو"]), c("modele", "Modèle", "الطراز", ["208", "208"]),
    c("immat", "N° d'immatriculation", "رقم التسجيل المنجمي", ["123 TU 4567", "123 تونس 4567"]),
    c("chassis", "N° de série (châssis)", "الرقم التسلسلي (الهيكل)", "VF3XXXXXXXX123456", { opt: true }),
    groupe("Durée", "المدة"),
    choix("duree", "Valable", "صالح", [{ v: "revocation", fr: "jusqu'à ce que je l'annule", ar: "إلى حين إلغائه" }, { v: "dates", fr: "entre deux dates", ar: "بين تاريخين" }]),
    date("debut", "Du", "من", { si: ["duree", "dates"] }), date("fin", "Au", "إلى", { si: ["duree", "dates"], ex: "2027-10-05" }),
    ...fin()
  ],
  fr: v => `<h1 class="d-titre">PROCURATION DE CONDUITE D'UN VÉHICULE</h1>
<p>Je soussigné(e), ${idFR(v, "m_", "propriétaire du véhicule désigné ci-dessous")},</p>
<p>donne par la présente procuration à ${idFR(v, "d_")},</p>
<p>pour conduire et utiliser en mon nom le véhicule suivant :</p>
<ul class="d-liste"><li>Marque : ${v("marque")} — Modèle : ${v("modele")}</li><li>N° d'immatriculation : ${v("immat")}</li>${v.has("chassis") ? `<li>N° de série (châssis) : ${v("chassis")}</li>` : ""}</ul>
<p>Le mandataire peut circuler avec ce véhicule sur le territoire tunisien et le présenter à tout contrôle des autorités compétentes. Il s'engage à respecter le Code de la route.</p>
<p>${v.is("duree", "dates") ? `La présente procuration est valable du ${v("debut")} au ${v("fin")}.` : "La présente procuration est valable jusqu'à sa révocation écrite par le mandant."}</p>
${faitFR(v)}${signe("Le mandant (propriétaire)<br><small>signature légalisée</small>", "Le mandataire<br><small>lu et accepté</small>")}`,
  ar: v => `<h1 class="d-titre">توكيل في سياقة سيارة</h1>
<p>أنا الممضي(ة) أسفله ${idAR(v, "m_", "مالك(ة) العربة المبينة أسفله")}،</p>
<p>أوكل بمقتضى هذا ${idAR(v, "d_")}،</p>
<p>لسياقة واستعمال العربة التالية باسمي:</p>
<ul class="d-liste"><li>النوع: ${v("marque")} — الطراز: ${v("modele")}</li><li>رقم التسجيل المنجمي: ${v("immat")}</li>${v.has("chassis") ? `<li>الرقم التسلسلي (الهيكل): ${v("chassis")}</li>` : ""}</ul>
<p>ويمكن للوكيل الجولان بهذه العربة داخل تراب الجمهورية التونسية وتقديمها عند كل مراقبة من قبل السلط المختصة، ويلتزم باحترام مجلة الطرقات.</p>
<p>${v.is("duree", "dates") ? `هذا التوكيل صالح من ${v("debut")} إلى ${v("fin")}.` : "هذا التوكيل صالح إلى حين إلغائه كتابيا من قبل الموكِّل."}</p>
${faitAR(v)}${signe("إمضاء الموكِّل (المالك)<br><small>معرف به</small>", "إمضاء الوكيل<br><small>اطلعت وقبلت</small>")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(2), ETAPE_LEGAL,
    { ic: "garder", fr: ["Garder l'original dans le véhicule", "Avec la carte grise et l'attestation d'assurance. Gardez une copie chez vous."],
      ar: ["الاحتفاظ بالأصل داخل العربة", "مع البطاقة الرمادية وشهادة التأمين. احتفظ بنسخة في منزلك."] }],
  pieces: { fr: ["CIN originale du propriétaire (pour la légalisation)", "Copie de la carte grise du véhicule", "Copie de la CIN du conducteur autorisé"],
            ar: ["بطاقة التعريف الأصلية للمالك (للتعريف بالإمضاء)", "نسخة من البطاقة الرمادية للعربة", "نسخة من بطاقة تعريف السائق المرخص له"] },
  ou: { fr: [LEG_OU.fr], ar: [LEG_OU.ar] },
  pieges: { fr: ["Vérifiez que l'assurance du véhicule couvre un autre conducteur : demandez à votre assureur.",
                 "Pour sortir du territoire tunisien avec le véhicule, une procuration ou des formalités particulières peuvent être exigées : renseignez-vous auprès de la douane avant le départ.",
                 "Le n° d'immatriculation doit être recopié exactement comme sur la carte grise."],
            ar: ["تثبت من أن تأمين العربة يغطي سائقا آخر: اسأل شركة التأمين.",
                 "للخروج بالعربة من التراب التونسي، قد يُشترط توكيل أو إجراءات خاصة: استفسر لدى الديوانة قبل السفر.",
                 "يجب نقل رقم التسجيل كما هو مكتوب في البطاقة الرمادية."] },
  averifier: { fr: ["Frais de légalisation à la municipalité."], ar: ["معاليم التعريف بالإمضاء بالبلدية."] },
  faq: [
    { fr: ["Faut-il légaliser la procuration de conduite ?", "Oui, en pratique la signature du propriétaire est légalisée à la municipalité, pour que les agents de contrôle puissent s'y fier."],
      ar: ["هل يجب التعريف بإمضاء توكيل السياقة؟", "نعم، عمليا يُعرَّف بإمضاء المالك بالبلدية حتى يعتمده أعوان المراقبة."] },
    { fr: ["La procuration de conduite permet-elle de vendre la voiture ?", "Non. Elle permet seulement de conduire. Pour vendre, il faut une procuration de vente spéciale (modèle à venir)."],
      ar: ["هل يسمح توكيل السياقة ببيع السيارة؟", "لا. هو يسمح بالسياقة فقط. للبيع يلزم توكيل خاص بالبيع (نموذج قادم)."] },
    { fr: ["Combien de temps est-elle valable ?", "Le temps que vous choisissez : jusqu'à une date précise, ou jusqu'à ce que vous l'annuliez par écrit."],
      ar: ["ما هي مدة صلوحيته؟", "المدة التي تختارها: إلى تاريخ محدد، أو إلى حين إلغائه كتابيا."] }
  ],
  sources: ["attt", "portail", "legislation"]
},
/* ======================================================================= 2 */
{
  slug: "attestation-de-travail", cat: "travail", rang: 2,
  titre: { fr: "Attestation de travail", ar: "شهادة عمل" },
  court: { fr: "L'employeur atteste qu'une personne travaille (ou a travaillé) chez lui.", ar: "يشهد المؤجر أن شخصا يعمل (أو عمل) لديه." },
  bref: { fr: "Document signé par l'employeur (avec son cachet) qui atteste l'emploi d'un salarié : banque, consulat, location, dossier administratif.",
          ar: "وثيقة يمضيها المؤجر (مع ختمه) تثبت تشغيل أجير: للبنك أو القنصلية أو الكراء أو ملف إداري." },
  legal: { legalisation: "parfois", enregistrement: "non",
           cout: { fr: "Gratuit.", ar: "مجانية." }, delai: { fr: "Aucun ; certains organismes veulent une attestation de moins de 3 mois.", ar: "لا يوجد؛ بعض الجهات تطلب شهادة لا يتجاوز تاريخها 3 أشهر." } },
  champs: [
    groupe("L'employeur", "المؤجر"),
    c("e_nom", "Nom de l'entreprise ou de l'employeur", "اسم المؤسسة أو المؤجر", ["Société Al Amal SARL", "شركة الأمل ش.ذ.م.م"]),
    c("e_mf", "Matricule fiscal", "المعرف الجبائي", "1234567/A/M/000", { opt: true }),
    adresse("e_adresse", ["Zone industrielle, Ben Arous", "المنطقة الصناعية، بن عروس"]),
    nom("r_nom", ["Leila Mansour", "ليلى منصور"]),
    choix("r_qualite", "Qualité du signataire", "صفة الممضي", [
      { v: "gerant", fr: "gérant(e)", ar: "مسير(ة)" }, { v: "dg", fr: "directeur(trice) général(e)", ar: "مدير(ة) عام(ة)" },
      { v: "drh", fr: "directeur(trice) des ressources humaines", ar: "مدير(ة) الموارد البشرية" },
      { v: "pdg", fr: "président(e)-directeur(trice) général(e)", ar: "رئيس(ة) مدير(ة) عام(ة)" }, { v: "employeur", fr: "employeur", ar: "مؤجر" }]),
    groupe("Le salarié", "الأجير"), nom("s_nom"), cin("s_cin"),
    c("s_poste", "Poste occupé", "الخطة", ["comptable", "محاسب"]),
    date("s_debut", "Date d'embauche", "تاريخ الانتداب", { ex: "2020-03-01" }),
    choix("statut", "Situation", "الوضعية", [{ v: "poste", fr: "toujours en poste", ar: "مازال يعمل" }, { v: "parti", fr: "a quitté l'entreprise", ar: "غادر المؤسسة" }]),
    date("s_fin", "Date de départ", "تاريخ المغادرة", { si: ["statut", "parti"], ex: "2026-06-30" }),
    ...fin()
  ],
  fr: v => `<p class="d-entete">${v("e_nom")}${v.has("e_mf") ? `<br>Matricule fiscal : ${v("e_mf")}` : ""}<br>${v("e_adresse")}</p>
<h1 class="d-titre">ATTESTATION DE TRAVAIL</h1>
<p>Je soussigné(e), ${v("r_nom")}, agissant en qualité de ${v("r_qualite")} de ${v("e_nom")}, dont le siège est situé à ${v("e_adresse")},</p>
<p>atteste que M. / Mme ${v("s_nom")}, titulaire de la carte d'identité nationale n° ${v("s_cin")}, ${v.is("statut", "parti")
    ? `a été employé(e) au sein de notre entreprise du ${v("s_debut")} au ${v("s_fin")} en qualité de ${v("s_poste")}.`
    : `est employé(e) au sein de notre entreprise depuis le ${v("s_debut")} en qualité de ${v("s_poste")}.`}</p>
<p>La présente attestation est délivrée à l'intéressé(e), à sa demande, pour servir et valoir ce que de droit.</p>
${faitFR(v)}${signe("L'employeur<br><small>signature et cachet</small>")}`,
  ar: v => `<p class="d-entete">${v("e_nom")}${v.has("e_mf") ? `<br>المعرف الجبائي: ${v("e_mf")}` : ""}<br>${v("e_adresse")}</p>
<h1 class="d-titre">شهادة عمل</h1>
<p>أنا الممضي(ة) أسفله ${v("r_nom")}، بصفتي ${v("r_qualite")} لـ${v("e_nom")}، الكائن مقرها بـ${v("e_adresse")}،</p>
<p>أشهد أن السيد(ة) ${v("s_nom")}، صاحب(ة) بطاقة التعريف الوطنية عدد ${v("s_cin")}، ${v.is("statut", "parti")
    ? `قد عمل(ت) بمؤسستنا من ${v("s_debut")} إلى ${v("s_fin")} بخطة ${v("s_poste")}.`
    : `يعمل (تعمل) بمؤسستنا منذ ${v("s_debut")} بخطة ${v("s_poste")}.`}</p>
<p>سُلّمت هذه الشهادة للمعني(ة) بالأمر بطلب منه(ا) للإدلاء بها عند الاقتضاء.</p>
${faitAR(v)}${signe("المؤجر<br><small>الإمضاء والختم</small>")}`,
  etapes: [ETAPE_REMPLIR,
    { ic: "signer", fr: ["Signature et cachet de l'employeur", "Le gérant ou le responsable RH signe et appose le cachet de l'entreprise."], ar: ["إمضاء المؤجر وختمه", "يمضي المسير أو مسؤول الموارد البشرية ويضع ختم المؤسسة."] },
    { ic: "municipalite", fr: ["Légalisation si on vous la demande", "Certains organismes (consulats, banques) exigent la légalisation de la signature de l'employeur à la municipalité."], ar: ["التعريف بالإمضاء إذا طُلب منك", "بعض الجهات (القنصليات، البنوك) تشترط التعريف بإمضاء المؤجر بالبلدية."] },
    { ic: "remettre", fr: ["Remettre à l'organisme", "Gardez une copie."], ar: ["تسليمها للجهة المعنية", "احتفظ بنسخة."] }],
  pieces: { fr: ["Aucune pièce pour la rédiger", "Pour une légalisation : CIN originale du signataire"], ar: ["لا وثائق لتحريرها", "للتعريف بالإمضاء: بطاقة التعريف الأصلية للممضي"] },
  ou: { fr: ["Service du personnel ou direction de l'entreprise", LEG_OU.fr + " (si demandé)"], ar: ["مصلحة الأعوان أو إدارة المؤسسة", LEG_OU.ar + " (عند الطلب)"] },
  pieges: { fr: ["L'employeur ne peut pas être remplacé par le salarié : seul l'employeur (ou son représentant) signe.", "Pour justifier de vos salaires déclarés, c'est la CNSS qui délivre l'attestation officielle (en ligne)."],
            ar: ["لا يمكن للأجير أن يمضي مكان المؤجر: المؤجر (أو من يمثله) وحده يمضي.", "لإثبات الأجور المصرح بها، الصندوق الوطني للضمان الاجتماعي هو من يسلم الشهادة الرسمية (عن بعد)."] },
  averifier: { fr: [], ar: [] },
  faq: [
    { fr: ["Qui signe l'attestation de travail ?", "L'employeur ou son représentant (gérant, directeur, responsable RH), avec le cachet de l'entreprise."], ar: ["من يمضي شهادة العمل؟", "المؤجر أو من يمثله (المسير، المدير، مسؤول الموارد البشرية)، مع ختم المؤسسة."] },
    { fr: ["L'employeur peut-il refuser ?", "L'attestation est un document courant. En cas de difficulté, adressez-vous à l'inspection du travail de votre région."], ar: ["هل يمكن للمؤجر أن يرفض؟", "شهادة العمل وثيقة عادية. في حالة صعوبة، اتصل بتفقدية الشغل بجهتك."] },
    { fr: ["Quelle différence avec l'attestation de salaire ?", "L'attestation de travail prouve l'emploi ; l'attestation de salaire indique en plus la rémunération."], ar: ["ما الفرق مع شهادة الأجر؟", "شهادة العمل تثبت التشغيل؛ أما شهادة الأجر فتذكر أيضا مبلغ الأجر."] }
  ],
  sources: ["social", "cnss", "legislation"]
},
/* ======================================================================= 3 */
{
  slug: "demande-de-conge", cat: "travail", rang: 3,
  titre: { fr: "Demande de congé", ar: "مطلب عطلة" },
  court: { fr: "Demander un congé annuel, exceptionnel ou sans solde.", ar: "طلب عطلة سنوية أو استثنائية أو دون أجر." },
  bref: { fr: "Lettre adressée à votre employeur pour demander un congé à des dates précises. Remettez-la contre une copie signée (décharge).",
          ar: "رسالة توجهها إلى مؤجرك لطلب عطلة في تواريخ محددة. سلّمها مقابل نسخة ممضاة (وصل استلام)." },
  legal: { legalisation: "non", enregistrement: "non", cout: { fr: "Gratuit.", ar: "مجاني." },
           delai: { fr: "Déposez-la assez tôt, selon le règlement de votre employeur.", ar: "قدّمه مبكرا، حسب تراتيب مؤجرك." } },
  champs: [
    groupe("Vous", "أنت"), nom("nom"), c("poste", "Poste / fonction", "الخطة / الوظيفة", ["technicien", "تقني"]),
    c("matricule", "Matricule", "المعرف (رقم التسجيل)", "4521", { opt: true }), c("service", "Service", "المصلحة", ["Service maintenance", "مصلحة الصيانة"], { opt: true }),
    groupe("Votre employeur", "المؤجر"), choix("dest", "Destinataire", "المرسل إليه", DEST),
    c("etab", "Entreprise ou établissement", "المؤسسة", ["Société Al Amal", "شركة الأمل"]),
    groupe("Le congé", "العطلة"),
    choix("type", "Type de congé", "نوع العطلة", [{ v: "annuel", fr: "annuel", ar: "سنوية" }, { v: "exceptionnel", fr: "exceptionnel", ar: "استثنائية" }, { v: "sans", fr: "sans solde", ar: "دون أجر" }]),
    date("debut", "Premier jour", "أول يوم", { ex: "2026-11-02" }), date("fin", "Dernier jour", "آخر يوم", { ex: "2026-11-13" }),
    c("motif", "Motif", "السبب", ["raisons familiales", "أسباب عائلية"], { opt: true }),
    ...fin()
  ],
  fr: v => `${expediteur(v, [v("nom"), v("poste"), v.has("matricule") && "Matricule : " + v("matricule"), v.has("service") && v("service")])}
<p class="d-dest">À ${v("dest")}<br>${v("etab")}</p><p class="d-lieu-date">${v("lieu")}, le ${v("date")}</p>
<p class="d-objet"><b>Objet :</b> demande de congé ${v("type")}</p>
<p>${v("dest")},</p>
<p>J'ai l'honneur de vous demander de bien vouloir m'accorder un congé ${v("type")} du ${v("debut")} au ${v("fin")} inclus${v.has("motif") ? `, pour le motif suivant : ${v("motif")}` : ""}.</p>
${salutFR(v("dest"))}${signe("Signature", "Avis du responsable<br><small>☐ accordé&nbsp;&nbsp; ☐ refusé</small>")}`,
  ar: v => `${expediteur(v, [v("nom"), v("poste"), v.has("matricule") && "المعرف: " + v("matricule"), v.has("service") && v("service")])}
<p class="d-dest">إلى ${v("dest")}<br>${v("etab")}</p><p class="d-lieu-date">${v("lieu")} في ${v("date")}</p>
<p class="d-objet"><b>الموضوع:</b> مطلب عطلة ${v("type")}</p>
<p>تحية طيبة وبعد،</p>
<p>يشرفني أن أطلب منكم التفضل بمنحي عطلة ${v("type")} من ${v("debut")} إلى ${v("fin")} بدخول الغاية${v.has("motif") ? `، وذلك لـ${v("motif")}` : ""}.</p>
${salutAR}${signe("الإمضاء", "رأي المسؤول<br><small>☐ موافقة&nbsp;&nbsp; ☐ رفض</small>")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(2),
    { ic: "remettre", fr: ["Remettre contre décharge", "Donnez un exemplaire à votre employeur et faites signer ou tamponner le vôtre (date de réception)."], ar: ["التسليم مقابل وصل", "سلّم نظيرا لمؤجرك واطلب إمضاء أو ختم نظيرك (تاريخ الاستلام)."] },
    { ic: "garder", fr: ["Attendre la réponse", "Ne partez pas avant l'accord de l'employeur."], ar: ["انتظار الرد", "لا تغادر قبل موافقة المؤجر."] }],
  pieces: { fr: ["Pour un congé exceptionnel : le justificatif (acte de mariage, de naissance, de décès…)"], ar: ["بالنسبة إلى العطلة الاستثنائية: الوثيقة المؤيدة (عقد زواج، مضمون ولادة، وفاة…)"] },
  ou: { fr: ["Service du personnel / ressources humaines de votre employeur", "Secteur public : votre administration peut avoir son propre imprimé (par exemple dans l'enseignement : demandez à votre établissement)"],
        ar: ["مصلحة الأعوان / الموارد البشرية لدى مؤجرك", "القطاع العمومي: قد يكون لإدارتك مطبوع خاص (مثلا في التعليم: اسأل مؤسستك)"] },
  pieges: { fr: ["Le nombre de jours de congé dépend du Code du travail, de votre convention collective ou de votre statut : vérifiez vos droits avant de demander."],
            ar: ["عدد أيام العطلة يحدده مجلة الشغل أو الاتفاقية المشتركة أو نظامك الأساسي: تثبت من حقوقك قبل الطلب."] },
  averifier: { fr: [], ar: [] },
  faq: [
    { fr: ["Les enseignants peuvent-ils utiliser ce modèle ?", "Oui pour une lettre, mais le ministère de l'Éducation ou votre établissement peut exiger son imprimé officiel : demandez-le d'abord."], ar: ["هل يمكن للمدرسين استعمال هذا النموذج؟", "نعم كرسالة، لكن وزارة التربية أو مؤسستك قد تشترط مطبوعها الرسمي: اطلبه أولا."] },
    { fr: ["Faut-il légaliser une demande de congé ?", "Non."], ar: ["هل يجب التعريف بالإمضاء في مطلب العطلة؟", "لا."] },
    { fr: ["Comment prouver que j'ai déposé ma demande ?", "Gardez votre exemplaire signé ou tamponné par l'employeur avec la date de réception."], ar: ["كيف أثبت أنني قدمت المطلب؟", "احتفظ بنظيرك الممضى أو المختوم من المؤجر مع تاريخ الاستلام."] }
  ],
  sources: ["social", "legislation", "education"]
},
/* ======================================================================= 4 */
{
  slug: "lettre-de-demission", cat: "travail", rang: 4,
  titre: { fr: "Lettre de démission", ar: "مطلب استقالة" },
  court: { fr: "Quitter son emploi en respectant le préavis.", ar: "مغادرة العمل مع احترام أجل الإعلام المسبق." },
  bref: { fr: "Lettre par laquelle un salarié informe son employeur qu'il quitte son poste. Remettez-la contre décharge ou envoyez-la en recommandé avec accusé de réception.",
          ar: "رسالة يُعلم بها الأجير مؤجره بمغادرة عمله. سلّمها مقابل وصل أو أرسلها برسالة مضمونة الوصول مع الإعلام بالبلوغ." },
  legal: { legalisation: "non", enregistrement: "non", cout: { fr: "Gratuit (recommandé : tarif de la Poste).", ar: "مجاني (الرسالة المضمونة: تعريفة البريد)." },
           delai: { fr: "Préavis prévu par votre contrat ou votre convention collective.", ar: "أجل الإعلام المسبق المنصوص عليه بعقدك أو بالاتفاقية المشتركة." } },
  champs: [
    groupe("Vous", "أنت"), nom("nom"), adresse("adresse"), c("poste", "Poste occupé", "الخطة", ["commercial", "مكلف بالمبيعات"]),
    date("embauche", "Date d'embauche", "تاريخ الانتداب", { opt: true, ex: "2021-09-01" }),
    groupe("Votre employeur", "المؤجر"), choix("dest", "Destinataire", "المرسل إليه", DEST),
    c("etab", "Entreprise", "المؤسسة", ["Société Al Amal", "شركة الأمل"]), adresse("e_adresse", ["Zone industrielle, Ben Arous", "المنطقة الصناعية، بن عروس"]),
    groupe("Votre départ", "المغادرة"), date("dernier", "Dernier jour de travail", "آخر يوم عمل", { ex: "2026-11-05" }),
    ...fin()
  ],
  fr: v => `${expediteur(v, [v("nom"), v("adresse")])}
<p class="d-dest">À ${v("dest")}<br>${v("etab")}<br>${v("e_adresse")}</p><p class="d-lieu-date">${v("lieu")}, le ${v("date")}</p>
<p class="d-objet"><b>Objet :</b> démission</p>
<p>${v("dest")},</p>
<p>Par la présente, je vous informe de ma décision de démissionner du poste de ${v("poste")} que j'occupe au sein de ${v("etab")}${v.has("embauche") ? ` depuis le ${v("embauche")}` : ""}.</p>
<p>Conformément au préavis prévu par mon contrat de travail ou par la convention collective applicable, mon dernier jour de travail sera le ${v("dernier")}.</p>
<p>Je vous remercie de bien vouloir me remettre, à mon départ, une attestation de travail ainsi que le reçu pour solde de tout compte.</p>
${salutFR(v("dest"))}${signe("Signature")}`,
  ar: v => `${expediteur(v, [v("nom"), v("adresse")])}
<p class="d-dest">إلى ${v("dest")}<br>${v("etab")}<br>${v("e_adresse")}</p><p class="d-lieu-date">${v("lieu")} في ${v("date")}</p>
<p class="d-objet"><b>الموضوع:</b> استقالة</p>
<p>تحية طيبة وبعد،</p>
<p>أتشرف بإعلامكم بقراري الاستقالة من خطة ${v("poste")} التي أشغلها بـ${v("etab")}${v.has("embauche") ? ` منذ ${v("embauche")}` : ""}.</p>
<p>وطبقا لأجل الإعلام المسبق المنصوص عليه بعقد الشغل أو بالاتفاقية المشتركة المنطبقة، سيكون آخر يوم عمل لي ${v("dernier")}.</p>
<p>وأرجو منكم تسليمي عند المغادرة شهادة عمل ووصل تصفية كل الحسابات.</p>
${salutAR}${signe("الإمضاء")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(2),
    { ic: "poste", fr: ["Remettre ou envoyer", "En main propre contre décharge (copie datée et signée), ou en recommandé avec accusé de réception à la Poste."], ar: ["التسليم أو الإرسال", "مباشرة مقابل وصل (نسخة مؤرخة وممضاة)، أو برسالة مضمونة الوصول مع الإعلام بالبلوغ عبر البريد."] },
    { ic: "garder", fr: ["Effectuer le préavis puis récupérer vos documents", "Attestation de travail et reçu pour solde de tout compte."], ar: ["قضاء أجل الإعلام ثم تسلم وثائقك", "شهادة العمل ووصل تصفية كل الحسابات."] }],
  pieces: { fr: ["Aucune"], ar: ["لا شيء"] },
  ou: { fr: ["Direction ou service du personnel de l'employeur", "Bureau de poste (envoi recommandé avec accusé de réception)"], ar: ["إدارة المؤسسة أو مصلحة الأعوان", "مكتب البريد (رسالة مضمونة الوصول مع الإعلام بالبلوغ)"] },
  pieges: { fr: ["Gardez la preuve de la date de remise : c'est elle qui fait partir le préavis.", "La durée du préavis n'est pas la même pour tous : lisez votre contrat et votre convention collective."],
            ar: ["احتفظ بما يثبت تاريخ التسليم: منه يبدأ احتساب أجل الإعلام.", "مدة الإعلام المسبق ليست نفسها للجميع: اقرأ عقدك والاتفاقية المشتركة."] },
  averifier: { fr: ["Durée exacte du préavis applicable à votre situation (contrat, convention collective, Code du travail modifié en 2025)."], ar: ["المدة الدقيقة لأجل الإعلام المنطبقة على وضعيتك (العقد، الاتفاقية المشتركة، مجلة الشغل المنقحة في 2025)."] },
  faq: [
    { fr: ["Dois-je donner un motif ?", "Non, une démission n'a pas besoin d'être motivée."], ar: ["هل يجب ذكر السبب؟", "لا، الاستقالة لا تحتاج إلى تعليل."] },
    { fr: ["Quelle est la durée du préavis ?", "Celle prévue par votre contrat ou la convention collective de votre secteur. Vérifiez-la avant d'indiquer votre dernier jour."], ar: ["ما هي مدة الإعلام المسبق؟", "المدة المنصوص عليها بعقدك أو بالاتفاقية المشتركة لقطاعك. تثبت منها قبل تحديد آخر يوم عمل."] },
    { fr: ["Comment envoyer la lettre ?", "En main propre contre décharge ou en recommandé avec accusé de réception."], ar: ["كيف أرسل الرسالة؟", "مباشرة مقابل وصل أو برسالة مضمونة الوصول مع الإعلام بالبلوغ."] }
  ],
  sources: ["social", "legislation"]
},
/* ======================================================================= 5 */
{
  slug: "demande-d-emploi", cat: "travail", rang: 5,
  titre: { fr: "Demande d'emploi", ar: "مطلب شغل" },
  court: { fr: "Lettre de candidature à une entreprise ou une administration.", ar: "رسالة ترشح لمؤسسة أو إدارة." },
  bref: { fr: "Lettre courte qui accompagne votre CV pour demander un emploi. À envoyer ou déposer avec vos diplômes.",
          ar: "رسالة قصيرة ترافق سيرتك الذاتية لطلب شغل. تُرسل أو تُودع مع شهائدك." },
  legal: { legalisation: "non", enregistrement: "non", cout: { fr: "Gratuit.", ar: "مجاني." }, delai: { fr: "Selon l'offre d'emploi.", ar: "حسب عرض الشغل." } },
  champs: [
    groupe("Vous", "أنت"), nom("nom"), adresse("adresse"), c("tel", "Téléphone", "الهاتف", "20 123 456", { mode: "tel" }),
    c("email", "E-mail", "البريد الإلكتروني", "nom@exemple.tn", { opt: true, mode: "email" }),
    groupe("Le poste", "الخطة"), c("org", "Entreprise ou administration", "المؤسسة أو الإدارة", ["Société Al Amal", "شركة الأمل"]),
    c("poste", "Poste demandé", "الخطة المطلوبة", ["technicien en informatique", "تقني في الإعلامية"]),
    c("diplome", "Diplôme", "الشهادة العلمية", ["une licence en informatique", "إجازة في الإعلامية"]),
    c("experience", "Expérience (une phrase)", "الخبرة (جملة واحدة)", ["deux ans de stage en maintenance", "سنتان من التربص في الصيانة"], { opt: true }),
    ...fin()
  ],
  fr: v => `${expediteur(v, [v("nom"), v("adresse"), "Tél. : " + v("tel"), v.has("email") && v("email")])}
<p class="d-dest">À l'attention de la direction<br>${v("org")}</p><p class="d-lieu-date">${v("lieu")}, le ${v("date")}</p>
<p class="d-objet"><b>Objet :</b> demande d'emploi — poste de ${v("poste")}</p>
<p>Madame, Monsieur,</p>
<p>J'ai l'honneur de solliciter un emploi au poste de ${v("poste")} au sein de ${v("org")}.</p>
<p>Titulaire de ${v("diplome")}, je souhaite mettre mes compétences au service de votre établissement.${v.has("experience") ? ` Expérience : ${v("experience")}.` : ""}</p>
<p>Vous trouverez ci-joint mon curriculum vitae et une copie de mes diplômes. Je reste à votre disposition pour un entretien.</p>
${salutFR("Madame, Monsieur")}${signe("Signature")}`,
  ar: v => `${expediteur(v, [v("nom"), v("adresse"), "الهاتف: " + v("tel"), v.has("email") && v("email")])}
<p class="d-dest">إلى السيد(ة) المدير(ة)<br>${v("org")}</p><p class="d-lieu-date">${v("lieu")} في ${v("date")}</p>
<p class="d-objet"><b>الموضوع:</b> مطلب شغل بخطة ${v("poste")}</p>
<p>تحية طيبة وبعد،</p>
<p>يشرفني أن أتقدم إليكم بمطلبي هذا قصد الحصول على شغل بخطة ${v("poste")} بـ${v("org")}.</p>
<p>وأنا متحصل(ة) على ${v("diplome")}، وأرغب في وضع كفاءاتي على ذمة مؤسستكم.${v.has("experience") ? ` الخبرة: ${v("experience")}.` : ""}</p>
<p>تجدون صحبة هذا سيرتي الذاتية ونسخة من شهائدي، وأبقى على ذمتكم لإجراء مقابلة.</p>
<p>وفي انتظار ردكم الإيجابي، تقبلوا مني فائق عبارات الاحترام والتقدير.</p>${signe("الإمضاء")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(0),
    { ic: "remettre", fr: ["Joindre le dossier", "CV, copie de la CIN et des diplômes, puis envoyer ou déposer contre décharge."], ar: ["إرفاق الملف", "السيرة الذاتية، نسخة من بطاقة التعريف والشهائد، ثم الإرسال أو الإيداع مقابل وصل."] },
    { ic: "verifier", fr: ["S'inscrire au bureau de l'emploi", "L'inscription à l'ANETI donne accès aux offres et aux programmes d'emploi."], ar: ["التسجيل بمكتب التشغيل", "التسجيل لدى الوكالة الوطنية للتشغيل والعمل المستقل يتيح عروض الشغل وبرامج التشغيل."] }],
  pieces: { fr: ["CV à jour", "Copie de la CIN", "Copies des diplômes et attestations de stage"], ar: ["سيرة ذاتية محينة", "نسخة من بطاقة التعريف", "نسخ من الشهائد وشهائد التربص"] },
  ou: { fr: ["Service du personnel de l'entreprise visée", "Bureau de l'emploi et du travail indépendant (ANETI) le plus proche"], ar: ["مصلحة الأعوان بالمؤسسة المعنية", "أقرب مكتب للتشغيل والعمل المستقل"] },
  pieges: { fr: ["Pour un concours de la fonction publique, suivez l'avis officiel du concours : il a ses propres formulaires et délais."], ar: ["بالنسبة إلى مناظرات الوظيفة العمومية، اتبع بلاغ المناظرة الرسمي: له مطبوعاته وآجاله الخاصة."] },
  averifier: { fr: [], ar: [] },
  faq: [
    { fr: ["Faut-il écrire la demande d'emploi en arabe ou en français ?", "Les deux sont acceptés. Pour une administration, l'arabe est souvent préféré ; ce site fait les deux."], ar: ["هل يُكتب مطلب الشغل بالعربية أم بالفرنسية؟", "كلاهما مقبول. بالنسبة إلى الإدارة تُفضّل العربية غالبا؛ هذا الموقع يوفر اللغتين."] },
    { fr: ["Faut-il légaliser la demande ?", "Non."], ar: ["هل يجب التعريف بالإمضاء؟", "لا."] }
  ],
  sources: ["aneti", "portail"]
},
/* ======================================================================= 6 */
{
  slug: "autorisation-de-voyage-mineur", cat: "famille", rang: 6,
  titre: { fr: "Autorisation parentale de voyage d'un mineur", ar: "ترخيص أبوي في سفر قاصر" },
  court: { fr: "Autoriser un enfant mineur à voyager seul ou accompagné.", ar: "الترخيص لطفل قاصر في السفر بمفرده أو مرفوقا." },
  bref: { fr: "Le père, la mère ou le tuteur autorise un enfant mineur à voyager. Depuis la loi organique n° 2015-46 du 23 novembre 2015, la mère peut aussi donner cette autorisation. Signature légalisée à la municipalité.",
          ar: "يرخص الأب أو الأم أو الولي لطفل قاصر في السفر. منذ القانون الأساسي عدد 46 لسنة 2015 المؤرخ في 23 نوفمبر 2015، يمكن للأم أيضا منح هذا الترخيص. يُعرَّف بالإمضاء بالبلدية." },
  legal: { legalisation: "oui", enregistrement: "non", cout: { fr: "Modèle gratuit. Frais de légalisation éventuels : à vérifier à la municipalité.", ar: "النموذج مجاني. معاليم التعريف بالإمضاء إن وجدت: يُتثبت منها بالبلدية." },
           delai: { fr: "À préparer avant le voyage ; indiquez les dates.", ar: "يُعدّ قبل السفر مع ذكر التواريخ." } },
  champs: [
    groupe("Le parent ou tuteur", "الولي"), nom("p_nom"), choix("p_qualite", "Vous êtes", "صفتك", QUALITE_PARENT), cin("p_cin"), adresse("p_adresse"),
    groupe("L'enfant", "الطفل"), nom("e_nom", ["Yasmine Ben Salah", "ياسمين بن صالح"]), date("e_naissance", "Date de naissance", "تاريخ الولادة", { ex: "2014-04-12" }),
    c("e_doc", "N° de passeport de l'enfant", "عدد جواز سفر الطفل", "N1234567", { opt: true }),
    groupe("Le voyage", "السفر"),
    choix("accomp", "L'enfant voyage", "يسافر الطفل", [{ v: "seul", fr: "seul", ar: "بمفرده" }, { v: "avec", fr: "accompagné d'une personne", ar: "مرفوقا بشخص" }]),
    c("a_nom", "Nom et prénom de l'accompagnateur", "اسم المرافق ولقبه", ["Sonia Gharbi", "سنية الغربي"], { si: ["accomp", "avec"] }),
    c("a_doc", "N° de CIN ou de passeport de l'accompagnateur", "عدد بطاقة التعريف أو جواز سفر المرافق", "07654321", { opt: true, si: ["accomp", "avec"] }),
    c("destination", "Destination", "الوجهة", ["Paris (France)", "باريس (فرنسا)"]),
    date("depart", "Date de départ", "تاريخ الذهاب", { ex: "2026-12-20" }), date("retour", "Date de retour", "تاريخ العودة", { opt: true, ex: "2027-01-03" }),
    ...fin()
  ],
  fr: v => `<h1 class="d-titre">AUTORISATION PARENTALE DE VOYAGE</h1>
<p>Je soussigné(e), ${idFR(v, "p_")}, agissant en qualité de ${v("p_qualite")} de l'enfant mineur désigné ci-dessous,</p>
<p>autorise l'enfant ${v("e_nom")}, né(e) le ${v("e_naissance")}${v.has("e_doc") ? `, titulaire du passeport n° ${v("e_doc")}` : ""},</p>
<p>à voyager ${v.is("accomp", "avec") ? `accompagné(e) de ${v("a_nom")}${v.has("a_doc") ? `, titulaire de la pièce d'identité n° ${v("a_doc")}` : ""},` : "seul(e),"} à destination de ${v("destination")}, avec un départ le ${v("depart")}${v.has("retour") ? ` et un retour prévu le ${v("retour")}` : ""}.</p>
<p>La présente autorisation est établie pour servir et valoir ce que de droit.</p>
${faitFR(v)}${signe("Signature du parent ou tuteur<br><small>signature légalisée</small>")}`,
  ar: v => `<h1 class="d-titre">ترخيص أبوي في السفر</h1>
<p>أنا الممضي(ة) أسفله ${idAR(v, "p_")}، بصفتي ${v("p_qualite")} للطفل(ة) القاصر المذكور(ة) أسفله،</p>
<p>أرخص للطفل(ة) ${v("e_nom")}، المولود(ة) في ${v("e_naissance")}${v.has("e_doc") ? `، صاحب(ة) جواز السفر عدد ${v("e_doc")}` : ""}،</p>
<p>في السفر ${v.is("accomp", "avec") ? `مرفوقا(ة) بـ${v("a_nom")}${v.has("a_doc") ? `، صاحب(ة) وثيقة الهوية عدد ${v("a_doc")}` : ""}،` : "بمفرده (بمفردها)،"} إلى ${v("destination")}، على أن يكون الذهاب يوم ${v("depart")}${v.has("retour") ? ` والعودة يوم ${v("retour")}` : ""}.</p>
<p>وسُلّم هذا الترخيص للإدلاء به عند الاقتضاء.</p>
${faitAR(v)}${signe("إمضاء الولي<br><small>معرف به</small>")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(2), ETAPE_LEGAL,
    { ic: "remettre", fr: ["Le jour du départ", "L'enfant (ou l'accompagnateur) présente l'original légalisé avec son passeport à la police des frontières."], ar: ["يوم السفر", "يقدم الطفل (أو المرافق) الأصل المعرف بإمضائه مع جواز السفر لشرطة الحدود."] }],
  pieces: { fr: ["CIN originale du parent ou tuteur (légalisation)", "Passeport de l'enfant", "Pièce prouvant le lien de parenté ou la tutelle (extrait de naissance, jugement) : souvent demandée"],
            ar: ["بطاقة التعريف الأصلية للولي (للتعريف بالإمضاء)", "جواز سفر الطفل", "وثيقة تثبت القرابة أو الولاية (مضمون ولادة، حكم): تُطلب غالبا"] },
  ou: { fr: [LEG_OU.fr, "Police des frontières (aéroport, port, frontière terrestre) le jour du voyage"], ar: [LEG_OU.ar, "شرطة الحدود (المطار، الميناء، المعبر البري) يوم السفر"] },
  pieges: { fr: ["Le pays de destination peut avoir ses propres exigences (visa, autorisation de sortie) : vérifiez auprès de son consulat.", "Indiquez les vraies dates : une autorisation sans dates claires peut être refusée."],
            ar: ["قد تكون لبلد الوجهة شروطه الخاصة (تأشيرة، ترخيص): تثبت لدى قنصليته.", "اذكر التواريخ الحقيقية: قد يُرفض ترخيص دون تواريخ واضحة."] },
  averifier: { fr: ["Liste exacte des pièces demandées par la police des frontières selon la situation (voyage seul, avec un tiers, parents séparés)."], ar: ["القائمة الدقيقة للوثائق التي تطلبها شرطة الحدود حسب الوضعية (سفر بمفرده، مع شخص آخر، والدان منفصلان)."] },
  faq: [
    { fr: ["La mère peut-elle signer seule l'autorisation de voyage ?", "Oui. Depuis la loi organique n° 2015-46 du 23 novembre 2015, la mère comme le père (ou le tuteur) peut autoriser le voyage d'un enfant mineur."],
      ar: ["هل يمكن للأم وحدها إمضاء ترخيص السفر؟", "نعم. منذ القانون الأساسي عدد 46 لسنة 2015 المؤرخ في 23 نوفمبر 2015، يمكن للأم كما للأب (أو الولي) الترخيص في سفر الطفل القاصر."] },
    { fr: ["Faut-il légaliser l'autorisation ?", "Oui, la signature du parent est légalisée à la municipalité."], ar: ["هل يجب التعريف بالإمضاء؟", "نعم، يُعرَّف بإمضاء الولي بالبلدية."] },
    { fr: ["Et pour faire le passeport de l'enfant ?", "C'est une autre autorisation, déposée avec la demande de passeport : renseignez-vous au poste de police ou à la municipalité de votre lieu de résidence."], ar: ["وماذا عن استخراج جواز سفر الطفل؟", "هو ترخيص آخر يُقدم مع مطلب جواز السفر: استفسر بمركز الأمن أو بالبلدية بمكان إقامتك."] }
  ],
  sources: ["interieur", "legislation", "portail"]
},
/* ======================================================================= 7 */
{
  slug: "declaration-sur-l-honneur", cat: "famille", rang: 7,
  titre: { fr: "Déclaration sur l'honneur", ar: "تصريح على الشرف" },
  court: { fr: "Déclarer un fait (par exemple ne pas travailler) pour un dossier.", ar: "التصريح بأمر (مثلا عدم الشغل) لملف إداري." },
  bref: { fr: "Vous déclarez par écrit qu'un fait est vrai : non-emploi (souvent demandé par la CNSS), situation familiale, etc. La signature est souvent légalisée.",
          ar: "تصرح كتابيا بصحة أمر: عدم الشغل (يطلبه غالبا الصندوق الوطني للضمان الاجتماعي)، الوضعية العائلية، إلخ. يُعرَّف بالإمضاء غالبا." },
  legal: { legalisation: "parfois", enregistrement: "non", cout: { fr: "Modèle gratuit. Légalisation éventuelle : à vérifier à la municipalité.", ar: "النموذج مجاني. التعريف بالإمضاء إن طُلب: يُتثبت من معاليمه بالبلدية." },
           delai: { fr: "Selon l'organisme qui la demande.", ar: "حسب الجهة الطالبة." } },
  champs: [
    groupe("Vous", "أنت"), nom("nom"), cin("cin"), date("naissance", "Date de naissance", "تاريخ الولادة", { opt: true, ex: "1990-05-17" }), adresse("adresse"),
    groupe("Ce que vous déclarez", "موضوع التصريح"),
    choix("objet", "Objet", "الموضوع", [{ v: "nonemploi", fr: "ne pas travailler (non-emploi)", ar: "عدم الشغل" }, { v: "libre", fr: "autre (texte libre)", ar: "آخر (نص حر)" }]),
    c("texte", "Votre déclaration", "نص التصريح", ["être célibataire à ce jour", "أنني أعزب إلى تاريخ اليوم"], { type: "textarea", si: ["objet", "libre"] }),
    c("pour", "Pour être présentée à", "لتقديمه إلى", ["la CNSS", "الصندوق الوطني للضمان الاجتماعي"], { opt: true }),
    ...fin()
  ],
  fr: v => `<h1 class="d-titre">DÉCLARATION SUR L'HONNEUR</h1>
<p>Je soussigné(e), ${v("nom")}${v.has("naissance") ? `, né(e) le ${v("naissance")}` : ""}, titulaire de la carte d'identité nationale n° ${v("cin")}, demeurant à ${v("adresse")},</p>
<p>déclare sur l'honneur ${v.is("objet", "libre") ? `: ${v("texte")}.` : "ne pas exercer d'activité professionnelle, salariée ou non salariée, et ne percevoir aucun salaire à la date de la présente déclaration."}</p>
${v.has("pour") ? `<p>La présente déclaration est établie pour être présentée à ${v("pour")}.</p>` : ""}
<p>Je suis informé(e) que toute fausse déclaration engage ma responsabilité.</p>
${faitFR(v)}${signe("Signature")}`,
  ar: v => `<h1 class="d-titre">تصريح على الشرف</h1>
<p>أنا الممضي(ة) أسفله ${v("nom")}${v.has("naissance") ? `، المولود(ة) في ${v("naissance")}` : ""}، صاحب(ة) بطاقة التعريف الوطنية عدد ${v("cin")}، القاطن(ة) بـ${v("adresse")}،</p>
<p>أصرح على شرفي ${v.is("objet", "libre") ? `بما يلي: ${v("texte")}.` : "أنني لا أمارس أي نشاط مهني، بأجر أو لحسابي الخاص، ولا أتقاضى أي أجر في تاريخ هذا التصريح."}</p>
${v.has("pour") ? `<p>وقد حُرّر هذا التصريح لتقديمه إلى ${v("pour")}.</p>` : ""}
<p>وأنا على علم بأن كل تصريح مغلوط يُحمّلني المسؤولية.</p>
${faitAR(v)}${signe("الإمضاء")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(0),
    { ic: "municipalite", fr: ["Légaliser si l'organisme le demande", "À la municipalité, avec votre CIN originale. Vous signez devant l'agent."], ar: ["التعريف بالإمضاء إذا طلبته الجهة", "بالبلدية، مع بطاقة التعريف الأصلية. تمضي أمام العون."] },
    { ic: "remettre", fr: ["Déposer au dossier", "Gardez une copie."], ar: ["إيداعه بالملف", "احتفظ بنسخة."] }],
  pieces: { fr: ["CIN originale (pour la légalisation)"], ar: ["بطاقة التعريف الأصلية (للتعريف بالإمضاء)"] },
  ou: { fr: [LEG_OU.fr, "L'organisme qui demande la déclaration (CNSS, administration, banque…)"], ar: [LEG_OU.ar, "الجهة الطالبة للتصريح (الضمان الاجتماعي، إدارة، بنك…)"] },
  pieges: { fr: ["Certains organismes ont leur propre imprimé de déclaration : demandez-le d'abord.", "N'écrivez que des faits exacts : une fausse déclaration peut être sanctionnée."],
            ar: ["لبعض الجهات مطبوع خاص للتصريح: اطلبه أولا.", "لا تكتب إلا أمورا صحيحة: التصريح المغلوط قد يُعاقب عليه."] },
  averifier: { fr: ["Imprimé éventuellement exigé par la CNSS pour la déclaration de non-emploi."], ar: ["المطبوع الذي قد يشترطه الصندوق الوطني للضمان الاجتماعي للتصريح بعدم الشغل."] },
  faq: [
    { fr: ["Faut-il légaliser une déclaration sur l'honneur ?", "Souvent oui : beaucoup d'organismes demandent la légalisation de la signature à la municipalité. Demandez à l'organisme destinataire."], ar: ["هل يجب التعريف بإمضاء التصريح على الشرف؟", "غالبا نعم: تطلب جهات كثيرة التعريف بالإمضاء بالبلدية. اسأل الجهة المعنية."] },
    { fr: ["Qu'est-ce que la déclaration de non-emploi (تصريح على الشرف بعدم الشغل) ?", "Une déclaration par laquelle vous affirmez ne pas travailler, souvent demandée pour des prestations sociales."], ar: ["ما هو التصريح على الشرف بعدم الشغل؟", "تصريح تؤكد فيه أنك لا تعمل، يُطلب غالبا للحصول على منافع اجتماعية."] }
  ],
  sources: ["cnss", "portail", "legislation"]
},
/* ======================================================================= 8 */
{
  slug: "demande-de-transfert-eleve", cat: "administration", rang: 8,
  titre: { fr: "Demande de transfert d'un élève", ar: "مطلب نقلة تلميذ" },
  court: { fr: "Changer d'école, de collège ou de lycée.", ar: "تغيير المدرسة أو المدرسة الإعدادية أو المعهد." },
  bref: { fr: "Lettre du parent au commissaire régional de l'éducation pour faire passer l'élève dans un autre établissement, avec un justificatif.",
          ar: "رسالة من الولي إلى المندوب الجهوي للتربية لنقل التلميذ إلى مؤسسة أخرى، مع وثيقة مؤيدة." },
  legal: { legalisation: "non", enregistrement: "non", cout: { fr: "Gratuit.", ar: "مجاني." },
           delai: { fr: "Période fixée chaque année par le ministère (souvent en été) : à vérifier.", ar: "فترة تحددها الوزارة كل سنة (غالبا في الصيف): يُتثبت منها." } },
  champs: [
    groupe("Le parent ou tuteur", "الولي"), nom("p_nom"), choix("p_qualite", "Vous êtes", "صفتك", QUALITE_PARENT), cin("p_cin"), adresse("p_adresse"),
    c("tel", "Téléphone", "الهاتف", "20 123 456", { mode: "tel" }),
    groupe("L'élève", "التلميذ"), nom("e_nom", ["Youssef Ben Salah", "يوسف بن صالح"]), date("e_naissance", "Date de naissance", "تاريخ الولادة", { opt: true, ex: "2013-02-08" }),
    choix("niveau", "Niveau l'an prochain", "المستوى في السنة القادمة", NIVEAUX, { ex: "7" }),
    c("annee", "Année scolaire", "السنة الدراسية", "2026/2027"),
    c("actuel", "Établissement actuel", "المؤسسة الحالية", ["École primaire Ibn Khaldoun, Sfax", "المدرسة الابتدائية ابن خلدون، صفاقس"]),
    c("demande", "Établissement demandé", "المؤسسة المطلوبة", ["Collège Ennour, Ariana", "المدرسة الإعدادية النور، أريانة"]),
    choix("delegation", "Commissariat régional de l'éducation", "المندوبية الجهوية للتربية", DELEGATIONS),
    choix("motif", "Motif", "السبب", [{ v: "domicile", fr: "déménagement de la famille", ar: "تغيير مقر السكنى" }, { v: "travail", fr: "mutation professionnelle d'un parent", ar: "نقلة مهنية لأحد الوالدين" },
      { v: "sante", fr: "santé de l'élève", ar: "صحة التلميذ" }, { v: "autre", fr: "autre", ar: "آخر" }]),
    c("motif_txt", "Précisez le motif", "وضّح السبب", ["rapprochement familial", "الالتحاق بالعائلة"], { si: ["motif", "autre"] }),
    ...fin()
  ],
  fr: v => `${expediteur(v, [v("p_nom"), v("p_adresse"), "CIN n° " + v("p_cin"), "Tél. : " + v("tel")])}
<p class="d-dest">À Monsieur le Commissaire régional de l'éducation de ${v("delegation")}<br><small>sous couvert de Monsieur le Directeur de l'établissement : ${v("actuel")}</small></p><p class="d-lieu-date">${v("lieu")}, le ${v("date")}</p>
<p class="d-objet"><b>Objet :</b> demande de transfert d'un élève — année scolaire ${v("annee")}</p>
<p>Monsieur le Commissaire régional,</p>
<p>J'ai l'honneur, en ma qualité de ${v("p_qualite")} de l'élève ${v("e_nom")}${v.has("e_naissance") ? `, né(e) le ${v("e_naissance")}` : ""}, inscrit(e) en ${v("niveau")} pour l'année scolaire ${v("annee")} et actuellement scolarisé(e) à : ${v("actuel")}, de solliciter son transfert vers : ${v("demande")},
${v.is("motif", "domicile") ? "en raison du déménagement de la famille" : v.is("motif", "travail") ? "en raison de la mutation professionnelle de l'un des parents" : v.is("motif", "sante") ? "pour des raisons de santé de l'élève" : `pour le motif suivant : ${v("motif_txt")}`}.</p>
<p>Vous trouverez ci-joint les pièces justificatives.</p>
${salutFR("Monsieur le Commissaire régional")}${signe("Signature du parent ou tuteur")}`,
  ar: v => `${expediteur(v, [v("p_nom"), v("p_adresse"), "بطاقة التعريف عدد " + v("p_cin"), "الهاتف: " + v("tel")])}
<p class="d-dest">إلى السيد المندوب الجهوي للتربية بـ${v("delegation")}<br><small>على يد السيد مدير المؤسسة: ${v("actuel")}</small></p><p class="d-lieu-date">${v("lieu")} في ${v("date")}</p>
<p class="d-objet"><b>الموضوع:</b> مطلب نقلة تلميذ(ة) بعنوان السنة الدراسية ${v("annee")}</p>
<p>تحية طيبة وبعد،</p>
<p>يشرفني، بصفتي ${v("p_qualite")} للتلميذ(ة) ${v("e_nom")}${v.has("e_naissance") ? `، المولود(ة) في ${v("e_naissance")}` : ""}، المرسم(ة) بـ${v("niveau")} بعنوان السنة الدراسية ${v("annee")} والذي (التي) يزاول (تزاول) دراسته (ها) حاليا بـ${v("actuel")}، أن أطلب منكم التفضل بالموافقة على نقلته (نقلتها) إلى ${v("demande")}،
${v.is("motif", "domicile") ? "وذلك بسبب تغيير مقر سكنى العائلة" : v.is("motif", "travail") ? "وذلك بسبب نقلة مهنية لأحد الوالدين" : v.is("motif", "sante") ? "وذلك لأسباب صحية تخص التلميذ(ة)" : `وذلك للسبب التالي: ${v("motif_txt")}`}.</p>
<p>تجدون صحبة هذا الوثائق المؤيدة لمطلبي.</p>
${salutAR}${signe("إمضاء الولي")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(2),
    { ic: "ecole", fr: ["Déposer à l'établissement actuel", "La demande est transmise « sous couvert » du directeur au commissariat régional. Faites tamponner votre copie."], ar: ["الإيداع بالمؤسسة الحالية", "يُحال المطلب « على يد » المدير إلى المندوبية الجهوية. اطلب ختم نسختك."] },
    { ic: "verifier", fr: ["Suivre la réponse", "Le commissariat régional décide selon les places disponibles. Le ministère peut aussi ouvrir une procédure en ligne : vérifiez sur son site."], ar: ["متابعة الرد", "تقرر المندوبية الجهوية حسب الأماكن المتوفرة. قد تفتح الوزارة أيضا إجراء عن بعد: تثبت من موقعها."] }],
  pieces: { fr: ["Justificatif du motif (certificat de résidence, attestation de travail ou de mutation, certificat médical)", "Copie du bulletin de notes", "Copie de la CIN du parent"],
            ar: ["وثيقة تثبت السبب (شهادة إقامة، شهادة عمل أو قرار نقلة، شهادة طبية)", "نسخة من بطاقة الأعداد", "نسخة من بطاقة تعريف الولي"] },
  ou: { fr: ["Établissement actuel de l'élève (dépôt)", "Commissariat régional de l'éducation (décision)"], ar: ["المؤسسة الحالية للتلميذ (الإيداع)", "المندوبية الجهوية للتربية (القرار)"] },
  pieges: { fr: ["Les transferts se font surtout pendant une période fixée chaque année : déposez tôt.", "Gardez une copie tamponnée : c'est votre preuve de dépôt."], ar: ["تتم النقل أساسا خلال فترة تُحدد كل سنة: قدّم المطلب مبكرا.", "احتفظ بنسخة مختومة: هي دليل الإيداع."] },
  averifier: { fr: ["Dates d'ouverture des demandes de transfert pour l'année scolaire (communiqué du ministère).", "Existence d'une procédure en ligne pour certains niveaux."], ar: ["تواريخ فتح مطالب النقلة للسنة الدراسية (بلاغ الوزارة).", "وجود إجراء عن بعد لبعض المستويات."] },
  faq: [
    { fr: ["À qui adresser la demande de transfert ?", "Au commissaire régional de l'éducation, sous couvert du directeur de l'établissement actuel."], ar: ["إلى من يُوجه مطلب النقلة؟", "إلى المندوب الجهوي للتربية، على يد مدير المؤسسة الحالية."] },
    { fr: ["Quels justificatifs joindre ?", "Celui qui prouve le motif : certificat de résidence en cas de déménagement, attestation de mutation, certificat médical."], ar: ["ما هي الوثائق المؤيدة؟", "ما يثبت السبب: شهادة إقامة عند تغيير السكنى، قرار النقلة المهنية، شهادة طبية."] }
  ],
  sources: ["education", "portail"]
},
/* ======================================================================= 9 */
{
  slug: "reclamation-administration", cat: "administration", rang: 9,
  titre: { fr: "Réclamation à une administration", ar: "شكاية إلى إدارة" },
  court: { fr: "Signaler un problème et demander une solution par écrit.", ar: "الإبلاغ عن مشكل وطلب حل كتابيا." },
  bref: { fr: "Lettre adressée à une administration ou un service public pour signaler un problème et demander une réponse. Déposez-la au bureau d'ordre contre un numéro d'enregistrement.",
          ar: "رسالة توجه إلى إدارة أو مرفق عمومي للإبلاغ عن مشكل وطلب رد. أودعها بمكتب الضبط مقابل رقم تسجيل." },
  legal: { legalisation: "non", enregistrement: "non", cout: { fr: "Gratuit.", ar: "مجاني." }, delai: { fr: "Aucun ; gardez la preuve du dépôt.", ar: "لا يوجد؛ احتفظ بما يثبت الإيداع." } },
  champs: [
    groupe("Vous", "أنت"), nom("nom"), cin("cin"), adresse("adresse"), c("tel", "Téléphone", "الهاتف", "20 123 456", { mode: "tel" }),
    groupe("L'administration", "الإدارة"), c("org", "Administration ou service", "الإدارة أو المصلحة", ["Municipalité de l'Ariana", "بلدية أريانة"]),
    c("objet", "Objet (quelques mots)", "الموضوع (بضع كلمات)", ["retard de traitement de mon dossier", "التأخير في معالجة ملفي"]),
    c("ref", "Référence du dossier", "مرجع الملف", "2026/1458", { opt: true }),
    c("faits", "Ce qui s'est passé", "ما حدث", ["J'ai déposé ma demande le 3 juin 2026 et je n'ai reçu aucune réponse malgré deux relances.", "أودعت مطلبي يوم 3 جوان 2026 ولم أتلق أي رد رغم تذكيرين."], { type: "textarea" }),
    c("souhait", "Ce que vous demandez", "ما تطلبه", ["traiter mon dossier et m'informer de la décision.", "معالجة ملفي وإعلامي بالقرار."], { type: "textarea" }),
    ...fin()
  ],
  fr: v => `${expediteur(v, [v("nom"), v("adresse"), "CIN n° " + v("cin"), "Tél. : " + v("tel")])}
<p class="d-dest">À Madame, Monsieur le responsable<br>${v("org")}</p><p class="d-lieu-date">${v("lieu")}, le ${v("date")}</p>
<p class="d-objet"><b>Objet :</b> réclamation — ${v("objet")}${v.has("ref") ? `<br><b>Réf. :</b> ${v("ref")}` : ""}</p>
<p>Madame, Monsieur,</p>
<p>J'ai l'honneur de porter à votre connaissance la réclamation suivante :</p>
<p class="d-libre">${v("faits")}</p>
<p>En conséquence, je vous prie de bien vouloir : ${v("souhait")}</p>
<p>Je vous remercie de m'accuser réception de la présente et de me faire connaître la suite qui lui sera donnée.</p>
${salutFR("Madame, Monsieur")}${signe("Signature")}`,
  ar: v => `${expediteur(v, [v("nom"), v("adresse"), "بطاقة التعريف عدد " + v("cin"), "الهاتف: " + v("tel")])}
<p class="d-dest">إلى السيد(ة) المسؤول(ة)<br>${v("org")}</p><p class="d-lieu-date">${v("lieu")} في ${v("date")}</p>
<p class="d-objet"><b>الموضوع:</b> شكاية بخصوص ${v("objet")}${v.has("ref") ? `<br><b>المرجع:</b> ${v("ref")}` : ""}</p>
<p>تحية طيبة وبعد،</p>
<p>يشرفني أن أرفع إلى علمكم الشكاية التالية:</p>
<p class="d-libre">${v("faits")}</p>
<p>لذا، أرجو منكم التفضل بـ: ${v("souhait")}</p>
<p>كما أرجو إعلامي بتسلم هذه الشكاية وبالمآل الذي ستحظى به.</p>
${salutAR}${signe("الإمضاء")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(2),
    { ic: "remettre", fr: ["Déposer au bureau d'ordre", "Demandez le cachet avec la date et le numéro d'enregistrement sur votre copie. Sinon : recommandé avec accusé de réception."], ar: ["الإيداع بمكتب الضبط", "اطلب الختم مع التاريخ ورقم التسجيل على نسختك. وإلا: رسالة مضمونة الوصول مع الإعلام بالبلوغ."] },
    { ic: "verifier", fr: ["Relancer si pas de réponse", "Adressez-vous au bureau des relations avec le citoyen de l'administration, puis à l'autorité de tutelle."], ar: ["التذكير عند عدم الرد", "اتصل بمكتب العلاقات مع المواطن بالإدارة، ثم بسلطة الإشراف."] }],
  pieces: { fr: ["Copies des documents utiles (récépissé, courriers, factures)", "Copie de la CIN"], ar: ["نسخ من الوثائق المفيدة (وصل الإيداع، المراسلات، الفواتير)", "نسخة من بطاقة التعريف"] },
  ou: { fr: ["Bureau d'ordre de l'administration concernée", "Bureau des relations avec le citoyen"], ar: ["مكتب الضبط بالإدارة المعنية", "مكتب العلاقات مع المواطن"] },
  pieges: { fr: ["Restez factuel et poli : dates, numéros, ce que vous demandez.", "N'envoyez que des copies, jamais vos originaux."], ar: ["ابق موضوعيا ومهذبا: التواريخ، الأرقام، ما تطلبه.", "لا ترسل إلا نسخا، أبدا الأصول."] },
  averifier: { fr: [], ar: [] },
  faq: [
    { fr: ["Comment prouver que j'ai déposé ma réclamation ?", "Par le cachet du bureau d'ordre (date et numéro) sur votre copie, ou par l'accusé de réception de la Poste."], ar: ["كيف أثبت أنني أودعت الشكاية؟", "بختم مكتب الضبط (التاريخ والرقم) على نسختك، أو بالإعلام بالبلوغ من البريد."] },
    { fr: ["Peut-on déposer une réclamation en ligne ?", "Certaines administrations ont un formulaire en ligne : consultez le portail officiel du gouvernement et le site de l'administration."], ar: ["هل يمكن تقديم الشكاية عن بعد؟", "لبعض الإدارات استمارة عن بعد: راجع البوابة الرسمية للحكومة وموقع الإدارة."] }
  ],
  sources: ["portail", "legislation"]
},
/* ======================================================================= 10 */
{
  slug: "resiliation-de-bail", cat: "logement", rang: 10,
  titre: { fr: "Résiliation de bail (congé du locataire)", ar: "إعلام بفسخ عقد كراء" },
  court: { fr: "Le locataire prévient le propriétaire qu'il quitte le logement.", ar: "يُعلم المتسوغ المالك بمغادرة المحل." },
  bref: { fr: "Lettre par laquelle le locataire met fin au contrat de location en respectant le préavis prévu au contrat. Envoyez-la en recommandé avec accusé de réception ou par huissier de justice.",
          ar: "رسالة يُنهي بها المتسوغ عقد الكراء مع احترام أجل الإعلام المسبق المنصوص عليه بالعقد. أرسلها برسالة مضمونة الوصول مع الإعلام بالبلوغ أو بواسطة عدل منفذ." },
  legal: { legalisation: "non", enregistrement: "non", cout: { fr: "Recommandé : tarif de la Poste. Huissier : honoraires à demander.", ar: "الرسالة المضمونة: تعريفة البريد. العدل المنفذ: أجرة يُسأل عنها." },
           delai: { fr: "Préavis prévu par votre contrat.", ar: "أجل الإعلام المسبق المنصوص عليه بالعقد." } },
  champs: [
    groupe("Vous (le locataire)", "أنت (المتسوغ)"), nom("l_nom"), adresse("l_adresse"),
    groupe("Le propriétaire", "المالك (المسوّغ)"), nom("b_nom", ["Hédi Karoui", "الهادي القروي"]), adresse("b_adresse", ["8 rue de Rome, Tunis", "8 نهج روما، تونس"]),
    groupe("Le logement", "المحل"), c("logement", "Adresse du logement loué", "عنوان المحل المسوغ", ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"]),
    date("date_bail", "Date du contrat de location", "تاريخ عقد الكراء", { ex: "2023-09-01" }),
    date("depart", "Date de départ (fin du préavis)", "تاريخ المغادرة (نهاية أجل الإعلام)", { ex: "2026-12-31" }),
    choix("envoi", "Envoi", "طريقة الإرسال", [{ v: "rar", fr: "Lettre recommandée avec accusé de réception", ar: "رسالة مضمونة الوصول مع الإعلام بالبلوغ" }, { v: "main", fr: "Remise en main propre contre décharge", ar: "تسليم مباشر مقابل وصل" }]),
    ...fin()
  ],
  fr: v => `${expediteur(v, [v("l_nom"), v("l_adresse")])}
<p class="d-dest">À ${v("b_nom")}<br>${v("b_adresse")}</p><p class="d-lieu-date">${v("lieu")}, le ${v("date")}</p>
<p class="d-mode">${v("envoi")}</p>
<p class="d-objet"><b>Objet :</b> congé — fin du contrat de location</p>
<p>Madame, Monsieur,</p>
<p>Je soussigné(e), ${v("l_nom")}, locataire du logement situé à ${v("logement")} en vertu du contrat de location conclu le ${v("date_bail")}, vous informe par la présente de ma décision de mettre fin à ce contrat.</p>
<p>Dans le respect du délai de préavis prévu par le contrat, je libérerai le logement le ${v("depart")}.</p>
<p>Je vous propose d'établir ensemble l'état des lieux de sortie et de procéder à la remise des clés à cette date. Je vous remercie de me restituer le dépôt de garantie, déduction faite des sommes éventuellement dues et justifiées.</p>
${salutFR("Madame, Monsieur")}${signe("Signature du locataire")}`,
  ar: v => `${expediteur(v, [v("l_nom"), v("l_adresse")])}
<p class="d-dest">إلى السيد(ة) ${v("b_nom")}<br>${v("b_adresse")}</p><p class="d-lieu-date">${v("lieu")} في ${v("date")}</p>
<p class="d-mode">${v("envoi")}</p>
<p class="d-objet"><b>الموضوع:</b> إعلام بإنهاء عقد الكراء</p>
<p>تحية طيبة وبعد،</p>
<p>أنا الممضي(ة) أسفله ${v("l_nom")}، متسوغ(ة) المحل الكائن بـ${v("logement")} بمقتضى عقد الكراء المبرم في ${v("date_bail")}، أعلمكم بمقتضى هذا بقراري إنهاء العقد المذكور.</p>
<p>واحتراما لأجل الإعلام المسبق المنصوص عليه بالعقد، سأغادر المحل يوم ${v("depart")}.</p>
<p>وأقترح عليكم إجراء معاينة حالة المحل عند الخروج وتسليم المفاتيح في نفس التاريخ، كما أرجو منكم إرجاع مبلغ الضمان بعد طرح المبالغ المستحقة والمثبتة عند الاقتضاء.</p>
${salutAR}${signe("إمضاء المتسوغ")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(2),
    { ic: "poste", fr: ["Envoyer en recommandé", "Avec accusé de réception, ou faites signifier la lettre par un huissier de justice. La date de réception fait courir le préavis."], ar: ["الإرسال برسالة مضمونة", "مع الإعلام بالبلوغ، أو بواسطة عدل منفذ. تاريخ الاستلام هو بداية أجل الإعلام."] },
    { ic: "signer", fr: ["État des lieux et clés", "Le jour du départ : état des lieux signé par les deux, remise des clés contre reçu."], ar: ["معاينة الحالة والمفاتيح", "يوم المغادرة: معاينة ممضاة من الطرفين، وتسليم المفاتيح مقابل وصل."] },
    { ic: "garder", fr: ["Récupérer le dépôt de garantie", "Gardez les reçus de loyer et l'état des lieux."], ar: ["استرجاع مبلغ الضمان", "احتفظ بوصولات الكراء ومحضر المعاينة."] }],
  pieces: { fr: ["Copie du contrat de location", "Derniers reçus de loyer"], ar: ["نسخة من عقد الكراء", "آخر وصولات خلاص الكراء"] },
  ou: { fr: ["Bureau de poste (recommandé avec accusé de réception)", "Huissier de justice (si vous préférez une signification officielle)"], ar: ["مكتب البريد (رسالة مضمونة الوصول مع الإعلام بالبلوغ)", "عدل منفذ (إن أردت تبليغا رسميا)"] },
  pieges: { fr: ["Le préavis se calcule à partir de la réception de la lettre, pas de son envoi.", "Ce modèle est pour le locataire. Si vous êtes propriétaire, mettre fin à un bail obéit à des règles plus strictes : faites-vous conseiller par un avocat."],
            ar: ["يُحتسب أجل الإعلام من تاريخ استلام الرسالة لا من تاريخ إرسالها.", "هذا النموذج خاص بالمتسوغ. إن كنت مالكا، فإنهاء الكراء يخضع لقواعد أشد: استشر محاميا."] },
  averifier: { fr: ["Durée de préavis applicable si le contrat ne dit rien (Code des obligations et des contrats)."], ar: ["مدة الإعلام المسبق المنطبقة إذا سكت العقد (مجلة الالتزامات والعقود)."] },
  faq: [
    { fr: ["Quel est le préavis pour quitter un logement loué ?", "Celui écrit dans votre contrat. Si le contrat ne dit rien, renseignez-vous (Code des obligations et des contrats) avant d'envoyer la lettre."], ar: ["ما هو أجل الإعلام لمغادرة محل مسوغ؟", "المكتوب بعقدك. وإذا سكت العقد، استفسر (مجلة الالتزامات والعقود) قبل إرسال الرسالة."] },
    { fr: ["Faut-il légaliser la lettre de résiliation ?", "Non. Ce qui compte est la preuve de réception : accusé de réception ou acte d'huissier."], ar: ["هل يجب التعريف بإمضاء رسالة الفسخ؟", "لا. المهم هو إثبات الاستلام: الإعلام بالبلوغ أو محضر العدل المنفذ."] },
    { fr: ["Comment récupérer mon dépôt de garantie ?", "Faites un état des lieux de sortie signé par les deux, rendez les clés contre reçu et demandez la restitution par écrit."], ar: ["كيف أسترجع مبلغ الضمان؟", "قم بمعاينة عند الخروج يمضيها الطرفان، سلم المفاتيح مقابل وصل واطلب الإرجاع كتابيا."] }
  ],
  sources: ["legislation", "portail"]
},
/* ======================================================================= 11 */
{
  slug: "reconnaissance-de-dette", cat: "argent", rang: 11,
  titre: { fr: "Reconnaissance de dette", ar: "اعتراف بدين" },
  court: { fr: "Écrire qu'on doit une somme et quand on la rendra.", ar: "كتابة مبلغ الدين وأجل إرجاعه." },
  bref: { fr: "Document par lequel une personne (le débiteur) reconnaît devoir une somme d'argent à une autre (le créancier) et s'engage à la rembourser. Signature du débiteur légalisée à la municipalité, en deux exemplaires.",
          ar: "وثيقة يعترف فيها شخص (المدين) بأنه مدين لشخص آخر (الدائن) بمبلغ مالي ويلتزم بإرجاعه. يُعرَّف بإمضاء المدين بالبلدية، في نظيرين." },
  legal: { legalisation: "oui", enregistrement: "possible", cout: { fr: "Modèle gratuit. Légalisation et enregistrement éventuel : frais à vérifier.", ar: "النموذج مجاني. التعريف بالإمضاء والتسجيل إن وجد: معاليم يُتثبت منها." },
           delai: { fr: "Aucun délai légal pour la rédiger.", ar: "لا أجل قانوني لتحريره." } },
  champs: [
    groupe("Celui qui doit l'argent (débiteur)", "المدين"), nom("d_nom"), cin("d_cin"), adresse("d_adresse"),
    groupe("Celui qui a prêté (créancier)", "الدائن"), nom("c_nom", ["Karim Jaziri", "كريم الجزيري"]), cin("c_cin"), adresse("c_adresse", ["3 rue Ibn Khaldoun, Sfax", "3 نهج ابن خلدون، صفاقس"]),
    groupe("La dette", "الدين"), c("montant", "Montant (DT)", "المبلغ (د.ت)", "2500", { type: "montant" }),
    date("remise", "Date de remise de l'argent", "تاريخ تسلم المبلغ", { ex: "2026-10-01" }),
    date("rembourse", "Remboursement au plus tard le", "الإرجاع في أجل أقصاه", { ex: "2027-03-31" }),
    c("modalites", "Modalités (facultatif)", "كيفية الإرجاع (اختياري)", ["5 versements mensuels de 500 DT", "5 أقساط شهرية بـ 500 د"], { opt: true }),
    ...fin()
  ],
  fr: v => `<h1 class="d-titre">RECONNAISSANCE DE DETTE</h1>
<p>Je soussigné(e), ${idFR(v, "d_")},</p>
<p>reconnais devoir à ${idFR(v, "c_")},</p>
<p>la somme de <b>${v("montant")}</b> (${v.lettres("montant")}), qui m'a été remise le ${v("remise")} à titre de prêt.</p>
<p>Je m'engage à rembourser cette somme au plus tard le ${v("rembourse")}${v.has("modalites") ? `, selon les modalités suivantes : ${v("modalites")}` : ""}.</p>
<p>Fait en deux exemplaires originaux, un pour chaque partie.</p>
${faitFR(v)}${signe("Le débiteur<br><small>signature légalisée</small>", "Le créancier")}`,
  ar: v => `<h1 class="d-titre">اعتراف بدين</h1>
<p>أنا الممضي(ة) أسفله ${idAR(v, "d_")}،</p>
<p>أعترف بأنني مدين(ة) لـ${idAR(v, "c_")}،</p>
<p>بمبلغ قدره <b>${v("montant")}</b> (${v.lettres("montant")})، تسلّمته منه (منها) على وجه القرض بتاريخ ${v("remise")}.</p>
<p>وألتزم بإرجاع هذا المبلغ في أجل أقصاه ${v("rembourse")}${v.has("modalites") ? `، حسب الكيفية التالية: ${v("modalites")}` : ""}.</p>
<p>حُرّر في نظيرين أصليين، بيد كل طرف نظير.</p>
${faitAR(v)}${signe("المدين<br><small>إمضاء معرف به</small>", "الدائن")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(2), ETAPE_LEGAL,
    { ic: "recette", fr: ["Enregistrer (facultatif)", "L'enregistrement à la recette des finances donne une date certaine au document. Droits à payer : à vérifier sur place."], ar: ["التسجيل (اختياري)", "التسجيل بالقباضة المالية يعطي الوثيقة تاريخا ثابتا. المعاليم: يُتثبت منها بعين المكان."] },
    { ic: "garder", fr: ["Chacun garde un original", "Le créancier garde le sien jusqu'au remboursement complet."], ar: ["يحتفظ كل طرف بأصل", "يحتفظ الدائن بنظيره إلى غاية الخلاص الكامل."] }],
  pieces: { fr: ["CIN originale du débiteur (légalisation)", "Copie de la CIN du créancier"], ar: ["بطاقة التعريف الأصلية للمدين (التعريف بالإمضاء)", "نسخة من بطاقة تعريف الدائن"] },
  ou: { fr: [LEG_OU.fr, "Recette des finances (si vous voulez l'enregistrer)"], ar: [LEG_OU.ar, "القباضة المالية (إن أردت تسجيله)"] },
  pieges: { fr: ["Écrivez le montant en chiffres ET en lettres (le site le fait pour vous).", "Pour chaque remboursement, faites un reçu signé.", "Pour une somme importante, faites relire par un avocat."],
            ar: ["اكتب المبلغ بالأرقام وبالأحرف (الموقع يقوم بذلك).", "عن كل خلاص، حرر وصلا ممضى.", "بالنسبة إلى مبلغ هام، اعرضه على محام."] },
  averifier: { fr: ["Droits d'enregistrement d'une reconnaissance de dette à la recette des finances (Code des droits d'enregistrement et de timbre)."], ar: ["معاليم تسجيل الاعتراف بدين بالقباضة المالية (مجلة معاليم التسجيل والطابع الجبائي)."] },
  faq: [
    { fr: ["Faut-il légaliser une reconnaissance de dette ?", "C'est fortement conseillé : la signature du débiteur est légalisée à la municipalité (« اعتراف بدين في البلدية »)."], ar: ["هل يجب التعريف بإمضاء الاعتراف بدين؟", "يُنصح به بشدة: يُعرَّف بإمضاء المدين بالبلدية."] },
    { fr: ["Faut-il l'enregistrer à la recette des finances ?", "Ce n'est pas obligatoire pour qu'elle existe, mais l'enregistrement lui donne une date certaine. Les droits sont à vérifier à la recette."], ar: ["هل يجب تسجيله بالقباضة المالية؟", "ليس شرطا لوجوده، لكن التسجيل يعطيه تاريخا ثابتا. المعاليم يُتثبت منها بالقباضة."] },
    { fr: ["Que faire si le débiteur ne paie pas ?", "Envoyez d'abord une mise en demeure écrite, puis consultez un avocat ou un huissier de justice."], ar: ["ماذا أفعل إذا لم يدفع المدين؟", "أرسل أولا إنذارا كتابيا، ثم استشر محاميا أو عدلا منفذا."] }
  ],
  sources: ["legislation", "finances", "portail"]
},
/* ======================================================================= 12 */
{
  slug: "procuration", cat: "famille", rang: 12,
  titre: { fr: "Procuration simple", ar: "توكيل" },
  court: { fr: "Charger quelqu'un d'une démarche à votre place.", ar: "تكليف شخص بإجراء نيابة عنك." },
  bref: { fr: "Vous autorisez une personne de confiance (le mandataire) à faire une démarche précise à votre place : retirer un document, un colis, déposer un dossier. Signature légalisée à la municipalité.",
          ar: "ترخص لشخص تثق فيه (الوكيل) في القيام بإجراء محدد نيابة عنك: سحب وثيقة أو طرد، إيداع ملف. يُعرَّف بالإمضاء بالبلدية." },
  legal: { legalisation: "oui", enregistrement: "non", cout: { fr: "Modèle gratuit. Frais de légalisation éventuels : à vérifier.", ar: "النموذج مجاني. معاليم التعريف بالإمضاء إن وجدت: يُتثبت منها." },
           delai: { fr: "Valable pour la durée que vous indiquez.", ar: "صالح للمدة التي تحددها." } },
  champs: [
    groupe("Vous (le mandant)", "أنت (الموكِّل)"), nom("m_nom"), cin("m_cin"), adresse("m_adresse"),
    groupe("La personne de confiance (mandataire)", "الوكيل"), nom("d_nom", ["Sami Trabelsi", "سامي الطرابلسي"]), cin("d_cin"), adresse("d_adresse", ["5 avenue Habib Bourguiba, Sousse", "5 شارع الحبيب بورقيبة، سوسة"]),
    groupe("La démarche", "الإجراء"),
    choix("objet", "Pour", "قصد", [{ v: "passeport", fr: "retirer mon passeport", ar: "سحب جواز سفري" }, { v: "documents", fr: "retirer des documents administratifs", ar: "سحب وثائق إدارية" },
      { v: "courrier", fr: "retirer mon courrier et mes colis", ar: "سحب مراسلاتي وطرودي" }, { v: "dossier", fr: "déposer et suivre un dossier", ar: "إيداع ومتابعة ملف" }, { v: "autre", fr: "autre démarche", ar: "إجراء آخر" }]),
    c("aupres", "Auprès de (administration, bureau)", "لدى (الإدارة، المكتب)", ["Bureau de poste de l'Ariana", "مكتب بريد أريانة"]),
    c("precision", "Précisez la démarche", "وضّح الإجراء", ["retirer l'extrait de naissance de mon fils", "سحب مضمون ولادة ابني"], { type: "textarea", si: ["objet", "autre"] }),
    date("validite", "Valable jusqu'au", "صالح إلى غاية", { opt: true, ex: "2026-12-31" }),
    ...fin()
  ],
  fr: v => `<h1 class="d-titre">PROCURATION</h1>
<p>Je soussigné(e), ${idFR(v, "m_")},</p>
<p>donne par la présente procuration à ${idFR(v, "d_")},</p>
<p>pour ${v.is("objet", "passeport") ? "retirer en mon nom mon passeport" : v.is("objet", "documents") ? "retirer en mon nom des documents administratifs me concernant" : v.is("objet", "courrier") ? "retirer en mon nom mon courrier et mes colis" : v.is("objet", "dossier") ? "déposer et suivre en mon nom un dossier administratif" : `accomplir en mon nom la démarche suivante : ${v("precision")},`} auprès de : ${v("aupres")}.</p>
<p>À cet effet, le mandataire pourra signer tout document et accomplir toute formalité nécessaire, dans la limite de l'objet de la présente procuration.</p>
${v.has("validite") ? `<p>La présente procuration est valable jusqu'au ${v("validite")}.</p>` : ""}
${faitFR(v)}${signe("Le mandant<br><small>signature légalisée</small>", "Le mandataire<br><small>lu et accepté</small>")}`,
  ar: v => `<h1 class="d-titre">توكيل</h1>
<p>أنا الممضي(ة) أسفله ${idAR(v, "m_")}،</p>
<p>أوكل بمقتضى هذا ${idAR(v, "d_")}،</p>
<p>قصد ${v.is("objet", "passeport") ? "سحب جواز سفري نيابة عني" : v.is("objet", "documents") ? "سحب الوثائق الإدارية الخاصة بي نيابة عني" : v.is("objet", "courrier") ? "سحب مراسلاتي وطرودي نيابة عني" : v.is("objet", "dossier") ? "إيداع ملف إداري ومتابعته نيابة عني" : `القيام نيابة عني بالإجراء التالي: ${v("precision")}،`} لدى: ${v("aupres")}.</p>
<p>ولهذا الغرض، يمكن للوكيل إمضاء كل الوثائق والقيام بكل الإجراءات اللازمة في حدود موضوع هذا التوكيل.</p>
${v.has("validite") ? `<p>هذا التوكيل صالح إلى غاية ${v("validite")}.</p>` : ""}
${faitAR(v)}${signe("الموكِّل<br><small>إمضاء معرف به</small>", "الوكيل<br><small>اطلعت وقبلت</small>")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(2), ETAPE_LEGAL,
    { ic: "remettre", fr: ["Le mandataire fait la démarche", "Il présente l'original légalisé, sa propre CIN et une copie de la vôtre."], ar: ["يقوم الوكيل بالإجراء", "يقدم الأصل المعرف بإمضائه وبطاقة تعريفه ونسخة من بطاقتك."] }],
  pieces: { fr: ["Votre CIN originale (légalisation)", "Copie de votre CIN pour le mandataire", "CIN du mandataire le jour de la démarche"], ar: ["بطاقة تعريفك الأصلية (التعريف بالإمضاء)", "نسخة من بطاقة تعريفك للوكيل", "بطاقة تعريف الوكيل يوم الإجراء"] },
  ou: { fr: [LEG_OU.fr, "L'administration où se fait la démarche"], ar: [LEG_OU.ar, "الإدارة التي يتم فيها الإجراء"] },
  pieges: { fr: ["Certaines démarches exigent votre présence ou un imprimé spécial (par exemple certains retraits de passeport) : demandez d'abord à l'administration.", "Pour vendre un bien (voiture, maison), il faut une procuration spéciale : ce modèle ne suffit pas."],
            ar: ["بعض الإجراءات تشترط حضورك أو مطبوعا خاصا (مثلا بعض حالات سحب جواز السفر): اسأل الإدارة أولا.", "لبيع ملك (سيارة، منزل) يلزم توكيل خاص: هذا النموذج لا يكفي."] },
  averifier: { fr: ["Acceptation d'une procuration pour le retrait d'un passeport (à demander au poste de police ou à la municipalité concernés)."], ar: ["قبول التوكيل لسحب جواز السفر (يُسأل عنه بمركز الأمن أو البلدية المعنية)."] },
  faq: [
    { fr: ["Peut-on retirer un passeport avec une procuration ?", "Cela dépend des règles du service concerné : demandez avant de vous déplacer. Le modèle prévoit ce cas."], ar: ["هل يمكن سحب جواز السفر بتوكيل؟", "يتوقف ذلك على قواعد المصلحة المعنية: اسأل قبل التنقل. النموذج يشمل هذه الحالة."] },
    { fr: ["Faut-il légaliser une procuration ?", "Oui, la signature du mandant est légalisée à la municipalité."], ar: ["هل يجب التعريف بإمضاء التوكيل؟", "نعم، يُعرَّف بإمضاء الموكِّل بالبلدية."] }
  ],
  sources: ["portail", "interieur", "legislation"]
},
/* ======================================================================= 13 */
{
  slug: "attestation-d-hebergement", cat: "logement", rang: 13,
  titre: { fr: "Attestation d'hébergement", ar: "شهادة إيواء" },
  court: { fr: "Attester qu'une personne habite chez vous.", ar: "الإشهاد بأن شخصا يقيم عندك." },
  bref: { fr: "Vous attestez qu'une personne habite à votre domicile (dossier administratif, banque, inscription). La signature de l'hébergeant est en général légalisée.",
          ar: "تشهد بأن شخصا يقيم بمنزلك (ملف إداري، بنك، ترسيم). يُعرَّف عادة بإمضاء المُؤوي." },
  legal: { legalisation: "oui", enregistrement: "non", cout: { fr: "Modèle gratuit. Frais de légalisation éventuels : à vérifier.", ar: "النموذج مجاني. معاليم التعريف بالإمضاء إن وجدت: يُتثبت منها." },
           delai: { fr: "Certains organismes la veulent récente (moins de 3 mois).", ar: "بعض الجهات تطلبها حديثة (أقل من 3 أشهر)." } },
  champs: [
    groupe("Vous (qui hébergez)", "أنت (المُؤوي)"), nom("h_nom"), cin("h_cin"), date("h_naissance", "Date de naissance", "تاريخ الولادة", { opt: true, ex: "1975-01-20" }), adresse("h_adresse"),
    groupe("La personne hébergée", "الشخص المُقيم"), nom("q_nom", ["Amine Ben Salah", "أمين بن صالح"]), c("q_doc", "N° de CIN ou de passeport", "عدد بطاقة التعريف أو جواز السفر", "09876543"),
    date("q_naissance", "Date de naissance", "تاريخ الولادة", { opt: true, ex: "2001-07-09" }), date("depuis", "Hébergée depuis le", "مقيم منذ", { ex: "2025-09-01" }),
    ...fin()
  ],
  fr: v => `<h1 class="d-titre">ATTESTATION D'HÉBERGEMENT</h1>
<p>Je soussigné(e), ${v("h_nom")}${v.has("h_naissance") ? `, né(e) le ${v("h_naissance")}` : ""}, titulaire de la carte d'identité nationale n° ${v("h_cin")}, demeurant à ${v("h_adresse")},</p>
<p>atteste sur l'honneur héberger à mon domicile, à l'adresse ci-dessus, ${v("q_nom")}${v.has("q_naissance") ? `, né(e) le ${v("q_naissance")}` : ""}, titulaire de la pièce d'identité n° ${v("q_doc")}, depuis le ${v("depuis")}.</p>
<p>La présente attestation est délivrée pour servir et valoir ce que de droit.</p>
${faitFR(v)}${signe("Signature de l'hébergeant<br><small>signature légalisée</small>")}`,
  ar: v => `<h1 class="d-titre">شهادة إيواء</h1>
<p>أنا الممضي(ة) أسفله ${v("h_nom")}${v.has("h_naissance") ? `، المولود(ة) في ${v("h_naissance")}` : ""}، صاحب(ة) بطاقة التعريف الوطنية عدد ${v("h_cin")}، القاطن(ة) بـ${v("h_adresse")}،</p>
<p>أشهد على شرفي أنني أُؤوي بمحل سكناي، بالعنوان المذكور أعلاه، ${v("q_nom")}${v.has("q_naissance") ? `، المولود(ة) في ${v("q_naissance")}` : ""}، صاحب(ة) وثيقة الهوية عدد ${v("q_doc")}، وذلك منذ ${v("depuis")}.</p>
<p>وسُلّمت هذه الشهادة للإدلاء بها عند الاقتضاء.</p>
${faitAR(v)}${signe("إمضاء المُؤوي<br><small>معرف به</small>")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(0), ETAPE_LEGAL,
    { ic: "remettre", fr: ["Joindre les justificatifs", "Copie de votre CIN et un justificatif de domicile (facture d'électricité ou d'eau, contrat de location)."], ar: ["إرفاق الوثائق", "نسخة من بطاقة تعريفك ووثيقة تثبت السكنى (فاتورة كهرباء أو ماء، عقد كراء)."] }],
  pieces: { fr: ["CIN originale de l'hébergeant (légalisation)", "Justificatif de domicile récent (facture, contrat de location)", "Copie de la pièce d'identité de la personne hébergée"],
            ar: ["بطاقة التعريف الأصلية للمُؤوي (التعريف بالإمضاء)", "وثيقة حديثة تثبت السكنى (فاتورة، عقد كراء)", "نسخة من وثيقة هوية الشخص المُقيم"] },
  ou: { fr: [LEG_OU.fr], ar: [LEG_OU.ar] },
  pieges: { fr: ["Pour un visa, le consulat du pays concerné a souvent son propre formulaire d'accueil : vérifiez sur son site.", "Pour un certificat de résidence officiel, c'est l'administration qui le délivre (municipalité ou poste de police) : ce modèle ne le remplace pas."],
            ar: ["بالنسبة إلى التأشيرة، لقنصلية البلد المعني غالبا استمارة خاصة: تثبت من موقعها.", "شهادة الإقامة الرسمية تسلمها الإدارة (البلدية أو مركز الأمن): هذا النموذج لا يعوضها."] },
  averifier: { fr: [], ar: [] },
  faq: [
    { fr: ["Quelle différence avec le certificat de résidence ?", "Le certificat de résidence est délivré par l'administration. L'attestation d'hébergement est écrite par la personne qui vous héberge."], ar: ["ما الفرق مع شهادة الإقامة؟", "شهادة الإقامة تسلمها الإدارة. أما شهادة الإيواء فيحررها الشخص الذي يؤويك."] },
    { fr: ["Faut-il la légaliser ?", "En général oui : la signature de l'hébergeant est légalisée à la municipalité."], ar: ["هل يجب التعريف بالإمضاء؟", "عادة نعم: يُعرَّف بإمضاء المُؤوي بالبلدية."] }
  ],
  sources: ["portail", "interieur"]
},
/* ======================================================================= 14 */
{
  slug: "recu-de-loyer", cat: "argent", rang: 14,
  titre: { fr: "Reçu de loyer ou reçu d'espèces", ar: "وصل خلاص كراء أو وصل استلام مبلغ" },
  court: { fr: "Prouver qu'un loyer ou une somme a été payé.", ar: "إثبات خلاص معين الكراء أو مبلغ مالي." },
  bref: { fr: "Reçu signé par la personne qui reçoit l'argent : loyer d'un mois (quittance) ou toute autre somme. Gardez-en une copie.",
          ar: "وصل يمضيه من تسلم المبلغ: معين كراء شهر أو أي مبلغ آخر. احتفظ بنسخة." },
  legal: { legalisation: "non", enregistrement: "non", cout: { fr: "Gratuit.", ar: "مجاني." }, delai: { fr: "À chaque paiement.", ar: "عند كل خلاص." } },
  champs: [
    groupe("Le reçu", "الوصل"),
    choix("type", "Il s'agit", "النوع", [{ v: "loyer", fr: "d'un loyer", ar: "معين كراء" }, { v: "especes", fr: "d'une autre somme", ar: "مبلغ آخر" }]),
    groupe("Celui qui reçoit l'argent", "المتسلم"), nom("p_nom", ["Hédi Karoui", "الهادي القروي"]),
    groupe("Celui qui paie", "الدافع"), nom("l_nom"),
    groupe("Le paiement", "الخلاص"), c("montant", "Montant (DT)", "المبلغ (د.ت)", "650", { type: "montant" }),
    c("logement", "Adresse du logement", "عنوان المحل", ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], { si: ["type", "loyer"] }),
    choix("mois", "Mois du loyer", "شهر الكراء", MOIS, { si: ["type", "loyer"], ex: "10" }), c("annee", "Année", "السنة", "2026", { si: ["type", "loyer"], mode: "numeric" }),
    c("motif", "Pour (motif)", "بعنوان", ["l'achat d'un réfrigérateur d'occasion", "شراء ثلاجة مستعملة"], { si: ["type", "especes"] }),
    choix("mode", "Payé", "طريقة الخلاص", [{ v: "especes", fr: "en espèces", ar: "نقدا" }, { v: "cheque", fr: "par chèque", ar: "بواسطة صك" }, { v: "virement", fr: "par virement", ar: "بواسطة تحويل بنكي" }]),
    ...fin()
  ],
  fr: v => `<h1 class="d-titre">${v.is("type", "loyer") ? "QUITTANCE DE LOYER" : "REÇU"}</h1>
<p>Je soussigné(e), ${v("p_nom")}${v.is("type", "loyer") ? `, propriétaire du logement situé à ${v("logement")}` : ""}, déclare avoir reçu de ${v("l_nom")} la somme de <b>${v("montant")}</b> (${v.lettres("montant")}), ${v("mode")}, le ${v("date")},
${v.is("type", "loyer") ? `au titre du loyer du mois de ${v("mois")} ${v("annee")}.` : `au titre de : ${v("motif")}.`}</p>
<p>Dont quittance${v.is("mode", "cheque") ? ", sous réserve de l'encaissement du chèque" : ""}.</p>
${faitFR(v)}${signe("Signature de celui qui reçoit")}`,
  ar: v => `<h1 class="d-titre">${v.is("type", "loyer") ? "وصل خلاص معين كراء" : "وصل استلام مبلغ"}</h1>
<p>أنا الممضي(ة) أسفله ${v("p_nom")}${v.is("type", "loyer") ? `، مالك(ة) المحل الكائن بـ${v("logement")}` : ""}، أشهد أنني تسلمت من ${v("l_nom")} مبلغا قدره <b>${v("montant")}</b> (${v.lettres("montant")})، ${v("mode")}، بتاريخ ${v("date")}،
${v.is("type", "loyer") ? `بعنوان معين كراء شهر ${v("mois")} ${v("annee")}.` : `بعنوان: ${v("motif")}.`}</p>
<p>وهذا وصل في ذلك${v.is("mode", "cheque") ? "، مع مراعاة استخلاص الصك" : ""}.</p>
${faitAR(v)}${signe("إمضاء المتسلم")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(2),
    { ic: "signer", fr: ["Signer au moment du paiement", "Celui qui reçoit l'argent signe ; chacun garde un exemplaire."], ar: ["الإمضاء عند الخلاص", "يمضي من تسلم المبلغ؛ ويحتفظ كل طرف بنظير."] },
    { ic: "garder", fr: ["Classer les reçus", "Ils prouvent les paiements (fin de bail, litige, dossier)."], ar: ["حفظ الوصولات", "تثبت الخلاص (نهاية الكراء، نزاع، ملف)."] }],
  pieces: { fr: ["Aucune"], ar: ["لا شيء"] },
  ou: { fr: ["Nulle part : le reçu se fait entre vous"], ar: ["لا مكان: الوصل يُحرر بينكما"] },
  pieges: { fr: ["Pour un paiement en espèces, le reçu est votre seule preuve : exigez-le à chaque fois.", "Les entreprises soumises à la facture électronique doivent suivre leurs propres règles : ce reçu est pour les particuliers."],
            ar: ["عند الخلاص نقدا، الوصل هو دليلك الوحيد: اطلبه في كل مرة.", "المؤسسات الخاضعة للفاتورة الإلكترونية تتبع قواعدها الخاصة: هذا الوصل للخواص."] },
  averifier: { fr: [], ar: [] },
  faq: [
    { fr: ["Le propriétaire doit-il donner un reçu de loyer ?", "Demandez-le à chaque paiement, surtout en espèces : c'est votre preuve."], ar: ["هل يجب على المالك تسليم وصل خلاص الكراء؟", "اطلبه عند كل خلاص، خاصة نقدا: هو دليلك."] },
    { fr: ["Le montant est-il écrit en lettres ?", "Oui, le site l'écrit automatiquement en lettres, en français et en arabe."], ar: ["هل يُكتب المبلغ بالأحرف؟", "نعم، يكتبه الموقع آليا بالأحرف، بالعربية والفرنسية."] }
  ],
  sources: ["legislation", "finances"]
},
/* ======================================================================= 15 */
{
  slug: "resiliation-internet-telephone", cat: "administration", rang: 15,
  titre: { fr: "Résiliation d'abonnement internet ou téléphone", ar: "مطلب فسخ اشتراك انترنت أو هاتف" },
  court: { fr: "Mettre fin à un abonnement chez un opérateur.", ar: "إنهاء اشتراك لدى مشغل." },
  bref: { fr: "Lettre à votre opérateur pour résilier un abonnement (internet fixe, box, ligne fixe ou mobile). Envoyez-la en recommandé ou déposez-la en agence contre reçu.",
          ar: "رسالة إلى مشغلك لفسخ اشتراك (انترنت قار، موزع، خط قار أو جوال). أرسلها برسالة مضمونة أو أودعها بالوكالة مقابل وصل." },
  legal: { legalisation: "non", enregistrement: "non", cout: { fr: "Gratuit (recommandé : tarif de la Poste).", ar: "مجاني (الرسالة المضمونة: تعريفة البريد)." },
           delai: { fr: "Préavis et durée d'engagement prévus par votre contrat.", ar: "أجل الإعلام ومدة الالتزام المنصوص عليها بعقدك." } },
  champs: [
    groupe("Vous (l'abonné)", "أنت (المشترك)"), nom("nom"), cin("cin"), adresse("adresse"), c("tel", "Téléphone de contact", "هاتف الاتصال", "20 123 456", { mode: "tel" }),
    groupe("L'abonnement", "الاشتراك"),
    choix("operateur", "Opérateur", "المشغل", ["Tunisie Telecom|اتصالات تونس", "Ooredoo|Ooredoo", "Orange Tunisie|Orange تونس", "Topnet|Topnet", "Globalnet|Globalnet", "Hexabyte|Hexabyte", "autre|آخر"]
      .map(o => ({ v: o.split("|")[0], fr: o.split("|")[0], ar: o.split("|")[1] }))),
    c("op_autre", "Nom de l'opérateur", "اسم المشغل", ["Mon opérateur", "مشغلي"], { si: ["operateur", "autre"] }),
    choix("service", "Service", "الخدمة", [{ v: "fixe", fr: "internet fixe (ADSL ou fibre)", ar: "الانترنت القار (ADSL أو الألياف البصرية)" }, { v: "box", fr: "internet mobile (box 4G/5G)", ar: "الانترنت الجوال (موزع 4G/5G)" },
      { v: "ligne", fr: "ligne téléphonique fixe", ar: "الخط الهاتفي القار" }, { v: "mobile", fr: "ligne mobile", ar: "الخط الجوال" }]),
    c("contrat", "N° client ou de contrat", "عدد الحريف أو العقد", "C-00451287"), c("ligne", "N° de ligne", "رقم الخط", "71 123 456", { opt: true }),
    date("fin", "Résiliation souhaitée le", "تاريخ الفسخ المطلوب", { ex: "2026-11-01" }),
    { id: "equipement", type: "case", fr: "Je rends un équipement (modem, box)", ar: "أرجع تجهيزات (مودم، موزع)", ex: true, opt: true },
    ...fin()
  ],
  fr: v => `${expediteur(v, [v("nom"), v("adresse"), "CIN n° " + v("cin"), "Tél. : " + v("tel")])}
<p class="d-dest">À ${v.is("operateur", "autre") ? v("op_autre") : v("operateur")}<br>Service clients — résiliations</p><p class="d-lieu-date">${v("lieu")}, le ${v("date")}</p>
<p class="d-objet"><b>Objet :</b> demande de résiliation d'abonnement — n° client / contrat ${v("contrat")}</p>
<p>Madame, Monsieur,</p>
<p>Je vous demande par la présente de résilier mon abonnement ${v("service")}${v.has("ligne") ? ` (ligne n° ${v("ligne")})` : ""}, souscrit sous la référence ${v("contrat")}, à compter du ${v("fin")} ou, au plus tard, à l'expiration du préavis prévu par mon contrat.</p>
${v.has("equipement") ? "<p>Je m'engage à restituer l'équipement mis à ma disposition (modem, box) contre reçu.</p>" : ""}
<p>Je vous remercie d'arrêter toute facturation à compter de la date de résiliation et de m'adresser la facture de clôture ainsi qu'une confirmation écrite de la résiliation.</p>
${salutFR("Madame, Monsieur")}${signe("Signature de l'abonné")}`,
  ar: v => `${expediteur(v, [v("nom"), v("adresse"), "بطاقة التعريف عدد " + v("cin"), "الهاتف: " + v("tel")])}
<p class="d-dest">إلى ${v.is("operateur", "autre") ? v("op_autre") : v("operateur")}<br>مصلحة الحرفاء — الفسخ</p><p class="d-lieu-date">${v("lieu")} في ${v("date")}</p>
<p class="d-objet"><b>الموضوع:</b> مطلب فسخ اشتراك — عدد الحريف / العقد ${v("contrat")}</p>
<p>تحية طيبة وبعد،</p>
<p>أطلب منكم بمقتضى هذا فسخ اشتراكي في ${v("service")}${v.has("ligne") ? ` (الخط عدد ${v("ligne")})` : ""}، تحت المرجع ${v("contrat")}، ابتداء من ${v("fin")} أو، على أقصى تقدير، عند انتهاء أجل الإعلام المسبق المنصوص عليه بالعقد.</p>
${v.has("equipement") ? "<p>وألتزم بإرجاع التجهيزات الموضوعة على ذمتي (مودم، موزع) مقابل وصل.</p>" : ""}
<p>وأرجو منكم إيقاف كل فوترة ابتداء من تاريخ الفسخ وموافاتي بفاتورة الختم وبتأكيد كتابي للفسخ.</p>
${salutAR}${signe("إمضاء المشترك")}`,
  etapes: [ETAPE_REMPLIR, ETAPE_IMPRIMER(2),
    { ic: "poste", fr: ["Envoyer ou déposer", "Recommandé avec accusé de réception, ou dépôt en agence contre reçu daté."], ar: ["الإرسال أو الإيداع", "رسالة مضمونة الوصول مع الإعلام بالبلوغ، أو إيداع بالوكالة مقابل وصل مؤرخ."] },
    { ic: "remettre", fr: ["Rendre l'équipement", "Modem ou box : en agence, contre reçu."], ar: ["إرجاع التجهيزات", "المودم أو الموزع: بالوكالة مقابل وصل."] },
    { ic: "verifier", fr: ["Vérifier la dernière facture", "En cas de désaccord persistant : réclamation écrite, puis l'Instance nationale des télécommunications."], ar: ["التثبت من آخر فاتورة", "عند استمرار الخلاف: شكاية كتابية، ثم الهيئة الوطنية للاتصالات."] }],
  pieces: { fr: ["Copie de la CIN", "Copie du contrat ou d'une facture (n° client)"], ar: ["نسخة من بطاقة التعريف", "نسخة من العقد أو من فاتورة (عدد الحريف)"] },
  ou: { fr: ["Agence commerciale de l'opérateur", "Bureau de poste (recommandé)"], ar: ["الوكالة التجارية للمشغل", "مكتب البريد (رسالة مضمونة)"] },
  pieges: { fr: ["Lisez la durée d'engagement de votre contrat : une résiliation anticipée peut coûter des frais.", "Payez la dernière facture et gardez tous les reçus."], ar: ["اقرأ مدة الالتزام في عقدك: قد يترتب عن الفسخ المبكر معاليم.", "ادفع آخر فاتورة واحتفظ بكل الوصولات."] },
  averifier: { fr: ["Procédure propre à chaque opérateur (certains demandent un formulaire en agence)."], ar: ["الإجراء الخاص بكل مشغل (بعضهم يطلب استمارة بالوكالة)."] },
  faq: [
    { fr: ["Comment résilier un abonnement internet en Tunisie ?", "Par une lettre de résiliation envoyée en recommandé ou déposée en agence contre reçu, puis restitution du modem."], ar: ["كيف أفسخ اشتراك الانترنت في تونس؟", "برسالة فسخ مضمونة الوصول أو مودعة بالوكالة مقابل وصل، ثم إرجاع المودم."] },
    { fr: ["Que faire si l'opérateur continue à facturer ?", "Envoyez une réclamation écrite avec la preuve de votre demande ; si le litige continue, saisissez l'Instance nationale des télécommunications."], ar: ["ماذا أفعل إذا واصل المشغل الفوترة؟", "أرسل شكاية كتابية مع ما يثبت مطلبك؛ وإذا تواصل النزاع، اتصل بالهيئة الوطنية للاتصالات."] }
  ],
  sources: ["intt", "portail"]
}
];

/* ---- Les 4 grands contrats : étapes seulement (modèle après relecture par un avocat) ---- */
const AV = (fr, ar) => ({ fr, ar });
const CONTRATS = [
{
  slug: "vente-voiture", cat: "vehicules", contrat: true,
  titre: { fr: "Vente d'une voiture : les étapes", ar: "بيع سيارة: المراحل" },
  court: { fr: "Contrat, légalisation, recette des finances, carte grise.", ar: "العقد، التعريف بالإمضاء، القباضة المالية، البطاقة الرمادية." },
  bref: { fr: "Vendre une voiture d'occasion entre particuliers se fait en 4 temps : contrat signé en 2 exemplaires, signatures légalisées à la municipalité, enregistrement à la recette des finances, puis mutation de la carte grise à l'ATTT.",
          ar: "يتم بيع سيارة مستعملة بين الخواص على 4 مراحل: عقد ممضى في نظيرين، التعريف بالإمضاءات بالبلدية، التسجيل بالقباضة المالية، ثم نقل ملكية البطاقة الرمادية بالوكالة الفنية للنقل البري." },
  legal: { legalisation: "oui", enregistrement: "oui", cout: AV("Droits d'enregistrement : À VÉRIFIER (barème du Code des droits d'enregistrement et de timbre).", "معاليم التسجيل: يُتثبت منها (جدول مجلة معاليم التسجيل والطابع الجبائي)."),
           delai: AV("Inscription à l'ATTT : 15 jours après la signature (délai annoncé, à confirmer auprès de l'ATTT).", "التسجيل بالوكالة الفنية للنقل البري: 15 يوما بعد الإمضاء (أجل معلن، يُتثبت منه لدى الوكالة).") },
  etapes: [
    { ic: "verifier", fr: ["Vérifier la voiture et ses papiers", "Carte grise au nom du vendeur, certificat de non gage de moins d'un mois (délivré par l'ATTT), vignette payée."], ar: ["التثبت من السيارة ووثائقها", "بطاقة رمادية باسم البائع، شهادة عدم رهن لا يتجاوز تاريخها شهرا (تسلمها الوكالة الفنية للنقل البري)، معلوم الجولان مدفوع."] },
    { ic: "signer", fr: ["Signer le contrat en 2 exemplaires", "Modèle disponible après relecture par un avocat. Ne signez pas avant d'être devant l'agent de légalisation."], ar: ["إمضاء العقد في نظيرين", "النموذج متوفر بعد مراجعته من قبل محام. لا تمض قبل أن تكون أمام عون التعريف بالإمضاء."] },
    { ic: "municipalite", fr: ["Légaliser les signatures", "Vendeur et acheteur, à la municipalité, avec leur CIN originale."], ar: ["التعريف بالإمضاءات", "البائع والمشتري، بالبلدية، مع بطاقة التعريف الأصلية."] },
    { ic: "recette", fr: ["Enregistrer à la recette des finances", "Paiement des droits d'enregistrement (montant à vérifier)."], ar: ["التسجيل بالقباضة المالية", "دفع معاليم التسجيل (المبلغ يُتثبت منه)."] },
    { ic: "attt", fr: ["Mutation de la carte grise à l'ATTT", "Demande, ancienne carte grise, contrat enregistré, certificat de non gage, reçu de déclaration d'impôt sur le revenu, vignette."], ar: ["نقل ملكية البطاقة الرمادية", "مطلب، البطاقة الرمادية القديمة، العقد المسجل، شهادة عدم الرهن، وصل التصريح بالضريبة على الدخل، معلوم الجولان."] }],
  pieces: { fr: ["Carte grise originale", "Certificat de non gage (moins d'un mois)", "Reçu de la vignette de l'année", "CIN du vendeur et de l'acheteur", "Reçu de déclaration d'impôt sur le revenu (demandé à l'ATTT)", "Contrat en 2 exemplaires"],
            ar: ["البطاقة الرمادية الأصلية", "شهادة عدم الرهن (أقل من شهر)", "وصل معلوم الجولان للسنة", "بطاقتا تعريف البائع والمشتري", "وصل التصريح بالضريبة على الدخل (تطلبه الوكالة)", "العقد في نظيرين"] },
  ou: { fr: ["Municipalité (légalisation)", "Recette des finances (enregistrement)", "Agence de l'ATTT (carte grise)"], ar: ["البلدية (التعريف بالإمضاء)", "القباضة المالية (التسجيل)", "الوكالة الفنية للنقل البري (البطاقة الرمادية)"] },
  pieges: { fr: ["Ne remettez jamais la voiture sans contrat légalisé : jusqu'à la mutation, le vendeur reste le propriétaire inscrit.", "Méfiez-vous d'un certificat de non gage ancien : demandez-en un récent."],
            ar: ["لا تسلم السيارة دون عقد معرف بإمضائه: إلى حين نقل الملكية يبقى البائع هو المالك المسجل.", "احذر من شهادة عدم رهن قديمة: اطلب شهادة حديثة."] },
  averifier: { fr: ["Montant des droits d'enregistrement d'une vente de véhicule.", "Délai de 15 jours pour l'inscription à l'ATTT.", "Liste exacte des pièces demandées par l'ATTT."], ar: ["مبلغ معاليم تسجيل بيع عربة.", "أجل 15 يوما للتسجيل بالوكالة الفنية للنقل البري.", "القائمة الدقيقة للوثائق التي تطلبها الوكالة."] },
  faq: [
    { fr: ["Combien coûte l'enregistrement d'un contrat de vente de voiture ?", "Le montant dépend du barème du Code des droits d'enregistrement et de timbre. Nous ne l'affichons pas tant qu'il n'a pas été vérifié : demandez à la recette des finances."], ar: ["كم تبلغ معاليم تسجيل عقد بيع سيارة؟", "يتوقف المبلغ على جدول مجلة معاليم التسجيل والطابع الجبائي. لا ننشره قبل التثبت منه: اسأل القباضة المالية."] },
    { fr: ["Pourquoi n'y a-t-il pas de modèle de contrat ?", "Un contrat de vente engage beaucoup. Notre modèle sera publié après relecture par un avocat."], ar: ["لماذا لا يوجد نموذج عقد؟", "عقد البيع التزام هام. سيُنشر نموذجنا بعد مراجعته من قبل محام."] }
  ],
  sources: ["attt", "finances", "legislation"]
},
{
  slug: "vente-moto", cat: "vehicules", contrat: true,
  titre: { fr: "Vente d'une moto : les étapes", ar: "بيع دراجة نارية: المراحل" },
  court: { fr: "Mêmes étapes que la voiture pour les motos immatriculées.", ar: "نفس مراحل السيارة بالنسبة إلى الدراجات المسجلة." },
  bref: { fr: "Pour une moto immatriculée, les étapes sont les mêmes que pour une voiture : contrat en 2 exemplaires, légalisation, enregistrement à la recette des finances, mutation de la carte grise à l'ATTT.",
          ar: "بالنسبة إلى الدراجة النارية المسجلة، المراحل هي نفسها كالسيارة: عقد في نظيرين، التعريف بالإمضاء، التسجيل بالقباضة المالية، نقل ملكية البطاقة الرمادية." },
  legal: { legalisation: "oui", enregistrement: "oui", cout: AV("Droits d'enregistrement : À VÉRIFIER.", "معاليم التسجيل: يُتثبت منها."),
           delai: AV("Délai d'inscription à l'ATTT : à confirmer auprès de l'ATTT.", "أجل التسجيل بالوكالة: يُتثبت منه لدى الوكالة.") },
  etapes: [
    { ic: "verifier", fr: ["Vérifier la moto et ses papiers", "Carte grise au nom du vendeur, certificat de non gage récent."], ar: ["التثبت من الدراجة ووثائقها", "بطاقة رمادية باسم البائع، شهادة عدم رهن حديثة."] },
    { ic: "signer", fr: ["Signer le contrat en 2 exemplaires", "Modèle disponible après relecture par un avocat."], ar: ["إمضاء العقد في نظيرين", "النموذج متوفر بعد مراجعته من قبل محام."] },
    { ic: "municipalite", fr: ["Légaliser les signatures", "À la municipalité, avec les CIN originales."], ar: ["التعريف بالإمضاءات", "بالبلدية، مع بطاقات التعريف الأصلية."] },
    { ic: "recette", fr: ["Enregistrer à la recette des finances", "Droits à payer : à vérifier."], ar: ["التسجيل بالقباضة المالية", "المعاليم: يُتثبت منها."] },
    { ic: "attt", fr: ["Mutation de la carte grise à l'ATTT", "Avec le contrat enregistré et les pièces demandées."], ar: ["نقل ملكية البطاقة الرمادية", "مع العقد المسجل والوثائق المطلوبة."] }],
  pieces: { fr: ["Carte grise originale", "Certificat de non gage", "CIN du vendeur et de l'acheteur", "Contrat en 2 exemplaires"], ar: ["البطاقة الرمادية الأصلية", "شهادة عدم الرهن", "بطاقتا تعريف البائع والمشتري", "العقد في نظيرين"] },
  ou: { fr: ["Municipalité", "Recette des finances", "Agence de l'ATTT"], ar: ["البلدية", "القباضة المالية", "الوكالة الفنية للنقل البري"] },
  pieges: { fr: ["Les petits cyclomoteurs non immatriculés ne suivent pas forcément ces étapes : renseignez-vous à l'ATTT."], ar: ["الدراجات الصغيرة غير المسجلة لا تخضع بالضرورة لهذه المراحل: استفسر لدى الوكالة."] },
  averifier: { fr: ["Montant des droits d'enregistrement.", "Pièces et délai exigés par l'ATTT pour les motos."], ar: ["مبلغ معاليم التسجيل.", "الوثائق والأجل التي تشترطها الوكالة بالنسبة إلى الدراجات النارية."] },
  faq: [
    { fr: ["Faut-il légaliser un contrat de vente de moto ?", "Oui, comme pour une voiture : les signatures sont légalisées à la municipalité avant l'enregistrement."], ar: ["هل يجب التعريف بإمضاء عقد بيع دراجة نارية؟", "نعم، كالسيارة: يُعرَّف بالإمضاءات بالبلدية قبل التسجيل."] }
  ],
  sources: ["attt", "finances", "legislation"]
},
{
  slug: "location-maison", cat: "logement", contrat: true,
  titre: { fr: "Location d'une maison ou d'un appartement : les étapes", ar: "كراء منزل أو شقة: المراحل" },
  court: { fr: "Contrat, légalisation, enregistrement dans les 60 jours.", ar: "العقد، التعريف بالإمضاء، التسجيل في أجل 60 يوما." },
  bref: { fr: "Le bail d'habitation est signé en au moins 3 exemplaires, les signatures sont légalisées, puis le contrat est enregistré à la recette des finances du lieu du logement. Pénalités si l'enregistrement est fait après 60 jours.",
          ar: "يُمضى عقد كراء محل السكنى في 3 نظائر على الأقل، ويُعرَّف بالإمضاءات، ثم يُسجل العقد بالقباضة المالية لمكان المحل. توظف خطايا إذا تم التسجيل بعد 60 يوما." },
  legal: { legalisation: "oui", enregistrement: "oui", cout: AV("Droits d'enregistrement pour un logement : taux À VÉRIFIER.", "معاليم تسجيل كراء محل سكنى: النسبة يُتثبت منها."),
           delai: AV("Enregistrement dans les 60 jours (pénalités au-delà).", "التسجيل في أجل 60 يوما (خطايا بعده).") },
  etapes: [
    { ic: "verifier", fr: ["Vérifier le logement et le propriétaire", "Titre de propriété ou mandat du propriétaire, état du logement."], ar: ["التثبت من المحل ومن المالك", "سند الملكية أو توكيل المالك، حالة المحل."] },
    { ic: "signer", fr: ["Signer le bail en au moins 3 exemplaires", "Modèle disponible après relecture par un avocat. Faites un état des lieux d'entrée."], ar: ["إمضاء العقد في 3 نظائر على الأقل", "النموذج متوفر بعد مراجعته من قبل محام. قم بمعاينة عند الدخول."] },
    { ic: "municipalite", fr: ["Légaliser les signatures", "À la municipalité. Le propriétaire montre son quitus ou sa déclaration fiscale."], ar: ["التعريف بالإمضاءات", "بالبلدية. يقدم المالك إبراء الذمة الجبائية أو تصريحه الجبائي."] },
    { ic: "recette", fr: ["Enregistrer à la recette des finances", "Celle du lieu du logement, dans les 60 jours. Contrat rendu en général sous 24 h."], ar: ["التسجيل بالقباضة المالية", "قباضة مكان المحل، في أجل 60 يوما. يُسترجع العقد عادة في ظرف 24 ساعة."] },
    { ic: "garder", fr: ["Chacun garde son exemplaire enregistré", "Et les reçus de loyer à chaque paiement."], ar: ["يحتفظ كل طرف بنظيره المسجل", "ووصولات خلاص الكراء عند كل دفع."] }],
  pieces: { fr: ["CIN du propriétaire et du locataire", "Quitus ou déclaration fiscale du propriétaire (à la légalisation)", "Bail en au moins 3 exemplaires"], ar: ["بطاقتا تعريف المالك والمتسوغ", "إبراء الذمة أو التصريح الجبائي للمالك (عند التعريف بالإمضاء)", "العقد في 3 نظائر على الأقل"] },
  ou: { fr: ["Municipalité (légalisation)", "Recette des finances du lieu du logement (enregistrement)"], ar: ["البلدية (التعريف بالإمضاء)", "القباضة المالية لمكان المحل (التسجيل)"] },
  pieges: { fr: ["Passé 60 jours, des pénalités s'ajoutent aux droits d'enregistrement.", "Écrivez clairement le préavis, le dépôt de garantie et qui paie quoi (eau, électricité, syndic)."],
            ar: ["بعد 60 يوما تضاف خطايا إلى معاليم التسجيل.", "اكتب بوضوح أجل الإعلام ومبلغ الضمان ومن يدفع ماذا (الماء، الكهرباء، النقابة)."] },
  averifier: { fr: ["Taux des droits d'enregistrement d'un bail d'habitation.", "Montant des pénalités de retard."], ar: ["نسبة معاليم تسجيل كراء محل سكنى.", "مبلغ خطايا التأخير."] },
  faq: [
    { fr: ["Faut-il enregistrer un contrat de location de maison en Tunisie ?", "Oui, à la recette des finances du lieu du logement, dans les 60 jours ; sinon des pénalités s'appliquent."], ar: ["هل يجب تسجيل عقد كراء منزل في تونس؟", "نعم، بالقباضة المالية لمكان المحل في أجل 60 يوما؛ وإلا توظف خطايا."] },
    { fr: ["Quel texte s'applique au bail d'habitation ?", "Le Code des obligations et des contrats (articles 727 et suivants)."], ar: ["ما هو النص المنطبق على كراء محل السكنى؟", "مجلة الالتزامات والعقود (الفصل 727 وما بعده)."] }
  ],
  sources: ["finances", "legislation"]
},
{
  slug: "bail-commercial", cat: "logement", contrat: true,
  titre: { fr: "Bail commercial : les étapes", ar: "كراء محل تجاري: المراحل" },
  court: { fr: "Contrat, légalisation, enregistrement (1 % du loyer annuel).", ar: "العقد، التعريف بالإمضاء، التسجيل (1 % من معين الكراء السنوي)." },
  bref: { fr: "Le bail d'un local commercial suit la loi n° 77-37 du 25 mai 1977. Il est signé en plusieurs exemplaires, légalisé, puis enregistré à la recette des finances : droits de 1 % du loyer annuel, avec un minimum de 40 DT.",
          ar: "يخضع كراء المحل التجاري للقانون عدد 37 لسنة 1977 المؤرخ في 25 ماي 1977. يُمضى في عدة نظائر، ويُعرَّف بالإمضاء، ثم يُسجل بالقباضة المالية: المعاليم 1 % من معين الكراء السنوي، بحد أدنى 40 دينارا." },
  legal: { legalisation: "oui", enregistrement: "oui", cout: AV("1 % du loyer annuel, minimum 40 DT (à confirmer à la recette des finances).", "1 % من معين الكراء السنوي، بحد أدنى 40 دينارا (يُتثبت منه بالقباضة المالية)."),
           delai: AV("Enregistrement dans les 60 jours (pénalités au-delà).", "التسجيل في أجل 60 يوما (خطايا بعده).") },
  etapes: [
    { ic: "verifier", fr: ["Vérifier le local et l'activité autorisée", "Destination du local, autorisations nécessaires à votre activité."], ar: ["التثبت من المحل ومن النشاط المسموح به", "وجهة المحل، الرخص اللازمة لنشاطك."] },
    { ic: "signer", fr: ["Signer le bail", "Modèle disponible après relecture par un avocat."], ar: ["إمضاء العقد", "النموذج متوفر بعد مراجعته من قبل محام."] },
    { ic: "municipalite", fr: ["Légaliser les signatures", "À la municipalité."], ar: ["التعريف بالإمضاءات", "بالبلدية."] },
    { ic: "recette", fr: ["Enregistrer à la recette des finances", "Droits : 1 % du loyer annuel, minimum 40 DT, dans les 60 jours."], ar: ["التسجيل بالقباضة المالية", "المعاليم: 1 % من معين الكراء السنوي، بحد أدنى 40 دينارا، في أجل 60 يوما."] },
    { ic: "garder", fr: ["Déclarer l'adresse au registre", "Si vous créez une société ou un commerce : RNE."], ar: ["التصريح بالعنوان بالسجل", "إن كنت تحدث شركة أو تجارة: السجل الوطني للمؤسسات."] }],
  pieces: { fr: ["CIN ou extrait du registre des parties", "Quitus fiscal du propriétaire", "Bail en plusieurs exemplaires"], ar: ["بطاقات التعريف أو مضمون السجل للأطراف", "إبراء الذمة الجبائية للمالك", "العقد في عدة نظائر"] },
  ou: { fr: ["Municipalité", "Recette des finances du lieu du local", "Registre national des entreprises (si création d'activité)"], ar: ["البلدية", "القباضة المالية لمكان المحل", "السجل الوطني للمؤسسات (عند بعث نشاط)"] },
  pieges: { fr: ["Le bail commercial donne des droits particuliers au locataire (renouvellement) : faites relire le contrat par un avocat."], ar: ["يمنح الكراء التجاري حقوقا خاصة للمتسوغ (التجديد): اعرض العقد على محام."] },
  averifier: { fr: ["Taux de 1 % et minimum de 40 DT (à reconfirmer à chaque loi de finances).", "Montant des pénalités de retard."], ar: ["نسبة 1 % والحد الأدنى 40 دينارا (يُعاد التثبت منهما مع كل قانون مالية).", "مبلغ خطايا التأخير."] },
  faq: [
    { fr: ["Combien coûte l'enregistrement d'un bail commercial ?", "1 % du loyer annuel, avec un minimum de 40 DT, à la recette des finances (à confirmer sur place)."], ar: ["كم تبلغ معاليم تسجيل كراء محل تجاري؟", "1 % من معين الكراء السنوي، بحد أدنى 40 دينارا، بالقباضة المالية (يُتثبت منه بعين المكان)."] },
    { fr: ["Quelle loi régit le bail commercial ?", "La loi n° 77-37 du 25 mai 1977."], ar: ["ما هو القانون المنظم للكراء التجاري؟", "القانون عدد 37 لسنة 1977 المؤرخ في 25 ماي 1977."] }
  ],
  sources: ["finances", "legislation", "rne"]
}
];

if (typeof module !== "undefined") module.exports = { DOCS, CONTRATS, CATEGORIES, SOURCES, LEG_SUPPR };

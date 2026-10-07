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
  rne: { fr: "Registre national des entreprises (RNE)", ar: "السجل الوطني للمؤسسات", url: "https://www.registre-entreprises.tn/" },
  justice: { fr: "Ministère de la Justice (tribunaux)", ar: "وزارة العدل (المحاكم)", url: "https://www.justice.gov.tn/" },
  arp: { fr: "Assemblée des représentants du peuple (lois adoptées, texte publié au JORT)", ar: "مجلس نواب الشعب (القوانين المصادق عليها، النص المنشور بالرائد الرسمي)", url: "https://www.arp.tn/" },
  aneti_prog: { fr: "ANETI : programmes d'encouragement à l'emploi (décret n° 2019-542)", ar: "الوكالة الوطنية للتشغيل: برامج التشجيع على التشغيل (الأمر الحكومي عدد 542 لسنة 2019)", url: "https://www.emploi.nat.tn/fo/Fr/global.php?menu1=160" },
  bct_honneur: { fr: "Banque centrale de Tunisie : circulaire aux banques n° 2026-08 du 1er septembre 2026 sur les crédits sur l'honneur (texte en arabe)", ar: "البنك المركزي التونسي: منشور إلى البنوك عدد 8 لسنة 2026 المؤرخ في 1 سبتمبر 2026 المتعلق بالقروض والتمويلات الصغرى على الشرف", url: "https://www.bct.gov.tn/bct/siteprod/documents/Cir_2026_08_ar.pdf" },
  jort: { fr: "Imprimerie officielle (JORT) : décret n° 2026-148 du 23 juillet 2026 (crédits sur l'honneur)", ar: "المطبعة الرسمية (الرائد الرسمي): الأمر عدد 148 لسنة 2026 المؤرخ في 23 جويلية 2026 (التمويلات الصغرى على الشرف)", url: "http://www.iort.gov.tn/WD120AWP/WD120Awp.exe/CONNECT/SITEIORT" },
  bts: { fr: "Banque tunisienne de solidarité (BTS) : lancement du crédit sur l'honneur", ar: "البنك التونسي للتضامن: انطلاق القرض على الشرف", url: "https://www.bts.com.tn/actualites/la-bts-lance-le-dispositif-du-credit-sur-lhonneur-MTA" }
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
const GOUVERNORATS = ["Ariana|أريانة", "Béja|باجة", "Ben Arous|بن عروس", "Bizerte|بنزرت", "Gabès|قابس", "Gafsa|قفصة",
  "Jendouba|جندوبة", "Kairouan|القيروان", "Kasserine|القصرين", "Kébili|قبلي", "Le Kef|الكاف", "Mahdia|المهدية",
  "La Manouba|منوبة", "Médenine|مدنين", "Monastir|المنستير", "Nabeul|نابل", "Sfax|صفاقس", "Sidi Bouzid|سيدي بوزيد",
  "Siliana|سليانة", "Sousse|سوسة", "Tataouine|تطاوين", "Tozeur|توزر", "Tunis|تونس", "Zaghouan|زغوان"]
  .map(d => ({ v: d.split("|")[0], fr: d.split("|")[0], ar: d.split("|")[1] }));
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

/* ---- Crédit (prêt) sur l'honneur : textes communs à la page « démarche expliquée » et au modèle de lettre ----
   Vérifié le 06/10/2026 : circulaire BCT n° 2026-08 du 1er septembre 2026 (texte officiel lu : art. 2, 3, 4, 6, 7 et annexes) ;
   décret n° 2026-148 du 23 juillet 2026 (texte intégral non consulté sur le site du JORT : plafonds, durée, différé, délai
   et gratuité repris de plusieurs articles concordants et de l'annonce officielle de la BTS) ; Code de commerce, art. 412 ter. */
const HONNEUR_MOTS = {
  fr: "prêt d'honneur pret d'honneur prêt sur l'honneur crédit d'honneur crédit sur l'honneur credit d'honneur prêt sans intérêts crédit sans intérêts taux zéro sans garantie microcrédit financement BTS banque décret 148 décret 2026-148 circulaire BCT jeunes promoteurs petit projet société communautaire PME demande de prêt",
  ar: "قرض الشرف قرض على الشرف قروض على الشرف قروض بدون فوائد قرض بدون فائدة تمويل على الشرف تمويلات صغرى دون ضمان البنك التونسي للتضامن الأمر 148 الباعثين الشبان مشروع صغير شركة أهلية مطلب قرض"
};
const HONNEUR_DEPOT = {
  fr: "Depuis le 1er octobre 2026, la demande se dépose uniquement sur la plateforme en ligne de la banque, qui enregistre la date et l'heure et envoie un accusé de réception. Une demande remise par un autre moyen (papier, e-mail…) n'est pas prise en compte (circulaire BCT n° 2026-08, art. 3).",
  ar: "منذ 1 أكتوبر 2026، يُودع المطلب فقط عبر المنصة الإلكترونية للبنك، التي تثبت تاريخ الإيداع وتوقيته وتوجه وصلا بالاستلام. ولا يُعتد بأي مطلب يُقدم بوسيلة أخرى (ورقيا، بالبريد الإلكتروني…) (منشور البنك المركزي عدد 8 لسنة 2026، الفصل 3)."
};
const HONNEUR_CATS = [
  { v: "particulier", fr: "particulier (besoins de consommation, 5 000 DT au plus)", ar: "فرد (حاجيات الاستهلاك، 5000 دينار على الأكثر)" },
  { v: "projet", fr: "porteur d'un petit projet (10 000 DT au plus)", ar: "صاحب مشروع صغير (10000 دينار على الأكثر)" },
  { v: "pme", fr: "petite ou moyenne entreprise (25 000 DT au plus)", ar: "مؤسسة اقتصادية صغرى أو متوسطة (25000 دينار على الأكثر)" },
  { v: "communautaire", fr: "société communautaire (25 000 DT au plus)", ar: "شركة أهلية (25000 دينار على الأكثر)" }
];
const HONNEUR_PIECES = {
  fr: ["Carte d'identité (CIN) en cours de validité", "RIB d'un compte bancaire à votre nom (ou au nom de l'entreprise)", "Particulier : justificatif de votre situation (travail, revenus…), si la banque le demande",
       "Petit projet : courte présentation du projet (activité, coût, besoins) et, s'il existe, l'identifiant fiscal ou l'inscription au RNE", "Entreprise ou société communautaire : extrait du RNE, identifiant fiscal, statuts, derniers états financiers",
       "Liste exacte : celle affichée sur la plateforme de votre banque"],
  ar: ["بطاقة التعريف الوطنية سارية المفعول", "بطاقة التعريف البنكية (RIB) لحساب باسمك (أو باسم المؤسسة)", "بالنسبة إلى الفرد: ما يثبت وضعيتك (العمل، المداخيل…)، إن طلبه البنك",
       "بالنسبة إلى المشروع الصغير: تقديم مختصر للمشروع (النشاط، الكلفة، الحاجيات) والمعرف الجبائي أو الترسيم بالسجل الوطني للمؤسسات إن وُجد", "بالنسبة إلى المؤسسة أو الشركة الأهلية: مضمون من السجل الوطني للمؤسسات، المعرف الجبائي، العقد التأسيسي، آخر القوائم المالية",
       "القائمة الدقيقة: تلك المعروضة على منصة بنكك"]
};
const HONNEUR_OU = {
  fr: ["Plateforme en ligne de votre banque : la seule voie de dépôt depuis le 1er octobre 2026", "Votre agence bancaire : adresse de la plateforme, pièces demandées, catégories proposées", "BTS (Banque tunisienne de solidarité) : a annoncé le crédit sur l'honneur pour les micro-projets (10 000 DT) et les PME et sociétés communautaires (25 000 DT)"],
  ar: ["المنصة الإلكترونية لبنكك: الطريقة الوحيدة للإيداع منذ 1 أكتوبر 2026", "وكالتك البنكية: عنوان المنصة، الوثائق المطلوبة، الأصناف المقترحة", "البنك التونسي للتضامن: أعلن عن القرض على الشرف للمشاريع الصغرى (10000 دينار) وللمؤسسات الصغرى والمتوسطة والشركات الأهلية (25000 دينار)"]
};
const HONNEUR_PIEGES = {
  fr: ["Une demande sur papier, par e-mail ou par un intermédiaire n'est pas prise en compte : seule la plateforme de la banque compte.",
       "Le dossier est gratuit : ni frais d'étude, ni garantie, ni garant ne peuvent être exigés. Méfiez-vous des intermédiaires payants et ne donnez jamais vos codes bancaires.",
       "Les demandes sont traitées dans l'ordre d'arrivée et l'enveloppe de chaque banque est limitée : déposez un dossier complet sans attendre.",
       "Pas de nouveau crédit sur l'honneur tant qu'un précédent crédit de la même catégorie n'est pas entièrement remboursé : la banque le vérifie à la Banque centrale (circulaire, art. 4).",
       "Sans intérêts ne veut pas dire sans obligation : il faut rembourser, et les impayés sont déclarés à la Banque centrale."],
  ar: ["المطلب الورقي أو عبر البريد الإلكتروني أو عن طريق وسيط لا يُعتد به: المنصة البنكية وحدها هي المعتمدة.",
       "الملف مجاني: لا يمكن اشتراط معاليم دراسة ولا ضمان ولا ضامن. احذر الوسطاء بمقابل ولا تعط أبدا رموزك البنكية.",
       "تُعالج المطالب حسب أسبقية الإيداع والاعتمادات المخصصة لكل بنك محدودة: أودع ملفا كاملا دون تأخير.",
       "لا قرض جديد على الشرف ما دام قرض سابق من نفس الصنف لم يُسدد بالكامل: يتثبت البنك من ذلك لدى البنك المركزي (المنشور، الفصل 4).",
       "دون فوائد لا يعني دون التزام: يجب الخلاص، ويُصرح بالمبالغ غير المستخلصة لدى البنك المركزي."]
};
const HONNEUR_AVERIFIER = {
  fr: ["Situation au 06/10/2026 : la liste officielle des pièces n'est fixée ni par le décret ni par la circulaire de la BCT ; chaque banque la donne sur sa plateforme.",
       "Adresse de la plateforme de chaque banque, et catégories proposées par chacune (l'annonce de la BTS cite les micro-projets et les PME/sociétés communautaires, pas les particuliers).",
       "Âge, revenus, ancienneté du compte : aucune condition dans les textes que nous avons lus, mais la banque applique aussi ses règles internes (circulaire, art. 2). Demandez si vous devez déjà être client.",
       "Durée exacte, différé et échéances de remboursement : lisez le contrat de la banque (texte intégral du décret non consulté sur le site du JORT ; chiffres repris des annonces officielles et concordantes).",
       "Le « modèle de demande » qui a circulé en août 2026 n'est pas un formulaire officiel."],
  ar: ["الوضعية في 06/10/2026: القائمة الرسمية للوثائق غير محددة لا في الأمر ولا في منشور البنك المركزي؛ يحددها كل بنك على منصته.",
       "عنوان منصة كل بنك والأصناف التي يقترحها (يذكر إعلان البنك التونسي للتضامن المشاريع الصغرى والمؤسسات الصغرى والمتوسطة والشركات الأهلية، ولا يذكر الأفراد).",
       "السن، المداخيل، أقدمية الحساب: لا شروط في النصوص التي اطلعنا عليها، لكن البنك يطبق أيضا سياساته الداخلية (المنشور، الفصل 2). اسأل إن كان يجب أن تكون حريفا للبنك.",
       "المدة الدقيقة وفترة الإمهال وأقساط الخلاص: اقرأ عقد البنك (لم نطلع على النص الكامل للأمر بموقع الرائد الرسمي؛ الأرقام مأخوذة من إعلانات رسمية ومتطابقة).",
       "«نموذج المطلب» الذي تم تداوله في أوت 2026 ليس مطبوعة رسمية."]
};
const HONNEUR_SOURCES = ["bct_honneur", "jort", "bts", "legislation"];

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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { m_nom: ["Mohamed Ben Salah", "محمد بن صالح"], m_cin: "0XXXXXXX", m_adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"],
             d_nom: ["Sami Trabelsi", "سامي الطرابلسي"], d_cin: "1XXXXXXX", d_adresse: ["5 avenue Habib Bourguiba, Sousse", "5 شارع الحبيب بورقيبة، سوسة"],
             marque: ["Peugeot", "بيجو"], modele: "208", immat: ["123 TU 4567", "123 تونس 4567"], chassis: "VF3XXXXXXXXXXXXXX", duree: "revocation",
             lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { e_nom: ["Société Al Amal SARL", "شركة الأمل ش.ذ.م.م"], e_mf: "XXXXXXX/X/M/000", e_adresse: ["Zone industrielle, Ben Arous", "المنطقة الصناعية، بن عروس"],
             r_nom: ["Leila Mansour", "ليلى منصور"], r_qualite: "gerant", s_nom: ["Mohamed Ben Salah", "محمد بن صالح"], s_cin: "0XXXXXXX", s_poste: ["comptable", "محاسب"],
             s_debut: "2020-03-01", statut: "poste", lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { nom: ["Mohamed Ben Salah", "محمد بن صالح"], poste: ["technicien", "تقني"], matricule: "4521", service: ["Service maintenance", "مصلحة الصيانة"], dest: "dir",
             etab: ["Société Al Amal", "شركة الأمل"], type: "annuel", debut: "2026-11-02", fin: "2026-11-13", motif: ["raisons familiales", "أسباب عائلية"],
             lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { nom: ["Mohamed Ben Salah", "محمد بن صالح"], adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], poste: ["commercial", "مكلف بالمبيعات"], embauche: "2021-09-01", dest: "dir",
             etab: ["Société Al Amal", "شركة الأمل"], e_adresse: ["Zone industrielle, Ben Arous", "المنطقة الصناعية، بن عروس"], dernier: "2026-11-05",
             lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { nom: ["Mohamed Ben Salah", "محمد بن صالح"], adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], tel: "XX XXX XXX", email: "nom@exemple.tn", org: ["Société Al Amal", "شركة الأمل"],
             poste: ["technicien en informatique", "تقني في الإعلامية"], diplome: ["une licence en informatique", "إجازة في الإعلامية"],
             experience: ["deux ans de stage en maintenance", "سنتان من التربص في الصيانة"], lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { p_nom: ["Mohamed Ben Salah", "محمد بن صالح"], p_qualite: "pere", p_cin: "0XXXXXXX", p_adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], e_nom: ["Yasmine Ben Salah", "ياسمين بن صالح"],
             e_naissance: "2014-04-12", e_doc: "NXXXXXXX", accomp: "avec", a_nom: ["Sonia Gharbi", "سنية الغربي"], a_doc: "1XXXXXXX",
             destination: ["Paris (France)", "باريس (فرنسا)"], depart: "2026-12-20", retour: "2027-01-03", lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { nom: ["Mohamed Ben Salah", "محمد بن صالح"], cin: "0XXXXXXX", naissance: "1990-05-17", adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], objet: "nonemploi", pour: ["la CNSS", "الصندوق الوطني للضمان الاجتماعي"],
             lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { p_nom: ["Mohamed Ben Salah", "محمد بن صالح"], p_qualite: "pere", p_cin: "0XXXXXXX", p_adresse: ["8 rue des Roses, Ariana", "8 نهج الورود، أريانة"], tel: "XX XXX XXX",
             e_nom: ["Youssef Ben Salah", "يوسف بن صالح"], e_naissance: "2013-02-08", niveau: "7", annee: "2026/2027",
             actuel: ["École primaire Ibn Khaldoun, Sfax", "المدرسة الابتدائية ابن خلدون، صفاقس"], demande: ["Collège Ennour, Ariana", "المدرسة الإعدادية النور، أريانة"],
             delegation: "Ariana", motif: "domicile", lieu: ["Ariana", "أريانة"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { nom: ["Mohamed Ben Salah", "محمد بن صالح"], cin: "0XXXXXXX", adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], tel: "XX XXX XXX", org: ["Municipalité de l'Ariana", "بلدية أريانة"],
             objet: ["retard de traitement de mon dossier", "التأخير في معالجة ملفي"], ref: "2026/1458",
             faits: ["J'ai déposé ma demande le 3 juin 2026 et je n'ai reçu aucune réponse malgré deux relances.", "أودعت مطلبي يوم 3 جوان 2026 ولم أتلق أي رد رغم تذكيرين."],
             souhait: ["traiter mon dossier et m'informer de la décision.", "معالجة ملفي وإعلامي بالقرار."], lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { l_nom: ["Mohamed Ben Salah", "محمد بن صالح"], l_adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], b_nom: ["Hédi Karoui", "الهادي القروي"], b_adresse: ["8 rue de Rome, Tunis", "8 نهج روما، تونس"],
             logement: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], date_bail: "2023-09-01", depart: "2026-12-31", envoi: "rar", lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { d_nom: ["Mohamed Ben Salah", "محمد بن صالح"], d_cin: "0XXXXXXX", d_adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], c_nom: ["Karim Jaziri", "كريم الجزيري"], c_cin: "1XXXXXXX",
             c_adresse: ["3 rue Ibn Khaldoun, Sfax", "3 نهج ابن خلدون، صفاقس"], montant: "2500", remise: "2026-10-01", rembourse: "2027-03-31",
             modalites: ["5 versements mensuels de 500 DT", "5 أقساط شهرية بـ 500 د"], lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { m_nom: ["Mohamed Ben Salah", "محمد بن صالح"], m_cin: "0XXXXXXX", m_adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], d_nom: ["Sami Trabelsi", "سامي الطرابلسي"], d_cin: "1XXXXXXX",
             d_adresse: ["5 avenue Habib Bourguiba, Sousse", "5 شارع الحبيب بورقيبة، سوسة"], objet: "passeport",
             aupres: ["Bureau de poste de l'Ariana", "مكتب بريد أريانة"], validite: "2026-12-31", lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { h_nom: ["Mohamed Ben Salah", "محمد بن صالح"], h_cin: "0XXXXXXX", h_naissance: "1975-01-20", h_adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], q_nom: ["Amine Ben Salah", "أمين بن صالح"],
             q_doc: "1XXXXXXX", q_naissance: "2001-07-09", depuis: "2025-09-01", lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { type: "loyer", p_nom: ["Hédi Karoui", "الهادي القروي"], l_nom: ["Mohamed Ben Salah", "محمد بن صالح"], montant: "650", logement: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], mois: "10", annee: "2026",
             mode: "especes", lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { nom: ["Mohamed Ben Salah", "محمد بن صالح"], cin: "0XXXXXXX", adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"], tel: "XX XXX XXX", operateur: "Tunisie Telecom", service: "fixe",
             contrat: "C-XXXXXXXX", ligne: "71 XXX XXX", fin: "2026-11-01", equipement: true, lieu: ["Tunis", "تونس"], date: "2026-10-05" },
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
},
/* ======================================================================= 16 */
{
  slug: "demande-pret-d-honneur", cat: "argent", rang: 16, guidePlus: "pret-d-honneur",
  titre: { fr: "Demande de prêt d'honneur", ar: "مطلب قرض على الشرف" },
  court: { fr: "Préparer sa demande de crédit sur l'honneur sans intérêts (décret n° 2026-148).", ar: "إعداد مطلب القرض على الشرف دون فوائد (الأمر عدد 148 لسنة 2026)." },
  bref: { fr: "Lettre de demande d'un crédit sur l'honneur, sans intérêts ni garantie : particulier (5 000 DT au plus), petit projet (10 000 DT), PME ou société communautaire (25 000 DT). Elle vous aide à rassembler vos informations ; le dépôt officiel se fait sur la plateforme en ligne de votre banque.",
          ar: "رسالة لطلب قرض على الشرف دون فوائد ولا ضمانات: فرد (5000 دينار على الأكثر)، مشروع صغير (10000 دينار)، مؤسسة صغرى أو متوسطة أو شركة أهلية (25000 دينار). تساعدك على جمع معطياتك؛ والإيداع الرسمي يتم عبر المنصة الإلكترونية لبنكك." },
  attention: { fr: "Modèle indicatif : si votre banque propose un formulaire officiel, utilisez-le. " + HONNEUR_DEPOT.fr + " Servez-vous de cette lettre pour préparer ce que vous allez saisir, et joignez-la seulement si la plateforme accepte un document.",
               ar: "نموذج استرشادي: إذا وفّر بنكك مطبوعة رسمية، فاستعملها. " + HONNEUR_DEPOT.ar + " استعمل هذه الرسالة لإعداد ما ستعمّره، ولا ترفقها إلا إذا كانت المنصة تقبل وثيقة." },
  motscles: HONNEUR_MOTS,
  legal: { legalisation: "non", enregistrement: "non", cout: { fr: "Gratuit : ni intérêts, ni frais d'étude, ni garantie.", ar: "مجاني: دون فوائد ولا معاليم دراسة ولا ضمان." },
           delai: { fr: "Réponse de la banque en 10 jours ouvrables au plus après le dépôt en ligne.", ar: "رد البنك في أجل أقصاه 10 أيام عمل بعد الإيداع عن بعد." } },
  // exemple affiché avant le formulaire (données FICTIVES ; [fr, ar] ou valeur commune ; champ absent = son « ex »)
  exemple: { nom: ["Mohamed Ben Salah", "محمد بن صالح"], cin: "0XXXXXXX", adresse: ["15 rue de la Liberté, Sfax", "15 نهج الحرية، صفاقس"], tel: "XX XXX XXX", email: "nom@exemple.tn",
             situation: ["artisan indépendant", "حرفي مستقل"], gouv: "Sfax", categorie: "particulier", montant: "4000",
             objet: ["l'achat d'une machine à coudre professionnelle", "شراء آلة خياطة مهنية"], banque: ["agence principale de Sfax", "الوكالة الرئيسية بصفاقس"], rib: "XXXXXXXXXXXXXXXXXXXX",
             p_cin: true, p_situation: true, p_projet: true, lieu: ["Sfax", "صفاقس"], date: "2026-10-05" },
  champs: [
    groupe("Vous", "أنت"), nom("nom"), cin("cin"), adresse("adresse"), c("tel", "Téléphone", "الهاتف", "20 123 456", { mode: "tel" }),
    c("email", "E-mail", "البريد الإلكتروني", "nom@exemple.tn", { opt: true, mode: "email" }),
    c("situation", "Situation professionnelle", "الوضعية المهنية", ["artisan indépendant", "حرفي مستقل"]),
    choix("gouv", "Gouvernorat", "الولاية", GOUVERNORATS),
    groupe("La demande", "المطلب"),
    choix("categorie", "Catégorie", "الصنف", HONNEUR_CATS),
    c("structure", "Nom du projet ou de l'entreprise (si concerné)", "اسم المشروع أو المؤسسة (عند الاقتضاء)", ["Atelier de couture Al Amal", "ورشة خياطة الأمل"], { opt: true }),
    c("idfiscal", "Identifiant fiscal ou n° RNE (si concerné)", "المعرف الجبائي أو عدد السجل الوطني للمؤسسات (عند الاقتضاء)", "1234567A", { opt: true, max: 30 }),
    c("montant", "Montant demandé (DT)", "المبلغ المطلوب (د.ت)", "4000", { type: "montant" }),
    c("objet", "Objet du financement", "موضوع التمويل", ["l'achat d'une machine à coudre professionnelle", "شراء آلة خياطة مهنية"], { type: "textarea" }),
    c("banque", "Banque et agence", "البنك والوكالة", ["agence principale de Sfax", "الوكالة الرئيسية بصفاقس"]),
    c("rib", "RIB du compte à créditer (20 chiffres)", "عدد الحساب البنكي RIB (20 رقما)", "01234012345678901234", { opt: true, mode: "numeric", max: 30 }),
    groupe("Pièces jointes (cochez)", "الوثائق المصاحبة (اختر)"),
    c("p_cin", "Copie de la CIN", "نسخة من بطاقة التعريف الوطنية", "", { type: "case", opt: true }),
    c("p_rib", "RIB", "بطاقة التعريف البنكية (RIB)", "", { type: "case", opt: true }),
    c("p_situation", "Justificatif de situation ou de revenus", "ما يثبت الوضعية أو المداخيل", "", { type: "case", opt: true }),
    c("p_projet", "Présentation du projet", "تقديم المشروع", "", { type: "case", opt: true }),
    c("p_rne", "Extrait du RNE / identifiant fiscal", "مضمون من السجل الوطني للمؤسسات / المعرف الجبائي", "", { type: "case", opt: true }),
    c("p_statuts", "Statuts et états financiers de l'entreprise", "العقد التأسيسي والقوائم المالية للمؤسسة", "", { type: "case", opt: true }),
    c("p_autre", "Autre pièce", "وثيقة أخرى", ["devis du fournisseur", "فاتورة تقديرية من المزود"], { opt: true }),
    ...fin()
  ],
  fr: v => {
    const pj = [["p_cin", "copie de la carte d'identité nationale"], ["p_rib", "relevé d'identité bancaire (RIB)"], ["p_situation", "justificatif de situation ou de revenus"],
      ["p_projet", "présentation du projet"], ["p_rne", "extrait du RNE / identifiant fiscal"], ["p_statuts", "statuts et états financiers de l'entreprise"]].filter(([id]) => v.has(id)).map(([, t]) => t);
    if (v.has("p_autre")) pj.push(v("p_autre"));
    return `<div class="d-serre">${expediteur(v, [v("nom"), "CIN n° " + v("cin"), v("adresse"), "Tél. : " + v("tel"), v.has("email") && v("email")])}
<p class="d-dest">À l'attention du directeur de l'agence<br>${v("banque")}</p><p class="d-lieu-date">${v("lieu")}, le ${v("date")}</p>
<p class="d-objet"><b>Objet :</b> demande de crédit sur l'honneur (décret n° 2026-148 du 23 juillet 2026)</p>
<p>Madame, Monsieur,</p>
<p>Je soussigné(e) ${v("nom")}, titulaire de la carte d'identité nationale n° ${v("cin")}, demeurant à ${v("adresse")}, gouvernorat de ${v("gouv")}, situation professionnelle : ${v("situation")}, ai l'honneur de solliciter un crédit sur l'honneur sans intérêts, au titre de la catégorie : ${v("categorie")}${v.has("structure") ? `, pour : ${v("structure")}` : ""}${v.has("idfiscal") ? ` (identifiant fiscal / RNE : ${v("idfiscal")})` : ""}.</p>
<p>Le montant demandé est de <b>${v("montant")}</b> (${v.lettres("montant")}). Ce financement est destiné à ${v("objet")}.${v.has("rib") ? ` Compte à créditer (RIB) : ${v("rib")}.` : ""}</p>
<p>Je certifie sur l'honneur l'exactitude des informations ci-dessus et ne pas avoir de crédit sur l'honneur de la même catégorie en cours de remboursement.</p>
${pj.length ? `<p><b>Pièces jointes :</b> ${pj.join(" ; ")}.</p>` : ""}
${salutFR("Madame, Monsieur")}${signe("Signature")}</div>`;
  },
  ar: v => {
    const pj = [["p_cin", "نسخة من بطاقة التعريف الوطنية"], ["p_rib", "بطاقة التعريف البنكية (RIB)"], ["p_situation", "ما يثبت الوضعية أو المداخيل"],
      ["p_projet", "تقديم المشروع"], ["p_rne", "مضمون من السجل الوطني للمؤسسات / المعرف الجبائي"], ["p_statuts", "العقد التأسيسي والقوائم المالية للمؤسسة"]].filter(([id]) => v.has(id)).map(([, t]) => t);
    if (v.has("p_autre")) pj.push(v("p_autre"));
    return `<div class="d-serre">${expediteur(v, [v("nom"), "بطاقة التعريف عدد " + v("cin"), v("adresse"), "الهاتف: " + v("tel"), v.has("email") && v("email")])}
<p class="d-dest">إلى السيد(ة) مدير(ة) الوكالة<br>${v("banque")}</p><p class="d-lieu-date">${v("lieu")} في ${v("date")}</p>
<p class="d-objet"><b>الموضوع:</b> مطلب قرض على الشرف (الأمر عدد 148 لسنة 2026 المؤرخ في 23 جويلية 2026)</p>
<p>تحية طيبة وبعد،</p>
<p>أنا الممضي(ة) أسفله ${v("nom")}، صاحب(ة) بطاقة التعريف الوطنية عدد ${v("cin")}، القاطن(ة) بـ${v("adresse")}، ولاية ${v("gouv")}، الوضعية المهنية: ${v("situation")}، يشرفني أن أتقدم إليكم بمطلب للحصول على قرض على الشرف دون فوائد، بعنوان صنف: ${v("categorie")}${v.has("structure") ? `، لفائدة: ${v("structure")}` : ""}${v.has("idfiscal") ? ` (المعرف الجبائي / السجل الوطني للمؤسسات: ${v("idfiscal")})` : ""}.</p>
<p>المبلغ المطلوب: <b>${v("montant")}</b> (${v.lettres("montant")}). ويُخصص هذا التمويل لـ${v("objet")}.${v.has("rib") ? ` الحساب المراد تحويل المبلغ إليه (RIB): ${v("rib")}.` : ""}</p>
<p>وأشهد على الشرف بصحة المعطيات المذكورة أعلاه وبعدم وجود قرض على الشرف من نفس الصنف بذمتي لم يتم خلاصه.</p>
${pj.length ? `<p><b>الوثائق المصاحبة:</b> ${pj.join("؛ ")}.</p>` : ""}
<p>وفي انتظار ردكم، تقبلوا مني فائق عبارات الاحترام والتقدير.</p>${signe("الإمضاء")}</div>`;
  },
  etapes: [ETAPE_REMPLIR,
    { ic: "liste", fr: ["Rassembler les pièces", "CIN, RIB et, selon votre cas, présentation du projet, extrait du RNE, statuts. La liste exacte est sur la plateforme de votre banque."], ar: ["جمع الوثائق", "بطاقة التعريف، RIB، وحسب وضعيتك: تقديم المشروع، مضمون السجل الوطني للمؤسسات، العقد التأسيسي. القائمة الدقيقة على منصة بنكك."] },
    { ic: "remettre", fr: ["Déposer en ligne", HONNEUR_DEPOT.fr], ar: ["الإيداع عن بعد", HONNEUR_DEPOT.ar] },
    { ic: "horloge", fr: ["Attendre la réponse", "La banque répond dans un délai de 10 jours ouvrables au plus ; un refus doit être motivé. Gardez votre accusé de réception."], ar: ["انتظار الرد", "يرد البنك في أجل أقصاه 10 أيام عمل؛ ويجب أن يكون الرفض معللا. احتفظ بوصل الاستلام."] }],
  pieces: HONNEUR_PIECES,
  ou: HONNEUR_OU,
  pieges: HONNEUR_PIEGES,
  averifier: HONNEUR_AVERIFIER,
  faq: [
    { fr: ["Peut-on déposer cette lettre à l'agence ?", "Non : depuis le 1er octobre 2026, seule la demande déposée sur la plateforme en ligne de la banque est prise en compte (circulaire BCT n° 2026-08). La lettre sert à préparer vos informations, ou à être jointe si la plateforme le permet."], ar: ["هل يمكن إيداع هذه الرسالة بالوكالة؟", "لا: منذ 1 أكتوبر 2026 لا يُعتد إلا بالمطلب المودع عبر المنصة الإلكترونية للبنك (منشور البنك المركزي عدد 8 لسنة 2026). تُستعمل الرسالة لإعداد معطياتك، أو تُرفق إذا سمحت المنصة بذلك."] },
    { fr: ["Faut-il payer des frais ou donner une garantie ?", "Non. Le crédit sur l'honneur est sans intérêts, sans frais d'étude et sans garantie ni caution."], ar: ["هل يجب دفع معاليم أو تقديم ضمان؟", "لا. القرض على الشرف دون فوائد ودون معاليم دراسة ودون ضمان أو كفيل."] },
    { fr: ["Faut-il légaliser la demande ?", "Non."], ar: ["هل يجب التعريف بالإمضاء؟", "لا."] }
  ],
  sources: HONNEUR_SOURCES
}
];

/* ---- Contrats en « étapes seulement » : aucun depuis le 07/10/2026 (tous les grands contrats ont un modèle, plus bas) ---- */
const AV = (fr, ar) => ({ fr, ar });
const CONTRATS = [
];

/* ======================================================================= 17-19 : grands contrats (modèles du 07/10/2026,
   demande d'Ahmed). Rédigés d'après le Code des obligations et des contrats (vente : art. 564 et suivants ; louage de choses :
   art. 727 et suivants). Aucun texte copié d'un autre site. Montants des droits d'enregistrement : toujours « à vérifier ». */
// partie commune aux contrats : « Article n — titre » puis le texte
const art = (n, frT, txt) => `<p><b>Article ${n} — ${frT}</b><br>${txt}</p>`;
const fasl = (n, arT, txt) => `<p><b>الفصل ${n} — ${arT}</b><br>${txt}</p>`;
const FRAIS = [{ v: "acheteur", fr: "de l'acheteur", ar: "المشتري" }, { v: "vendeur", fr: "du vendeur", ar: "البائع" }, { v: "moitie", fr: "des deux parties, à parts égales", ar: "الطرفين مناصفة" }];
// vente d'un véhicule d'occasion entre particuliers : voiture ou moto (même contrat, mots adaptés)
function venteVehicule(moto) {
  const T = moto ? { fr: "CONTRAT DE VENTE D'UNE MOTO", ar: "عقد بيع دراجة نارية" } : { fr: "CONTRAT DE VENTE D'UNE VOITURE", ar: "عقد بيع سيارة" };
  const puiss = moto ? ["Cylindrée (cm³)", "سعة المحرك (صم³)", "125"] : ["Puissance fiscale (CV)", "القوة الجبائية (خيل)", "5"];
  const listeFR = v => `<ul class="d-liste"><li>Marque : ${v("marque")} — Modèle : ${v("modele")}</li><li>N° d'immatriculation : ${v("immat")}</li><li>N° de série (châssis) : ${v("chassis")}</li>${v.has("mise") ? `<li>Date de première mise en circulation : ${v("mise")}</li>` : ""}${v.has("puissance") ? `<li>${puiss[0]} : ${v("puissance")}</li>` : ""}${v.has("km") ? `<li>Kilométrage affiché au compteur : ${v("km")} km</li>` : ""}</ul>`;
  const listeAR = v => `<ul class="d-liste"><li>النوع: ${v("marque")} — الطراز: ${v("modele")}</li><li>رقم التسجيل المنجمي: ${v("immat")}</li><li>الرقم التسلسلي (الهيكل): ${v("chassis")}</li>${v.has("mise") ? `<li>تاريخ أول جولان: ${v("mise")}</li>` : ""}${v.has("puissance") ? `<li>${puiss[1]}: ${v("puissance")}</li>` : ""}${v.has("km") ? `<li>عدد الكيلومترات بالعداد: ${v("km")} كم</li>` : ""}</ul>`;
  const remiseFR = v => `${v("remise")}${v.has("heure") ? ` à ${v("heure")}` : ""}`;
  const remiseAR = v => `${v("remise")}${v.has("heure") ? ` على الساعة ${v("heure")}` : ""}`;
  return {
    exemple: { v_nom: ["Mohamed Ben Salah", "محمد بن صالح"], v_cin: "0XXXXXXX", v_adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"],
               a_nom: ["Sami Trabelsi", "سامي الطرابلسي"], a_cin: "1XXXXXXX", a_adresse: ["5 avenue Habib Bourguiba, Sousse", "5 شارع الحبيب بورقيبة، سوسة"],
               marque: moto ? ["Yamaha", "ياماها"] : ["Peugeot", "بيجو"], modele: moto ? "YBR 125" : "208", immat: moto ? ["123456", "123456"] : ["123 TU 4567", "123 تونس 4567"],
               chassis: moto ? "JYAXXXXXXXXXXXXXX" : "VF3XXXXXXXXXXXXXX", mise: "2019-03-15", puissance: puiss[2], km: moto ? "28000" : "96000",
               prix: moto ? "4500" : "32000", paiement: "comptant", remise: "2026-10-05", heure: "15h00", frais: "acheteur", lieu: ["Tunis", "تونس"], date: "2026-10-05" },
    champs: [
      groupe("Le vendeur", "البائع"), nom("v_nom"), cin("v_cin"), adresse("v_adresse"),
      groupe("L'acheteur", "المشتري"), nom("a_nom", ["Sami Trabelsi", "سامي الطرابلسي"]), cin("a_cin"), adresse("a_adresse", ["5 avenue Habib Bourguiba, Sousse", "5 شارع الحبيب بورقيبة، سوسة"]),
      groupe(moto ? "La moto (comme sur la carte grise)" : "La voiture (comme sur la carte grise)", moto ? "الدراجة النارية (كما في البطاقة الرمادية)" : "السيارة (كما في البطاقة الرمادية)"),
      c("marque", "Marque", "النوع (العلامة)", moto ? ["Yamaha", "ياماها"] : ["Peugeot", "بيجو"]), c("modele", "Modèle", "الطراز", moto ? "YBR 125" : "208"),
      c("immat", "N° d'immatriculation", "رقم التسجيل المنجمي", moto ? "123456" : ["123 TU 4567", "123 تونس 4567"]),
      c("chassis", "N° de série (châssis)", "الرقم التسلسلي (الهيكل)", "VF3XXXXXXXX123456"),
      date("mise", "Date de première mise en circulation (facultatif)", "تاريخ أول جولان (اختياري)", { opt: true, ex: "2019-03-15" }),
      c("puissance", puiss[0] + " (facultatif)", puiss[1] + " (اختياري)", puiss[2], { opt: true, mode: "numeric", max: 6 }),
      c("km", "Kilométrage au compteur (facultatif)", "عدد الكيلومترات بالعداد (اختياري)", "96000", { opt: true, mode: "numeric", max: 9 }),
      groupe("Le prix et la remise", "الثمن والتسليم"), c("prix", "Prix de vente (DT)", "ثمن البيع (د.ت)", moto ? "4500" : "32000", { type: "montant" }),
      choix("paiement", "Paiement", "الدفع", [{ v: "comptant", fr: "payé en totalité à la signature", ar: "مدفوع كاملا عند الإمضاء" }, { v: "autre", fr: "autres modalités", ar: "كيفية أخرى" }]),
      c("modalites", "Modalités de paiement", "كيفية الدفع", ["20 000 DT à la signature, le reste le 30/11/2026", "20.000 د عند الإمضاء والباقي في 30/11/2026"], { si: ["paiement", "autre"] }),
      date("remise", "Date de remise du véhicule", "تاريخ تسليم العربة"), c("heure", "Heure de remise (facultatif)", "ساعة التسليم (اختياري)", "15h00", { opt: true, max: 10 }),
      choix("frais", "Droits d'enregistrement et frais de carte grise à la charge", "معاليم التسجيل ومصاريف البطاقة الرمادية على", FRAIS),
      ...fin()
    ],
    fr: v => `<h1 class="d-titre">${T.fr}</h1>
<p><b>Entre les soussignés :</b></p>
<p>${idFR(v, "v_")}, ci-après « le vendeur »,</p>
<p>et ${idFR(v, "a_")}, ci-après « l'acheteur »,</p>
<p>il a été convenu ce qui suit :</p>
${art(1, "Objet", `Le vendeur vend à l'acheteur, qui accepte, le véhicule suivant :`)}${listeFR(v)}
${art(2, "Prix", `La vente est faite au prix de <b>${v("prix")}</b> (${v.lettres("prix")}). ${v.is("paiement", "autre") ? `Ce prix est payé selon les modalités suivantes : ${v("modalites")}.` : "Le vendeur reconnaît avoir reçu ce prix en totalité de l'acheteur à la signature du présent contrat, dont quittance."}`)}
${art(3, "Déclarations du vendeur", "Le vendeur déclare être le seul propriétaire du véhicule, inscrit à son nom sur la carte grise, et que ce véhicule n'est grevé d'aucun gage, saisie ou opposition.")}
${art(4, "État du véhicule", "L'acheteur déclare avoir examiné et essayé le véhicule et l'accepter dans l'état où il se trouve au jour de la remise. Les garanties prévues par la loi restent applicables.")}
${art(5, "Remise et responsabilité", `Le véhicule est remis à l'acheteur le ${remiseFR(v)}, avec la carte grise, les clés et les documents du véhicule. À compter de cette remise, l'acheteur est seul responsable de l'utilisation du véhicule, notamment des infractions, accidents et dommages ; le vendeur reste responsable de ceux survenus avant.`)}
${art(6, "Formalités et frais", `L'acheteur s'engage à faire enregistrer le présent contrat et à faire établir la carte grise à son nom auprès de l'Agence technique des transports terrestres (ATTT) dans les délais légaux. Les droits d'enregistrement et les frais de mutation sont à la charge ${v("frais")}.`)}
<p>Fait en deux exemplaires originaux, un pour chaque partie.</p>
${faitFR(v)}${signe("Le vendeur<br><small>signature légalisée</small>", "L'acheteur<br><small>signature légalisée</small>")}`,
    ar: v => `<h1 class="d-titre">${T.ar}</h1>
<p><b>بين الممضين أسفله:</b></p>
<p>${idAR(v, "v_")}، ويُشار إليه فيما يلي بـ«البائع»،</p>
<p>و${idAR(v, "a_")}، ويُشار إليه فيما يلي بـ«المشتري»،</p>
<p>تم الاتفاق على ما يلي:</p>
${fasl(1, "موضوع العقد", "باع البائع إلى المشتري، الذي قبل، العربة التالية:")}${listeAR(v)}
${fasl(2, "الثمن", `تم هذا البيع بثمن قدره <b>${v("prix")}</b> (${v.lettres("prix")}). ${v.is("paiement", "autre") ? `ويُدفع هذا الثمن حسب الكيفية التالية: ${v("modalites")}.` : "ويعترف البائع بأنه قبض هذا الثمن كاملا من المشتري عند إمضاء هذا العقد، وهذا إبراء له منه."}`)}
${fasl(3, "تصريحات البائع", "يصرح البائع بأنه المالك الوحيد للعربة المسجلة باسمه بالبطاقة الرمادية، وبأنها خالية من كل رهن أو عقلة أو اعتراض.")}
${fasl(4, "حالة العربة", "يصرح المشتري بأنه عاين العربة وجربها وقبلها على الحالة التي هي عليها يوم التسليم، مع بقاء الضمانات المنصوص عليها بالقانون سارية.")}
${fasl(5, "التسليم والمسؤولية", `تُسلَّم العربة إلى المشتري بتاريخ ${remiseAR(v)}، مع البطاقة الرمادية والمفاتيح ووثائق العربة. وابتداء من هذا التسليم يكون المشتري وحده مسؤولا عن استعمال العربة، وخاصة عن المخالفات والحوادث والأضرار، ويبقى البائع مسؤولا عما حصل قبل ذلك.`)}
${fasl(6, "الإجراءات والمصاريف", `يلتزم المشتري بتسجيل هذا العقد وباستخراج البطاقة الرمادية باسمه لدى الوكالة الفنية للنقل البري في الآجال القانونية. وتحمل معاليم التسجيل ومصاريف نقل الملكية على ${v("frais")}.`)}
<p>حُرّر في نظيرين أصليين، بيد كل طرف نظير.</p>
${faitAR(v)}${signe("البائع<br><small>إمضاء معرف به</small>", "المشتري<br><small>إمضاء معرف به</small>")}`
  };
}
const LEG_DEUX = { ic: "municipalite", fr: ["Légaliser les signatures", "Les deux parties, à la municipalité, en personne, avec leur CIN originale. Vous signez devant l'agent."],
  ar: ["التعريف بالإمضاءات", "الطرفان، بالبلدية، شخصيا، مع بطاقة التعريف الأصلية. تمضيان أمام العون."] };
const DOCS_CONTRATS = [
/* ======================================================================= 17 */
Object.assign({
  slug: "vente-voiture", cat: "vehicules", grand: true, rang: 17, motscles: { fr: "contrat vente voiture occasion acheter", ar: "عقد بيع سيارة شراء" },
  titre: { fr: "Contrat de vente d'une voiture", ar: "عقد بيع سيارة" },
  court: { fr: "Le contrat entre vendeur et acheteur, puis légalisation, enregistrement et carte grise.", ar: "العقد بين البائع والمشتري، ثم التعريف بالإمضاء والتسجيل والبطاقة الرمادية." },
  bref: { fr: "Vendre une voiture d'occasion entre particuliers se fait en 4 temps : contrat signé en 2 exemplaires, signatures légalisées à la municipalité, enregistrement à la recette des finances, puis mutation de la carte grise à l'ATTT.",
          ar: "يتم بيع سيارة مستعملة بين الخواص على 4 مراحل: عقد ممضى في نظيرين، التعريف بالإمضاءات بالبلدية، التسجيل بالقباضة المالية، ثم نقل ملكية البطاقة الرمادية بالوكالة الفنية للنقل البري." },
  legal: { legalisation: "oui", enregistrement: "oui", cout: AV("Modèle gratuit. Droits d'enregistrement : À VÉRIFIER (barème du Code des droits d'enregistrement et de timbre).", "النموذج مجاني. معاليم التسجيل: يُتثبت منها (جدول مجلة معاليم التسجيل والطابع الجبائي)."),
           delai: AV("Inscription à l'ATTT : 15 jours après la signature (délai annoncé, à confirmer auprès de l'ATTT).", "التسجيل بالوكالة الفنية للنقل البري: 15 يوما بعد الإمضاء (أجل معلن، يُتثبت منه لدى الوكالة).") },
  etapes: [
    { ic: "verifier", fr: ["Vérifier la voiture et ses papiers", "Carte grise au nom du vendeur, certificat de non gage de moins d'un mois (délivré par l'ATTT), vignette payée."], ar: ["التثبت من السيارة ووثائقها", "بطاقة رمادية باسم البائع، شهادة عدم رهن لا يتجاوز تاريخها شهرا (تسلمها الوكالة الفنية للنقل البري)، معلوم الجولان مدفوع."] },
    ETAPE_REMPLIR, ETAPE_IMPRIMER(2), LEG_DEUX,
    { ic: "recette", fr: ["Enregistrer à la recette des finances", "Paiement des droits d'enregistrement (montant à vérifier)."], ar: ["التسجيل بالقباضة المالية", "دفع معاليم التسجيل (المبلغ يُتثبت منه)."] },
    { ic: "attt", fr: ["Mutation de la carte grise à l'ATTT", "Demande, ancienne carte grise, contrat enregistré, certificat de non gage, reçu de déclaration d'impôt sur le revenu, vignette."], ar: ["نقل ملكية البطاقة الرمادية", "مطلب، البطاقة الرمادية القديمة، العقد المسجل، شهادة عدم الرهن، وصل التصريح بالضريبة على الدخل، معلوم الجولان."] }],
  pieces: { fr: ["Carte grise originale", "Certificat de non gage (moins d'un mois)", "Reçu de la vignette de l'année", "CIN originale du vendeur et de l'acheteur", "Reçu de déclaration d'impôt sur le revenu (demandé à l'ATTT)", "Contrat en 2 exemplaires"],
            ar: ["البطاقة الرمادية الأصلية", "شهادة عدم الرهن (أقل من شهر)", "وصل معلوم الجولان للسنة", "بطاقتا التعريف الأصليتان للبائع والمشتري", "وصل التصريح بالضريبة على الدخل (تطلبه الوكالة)", "العقد في نظيرين"] },
  ou: { fr: [LEG_OU.fr, "Recette des finances (enregistrement)", "Agence de l'ATTT (carte grise)"], ar: [LEG_OU.ar, "القباضة المالية (التسجيل)", "الوكالة الفنية للنقل البري (البطاقة الرمادية)"] },
  pieges: { fr: ["Recopiez le n° d'immatriculation et le n° de série exactement comme sur la carte grise.", "Ne remettez jamais la voiture sans contrat légalisé : jusqu'à la mutation, le vendeur reste le propriétaire inscrit.", "Méfiez-vous d'un certificat de non gage ancien : demandez-en un récent.", "Notez l'heure de la remise : elle fixe qui est responsable des amendes et accidents."],
            ar: ["انقل رقم التسجيل والرقم التسلسلي كما هما في البطاقة الرمادية.", "لا تسلم السيارة دون عقد معرف بإمضائه: إلى حين نقل الملكية يبقى البائع هو المالك المسجل.", "احذر من شهادة عدم رهن قديمة: اطلب شهادة حديثة.", "اكتب ساعة التسليم: بها يُعرف من يتحمل المخالفات والحوادث."] },
  averifier: { fr: ["Montant des droits d'enregistrement d'une vente de véhicule.", "Délai de 15 jours pour l'inscription à l'ATTT.", "Liste exacte des pièces demandées par l'ATTT."], ar: ["مبلغ معاليم تسجيل بيع عربة.", "أجل 15 يوما للتسجيل بالوكالة الفنية للنقل البري.", "القائمة الدقيقة للوثائق التي تطلبها الوكالة."] },
  faq: [
    { fr: ["Combien coûte l'enregistrement d'un contrat de vente de voiture ?", "Le montant dépend du barème du Code des droits d'enregistrement et de timbre. Nous ne l'affichons pas tant qu'il n'a pas été vérifié : demandez à la recette des finances."], ar: ["كم تبلغ معاليم تسجيل عقد بيع سيارة؟", "يتوقف المبلغ على جدول مجلة معاليم التسجيل والطابع الجبائي. لا ننشره قبل التثبت منه: اسأل القباضة المالية."] },
    { fr: ["Faut-il légaliser le contrat de vente de voiture ?", "Oui : le vendeur et l'acheteur signent devant l'agent de la municipalité, avec leur CIN originale, avant l'enregistrement."], ar: ["هل يجب التعريف بإمضاء عقد بيع السيارة؟", "نعم: يمضي البائع والمشتري أمام عون البلدية، مع بطاقة التعريف الأصلية، قبل التسجيل."] },
    { fr: ["Qui paie les frais de la vente ?", "C'est aux parties de le décider : le modèle vous laisse choisir l'acheteur, le vendeur, ou les deux à parts égales."], ar: ["من يدفع مصاريف البيع؟", "يقرر الطرفان ذلك: يتيح لك النموذج اختيار المشتري أو البائع أو الطرفين مناصفة."] }
  ],
  sources: ["attt", "finances", "legislation"]
}, venteVehicule(false)),
/* ======================================================================= 18 */
Object.assign({
  slug: "vente-moto", cat: "vehicules", grand: true, rang: 18, motscles: { fr: "contrat vente moto scooter", ar: "عقد بيع دراجة نارية موتور" },
  titre: { fr: "Contrat de vente d'une moto", ar: "عقد بيع دراجة نارية" },
  court: { fr: "Le contrat pour une moto immatriculée : mêmes étapes que la voiture.", ar: "عقد الدراجة النارية المسجلة: نفس مراحل السيارة." },
  bref: { fr: "Pour une moto immatriculée, les étapes sont les mêmes que pour une voiture : contrat en 2 exemplaires, légalisation, enregistrement à la recette des finances, mutation de la carte grise à l'ATTT.",
          ar: "بالنسبة إلى الدراجة النارية المسجلة، المراحل هي نفسها كالسيارة: عقد في نظيرين، التعريف بالإمضاء، التسجيل بالقباضة المالية، نقل ملكية البطاقة الرمادية." },
  legal: { legalisation: "oui", enregistrement: "oui", cout: AV("Modèle gratuit. Droits d'enregistrement : À VÉRIFIER.", "النموذج مجاني. معاليم التسجيل: يُتثبت منها."),
           delai: AV("Délai d'inscription à l'ATTT : à confirmer auprès de l'ATTT.", "أجل التسجيل بالوكالة: يُتثبت منه لدى الوكالة.") },
  etapes: [
    { ic: "verifier", fr: ["Vérifier la moto et ses papiers", "Carte grise au nom du vendeur, certificat de non gage récent."], ar: ["التثبت من الدراجة ووثائقها", "بطاقة رمادية باسم البائع، شهادة عدم رهن حديثة."] },
    ETAPE_REMPLIR, ETAPE_IMPRIMER(2), LEG_DEUX,
    { ic: "recette", fr: ["Enregistrer à la recette des finances", "Droits à payer : à vérifier."], ar: ["التسجيل بالقباضة المالية", "المعاليم: يُتثبت منها."] },
    { ic: "attt", fr: ["Mutation de la carte grise à l'ATTT", "Avec le contrat enregistré et les pièces demandées."], ar: ["نقل ملكية البطاقة الرمادية", "مع العقد المسجل والوثائق المطلوبة."] }],
  pieces: { fr: ["Carte grise originale", "Certificat de non gage", "CIN originale du vendeur et de l'acheteur", "Contrat en 2 exemplaires"], ar: ["البطاقة الرمادية الأصلية", "شهادة عدم الرهن", "بطاقتا التعريف الأصليتان للبائع والمشتري", "العقد في نظيرين"] },
  ou: { fr: [LEG_OU.fr, "Recette des finances", "Agence de l'ATTT"], ar: [LEG_OU.ar, "القباضة المالية", "الوكالة الفنية للنقل البري"] },
  pieges: { fr: ["Les petits cyclomoteurs non immatriculés ne suivent pas forcément ces étapes : renseignez-vous à l'ATTT.", "Recopiez le n° d'immatriculation et le n° de série exactement comme sur la carte grise."],
            ar: ["الدراجات الصغيرة غير المسجلة لا تخضع بالضرورة لهذه المراحل: استفسر لدى الوكالة.", "انقل رقم التسجيل والرقم التسلسلي كما هما في البطاقة الرمادية."] },
  averifier: { fr: ["Montant des droits d'enregistrement.", "Pièces et délai exigés par l'ATTT pour les motos."], ar: ["مبلغ معاليم التسجيل.", "الوثائق والأجل التي تشترطها الوكالة بالنسبة إلى الدراجات النارية."] },
  faq: [
    { fr: ["Faut-il légaliser un contrat de vente de moto ?", "Oui, comme pour une voiture : les signatures sont légalisées à la municipalité avant l'enregistrement."], ar: ["هل يجب التعريف بإمضاء عقد بيع دراجة نارية؟", "نعم، كالسيارة: يُعرَّف بالإمضاءات بالبلدية قبل التسجيل."] }
  ],
  sources: ["attt", "finances", "legislation"]
}, venteVehicule(true)),
/* ======================================================================= 19 */
{
  slug: "location-maison", cat: "logement", grand: true, rang: 19, motscles: { fr: "contrat location bail maison appartement logement loyer", ar: "عقد كراء منزل شقة سكنى" },
  titre: { fr: "Contrat de location d'une maison ou d'un appartement", ar: "عقد كراء منزل أو شقة" },
  court: { fr: "Le bail d'habitation, puis légalisation et enregistrement dans les 60 jours.", ar: "عقد كراء محل السكنى، ثم التعريف بالإمضاء والتسجيل في أجل 60 يوما." },
  bref: { fr: "Le bail d'habitation est signé en au moins 3 exemplaires, les signatures sont légalisées, puis le contrat est enregistré à la recette des finances du lieu du logement. Pénalités si l'enregistrement est fait après 60 jours.",
          ar: "يُمضى عقد كراء محل السكنى في 3 نظائر على الأقل، ويُعرَّف بالإمضاءات، ثم يُسجل العقد بالقباضة المالية لمكان المحل. توظف خطايا إذا تم التسجيل بعد 60 يوما." },
  legal: { legalisation: "oui", enregistrement: "oui", cout: AV("Modèle gratuit. Droits d'enregistrement pour un logement : taux À VÉRIFIER.", "النموذج مجاني. معاليم تسجيل كراء محل سكنى: النسبة يُتثبت منها."),
           delai: AV("Enregistrement dans les 60 jours (pénalités au-delà).", "التسجيل في أجل 60 يوما (خطايا بعده).") },
  exemple: { b_nom: ["Mohamed Ben Salah", "محمد بن صالح"], b_cin: "0XXXXXXX", b_adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"],
             l_nom: ["Karim Jaziri", "كريم الجزيري"], l_cin: "1XXXXXXX", l_adresse: ["3 rue Ibn Khaldoun, Sfax", "3 نهج ابن خلدون، صفاقس"],
             log_adresse: ["8 rue des Jasmins, Ariana", "8 نهج الياسمين، أريانة"], log_desc: ["un appartement de 3 pièces au 2e étage, avec cuisine et salle de bain", "شقة من 3 غرف بالطابق الثاني، بها مطبخ وبيت استحمام"],
             meuble: "non", debut: "2026-11-01", duree: "1an", preavis: "1", loyer: "750", jour: "5", garantie: "750", frais: "locataire", lieu: ["Ariana", "أريانة"], date: "2026-10-05" },
  champs: [
    groupe("Le propriétaire (bailleur)", "المالك (المسوّغ)"), nom("b_nom"), cin("b_cin"), adresse("b_adresse"),
    groupe("Le locataire", "المتسوّغ"), nom("l_nom", ["Karim Jaziri", "كريم الجزيري"]), cin("l_cin"), adresse("l_adresse", ["3 rue Ibn Khaldoun, Sfax", "3 نهج ابن خلدون، صفاقس"]),
    groupe("Le logement", "المحل"),
    c("log_adresse", "Adresse du logement loué", "عنوان المحل المسوَّغ", ["8 rue des Jasmins, Ariana", "8 نهج الياسمين، أريانة"]),
    c("log_desc", "Description", "الوصف", ["un appartement de 3 pièces au 2e étage, avec cuisine et salle de bain", "شقة من 3 غرف بالطابق الثاني، بها مطبخ وبيت استحمام"]),
    choix("meuble", "Meublé ?", "مؤثث؟", [{ v: "non", fr: "non meublé", ar: "غير مؤثث" }, { v: "oui", fr: "meublé", ar: "مؤثث" }]),
    groupe("La durée", "المدة"), date("debut", "Début de la location", "بداية الكراء", { ex: "2026-11-01" }),
    choix("duree", "Durée", "المدة", [{ v: "1an", fr: "un (1) an", ar: "سنة واحدة" }, { v: "2ans", fr: "deux (2) ans", ar: "سنتين" }, { v: "6mois", fr: "six (6) mois", ar: "ستة أشهر" }]),
    choix("preavis", "Préavis pour partir ou ne pas renouveler", "أجل الإعلام بالمغادرة أو عدم التجديد", [{ v: "1", fr: "un (1) mois", ar: "شهر واحد" }, { v: "2", fr: "deux (2) mois", ar: "شهرين" }, { v: "3", fr: "trois (3) mois", ar: "ثلاثة أشهر" }]),
    groupe("Le loyer", "معين الكراء"), c("loyer", "Loyer mensuel (DT)", "معين الكراء الشهري (د.ت)", "750", { type: "montant" }),
    c("jour", "Payé au plus tard le (jour du mois)", "يُدفع في أجل أقصاه اليوم (من الشهر)", "5", { mode: "numeric", max: 2 }),
    c("garantie", "Dépôt de garantie (DT, facultatif)", "مبلغ الضمان (د.ت، اختياري)", "750", { type: "montant", opt: true }),
    choix("frais", "Droits d'enregistrement à la charge", "معاليم التسجيل على", [{ v: "locataire", fr: "du locataire", ar: "المتسوّغ" }, { v: "bailleur", fr: "du bailleur", ar: "المسوّغ" }, { v: "moitie", fr: "des deux parties, à parts égales", ar: "الطرفين مناصفة" }]),
    ...fin()
  ],
  fr: v => { let n = 3; const N = () => ++n; return `<h1 class="d-titre">CONTRAT DE LOCATION D'UN LOCAL À USAGE D'HABITATION</h1>
<p><b>Entre les soussignés :</b></p>
<p>${idFR(v, "b_", "propriétaire du logement désigné ci-dessous")}, ci-après « le bailleur »,</p>
<p>et ${idFR(v, "l_")}, ci-après « le locataire »,</p>
<p>il a été convenu ce qui suit :</p>
${art(1, "Objet", `Le bailleur donne en location au locataire, qui accepte, le logement situé à ${v("log_adresse")}, composé de : ${v("log_desc")}, loué ${v("meuble")}. Le logement est loué à usage d'habitation uniquement. Le locataire ne peut ni le sous-louer ni céder le présent contrat sans l'accord écrit du bailleur.`)}
${art(2, "Durée", `Le présent contrat est conclu pour une durée de ${v("duree")}, à compter du ${v("debut")}. Il se renouvelle par tacite reconduction pour la même durée, sauf si l'une des parties informe l'autre par écrit de sa volonté d'y mettre fin, au moins ${v("preavis")} avant la fin de la période en cours.`)}
${art(3, "Loyer", `Le loyer est fixé à <b>${v("loyer")}</b> (${v.lettres("loyer")}) par mois, payable d'avance au plus tard le ${v("jour")} de chaque mois. Le bailleur remet un reçu au locataire à chaque paiement.`)}
${v.has("garantie") ? art(N(), "Dépôt de garantie", `À la signature, le locataire remet au bailleur la somme de <b>${v("garantie")}</b> (${v.lettres("garantie")}) à titre de garantie. Elle lui est rendue à la remise des clés, après déduction, le cas échéant, des loyers et charges impayés et du coût de réparation des dégradations dont il est responsable.`) : ""}
${art(N(), "Charges", "Les consommations d'eau, d'électricité, de gaz et de téléphone du logement sont à la charge du locataire.")}
${art(N(), "Obligations du locataire", "Le locataire s'engage à utiliser le logement avec soin, à payer le loyer aux dates prévues, à faire les petites réparations d'entretien courant, à ne faire aucune transformation sans l'accord écrit du bailleur, et à rendre le logement en bon état à la fin de la location, sauf l'usure normale.")}
${art(N(), "Obligations du bailleur", "Le bailleur s'engage à remettre le logement en bon état d'habitation, à faire les grosses réparations et à garantir au locataire la jouissance paisible du logement.")}
${art(N(), "Enregistrement", `Le présent contrat est enregistré à la recette des finances. Les droits d'enregistrement sont à la charge ${v("frais")}.`)}
<p>Fait en trois exemplaires originaux : un pour chaque partie et un pour l'enregistrement.</p>
${faitFR(v)}${signe("Le bailleur<br><small>signature légalisée</small>", "Le locataire<br><small>signature légalisée</small>")}`; },
  ar: v => { let n = 3; const N = () => ++n; return `<h1 class="d-titre">عقد كراء محل معد للسكنى</h1>
<p><b>بين الممضين أسفله:</b></p>
<p>${idAR(v, "b_", "مالك(ة) المحل المبين أسفله")}، ويُشار إليه فيما يلي بـ«المسوّغ»،</p>
<p>و${idAR(v, "l_")}، ويُشار إليه فيما يلي بـ«المتسوّغ»،</p>
<p>تم الاتفاق على ما يلي:</p>
${fasl(1, "موضوع العقد", `يسوّغ المسوّغ إلى المتسوّغ، الذي قبل، المحل الكائن بـ${v("log_adresse")}، والمتكون من: ${v("log_desc")}، ${v("meuble")}. ويُسوَّغ المحل للسكنى فقط، ولا يجوز للمتسوّغ تسويغه من الباطن أو إحالة هذا العقد دون موافقة كتابية من المسوّغ.`)}
${fasl(2, "المدة", `أُبرم هذا العقد لمدة ${v("duree")} تبتدئ من ${v("debut")}، ويتجدد ضمنيا لنفس المدة ما لم يُعلم أحد الطرفين الآخر كتابيا برغبته في إنهائه قبل ${v("preavis")} على الأقل من نهاية المدة الجارية.`)}
${fasl(3, "معين الكراء", `حُدد معين الكراء بـ<b>${v("loyer")}</b> (${v.lettres("loyer")}) شهريا، يُدفع مسبقا في أجل أقصاه اليوم ${v("jour")} من كل شهر، ويسلّم المسوّغ للمتسوّغ وصلا عن كل خلاص.`)}
${v.has("garantie") ? fasl(N(), "الضمان", `يدفع المتسوّغ عند الإمضاء إلى المسوّغ مبلغا قدره <b>${v("garantie")}</b> (${v.lettres("garantie")}) على سبيل الضمان، يُرجع إليه عند تسليم المفاتيح بعد طرح ما قد يكون متخلدا بذمته من معاليم كراء ومصاريف وكلفة إصلاح الأضرار التي يتحمل مسؤوليتها.`) : ""}
${fasl(N(), "المصاريف", "يتحمل المتسوّغ معاليم استهلاك الماء والكهرباء والغاز والهاتف بالمحل.")}
${fasl(N(), "التزامات المتسوّغ", "يلتزم المتسوّغ باستعمال المحل بعناية والمحافظة عليه، وبدفع معين الكراء في آجاله، وبالقيام بالإصلاحات البسيطة للصيانة العادية، وبعدم إدخال أي تغيير على المحل دون موافقة كتابية من المسوّغ، وبإرجاعه في حالة حسنة عند انتهاء الكراء باستثناء ما ينتج عن الاستعمال العادي.")}
${fasl(N(), "التزامات المسوّغ", "يلتزم المسوّغ بتسليم المحل في حالة صالحة للسكنى، وبالقيام بالإصلاحات الكبرى، وبضمان انتفاع المتسوّغ بالمحل انتفاعا هادئا.")}
${fasl(N(), "التسجيل", `يُسجل هذا العقد بالقباضة المالية، وتحمل معاليم التسجيل على ${v("frais")}.`)}
<p>حُرّر في ثلاثة نظائر أصلية: نظير لكل طرف ونظير للتسجيل.</p>
${faitAR(v)}${signe("المسوّغ<br><small>إمضاء معرف به</small>", "المتسوّغ<br><small>إمضاء معرف به</small>")}`; },
  etapes: [
    { ic: "verifier", fr: ["Vérifier le logement et le propriétaire", "Titre de propriété ou mandat du propriétaire, état du logement."], ar: ["التثبت من المحل ومن المالك", "سند الملكية أو توكيل المالك، حالة المحل."] },
    ETAPE_REMPLIR, ETAPE_IMPRIMER(3),
    { ic: "municipalite", fr: ["Légaliser les signatures", "Les deux parties, à la municipalité, avec leur CIN originale. Le propriétaire montre son quitus ou sa déclaration fiscale."], ar: ["التعريف بالإمضاءات", "الطرفان، بالبلدية، مع بطاقة التعريف الأصلية. يقدم المالك إبراء الذمة الجبائية أو تصريحه الجبائي."] },
    { ic: "recette", fr: ["Enregistrer à la recette des finances", "Celle du lieu du logement, dans les 60 jours. Contrat rendu en général sous 24 h."], ar: ["التسجيل بالقباضة المالية", "قباضة مكان المحل، في أجل 60 يوما. يُسترجع العقد عادة في ظرف 24 ساعة."] },
    { ic: "garder", fr: ["Chacun garde son exemplaire enregistré", "Et les reçus de loyer à chaque paiement (modèle « Reçu de loyer » sur ce site)."], ar: ["يحتفظ كل طرف بنظيره المسجل", "ووصولات خلاص الكراء عند كل دفع (نموذج «وصل خلاص كراء» بهذا الموقع)."] }],
  pieces: { fr: ["CIN originale du propriétaire et du locataire", "Quitus ou déclaration fiscale du propriétaire (à la légalisation)", "Bail en au moins 3 exemplaires"], ar: ["بطاقتا التعريف الأصليتان للمالك والمتسوغ", "إبراء الذمة أو التصريح الجبائي للمالك (عند التعريف بالإمضاء)", "العقد في 3 نظائر على الأقل"] },
  ou: { fr: [LEG_OU.fr, "Recette des finances du lieu du logement (enregistrement)"], ar: [LEG_OU.ar, "القباضة المالية لمكان المحل (التسجيل)"] },
  pieges: { fr: ["Passé 60 jours, des pénalités s'ajoutent aux droits d'enregistrement.", "Faites un état des lieux écrit à l'entrée (photos datées) : il évite les disputes sur le dépôt de garantie.", "Gardez un reçu pour chaque loyer payé."],
            ar: ["بعد 60 يوما تضاف خطايا إلى معاليم التسجيل.", "قم بمعاينة كتابية عند الدخول (صور مؤرخة): تجنب الخلافات حول مبلغ الضمان.", "احتفظ بوصل عن كل معين كراء مدفوع."] },
  averifier: { fr: ["Taux des droits d'enregistrement d'un bail d'habitation.", "Montant des pénalités de retard."], ar: ["نسبة معاليم تسجيل كراء محل سكنى.", "مبلغ خطايا التأخير."] },
  faq: [
    { fr: ["Faut-il enregistrer un contrat de location de maison en Tunisie ?", "Oui, à la recette des finances du lieu du logement, dans les 60 jours ; sinon des pénalités s'appliquent."], ar: ["هل يجب تسجيل عقد كراء منزل في تونس؟", "نعم، بالقباضة المالية لمكان المحل في أجل 60 يوما؛ وإلا توظف خطايا."] },
    { fr: ["Quel texte s'applique au bail d'habitation ?", "Le Code des obligations et des contrats (articles 727 et suivants)."], ar: ["ما هو النص المنطبق على كراء محل السكنى؟", "مجلة الالتزامات والعقود (الفصل 727 وما بعده)."] },
    { fr: ["Combien d'exemplaires faut-il ?", "Au moins 3 : un pour le propriétaire, un pour le locataire et un gardé par la recette des finances."], ar: ["كم نظيرا يلزم؟", "3 على الأقل: نظير للمالك ونظير للمتسوّغ ونظير تحتفظ به القباضة المالية."] }
  ],
  sources: ["finances", "legislation"]
}
];
DOCS.push(...DOCS_CONTRATS);
/* ======================================================================= 20 : bail commercial (modèle du 07/10/2026, demande d'Ahmed :
   plus de règle « modèle après relecture par un avocat »). Loi n° 77-37 du 25 mai 1977 + COC (louage). Aucun texte copié. */
const FRAIS_BAIL = [{ v: "locataire", fr: "du locataire", ar: "المتسوّغ" }, { v: "bailleur", fr: "du bailleur", ar: "المسوّغ" }, { v: "moitie", fr: "des deux parties, à parts égales", ar: "الطرفين مناصفة" }];
DOCS.push({
  slug: "bail-commercial", cat: "logement", grand: true, rang: 20, motscles: { fr: "bail commercial location local magasin boutique bureau loyer", ar: "كراء محل تجاري دكان مكتب" },
  titre: { fr: "Bail commercial (location d'un local)", ar: "عقد كراء محل تجاري" },
  court: { fr: "Louer un magasin, une boutique ou un bureau : contrat, légalisation, enregistrement (1 % du loyer annuel).", ar: "كراء دكان أو محل أو مكتب: العقد، التعريف بالإمضاء، التسجيل (1 % من معين الكراء السنوي)." },
  bref: { fr: "Le bail d'un local commercial suit la loi n° 77-37 du 25 mai 1977, qui donne au locataire des droits particuliers, notamment pour le renouvellement. Il est signé en plusieurs exemplaires, légalisé, puis enregistré à la recette des finances : droits de 1 % du loyer annuel, avec un minimum de 40 DT.",
          ar: "يخضع كراء المحل التجاري للقانون عدد 37 لسنة 1977 المؤرخ في 25 ماي 1977، الذي يمنح المتسوّغ حقوقا خاصة، خاصة في التجديد. يُمضى في عدة نظائر، ويُعرَّف بالإمضاء، ثم يُسجل بالقباضة المالية: المعاليم 1 % من معين الكراء السنوي، بحد أدنى 40 دينارا." },
  legal: { legalisation: "oui", enregistrement: "oui", cout: AV("Modèle gratuit. Enregistrement : 1 % du loyer annuel, minimum 40 DT (à confirmer à la recette des finances).", "النموذج مجاني. التسجيل: 1 % من معين الكراء السنوي، بحد أدنى 40 دينارا (يُتثبت منه بالقباضة المالية)."),
           delai: AV("Enregistrement dans les 60 jours (pénalités au-delà).", "التسجيل في أجل 60 يوما (خطايا بعده).") },
  exemple: { b_nom: ["Mohamed Ben Salah", "محمد بن صالح"], b_cin: "0XXXXXXX", b_adresse: ["12 rue de Marseille, Tunis", "12 نهج مرسيليا، تونس"],
             l_nom: ["Karim Jaziri", "كريم الجزيري"], l_cin: "1XXXXXXX", l_adresse: ["3 rue Ibn Khaldoun, Sfax", "3 نهج ابن خلدون، صفاقس"],
             loc_adresse: ["25 avenue de la Liberté, Sousse", "25 شارع الحرية، سوسة"], loc_desc: ["un local au rez-de-chaussée de 40 m², avec vitrine", "محل بالطابق الأرضي مساحته 40 م² بواجهة"],
             activite: ["vente de vêtements", "بيع الملابس"], debut: "2026-11-01", duree: "3ans", loyer: "1200", jour: "5", hausse: "5", garantie: "2400", frais: "locataire", lieu: ["Sousse", "سوسة"], date: "2026-10-05" },
  champs: [
    groupe("Le propriétaire (bailleur)", "المالك (المسوّغ)"), nom("b_nom"), cin("b_cin"), adresse("b_adresse"),
    groupe("Le locataire (personne ou gérant de la société)", "المتسوّغ (شخص أو مسير الشركة)"), nom("l_nom", ["Karim Jaziri", "كريم الجزيري"]), cin("l_cin"), adresse("l_adresse", ["3 rue Ibn Khaldoun, Sfax", "3 نهج ابن خلدون، صفاقس"]),
    groupe("Le local", "المحل"),
    c("loc_adresse", "Adresse du local", "عنوان المحل", ["25 avenue de la Liberté, Sousse", "25 شارع الحرية، سوسة"]),
    c("loc_desc", "Description", "الوصف", ["un local au rez-de-chaussée de 40 m², avec vitrine", "محل بالطابق الأرضي مساحته 40 م² بواجهة"]),
    c("activite", "Activité exercée dans le local", "النشاط الممارس بالمحل", ["vente de vêtements", "بيع الملابس"]),
    groupe("La durée", "المدة"), date("debut", "Début de la location", "بداية الكراء", { ex: "2026-11-01" }),
    choix("duree", "Durée", "المدة", [{ v: "3ans", fr: "trois (3) ans", ar: "ثلاث سنوات" }, { v: "1an", fr: "un (1) an", ar: "سنة واحدة" }, { v: "2ans", fr: "deux (2) ans", ar: "سنتين" }, { v: "5ans", fr: "cinq (5) ans", ar: "خمس سنوات" }]),
    groupe("Le loyer", "معين الكراء"), c("loyer", "Loyer mensuel (DT)", "معين الكراء الشهري (د.ت)", "1200", { type: "montant" }),
    c("jour", "Payé au plus tard le (jour du mois)", "يُدفع في أجل أقصاه اليوم (من الشهر)", "5", { mode: "numeric", max: 2 }),
    c("hausse", "Augmentation chaque année (%, facultatif)", "الزيادة كل سنة (%، اختياري)", "5", { opt: true, mode: "decimal", max: 4 }),
    c("garantie", "Dépôt de garantie (DT, facultatif)", "مبلغ الضمان (د.ت، اختياري)", "2400", { type: "montant", opt: true }),
    choix("frais", "Droits d'enregistrement à la charge", "معاليم التسجيل على", FRAIS_BAIL),
    ...fin()
  ],
  fr: v => { let n = 3; const N = () => ++n; return `<h1 class="d-titre">CONTRAT DE LOCATION D'UN LOCAL À USAGE COMMERCIAL</h1>
<p><b>Entre les soussignés :</b></p>
<p>${idFR(v, "b_", "propriétaire du local désigné ci-dessous")}, ci-après « le bailleur »,</p>
<p>et ${idFR(v, "l_")}, ci-après « le locataire »,</p>
<p>il a été convenu ce qui suit :</p>
${art(1, "Objet", `Le bailleur donne en location au locataire, qui accepte, le local situé à ${v("loc_adresse")}, composé de : ${v("loc_desc")}. Le local est loué pour l'activité suivante : ${v("activite")}. Le locataire ne peut pas changer d'activité, ni sous-louer le local ou céder le présent contrat, sans l'accord écrit du bailleur, sauf dans les cas prévus par la loi.`)}
${art(2, "Durée", `Le présent contrat est conclu pour une durée de ${v("duree")}, à compter du ${v("debut")}. Son renouvellement et sa fin sont soumis à la loi n° 77-37 du 25 mai 1977 sur les baux commerciaux.`)}
${art(3, "Loyer", `Le loyer est fixé à <b>${v("loyer")}</b> (${v.lettres("loyer")}) par mois, payable d'avance au plus tard le ${v("jour")} de chaque mois. Le bailleur remet un reçu au locataire à chaque paiement.${v.has("hausse") ? ` Le loyer augmente de ${v("hausse")} % chaque année, à la date anniversaire du contrat.` : ""}`)}
${v.has("garantie") ? art(N(), "Dépôt de garantie", `À la signature, le locataire remet au bailleur la somme de <b>${v("garantie")}</b> (${v.lettres("garantie")}) à titre de garantie. Elle lui est rendue à la remise des clés, après déduction, le cas échéant, des loyers et charges impayés et du coût de réparation des dégradations dont il est responsable.`) : ""}
${art(N(), "Charges, impôts et autorisations", "Les consommations d'eau, d'électricité, de gaz et de téléphone du local sont à la charge du locataire. Le locataire obtient à ses frais les autorisations nécessaires à son activité et respecte la réglementation qui s'y applique.")}
${art(N(), "Obligations du locataire", "Le locataire s'engage à utiliser le local avec soin et seulement pour l'activité prévue, à payer le loyer aux dates prévues, à faire les réparations d'entretien courant, à ne faire aucune transformation sans l'accord écrit du bailleur, et à rendre le local en bon état à la fin de la location, sauf l'usure normale.")}
${art(N(), "Obligations du bailleur", "Le bailleur s'engage à remettre le local en bon état, à faire les grosses réparations et à garantir au locataire la jouissance paisible du local.")}
${art(N(), "Enregistrement", `Le présent contrat est enregistré à la recette des finances. Les droits d'enregistrement sont à la charge ${v("frais")}.`)}
<p>Fait en trois exemplaires originaux : un pour chaque partie et un pour l'enregistrement.</p>
${faitFR(v)}${signe("Le bailleur<br><small>signature légalisée</small>", "Le locataire<br><small>signature légalisée</small>")}`; },
  ar: v => { let n = 3; const N = () => ++n; return `<h1 class="d-titre">عقد كراء محل معد للاستعمال التجاري</h1>
<p><b>بين الممضين أسفله:</b></p>
<p>${idAR(v, "b_", "مالك(ة) المحل المبين أسفله")}، ويُشار إليه فيما يلي بـ«المسوّغ»،</p>
<p>و${idAR(v, "l_")}، ويُشار إليه فيما يلي بـ«المتسوّغ»،</p>
<p>تم الاتفاق على ما يلي:</p>
${fasl(1, "موضوع العقد", `يسوّغ المسوّغ إلى المتسوّغ، الذي قبل، المحل الكائن بـ${v("loc_adresse")}، والمتكون من: ${v("loc_desc")}. ويُسوَّغ المحل لممارسة النشاط التالي: ${v("activite")}. ولا يجوز للمتسوّغ تغيير النشاط أو تسويغ المحل من الباطن أو إحالة هذا العقد دون موافقة كتابية من المسوّغ، إلا في الحالات التي يقتضيها القانون.`)}
${fasl(2, "المدة", `أُبرم هذا العقد لمدة ${v("duree")} تبتدئ من ${v("debut")}. ويخضع تجديده وإنهاؤه للقانون عدد 37 لسنة 1977 المؤرخ في 25 ماي 1977 المتعلق بالكراء التجاري.`)}
${fasl(3, "معين الكراء", `حُدد معين الكراء بـ<b>${v("loyer")}</b> (${v.lettres("loyer")}) شهريا، يُدفع مسبقا في أجل أقصاه اليوم ${v("jour")} من كل شهر، ويسلّم المسوّغ للمتسوّغ وصلا عن كل خلاص.${v.has("hausse") ? ` ويُرفّع في معين الكراء بنسبة ${v("hausse")} % كل سنة، في تاريخ ذكرى إبرام العقد.` : ""}`)}
${v.has("garantie") ? fasl(N(), "الضمان", `يدفع المتسوّغ عند الإمضاء إلى المسوّغ مبلغا قدره <b>${v("garantie")}</b> (${v.lettres("garantie")}) على سبيل الضمان، يُرجع إليه عند تسليم المفاتيح بعد طرح ما قد يكون متخلدا بذمته من معاليم كراء ومصاريف وكلفة إصلاح الأضرار التي يتحمل مسؤوليتها.`) : ""}
${fasl(N(), "المصاريف والأداءات والتراخيص", "يتحمل المتسوّغ معاليم استهلاك الماء والكهرباء والغاز والهاتف بالمحل. ويتحصل المتسوّغ على نفقته على التراخيص اللازمة لنشاطه ويحترم التراتيب المنطبقة عليه.")}
${fasl(N(), "التزامات المتسوّغ", "يلتزم المتسوّغ باستعمال المحل بعناية وللنشاط المتفق عليه فقط، وبدفع معين الكراء في آجاله، وبالقيام بإصلاحات الصيانة العادية، وبعدم إدخال أي تغيير على المحل دون موافقة كتابية من المسوّغ، وبإرجاعه في حالة حسنة عند انتهاء الكراء باستثناء ما ينتج عن الاستعمال العادي.")}
${fasl(N(), "التزامات المسوّغ", "يلتزم المسوّغ بتسليم المحل في حالة حسنة، وبالقيام بالإصلاحات الكبرى، وبضمان انتفاع المتسوّغ بالمحل انتفاعا هادئا.")}
${fasl(N(), "التسجيل", `يُسجل هذا العقد بالقباضة المالية، وتحمل معاليم التسجيل على ${v("frais")}.`)}
<p>حُرّر في ثلاثة نظائر أصلية: نظير لكل طرف ونظير للتسجيل.</p>
${faitAR(v)}${signe("المسوّغ<br><small>إمضاء معرف به</small>", "المتسوّغ<br><small>إمضاء معرف به</small>")}`; },
  etapes: [
    { ic: "verifier", fr: ["Vérifier le local et l'activité autorisée", "Destination du local, autorisations nécessaires à votre activité."], ar: ["التثبت من المحل ومن النشاط المسموح به", "وجهة المحل، الرخص اللازمة لنشاطك."] },
    ETAPE_REMPLIR, ETAPE_IMPRIMER(3),
    { ic: "municipalite", fr: ["Légaliser les signatures", "Les deux parties, à la municipalité, avec leur CIN originale."], ar: ["التعريف بالإمضاءات", "الطرفان، بالبلدية، مع بطاقة التعريف الأصلية."] },
    { ic: "recette", fr: ["Enregistrer à la recette des finances", "Droits : 1 % du loyer annuel, minimum 40 DT, dans les 60 jours."], ar: ["التسجيل بالقباضة المالية", "المعاليم: 1 % من معين الكراء السنوي، بحد أدنى 40 دينارا، في أجل 60 يوما."] },
    { ic: "garder", fr: ["Déclarer l'adresse au registre", "Si vous créez une société ou un commerce : RNE."], ar: ["التصريح بالعنوان بالسجل", "إن كنت تحدث شركة أو تجارة: السجل الوطني للمؤسسات."] }],
  pieces: { fr: ["CIN ou extrait du registre des parties", "Quitus fiscal du propriétaire", "Bail en au moins 3 exemplaires"], ar: ["بطاقات التعريف أو مضمون السجل للأطراف", "إبراء الذمة الجبائية للمالك", "العقد في 3 نظائر على الأقل"] },
  ou: { fr: [LEG_OU.fr, "Recette des finances du lieu du local", "Registre national des entreprises (si création d'activité)"], ar: [LEG_OU.ar, "القباضة المالية لمكان المحل", "السجل الوطني للمؤسسات (عند بعث نشاط)"] },
  pieges: { fr: ["Le bail commercial donne des droits particuliers au locataire (renouvellement, indemnité en cas de refus) : lisez bien la loi n° 77-37.", "Si le locataire est une société, écrivez le nom de la société et de son gérant, avec son matricule fiscal.", "Écrivez clairement l'activité permise : changer d'activité sans accord peut poser problème.", "Passé 60 jours, des pénalités s'ajoutent aux droits d'enregistrement."],
            ar: ["يمنح الكراء التجاري حقوقا خاصة للمتسوّغ (التجديد، غرامة في صورة الرفض): اقرأ جيدا القانون عدد 37 لسنة 1977.", "إذا كان المتسوّغ شركة، اكتب اسم الشركة واسم مسيرها مع معرفها الجبائي.", "اكتب بوضوح النشاط المسموح به: تغيير النشاط دون موافقة قد يطرح إشكالا.", "بعد 60 يوما تضاف خطايا إلى معاليم التسجيل."] },
  averifier: { fr: ["Taux de 1 % et minimum de 40 DT (à reconfirmer à chaque loi de finances).", "Montant des pénalités de retard.", "Règles d'augmentation du loyer prévues par la loi n° 77-37."], ar: ["نسبة 1 % والحد الأدنى 40 دينارا (يُعاد التثبت منهما مع كل قانون مالية).", "مبلغ خطايا التأخير.", "قواعد الترفيع في معين الكراء المنصوص عليها بالقانون عدد 37 لسنة 1977."] },
  faq: [
    { fr: ["Combien coûte l'enregistrement d'un bail commercial ?", "1 % du loyer annuel, avec un minimum de 40 DT, à la recette des finances (à confirmer sur place)."], ar: ["كم تبلغ معاليم تسجيل كراء محل تجاري؟", "1 % من معين الكراء السنوي، بحد أدنى 40 دينارا، بالقباضة المالية (يُتثبت منه بعين المكان)."] },
    { fr: ["Quelle loi régit le bail commercial ?", "La loi n° 77-37 du 25 mai 1977."], ar: ["ما هو القانون المنظم للكراء التجاري؟", "القانون عدد 37 لسنة 1977 المؤرخ في 25 ماي 1977."] }
  ],
  sources: ["finances", "legislation", "rne"]
});


/* ---- Démarches expliquées : EXPLICATION SEULEMENT, aucun modèle à remplir (textes officiels vérifiés le 05/10/2026) ----
   Divorce et mariage : Code du statut personnel (art. 3, 5, 30 à 32), loi n° 57-3 (état civil), loi n° 64-46 (certificat prénuptial),
   loi n° 98-94 (communauté des biens), Code de procédure civile (art. 68), édition de l'Imprimerie officielle.
   Contrat de travail : loi n° 2025-9 du 21 mai 2025 (JORT n° 61 du 23 mai 2025) ; fiches CNSS (affiliation, immatriculation).
   CIVP, Karama, Service civil : décret gouvernemental n° 2019-542 du 28 mai 2019 (publié sur le site de l'ANETI). */
const GUIDES = [
{
  slug: "divorce", cat: "famille", guide: true,
  titre: { fr: "Divorce : les étapes", ar: "الطلاق: المراحل" },
  court: { fr: "Toujours devant le tribunal : 3 types de divorce, tentative de conciliation obligatoire.", ar: "دائما أمام المحكمة: 3 أنواع من الطلاق، ومحاولة الصلح وجوبية." },
  bref: { fr: "En Tunisie, le divorce ne peut avoir lieu que devant le tribunal (Code du statut personnel, art. 30). L'article 31 prévoit 3 cas : consentement mutuel, demande d'un époux pour le préjudice subi, demande du mari ou de la femme. Le juge de la famille tente d'abord de réconcilier les époux.",
          ar: "في تونس لا يقع الطلاق إلا لدى المحكمة (مجلة الأحوال الشخصية، الفصل 30). ويضبط الفصل 31 ثلاث حالات: التراضي بين الزوجين، طلب أحد الزوجين بسبب ما لحقه من ضرر، رغبة الزوج أو الزوجة في الطلاق. ويحاول قاضي الأسرة أولا الصلح بين الزوجين." },
  legal: { legalisation: "non", enregistrement: "non", cout: AV("Frais de procédure, d'huissier et d'avocat : à vérifier.", "مصاريف الإجراءات وعدل التنفيذ والمحامي: يُتثبت منها."),
           delai: AV("2 mois de réflexion avant les plaidoiries ; avec enfants mineurs, 3 audiences de conciliation à 30 jours d'intervalle au moins.", "شهران للتأمل قبل المرافعة؛ ومع وجود أبناء قصر 3 جلسات صلحية لا يقل الفاصل بينها عن 30 يوما.") },
  etapes: [
    { ic: "info", fr: ["Connaître les 3 types de divorce", "Consentement mutuel ; divorce pour préjudice subi ; divorce à la demande du mari ou de la femme (art. 31). Dans les 2 derniers cas, le tribunal statue aussi sur la réparation du préjudice."], ar: ["معرفة أنواع الطلاق الثلاثة", "الطلاق بالتراضي؛ الطلاق للضرر؛ الطلاق بطلب من الزوج أو الزوجة (الفصل 31). وفي الحالتين الأخيرتين تقضي المحكمة أيضا بجبر الضرر."] },
    { ic: "remettre", fr: ["Saisir le tribunal de première instance", "Par une requête au tribunal. En matière de statut personnel, l'avocat n'est pas obligatoire devant ce tribunal (Code de procédure civile, art. 68), mais il est vivement conseillé."], ar: ["رفع الدعوى أمام المحكمة الابتدائية", "بعريضة لدى المحكمة. في مادة الأحوال الشخصية، إنابة المحامي غير وجوبية أمام هذه المحكمة (مجلة المرافعات المدنية والتجارية، الفصل 68)، لكنها مستحسنة جدا."] },
    { ic: "question", fr: ["Tentative de conciliation", "Le juge de la famille cherche à réconcilier les époux. Avec des enfants mineurs : 3 audiences, au moins 30 jours entre chacune. Il peut se faire aider par un conciliateur familial si les deux époux l'acceptent (art. 32)."], ar: ["محاولة الصلح", "يسعى قاضي الأسرة إلى الصلح بين الزوجين. مع وجود أبناء قصر: 3 جلسات، لا يقل الفاصل بين كل جلسة والتي تليها عن 30 يوما. ويمكنه الاستعانة بمصالح عائلي إذا قبل الزوجان ذلك (الفصل 32)."] },
    { ic: "alerte", fr: ["Mesures urgentes", "Le juge de la famille fixe, même d'office, la résidence des époux, la pension alimentaire, la garde des enfants et le droit de visite."], ar: ["الوسائل المتأكدة", "يتخذ قاضي الأسرة، ولو من تلقاء نفسه، القرارات المتعلقة بسكنى الزوجين والنفقة والحضانة وحق الزيارة."] },
    { ic: "horloge", fr: ["Réflexion, puis jugement", "2 mois de réflexion avant les plaidoiries (le juge peut abréger en cas de consentement mutuel, sans nuire aux enfants). Le jugement règle aussi la rente due à la femme divorcée."], ar: ["مدة التأمل ثم الحكم", "شهران للتأمل قبل المرافعة (يمكن للقاضي اختصار الإجراءات في الطلاق بالتراضي دون الإضرار بمصلحة الأبناء). ويضبط الحكم أيضا الجراية المستحقة للمطلقة."] },
    { ic: "garder", fr: ["Inscription à l'état civil", "Le greffier envoie le jugement définitif à l'état civil : il est transcrit et mentionné en marge de l'acte de mariage et des actes de naissance (loi n° 57-3, art. 40 et 41)."], ar: ["الترسيم بالحالة المدنية", "يوجه كاتب المحكمة الحكم النهائي إلى الحالة المدنية: يُرسم ويُنص عليه بطرة رسم الزواج ورسوم ولادة الزوجين (القانون عدد 3 لسنة 1957، الفصلان 40 و41)."] }],
  pieces: { fr: ["Carte d'identité (CIN)", "Extrait de l'acte de mariage", "Pièces utiles à votre demande (préjudice, revenus, enfants) : liste exacte au greffe ou chez votre avocat"],
            ar: ["بطاقة التعريف الوطنية", "مضمون من رسم الزواج", "الوثائق المفيدة لطلبك (الضرر، المداخيل، الأبناء): القائمة الدقيقة لدى كتابة المحكمة أو لدى محاميك"] },
  ou: { fr: ["Tribunal de première instance (juge de la famille)", "Un avocat (conseillé)", "Un huissier de justice (pour notifier la demande à l'autre époux)"], ar: ["المحكمة الابتدائية (قاضي الأسرة)", "محام (مستحسن)", "عدل تنفيذ (لإعلام الزوج الآخر بالدعوى)"] },
  pieges: { fr: ["Un divorce décidé hors du tribunal n'a aucune valeur : seul le jugement compte (art. 30).", "Avec des enfants mineurs, la conciliation prend au moins 3 audiences : comptez plusieurs mois.", "Les décisions sur la garde, la pension et la résidence s'appliquent même en cas d'appel."],
            ar: ["الطلاق خارج المحكمة لا قيمة له: الحكم وحده هو المعتبر (الفصل 30).", "مع وجود أبناء قصر يتطلب الصلح 3 جلسات على الأقل: احسب عدة أشهر.", "القرارات المتعلقة بالحضانة والنفقة والسكنى تُنفذ حتى في صورة الاستئناف."] },
  averifier: { fr: ["Frais de procédure, d'huissier et honoraires d'avocat.", "Liste exacte des pièces demandées par le greffe.", "Une proposition de loi (2025) prévoyait un divorce par consentement mutuel devant notaire : nous n'avons trouvé aucun texte adopté. Vérifiez qu'aucune loi nouvelle n'a été publiée au JORT."],
               ar: ["مصاريف الإجراءات وعدل التنفيذ وأتعاب المحامي.", "القائمة الدقيقة للوثائق التي تطلبها كتابة المحكمة.", "مقترح قانون (2025) يتعلق بالطلاق بالتراضي أمام عدل إشهاد: لم نجد أي نص مصادق عليه. تثبت من عدم صدور قانون جديد بالرائد الرسمي."] },
  faq: [
    { fr: ["Peut-on divorcer sans passer par le tribunal en Tunisie ?", "Non. Selon l'article 30 du Code du statut personnel, le divorce ne peut avoir lieu que devant le tribunal."], ar: ["هل يمكن الطلاق دون المرور بالمحكمة في تونس؟", "لا. حسب الفصل 30 من مجلة الأحوال الشخصية، لا يقع الطلاق إلا لدى المحكمة."] },
    { fr: ["L'avocat est-il obligatoire pour divorcer ?", "Devant le tribunal de première instance, le Code de procédure civile (art. 68) ne rend pas l'avocat obligatoire en matière de statut personnel. Il reste vivement conseillé."], ar: ["هل المحامي وجوبي في قضية الطلاق؟", "أمام المحكمة الابتدائية، لا توجب مجلة المرافعات المدنية والتجارية (الفصل 68) إنابة المحامي في مادة الأحوال الشخصية. لكنها تبقى مستحسنة جدا."] },
    { fr: ["Pourquoi n'y a-t-il pas de modèle ?", "Un divorce a des conséquences importantes (enfants, pension, logement) : cette page explique seulement les étapes. Faites-vous conseiller par un avocat."], ar: ["لماذا لا يوجد نموذج؟", "للطلاق آثار هامة (الأبناء، النفقة، السكن): هذه الصفحة تشرح المراحل فقط. استشر محاميا."] }
  ],
  sources: ["legislation", "justice"]
},
{
  slug: "mariage", cat: "famille", guide: true,
  titre: { fr: "Se marier en Tunisie : les démarches", ar: "الزواج في تونس: الإجراءات" },
  court: { fr: "Certificat prénuptial, officier de l'état civil ou deux notaires, deux témoins.", ar: "الشهادة الطبية السابقة للزواج، ضابط الحالة المدنية أو عدلا إشهاد، شاهدان." },
  bref: { fr: "Le mariage est conclu devant l'officier de l'état civil ou devant deux notaires, en présence de deux témoins (loi n° 57-3, art. 31). Chaque futur époux remet un certificat médical prénuptial de moins de 2 mois. Âge minimum : 18 ans pour chacun.",
          ar: "يُبرم عقد الزواج أمام ضابط الحالة المدنية أو أمام عدلي إشهاد، بحضور شاهدين (القانون عدد 3 لسنة 1957، الفصل 31). ويقدم كل واحد من الخطيبين شهادة طبية سابقة للزواج لا يتجاوز تاريخها شهرين. السن الدنيا: 18 سنة لكل منهما." },
  legal: { legalisation: "non", enregistrement: "non", cout: AV("Certificat prénuptial gratuit dans les hôpitaux publics (loi n° 64-46, art. 4). Autres frais (municipalité, notaires) : à vérifier.", "الشهادة الطبية مجانية بالمستشفيات العمومية (القانون عدد 46 لسنة 1964، الفصل 4). المصاريف الأخرى (البلدية، عدول الإشهاد): يُتثبت منها."),
           delai: AV("Certificat médical de moins de 2 mois le jour du mariage.", "شهادة طبية لا يتجاوز تاريخها شهرين يوم الزواج.") },
  etapes: [
    { ic: "verifier", fr: ["Vérifier les conditions", "Consentement des deux époux, 18 ans révolus (sinon autorisation spéciale du juge), aucun empêchement (mariage non dissous, parenté…), dot fixée au profit de la femme (Code du statut personnel, art. 3 et 5)."], ar: ["التثبت من الشروط", "رضا الزوجين، بلوغ 18 سنة كاملة (وإلا فإذن خاص من القاضي)، انتفاء الموانع (زواج قائم، قرابة…)، تسمية مهر للزوجة (مجلة الأحوال الشخصية، الفصلان 3 و5)."] },
    { ic: "liste", fr: ["Certificat médical prénuptial", "Chaque futur époux passe un examen médical (médecin agréé ou hôpital public, gratuit à l'hôpital). Le certificat doit dater de moins de 2 mois."], ar: ["الشهادة الطبية السابقة للزواج", "يجري كل واحد من الخطيبين فحصا طبيا (طبيب أو مخبر مرخص له أو مستشفى عمومي، مجانا بالمستشفى). يجب ألا يتجاوز تاريخ الشهادة شهرين."] },
    { ic: "municipalite", fr: ["Conclure le mariage", "Devant l'officier de l'état civil (municipalité) ou devant deux notaires, avec deux témoins. Les noms des époux, de leurs parents et la dot figurent dans l'acte."], ar: ["إبرام عقد الزواج", "أمام ضابط الحالة المدنية (البلدية) أو أمام عدلي إشهاد، بحضور شاهدين. يتضمن الرسم أسماء الزوجين ووالديهما والمهر."] },
    { ic: "signer", fr: ["Choisir le régime des biens", "On vous rappelle le régime facultatif de la communauté des biens ; votre réponse est écrite dans l'acte. Sans choix écrit : séparation des biens (loi n° 98-94, art. 7)."], ar: ["اختيار نظام الأملاك", "يُذكّركما محرر العقد بنظام الاشتراك في الأملاك الاختياري ويُنص على جوابكما في العقد. وإن لم يُنص على الاختيار: نظام التفرقة في الأملاك (القانون عدد 94 لسنة 1998، الفصل 7)."] },
    { ic: "garder", fr: ["Inscription à l'état civil", "Le mariage est inscrit au registre et mentionné en marge des actes de naissance des époux. Chez deux notaires : ils envoient un avis de mariage à l'état civil dans le mois."], ar: ["الترسيم بالحالة المدنية", "يُرسم الزواج بالدفتر ويُنص عليه بطرة رسمي ولادة الزوجين. عند عدلي الإشهاد: يوجهان إعلاما بالزواج إلى ضابط الحالة المدنية في أجل شهر."] }],
  pieces: { fr: ["Carte d'identité (CIN) des futurs époux", "Certificat médical prénuptial de chacun (moins de 2 mois)", "Deux témoins", "En cas de remariage : preuve de la fin du mariage précédent (décès ou divorce)"],
            ar: ["بطاقتا تعريف الخطيبين", "شهادة طبية سابقة للزواج لكل منهما (أقل من شهرين)", "شاهدان", "في صورة زواج سابق: ما يثبت انتهاءه (وفاة أو طلاق)"] },
  ou: { fr: ["Municipalité (officier de l'état civil)", "Ou deux notaires (عدول الإشهاد)", "Hôpital public ou médecin agréé (certificat prénuptial)"], ar: ["البلدية (ضابط الحالة المدنية)", "أو عدلا إشهاد", "مستشفى عمومي أو طبيب مرخص له (الشهادة الطبية)"] },
  pieges: { fr: ["Un mariage conclu hors de ces formes (mariage « orfi ») est nul et puni de prison (loi n° 57-3, art. 36).", "Un certificat prénuptial de plus de 2 mois n'est pas accepté.", "Mariage à l'étranger selon la loi locale : faites-le transcrire au consulat de Tunisie dans les 3 mois (loi n° 57-3, art. 37)."],
            ar: ["الزواج المبرم خارج هذه الصيغ (الزواج العرفي) باطل ويعاقب عليه بالسجن (القانون عدد 3 لسنة 1957، الفصل 36).", "لا تُقبل شهادة طبية تجاوز تاريخها شهرين.", "الزواج بالخارج حسب القانون المحلي: يجب ترسيمه بالقنصلية التونسية في أجل 3 أشهر (القانون عدد 3 لسنة 1957، الفصل 37)."] },
  averifier: { fr: ["Liste exacte des pièces demandées par votre municipalité (extrait de naissance, photos…).", "Frais à la municipalité et honoraires des notaires.", "Délai pour obtenir un rendez-vous à la municipalité."],
               ar: ["القائمة الدقيقة للوثائق التي تطلبها بلديتك (مضمون ولادة، صور…).", "المعاليم بالبلدية وأجرة عدول الإشهاد.", "أجل الحصول على موعد بالبلدية."] },
  faq: [
    { fr: ["Le certificat prénuptial est-il obligatoire ?", "Oui, dans toute la Tunisie (arrêté du 28 juillet 1995). Il doit dater de moins de 2 mois (loi n° 64-46). Le juge peut en dispenser dans des cas exceptionnels."], ar: ["هل الشهادة الطبية السابقة للزواج وجوبية؟", "نعم، بكامل تراب الجمهورية (قرار 28 جويلية 1995). ويجب ألا يتجاوز تاريخها شهرين (القانون عدد 46 لسنة 1964). ويمكن للقاضي الإعفاء منها في حالات استثنائية."] },
    { fr: ["Qu'est-ce que la communauté des biens ?", "Un régime facultatif (loi n° 98-94) : les immeubles acquis après le mariage et destinés à la famille appartiennent aux deux époux, sauf ceux reçus par succession, donation ou legs. Sans choix écrit, c'est la séparation des biens."], ar: ["ما هو نظام الاشتراك في الأملاك؟", "نظام اختياري (القانون عدد 94 لسنة 1998): العقارات المكتسبة بعد الزواج والمخصصة لاستعمال العائلة تكون على ملك الزوجين، باستثناء ما انتقل بالإرث أو الهبة أو الوصية. وإن لم يُنص على الاختيار فالنظام هو التفرقة في الأملاك."] },
    { fr: ["Pourquoi n'y a-t-il pas de modèle ?", "L'acte de mariage est rédigé par l'officier de l'état civil ou par les notaires : il n'y a rien à remplir soi-même."], ar: ["لماذا لا يوجد نموذج؟", "يحرر رسم الزواج ضابط الحالة المدنية أو عدلا الإشهاد: لا شيء تعمره بنفسك."] }
  ],
  sources: ["legislation"]
},
{
  slug: "contrat-de-travail", cat: "travail", guide: true,
  titre: { fr: "Contrat de travail (CDI, CDD) : les règles de 2025", ar: "عقد الشغل: قواعد 2025" },
  court: { fr: "Le CDI est la règle, le CDD seulement dans des cas précis, déclaration à la CNSS.", ar: "العقد غير معين المدة هو الأصل، والعقد معين المدة في حالات محددة فقط، والتصريح لدى الضمان الاجتماعي." },
  bref: { fr: "Depuis la loi n° 2025-9 du 21 mai 2025 (JORT n° 61 du 23 mai 2025), le contrat de travail est en principe à durée indéterminée (CDI). Le CDD n'est permis que dans des cas exceptionnels et doit être écrit ; la sous-traitance de main-d'œuvre est interdite. L'employeur déclare le salarié à la CNSS.",
          ar: "منذ القانون عدد 9 لسنة 2025 المؤرخ في 21 ماي 2025 (الرائد الرسمي عدد 61 بتاريخ 23 ماي 2025)، الأصل في عقد الشغل أن يكون لمدة غير معينة. ولا يُسمح بالعقد لمدة معينة إلا في حالات استثنائية ويجب أن يكون كتابيا؛ ومناولة اليد العاملة ممنوعة. ويصرح المؤجر بالأجير لدى الصندوق الوطني للضمان الاجتماعي." },
  legal: { legalisation: "non", enregistrement: "non", cout: AV("Aucun frais pour signer. Cotisations CNSS : taux à vérifier auprès de la CNSS.", "لا معاليم للإمضاء. اشتراكات الضمان الاجتماعي: النسب يُتثبت منها لدى الصندوق."),
           delai: AV("Immatriculation du salarié à la CNSS dans le mois qui suit l'embauche.", "تسجيل الأجير بالصندوق في أجل شهر من تاريخ الانتداب.") },
  etapes: [
    { ic: "info", fr: ["Le CDI est la règle", "Le contrat de travail est conclu pour une durée indéterminée (Code du travail, art. 6-2 nouveau, loi n° 2025-9)."], ar: ["العقد غير معين المدة هو الأصل", "يُبرم عقد الشغل لمدة غير معينة (مجلة الشغل، الفصل 6-2 جديد، القانون عدد 9 لسنة 2025)."] },
    { ic: "verifier", fr: ["CDD : seulement dans des cas précis", "Surcroît exceptionnel de travail ; remplacement temporaire d'un salarié permanent absent ou dont le contrat est suspendu ; travaux saisonniers ; activités où l'usage ou leur nature excluent le CDI (art. 6-4 nouveau)."], ar: ["العقد لمدة معينة: في حالات محددة فقط", "زيادة غير عادية في حجم العمل؛ التعويض الوقتي لأجير قار متغيب أو معلق عقده؛ الأعمال الموسمية؛ الأنشطة التي لا يمكن حسب العرف أو بحكم طبيعتها اللجوء فيها إلى عقود لمدة غير معينة (الفصل 6-4 جديد)."] },
    { ic: "signer", fr: ["CDD : toujours par écrit", "Le CDD est écrit et précise sa durée et le cas d'exception ; sinon il est considéré comme un CDI. Pas de période d'essai dans un CDD."], ar: ["العقد لمدة معينة: كتابيا دائما", "يُبرم العقد لمدة معينة كتابيا مع التنصيص على مدته وحالة الاستثناء؛ وإلا اعتُبر مبرما لمدة غير معينة. ولا فترة تجربة في العقد لمدة معينة."] },
    { ic: "horloge", fr: ["Période d'essai (CDI seulement)", "Facultative : 6 mois au plus, renouvelable une fois pour la même durée. Chaque partie peut y mettre fin en prévenant l'autre par un moyen laissant une trace écrite, 15 jours avant (art. 6-3 nouveau)."], ar: ["فترة التجربة (العقد غير معين المدة فقط)", "اختيارية: ستة أشهر على الأكثر، قابلة للتجديد مرة واحدة ولنفس المدة. ويمكن لكل طرف إنهاؤها بإعلام الطرف الآخر بأي وسيلة تترك أثرا كتابيا قبل 15 يوما (الفصل 6-3 جديد)."] },
    { ic: "garder", fr: ["Déclarer le salarié à la CNSS", "L'employeur s'affilie à la CNSS le mois qui suit sa première embauche, puis demande l'immatriculation du salarié dans le mois de l'embauche. Sinon, le salarié peut la demander lui-même au bureau de la CNSS."], ar: ["التصريح بالأجير لدى الصندوق", "ينخرط المؤجر بالصندوق في الشهر الذي يلي أول انتداب، ثم يطلب تسجيل الأجير في أجل شهر من انتدابه. وإلا يمكن للأجير أن يطلب تسجيله بنفسه لدى مكتب الصندوق."] }],
  pieces: { fr: ["Immatriculation du salarié : demande (formulaire CNSS) et copie de sa CIN", "Salarié marié : copie de la CIN du conjoint (ayants droit)", "Affiliation de l'employeur : demande (formulaire CNSS), CIN, extrait du registre ou carte d'identification fiscale"],
            ar: ["تسجيل الأجير: مطلب (مطبوعة الصندوق) ونسخة من بطاقة تعريفه", "الأجير المتزوج: نسخة من بطاقة تعريف القرين (أولو الحق)", "انخراط المؤجر: مطلب (مطبوعة الصندوق)، بطاقة التعريف، مضمون من السجل أو بطاقة التعريف الجبائية"] },
  ou: { fr: ["Bureau régional ou local de la CNSS", "Ministère des Affaires sociales (inspection du travail) pour toute question sur le contrat"], ar: ["المكتب الجهوي أو المحلي للصندوق الوطني للضمان الاجتماعي", "وزارة الشؤون الاجتماعية (تفقدية الشغل) لكل سؤال حول العقد"] },
  pieges: { fr: ["Un CDD sans écrit, sans durée ou hors des cas prévus devient un CDI.", "Si le salarié continue à travailler après la fin du CDD, le contrat devient un CDI, avec son ancienneté et sans période d'essai (art. 17 nouveau).", "La sous-traitance de main-d'œuvre est interdite (le gardiennage et le nettoyage en font partie) : amende de 10 000 DT (art. 28 et 29 nouveaux).", "Le salarié en CDD a les mêmes droits que les permanents du même métier et une priorité d'embauche en CDI chez le même employeur."],
            ar: ["العقد لمدة معينة دون كتب أو دون مدة أو خارج الحالات المحددة يصبح عقدا لمدة غير معينة.", "إذا واصل الأجير العمل بعد انقضاء العقد لمدة معينة يتحول العقد إلى عقد غير معين المدة مع حفظ أقدميته ودون فترة تجربة (الفصل 17 جديد).", "مناولة اليد العاملة ممنوعة (ومنها الحراسة والتنظيف): خطية بعشرة آلاف دينار (الفصلان 28 و29 جديدان).", "للأجير بعقد لمدة معينة نفس حقوق الأجراء القارين في نفس الاختصاص وأولوية الانتداب في مواطن الشغل القارة لدى نفس المؤجر."] },
  averifier: { fr: ["La loi impose l'écrit pour le CDD ; pour le CDI, vérifiez si votre convention collective exige un contrat écrit et son contenu.", "Taux des cotisations CNSS de l'employeur et du salarié.", "Textes d'application publiés après la loi n° 2025-9 (arrêtés du ministère des Affaires sociales).", "Effet de la loi sur les contrats des programmes d'emploi (CIVP, Karama)."],
               ar: ["يفرض القانون الكتابة في العقد لمدة معينة؛ بالنسبة إلى العقد غير معين المدة تثبت إن كانت اتفاقيتك المشتركة تشترط عقدا كتابيا وما يتضمنه.", "نسب اشتراكات الضمان الاجتماعي للمؤجر وللأجير.", "النصوص التطبيقية الصادرة بعد القانون عدد 9 لسنة 2025 (قرارات وزارة الشؤون الاجتماعية).", "أثر القانون على عقود برامج التشغيل (عقد الإعداد للحياة المهنية، عقد الكرامة)."] },
  faq: [
    { fr: ["Un CDD est-il encore possible en Tunisie ?", "Oui, mais seulement dans les cas exceptionnels de l'article 6-4 nouveau du Code du travail (surcroît exceptionnel de travail, remplacement, travaux saisonniers, usage). Sinon, il devient un CDI."], ar: ["هل لا يزال العقد لمدة معينة ممكنا في تونس؟", "نعم، لكن فقط في الحالات الاستثنائية للفصل 6-4 جديد من مجلة الشغل (زيادة غير عادية في العمل، تعويض أجير، أعمال موسمية، العرف). وإلا يصبح عقدا لمدة غير معينة."] },
    { fr: ["Combien de temps dure la période d'essai ?", "6 mois au plus, renouvelable une fois pour la même durée, et seulement dans un CDI (loi n° 2025-9)."], ar: ["ما هي مدة فترة التجربة؟", "ستة أشهر على الأكثر، قابلة للتجديد مرة واحدة ولنفس المدة، وفقط في العقد غير معين المدة (القانون عدد 9 لسنة 2025)."] },
    { fr: ["Pourquoi n'y a-t-il pas de modèle de contrat ?", "Pas encore : un contrat de travail doit respecter la loi de 2025 et la convention collective de votre secteur. Le modèle sera ajouté au site."], ar: ["لماذا لا يوجد نموذج عقد؟", "ليس بعد: يجب أن يحترم عقد الشغل قانون 2025 والاتفاقية المشتركة لقطاعك. سيُضاف النموذج إلى الموقع."] }
  ],
  sources: ["arp", "social", "cnss", "legislation"]
},
{
  slug: "civp-karama-service-civil", cat: "travail", guide: true,
  titre: { fr: "CIVP, Karama, Service civil : les programmes de l'ANETI", ar: "عقد الإعداد للحياة المهنية، عقد الكرامة، عقد الخدمة المدنية" },
  court: { fr: "Stages et aides à l'embauche pour les demandeurs d'emploi inscrits à l'ANETI.", ar: "تربصات وحوافز انتداب لطالبي الشغل المسجلين بمكاتب التشغيل." },
  bref: { fr: "Le décret gouvernemental n° 2019-542 du 28 mai 2019 fixe les programmes du Fonds national de l'emploi, gérés par l'ANETI : le CIVP (stage en entreprise privée), le contrat Karama (aide à l'embauche de diplômés) et le contrat Service civil (activité dans une association). Il faut être inscrit dans un bureau de l'emploi.",
          ar: "يضبط الأمر الحكومي عدد 542 لسنة 2019 المؤرخ في 28 ماي 2019 برامج الصندوق الوطني للتشغيل التي تتصرف فيها الوكالة الوطنية للتشغيل والعمل المستقل: عقد الإعداد للحياة المهنية (تربص بمؤسسة خاصة)، عقد الكرامة (حافز لانتداب أصحاب الشهائد) وعقد الخدمة المدنية (نشاط في جمعية). ويجب التسجيل بمكتب التشغيل." },
  legal: { legalisation: "non", enregistrement: "non", cout: AV("Le bénéficiaire reçoit une indemnité mensuelle (montants du décret de 2019, à vérifier).", "يتحصل المنتفع على منحة شهرية (مقادير أمر 2019، يُتثبت منها)."),
           delai: AV("CIVP et Service civil : 12 mois au plus, prolongeables à titre exceptionnel d'un an au plus.", "عقد الإعداد للحياة المهنية وعقد الخدمة المدنية: 12 شهرا على الأكثر، قابلة للتمديد بصفة استثنائية لمدة أقصاها سنة.") },
  etapes: [
    { ic: "remettre", fr: ["S'inscrire au bureau de l'emploi", "Inscription au bureau de l'emploi et du travail indépendant (ANETI) de votre région, ou en ligne sur le site officiel de l'ANETI."], ar: ["التسجيل بمكتب التشغيل", "التسجيل بمكتب التشغيل والعمل المستقل بجهتك، أو عن بعد بالموقع الرسمي للوكالة."] },
    { ic: "ecole", fr: ["CIVP (contrat d'initiation à la vie professionnelle)", "Pour les Tunisiens en recherche d'un premier emploi (cette condition ne s'applique pas aux non-diplômés du supérieur ni aux personnes handicapées). Stage en entreprise privée. Indemnité ANETI : 200 DT (diplômés du supérieur) ou 150 DT, plus un complément obligatoire payé par l'entreprise."], ar: ["عقد الإعداد للحياة المهنية", "لطالبي الشغل لأول مرة من ذوي الجنسية التونسية (لا ينطبق هذا الشرط على غير حاملي شهادة التعليم العالي ولا على ذوي الإعاقة). تربص بمؤسسة خاصة. منحة الوكالة: 200 دينار (لحاملي شهادات التعليم العالي) أو 150 دينارا، مع منحة تكميلية وجوبية تدفعها المؤسسة."] },
    { ic: "info", fr: ["Contrat Karama (contrat de la dignité)", "Pour les diplômés du supérieur en recherche d'un premier emploi, au chômage depuis au moins 2 ans. L'entreprise privée paie au moins 600 DT net par mois ; le Fonds prend en charge la moitié du salaire net (400 DT au plus) et des cotisations sociales pendant 2 ans."], ar: ["عقد الكرامة", "لحاملي شهادات التعليم العالي طالبي الشغل لأول مرة الذين لا تقل فترة بطالتهم عن سنتين. تدفع المؤسسة الخاصة أجرا صافيا لا يقل عن 600 دينار شهريا؛ ويتكفل الصندوق بنصف الأجر الصافي (400 دينار على الأكثر) وبالمساهمات الاجتماعية طيلة سنتين."] },
    { ic: "bouclier", fr: ["Contrat Service civil", "Pour les diplômés du supérieur en recherche d'un premier emploi, au chômage depuis plus d'un an : activité dans une association ou une organisation professionnelle. Indemnité ANETI : 200 DT par mois."], ar: ["عقد الخدمة المدنية", "لحاملي شهادات التعليم العالي طالبي الشغل لأول مرة الذين تجاوزت فترة بطالتهم السنة: نشاط بجمعية أو منظمة مهنية. منحة الوكالة: 200 دينار شهريا."] },
    { ic: "liste", fr: ["Dossier déposé au bureau de l'emploi", "L'entreprise ou l'association dépose sa demande au bureau de l'emploi de sa région, sur le formulaire de l'ANETI (à télécharger sur son site), avec les pièces demandées."], ar: ["ملف يودع بمكتب التشغيل", "تودع المؤسسة أو الجمعية مطلبها بمكتب التشغيل المختص ترابيا حسب أنموذج الوكالة (يُحمّل من موقعها)، مع الوثائق المطلوبة."] }],
  pieces: { fr: ["Inscription au bureau de l'emploi (obligatoire)", "Formulaire de l'ANETI pour le programme choisi", "Autres pièces (diplôme, CIN…) : liste exacte au bureau de l'emploi"],
            ar: ["التسجيل بمكتب التشغيل (وجوبي)", "أنموذج الوكالة الخاص بالبرنامج المختار", "وثائق أخرى (الشهادة، بطاقة التعريف…): القائمة الدقيقة بمكتب التشغيل"] },
  ou: { fr: ["Bureau de l'emploi et du travail indépendant (ANETI) de votre région", "Site officiel de l'ANETI (inscription en ligne, formulaires)"], ar: ["مكتب التشغيل والعمل المستقل بجهتك", "الموقع الرسمي للوكالة (التسجيل عن بعد، المطبوعات)"] },
  pieges: { fr: ["Une entreprise ne peut prendre de nouveaux CIVP que si elle a embauché au moins 50 % des stagiaires CIVP des 3 années précédentes (décret n° 2019-542, art. 11).", "Le CIVP et le Service civil sont des stages indemnisés, pas des emplois salariés : vérifiez ce que vous signez.", "Passez directement par l'ANETI (bureau de l'emploi ou site officiel), sans intermédiaire."],
            ar: ["لا يمكن للمؤسسة قبول منتفعين جدد بعقد الإعداد للحياة المهنية إلا إذا أدمجت 50 % على الأقل ممن أنهوا هذا العقد خلال السنوات الثلاث السابقة (الأمر عدد 542 لسنة 2019، الفصل 11).", "عقد الإعداد للحياة المهنية وعقد الخدمة المدنية تربصات بمنحة، وليست شغلا مأجورا: تثبت مما تمضي عليه.", "تعامل مباشرة مع الوكالة (مكتب التشغيل أو الموقع الرسمي)، دون وسيط."] },
  averifier: { fr: ["Montants des indemnités (fixés en 2019, peut-être révisés depuis) et montant minimal du complément payé par l'entreprise (CIVP).", "Programme Karama : vérifiez auprès de l'ANETI qu'il accepte encore des demandes ; il prévoit un CDD renouvelable, à lire avec la loi n° 2025-9 qui limite les CDD.", "Liste exacte des pièces à fournir."],
               ar: ["مقادير المنح (ضُبطت سنة 2019 وقد تكون نُقحت) والمقدار الأدنى للمنحة التكميلية التي تدفعها المؤسسة (عقد الإعداد للحياة المهنية).", "عقد الكرامة: تثبت لدى الوكالة من أنه لا يزال مفتوحا؛ وهو ينص على عقد لمدة معينة قابل للتجديد، يُقرأ مع القانون عدد 9 لسنة 2025 الذي يحد من هذه العقود.", "القائمة الدقيقة للوثائق المطلوبة."] },
  faq: [
    { fr: ["Qui peut bénéficier d'un CIVP ?", "Les Tunisiens en recherche d'un premier emploi inscrits dans un bureau de l'emploi (décret n° 2019-542, art. 5). La condition « premier emploi » ne s'applique pas aux non-diplômés du supérieur ni aux personnes handicapées."], ar: ["من يمكنه الانتفاع بعقد الإعداد للحياة المهنية؟", "طالبو الشغل لأول مرة من ذوي الجنسية التونسية المسجلون بمكاتب التشغيل (الأمر عدد 542 لسنة 2019، الفصل 5). ولا ينطبق شرط الشغل لأول مرة على غير حاملي شهادة التعليم العالي ولا على ذوي الإعاقة."] },
    { fr: ["Combien de temps dure un CIVP ?", "12 mois au plus ; il peut être renouvelé ou prolongé à titre exceptionnel d'un an au plus (décret n° 2019-542, art. 6)."], ar: ["ما هي مدة عقد الإعداد للحياة المهنية؟", "12 شهرا على الأكثر؛ ويمكن تجديده أو تمديده بصفة استثنائية لمدة أقصاها سنة (الأمر عدد 542 لسنة 2019، الفصل 6)."] },
    { fr: ["Pourquoi n'y a-t-il pas de modèle ?", "Les contrats de ces programmes sont fournis par l'ANETI : cette page explique seulement les conditions et les étapes."], ar: ["لماذا لا يوجد نموذج؟", "عقود هذه البرامج توفرها الوكالة: هذه الصفحة تشرح الشروط والمراحل فقط."] }
  ],
  sources: ["aneti_prog", "aneti", "legislation"]
},
{
  slug: "pret-d-honneur", cat: "argent", guide: true, modele: "demande-pret-d-honneur",
  titre: { fr: "Prêt d'honneur sans intérêts en Tunisie : conditions, montants, pièces à fournir, démarches", ar: "القرض على الشرف دون فوائد: الشروط، المبالغ، الوثائق، الإجراءات" },
  court: { fr: "Jusqu'à 5 000, 10 000 ou 25 000 DT, sans intérêts ni garantie ; demande en ligne à la banque.", ar: "إلى حدود 5000 أو 10000 أو 25000 دينار، دون فوائد ولا ضمان؛ المطلب عن بعد لدى البنك." },
  bref: { fr: "Le décret n° 2026-148 du 23 juillet 2026 (Code de commerce, art. 412 ter) crée le crédit (ou prêt) sur l'honneur : sans intérêts, sans garantie ni caution, sans frais d'étude. Plafonds : 5 000 DT pour un particulier, 10 000 DT pour un petit projet, 25 000 DT pour une PME ou une société communautaire. Depuis le 1er octobre 2026, la demande se fait uniquement en ligne, sur la plateforme de la banque (circulaire BCT n° 2026-08).",
          ar: "أحدث الأمر عدد 148 لسنة 2026 المؤرخ في 23 جويلية 2026 (المجلة التجارية، الفصل 412 ثالثا) القرض على الشرف: دون فوائد، دون ضمان ولا كفيل، دون معاليم دراسة. الأسقف: 5000 دينار للفرد، 10000 دينار للمشروع الصغير، 25000 دينار للمؤسسة الصغرى أو المتوسطة أو الشركة الأهلية. منذ 1 أكتوبر 2026، يُقدم المطلب عن بعد فقط، عبر منصة البنك (منشور البنك المركزي عدد 8 لسنة 2026)." },
  motscles: HONNEUR_MOTS,
  legal: { legalisation: "non", enregistrement: "non", cout: AV("Sans intérêts, sans frais d'étude, sans garantie ni caution.", "دون فوائد، دون معاليم دراسة، دون ضمان ولا كفيل."),
           delai: AV("Réponse en 10 jours ouvrables au plus ; remboursement en 2 ans au plus, avec un différé possible de 6 mois au plus.", "الرد في أجل أقصاه 10 أيام عمل؛ الخلاص في سنتين على الأكثر، مع إمكانية إمهال لا يتجاوز 6 أشهر.") },
  etapes: [
    { ic: "info", fr: ["Trouver votre catégorie", "Particulier : 5 000 DT au plus, pour des besoins de consommation. Petit projet (investissement de 150 000 DT au plus) : 10 000 DT. PME (investissement de 150 000 DT à 15 millions de DT) ou société communautaire : 25 000 DT (définitions : circulaire BCT n° 2026-08, annexe 2)."], ar: ["تحديد صنفك", "الفرد: 5000 دينار على الأكثر لتمويل حاجيات الاستهلاك. المشروع الصغير (استثمار لا يتجاوز 150 ألف دينار): 10000 دينار. المؤسسة الصغرى أو المتوسطة (استثمار بين 150 ألف دينار و15 مليون دينار) أو الشركة الأهلية: 25000 دينار (التعريفات: منشور البنك المركزي عدد 8 لسنة 2026، الملحق 2)."] },
    { ic: "liste", fr: ["Préparer le dossier", "CIN, RIB et, selon votre cas, présentation du projet, extrait du RNE, statuts. Le modèle de lettre de ce site vous aide à tout rassembler avant de remplir la demande en ligne."], ar: ["إعداد الملف", "بطاقة التعريف، RIB، وحسب وضعيتك: تقديم المشروع، مضمون السجل الوطني للمؤسسات، العقد التأسيسي. يساعدك نموذج الرسالة في هذا الموقع على جمع كل شيء قبل تعمير المطلب عن بعد."] },
    { ic: "remettre", fr: ["Déposer la demande en ligne", HONNEUR_DEPOT.fr], ar: ["إيداع المطلب عن بعد", HONNEUR_DEPOT.ar] },
    { ic: "horloge", fr: ["Réponse de la banque", "Les demandes sont classées par ordre d'arrivée. La banque répond dans un délai de 10 jours ouvrables au plus ; un refus doit être motivé."], ar: ["رد البنك", "تُرتب المطالب حسب أسبقية الإيداع. ويرد البنك في أجل أقصاه 10 أيام عمل؛ ويجب أن يكون الرفض معللا."] },
    { ic: "verifier", fr: ["Vérification puis versement", "Avant de verser l'argent, la banque vérifie à la Banque centrale que vous n'avez pas un crédit sur l'honneur de la même catégorie non remboursé (circulaire, art. 4)."], ar: ["التثبت ثم الصرف", "قبل صرف المبلغ، يتثبت البنك لدى البنك المركزي من عدم حصولك على قرض على الشرف من نفس الصنف لم يتم خلاصه بالكامل (المنشور، الفصل 4)."] },
    { ic: "recette", fr: ["Rembourser", "Sans intérêts, sur 2 ans au plus, avec un différé possible de 6 mois au plus. Les échéances exactes sont dans le contrat de la banque."], ar: ["الخلاص", "دون فوائد، على سنتين على الأكثر، مع إمكانية إمهال لا يتجاوز 6 أشهر. الأقساط الدقيقة مضبوطة في عقد البنك."] }],
  pieces: HONNEUR_PIECES,
  ou: HONNEUR_OU,
  pieges: HONNEUR_PIEGES,
  averifier: HONNEUR_AVERIFIER,
  faq: [
    { fr: ["Qui peut obtenir un prêt d'honneur en Tunisie ?", "Quatre catégories : les particuliers (5 000 DT au plus, besoins de consommation), les porteurs de petits projets (10 000 DT), les petites et moyennes entreprises et les sociétés communautaires (25 000 DT). La banque applique aussi ses règles internes."], ar: ["من يمكنه الحصول على قرض على الشرف في تونس؟", "أربعة أصناف: الأفراد (5000 دينار على الأكثر لحاجيات الاستهلاك)، أصحاب المشاريع الصغرى (10000 دينار)، المؤسسات الاقتصادية الصغرى والمتوسطة والشركات الأهلية (25000 دينار). ويطبق البنك أيضا سياساته الداخلية."] },
    { fr: ["Où déposer la demande de crédit sur l'honneur ?", "Uniquement sur la plateforme en ligne de votre banque, depuis le 1er octobre 2026. Une demande remise autrement n'est pas prise en compte (circulaire BCT n° 2026-08, art. 3)."], ar: ["أين أودع مطلب القرض على الشرف؟", "فقط عبر المنصة الإلكترونية لبنكك، منذ 1 أكتوبر 2026. ولا يُعتد بالمطلب المقدم بطريقة أخرى (منشور البنك المركزي عدد 8 لسنة 2026، الفصل 3)."] },
    { fr: ["Faut-il une garantie, un garant ou payer des frais ?", "Non : ni intérêts, ni garantie, ni caution, ni frais d'étude du dossier."], ar: ["هل يجب تقديم ضمان أو كفيل أو دفع معاليم؟", "لا: لا فوائد ولا ضمان ولا كفيل ولا معاليم دراسة الملف."] },
    { fr: ["Peut-on avoir deux prêts d'honneur ?", "Pas tant qu'un précédent crédit sur l'honneur de la même catégorie n'est pas entièrement remboursé : la banque le vérifie à la Banque centrale."], ar: ["هل يمكن الحصول على قرضين على الشرف؟", "لا، ما دام قرض سابق على الشرف من نفس الصنف لم يُسدد بالكامل: يتثبت البنك من ذلك لدى البنك المركزي."] }
  ],
  sources: HONNEUR_SOURCES
},
/* Traite (lettre de change) : explication seulement (07/10/2026, demande d'Ahmed). D'après le Code de commerce (livre III,
   lettre de change). Pas de modèle : les banques utilisent des formulaires imprimés. Points non confirmés dans « averifier ». */
{
  slug: "traite-lettre-de-change", cat: "argent", guide: true,
  motscles: { fr: "traite lettre de change effet de commerce échéance aval endos protêt", ar: "كمبيالة سفتجة كمبيالات ورقة تجارية أجل ضمان احتياطي تظهير احتجاج" },
  titre: { fr: "Traite (lettre de change) : la remplir et la signer sans risque", ar: "الكمبيالة: كيفية تعميرها وإمضائها دون مخاطر" },
  court: { fr: "Qui est qui, les mentions à écrire, et ce qu'il faut vérifier avant de la signer ou de la donner.", ar: "من هو من، البيانات التي تُكتب، وما يجب التثبت منه قبل إمضائها أو تسليمها." },
  bref: { fr: "La traite (lettre de change, كمبيالة) est un ordre écrit : le tireur (celui à qui l'argent est dû) ordonne au tiré (celui qui doit payer) de payer une somme précise, à une date précise (l'échéance), au bénéficiaire. En signant « accepté », le tiré s'engage à payer à l'échéance. Elle est régie par le Code de commerce. On la remplit sur un formulaire imprimé, vendu en librairie ou fourni par la banque.",
          ar: "الكمبيالة (السفتجة) أمر كتابي: يأمر الساحب (الدائن) المسحوب عليه (المدين) بأن يدفع مبلغا محددا، في تاريخ محدد (تاريخ الاستحقاق)، إلى المستفيد. وبإمضائه «مقبول» يلتزم المسحوب عليه بالدفع عند الاستحقاق. وتخضع لمجلة التجارة. وتُعمّر على مطبوعة تباع بالمكتبات أو يسلمها البنك." },
  legal: { legalisation: "non", enregistrement: "non", cout: AV("Formulaire en librairie ou à la banque. Droit de timbre éventuel : À VÉRIFIER.", "المطبوعة بالمكتبات أو بالبنك. معلوم الطابع الجبائي إن وجد: يُتثبت منه."),
           delai: AV("Paiement à l'échéance écrite sur la traite. Si elle n'est pas payée, le protêt doit être fait très vite (délai à vérifier).", "الدفع في تاريخ الاستحقاق المكتوب بالكمبيالة. إذا لم تُدفع، يجب القيام بالاحتجاج بسرعة كبيرة (الأجل يُتثبت منه).") },
  etapes: [
    { ic: "info", fr: ["Qui est qui", "Le tireur fait la traite : c'est celui à qui l'argent est dû (souvent le vendeur). Le tiré doit payer (souvent l'acheteur). Le bénéficiaire reçoit l'argent : souvent le tireur lui-même, ou sa banque."], ar: ["من هو من", "الساحب يحرر الكمبيالة: هو الدائن (غالبا البائع). المسحوب عليه هو الذي يدفع (غالبا المشتري). المستفيد يقبض المبلغ: غالبا الساحب نفسه أو بنكه."] },
    { ic: "remplir", fr: ["Écrire toutes les mentions", "Le montant, le nom du tiré, l'échéance, le lieu de paiement (banque et RIB du tiré), le nom du bénéficiaire, la date et le lieu de création, et la signature du tireur. Le mot « lettre de change » est déjà imprimé sur le formulaire."], ar: ["كتابة كل البيانات", "المبلغ، اسم المسحوب عليه، تاريخ الاستحقاق، مكان الدفع (بنك المسحوب عليه ومعرفه البنكي RIB)، اسم المستفيد، تاريخ ومكان الإنشاء، وإمضاء الساحب. عبارة «كمبيالة» مطبوعة مسبقا على المطبوعة."] },
    { ic: "verifier", fr: ["Le montant en chiffres ET en lettres", "Écrivez la même somme dans les deux cases, sans rature. Si les deux ne sont pas pareilles, c'est en général la somme en lettres qui compte."], ar: ["المبلغ بالأرقام وبالأحرف", "اكتب نفس المبلغ في الخانتين، دون شطب. إذا اختلفا، يُعتد عادة بالمبلغ المكتوب بالأحرف."] },
    { ic: "signer", fr: ["Le tiré accepte en signant", "Il écrit « accepté » et signe sur le devant de la traite. Dès ce moment, il doit payer à l'échéance."], ar: ["المسحوب عليه يقبل بالإمضاء", "يكتب «مقبول» ويمضي على وجه الكمبيالة. ومنذ تلك اللحظة يصبح ملزما بالدفع عند الاستحقاق."] },
    { ic: "remettre", fr: ["La donner à quelqu'un (endos)", "Pour la transmettre à une autre personne ou à une banque, le bénéficiaire signe au dos (endossement). Chaque personne qui signe au dos garantit aussi le paiement."], ar: ["تسليمها لشخص آخر (التظهير)", "لإحالتها إلى شخص آخر أو إلى بنك، يمضي المستفيد على ظهرها (التظهير). وكل من يمضي على الظهر يضمن هو أيضا الدفع."] },
    { ic: "horloge", fr: ["Le jour de l'échéance", "La traite est présentée à la banque du tiré. L'argent doit être sur le compte ce jour-là."], ar: ["يوم الاستحقاق", "تُقدَّم الكمبيالة إلى بنك المسحوب عليه. ويجب أن يكون المبلغ بالحساب في ذلك اليوم."] },
    { ic: "alerte", fr: ["Si elle n'est pas payée", "Le porteur fait constater l'impayé par un huissier de justice (protêt), puis peut réclamer le paiement au tiré, au tireur et à ceux qui ont signé au dos, avec les frais."], ar: ["إذا لم تُدفع", "يطلب الحامل من عدل منفذ معاينة عدم الدفع (الاحتجاج)، ثم يمكنه مطالبة المسحوب عليه والساحب ومن أمضوا على الظهر بالدفع مع المصاريف."] }],
  pieces: { fr: ["Formulaire de traite (librairie ou banque)", "RIB complet du tiré (banque où la traite sera payée)", "Facture ou contrat qui explique la dette (à garder)"], ar: ["مطبوعة الكمبيالة (مكتبة أو بنك)", "المعرف البنكي الكامل RIB للمسحوب عليه (البنك الذي ستُدفع فيه)", "الفاتورة أو العقد الذي يبين الدين (للاحتفاظ به)"] },
  ou: { fr: ["Banque du tiré (paiement à l'échéance)", "Banque du bénéficiaire (remise à l'encaissement)", "Huissier de justice (protêt si impayé)"], ar: ["بنك المسحوب عليه (الدفع عند الاستحقاق)", "بنك المستفيد (التقديم للاستخلاص)", "عدل منفذ (الاحتجاج عند عدم الدفع)"] },
  pieges: { fr: ["Ne signez JAMAIS une traite en blanc (sans montant, sans échéance ou sans nom) : quelqu'un pourrait la remplir à votre place.",
                 "Avant de signer, relisez le montant, l'échéance et le nom du bénéficiaire.",
                 "Attention : une fois acceptée et donnée à une autre personne ou à une banque, vous devez la payer même s'il y a un problème avec la marchandise ou le service. Réglez les désaccords AVANT de signer.",
                 "Pour payer en plusieurs fois, faites une traite par échéance et notez leurs numéros et dates dans le contrat ou la facture.",
                 "Gardez une photo de chaque traite signée et la liste des échéances.",
                 "Mettez l'argent sur le compte avant l'échéance : une traite impayée entraîne un protêt, des frais et des poursuites.",
                 "Si vous payez une traite directement (sans la banque), récupérez l'original : sinon elle peut vous être présentée une seconde fois.",
                 "Si vous recevez une traite : vérifiez la signature d'acceptation, le RIB complet du tiré et sa capacité à payer."],
            ar: ["لا تمض أبدا كمبيالة على بياض (دون مبلغ أو دون تاريخ استحقاق أو دون اسم): قد يعمّرها شخص آخر مكانك.",
                 "قبل الإمضاء، أعد قراءة المبلغ وتاريخ الاستحقاق واسم المستفيد.",
                 "انتبه: بعد قبولها وتسليمها إلى شخص آخر أو إلى بنك، يجب عليك دفعها حتى لو كان هناك إشكال في البضاعة أو الخدمة. حُلّ الخلافات قبل الإمضاء.",
                 "للدفع على أقساط، حرر كمبيالة لكل قسط واكتب أعدادها وتواريخها في العقد أو الفاتورة.",
                 "احتفظ بصورة لكل كمبيالة ممضاة وبقائمة تواريخ الاستحقاق.",
                 "ضع المبلغ في الحساب قبل الاستحقاق: الكمبيالة غير المدفوعة تؤدي إلى احتجاج ومصاريف وتتبعات.",
                 "إذا دفعت كمبيالة مباشرة (دون البنك)، استرجع الأصل: وإلا قد تُقدَّم إليك مرة ثانية.",
                 "إذا تسلمت كمبيالة: تثبت من إمضاء القبول ومن المعرف البنكي الكامل للمسحوب عليه ومن قدرته على الدفع."] },
  averifier: { fr: ["Obligation d'utiliser le formulaire normalisé exigé par les banques (Banque centrale de Tunisie).", "Droit de timbre sur la traite.", "Délai et frais du protêt.", "Inscription d'une traite impayée auprès de la Banque centrale.", "Articles exacts du Code de commerce sur la lettre de change."],
               ar: ["وجوب استعمال المطبوعة الموحدة التي تشترطها البنوك (البنك المركزي التونسي).", "معلوم الطابع الجبائي على الكمبيالة.", "أجل الاحتجاج ومصاريفه.", "تسجيل الكمبيالة غير المدفوعة لدى البنك المركزي.", "الفصول الدقيقة لمجلة التجارة المتعلقة بالكمبيالة."] },
  faq: [
    { fr: ["Quelle différence entre une traite et un chèque ?", "Le chèque se paie dès qu'il est présenté. La traite se paie à une date fixée à l'avance, l'échéance : elle sert surtout à payer plus tard ou en plusieurs fois."], ar: ["ما الفرق بين الكمبيالة والصك؟", "الصك يُدفع بمجرد تقديمه. أما الكمبيالة فتُدفع في تاريخ محدد مسبقا هو تاريخ الاستحقاق: وتُستعمل خاصة للدفع لاحقا أو على أقساط."] },
    { fr: ["Qui remplit la traite ?", "En général le tireur (le vendeur ou le créancier) la remplit, puis la donne au tiré qui l'accepte en signant."], ar: ["من يعمّر الكمبيالة؟", "عادة يعمّرها الساحب (البائع أو الدائن)، ثم يسلمها إلى المسحوب عليه الذي يقبلها بالإمضاء."] },
    { fr: ["Que se passe-t-il si je ne peux pas payer à l'échéance ?", "Prévenez le bénéficiaire et votre banque AVANT l'échéance pour chercher un accord. Sinon, la traite est protestée par un huissier et les frais s'ajoutent à la dette."], ar: ["ماذا يحدث إذا لم أستطع الدفع عند الاستحقاق؟", "أعلم المستفيد وبنكك قبل الاستحقاق للبحث عن اتفاق. وإلا يتم الاحتجاج على الكمبيالة من قبل عدل منفذ وتضاف المصاريف إلى الدين."] },
    { fr: ["Pourquoi n'y a-t-il pas de modèle à imprimer ?", "Les banques demandent des traites remplies sur un formulaire imprimé : achetez-le en librairie ou demandez-le à votre banque. Cette page explique comment le remplir."], ar: ["لماذا لا يوجد نموذج للطباعة؟", "تطلب البنوك كمبيالات معمرة على مطبوعة جاهزة: اشترها من المكتبة أو اطلبها من بنكك. وتشرح هذه الصفحة كيفية تعميرها."] }
  ],
  sources: ["legislation", "bct"]
}
];

if (typeof module !== "undefined") module.exports = { DOCS, CONTRATS, GUIDES, CATEGORIES, SOURCES, LEG_SUPPR };

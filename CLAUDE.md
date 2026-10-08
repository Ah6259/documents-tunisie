# Mémoire du projet — Documents Tunisie

Fichier lu automatiquement par Claude Code au début de chaque session dans ce dossier.
**Dépôt PUBLIC : rien de personnel ni de secret ici, et jamais le nom d'un site concurrent.**
À tenir à jour à chaque modification importante (avec README et GUIDE).

## Qui et comment travailler
- Propriétaire : Ahmed (compte GitHub `Ah6259`), débutant. Expliquer simplement, **en français**.
- **Demander l'accord d'Ahmed avant de modifier le site** (sauf s'il dit « fais »). **Demander avant d'installer un logiciel.**
- Appliquer les **règles communes à tous ses sites** et la **consigne sécurité commune** (fichiers du dossier parent des projets).
- L'étude privée (concurrents, popularité, 55 documents) est hors de ce dépôt : `..\etude et plan.md`.
  Les preuves des conditions d'utilisation et des licences photos : `..\preuves conditions d'utilisation\` (jamais publiées).

## Le site
- Adresse prévue : https://ah6259.github.io/documents-tunisie/ — dépôt `Ah6259/documents-tunisie` (GitHub Pages, main).
- Couleur principale bordeaux `#8C2B3A`. Français + arabe (bouton, ou `?lang=ar`). Mobile d'abord.
- **Le PDF ne porte AUCUNE mention du site** (décision d'Ahmed 05/10/2026 : c'est le document de la personne, on aide seulement à l'écrire ; l'avertissement « modèle indicatif / relisez » reste sur la page web). Test + sabotage le vérifient.
- 25 modèles à remplir (PDF par l'impression du navigateur, **rien n'est envoyé**), dont **4 grands contrats** (07/10/2026, demande
  d'Ahmed : vente voiture, vente moto, location maison, bail commercial ; `grand: true`, rédigés d'après le COC et la loi n° 77-37,
  aucun texte copié). **Décision d'Ahmed (07/10/2026) : plus de règle « modèle seulement après relecture par un avocat »** ; pas de
  mention « modèle indicatif » ajoutée. `CONTRATS` (étapes seulement) est vide.
  + 5 « démarches expliquées » (`GUIDES`, explication seulement, jamais de modèle, 05/10/2026) : divorce, mariage,
  contrat de travail CDI/CDD (loi n° 2025-9), CIVP/Karama/Service civil (décret n° 2019-542, ANETI), prêt d'honneur (06/10/2026), traite / lettre de change (07/10/2026 : remplir, accepter, endosser, échéance, protêt, pièges avant de signer ; pas de modèle, formulaire imprimé des banques).
- Données : `assets/documents.js`. Pages fabriquées par `node tools/generer.mjs` (ne pas éditer les HTML à la main).
- Date unique « vérifié le » : `MAJ` dans `assets/page.js`. Ne la changer qu'après une vraie relecture des sources.
- Ce qui n'est pas confirmé par un texte officiel va dans `averifier` (affiché « À vérifier »), jamais inventé.
- Sources citées : **officielles seulement** (`SOURCES` dans documents.js), liens en `rel="noopener noreferrer"`.
- Photos : Wikimedia Commons, licence libre vérifiée, crédit sur chaque bandeau + page À propos, ≤ 150 Ko,
  pas de visage, pas d'emblème de l'État. Preuves dans `..\preuves conditions d'utilisation\<date>\photos\`.
- Image d'aperçu : `assets/og-image-v3.jpg` (modèle `tools/og.html`, logo plume du 05/10/2026). Si on la change : **nouveau nom de fichier**.
  Toujours en **JPEG < 250 Ko** (sinon WhatsApp n'affiche qu'une petite vignette ; le test le vérifie). Les anciens `og-image-v1.png` et `og-image-v2.jpg` ne sont plus utilisés.

## Sécurité (consigne commune du 05/10/2026)
- `robots.txt` : moteurs de recherche autorisés, robots d'IA et aspirateurs interdits ; `<meta name="robots" content="noai, noimageai">`.
- Statistiques **GoatCounter** (anonymes, sans cookies, 05/10/2026) sur toutes les pages : compteur partagé
  `https://prix-eaux-tunisie.goatcounter.com` (constante `COMPTEUR` dans generer.mjs ; pages séparées par chemin). Mentionné dans À propos.
  Événement `pdf-<slug>` envoyé au clic sur « Télécharger le PDF » (modele.js) : seulement le nom du modèle, jamais le contenu → classement des documents les plus demandés (onglet Events / chemins pdf-… dans GoatCounter).
- Installation sur le téléphone : `manifest.webmanifest` avec `"id": "/documents-tunisie/"` (UNIQUE : tous les sites d'Ahmed
  partagent l'origine ah6259.github.io ; sans id, Chrome disait « déjà installée »), icônes `assets/icons/` (192, 512, maskable,
  apple-touch-icon 180) tirées de `assets/logo.svg`. Liens dans le gabarit ; vérifié par le test.
- **Service worker** (05/10/2026, installation complète Chrome/Android + iPhone) : `sw.js` à la racine, portée `/documents-tunisie/`,
  enregistré à la fin de `assets/page.js` (https seulement, try/catch). **Réseau d'abord** pour les pages HTML et les données (le cache ne sert
  que hors connexion ; sinon page « Hors connexion » FR+AR) ; CSS/JS/images avec `?v=` : cache puis mise à jour en arrière-plan.
  Jamais en cache : non-GET, autres origines, autres sites d'Ahmed. Caches `documents-tunisie-<CACHE_VERSION>` (on ne supprime QUE les nôtres).
  Vieille version bloquée sur un téléphone → changer `CACHE_VERSION`. Meta iPhone (`apple-mobile-web-app-capable`, `-title`
  « Documents TN ») dans le gabarit generer.mjs. Test : `node tools/test_sw.mjs` (faux navigateur ; accepte un dossier en argument).
- CSP en balise meta (scripts du site + gc.zgo.at, polices Google ; envoi au compteur GoatCounter) : **aucun script en ligne, aucun `style="…"`, aucun `onclick`**.
- Anti-copie légère (page.js + `.protege`) : modèles et étapes non sélectionnables, source ajoutée au texte copié ;
  les champs du formulaire restent libres. Anti-cadre (iframe d'un autre site).

## Votre avis (05/10/2026, règle d'Ahmed : sur chacun de ses sites)
- Section `#avis` en bas de l'accueil (constante `AVIS` dans generer.mjs : carte FR + AR, note 😀🙂😐🙁 facultative, message
  obligatoire ≤ 1000 caractères, e-mail facultatif), lien « Votre avis » dans le pied de page (`page.js`).
- `assets/avis.js` (fichier externe, chargé seulement sur l'accueil, compté dans le `?v=`) envoie par `fetch` à
  `https://formspree.io/f/mwlpakqj` (Accept JSON) **seulement au clic**, avec les champs cachés `site` = « Documents Tunisie »,
  `page`, `_subject` et le piège `_gotcha`. CSP (`FORMSPREE` dans generer.mjs) : `connect-src` + `form-action`. Champs
  sélectionnables malgré l'anti-copie ; le service worker laisse passer formspree.io ; mentionné dans À propos (« Vos données »).
- Formspree gratuit = 50 envois/mois pour TOUS les sites (même formulaire). Test : `node tools/test_avis.mjs` (accepte un dossier).

## Tests (obligatoires avant toute publication)
- `node tools/generer.mjs` puis `node tools/test_site.mjs` (≈ 1290 vérifications) → **TOUT PASSE**.
- `node tools/sabotage.mjs` : 37 sabotages, tous doivent être attrapés. `node tools/test_robot.mjs` : pannes du robot.
- **Pas de faux boutons** (Ahmed, 06/10/2026) : badges « Gratuit / Données / Français et arabe » de l'accueil supprimés (cartes avec icône qui ne menaient nulle part) ; « Gratuit, sans inscription, rien n'est envoyé » est dans l'intro. Test sur toutes les pages + sabotage : aucune carte avec icône sans lien.
- CSS : `[hidden]{display:none!important}` obligatoire (sinon un `display:flex/grid` rend visibles les éléments cachés par le JS : recherche, « aucun résultat ») ; test + sabotage (06/10/2026).
- `node tools/test_sw.mjs` : service worker (réseau d'abord, exclusions, meta iPhone).
- `node tools/test_avis.mjs` : Votre avis (section, lien du pied de page sur toutes les pages, CSP, envoi simulé, refus si vide).
- Captures : serveur `python -m http.server 8931 --bind 127.0.0.1` dans `site/`, puis `sh tools/captures.sh`.
- jsdom : `npm install --no-save --no-package-lock jsdom` (une fois par PC).

## Robots
- `surveillance.yml` (1er du mois, TZ Africa/Tunis, groupe `robot`) : sources officielles + battement de cœur ; issue si panne.
- `tests.yml` : à chaque push.

## Reste à faire / idées
- Bail commercial : modèle seulement si Ahmed le demande (règles particulières, loi n° 77-37).
- Autres pages « explication seulement » (`GUIDES`, encart « Explication seulement », section « Démarches expliquées » de l'accueil) : certificat de résidence, non gage, TEJ… Autres documents de l'étude (55).

## Mise à jour du 05/10/2026 (soir)
- **Icône (famille commune des 5 sites)** : un seul symbole en aplats 2-3 tons, accent doré `#F2B33D`, sans texte ni brillance (règle d'Ahmed : jamais d'effet « image IA » ni de clip-art). Ce site : **plume de stylo**. Source = `assets/logo.svg` ; PNG 192/512 = dessin arrondi, maskable 512 et iPhone 180 = même dessin sur carré plein, symbole à 78 %. Générateur (hors dépôt) : `_claude code project/icones des sites - generateur.py`. Changer l'icône → renouveler `CACHE_VERSION` de `sw.js`.
- **« Gratuit » mis en avant** (titres Google, descriptions, aperçus de partage, manifeste), seulement là où c'est vrai. Partie payante (Pass Journée) en ligne depuis le 06/10/2026 : voir plus bas.
- **Aperçus WhatsApp** : tous les sites sont réglés pareil (1200 × 630, JPEG léger). WhatsApp sur PC fait de petites vignettes : envoyer les liens depuis le téléphone (ou transférer un message préparé sur le téléphone).
- **Règle d'Ahmed : tout tourne sur internet (GitHub), sans son PC ni son intervention, « même s'il meurt ».**
- **PDF** : mise en page de lettre administrative (police à empattement, titre détaché, marges A4 25/22 mm, 45 mm pour signer et légaliser) ; aucune mention du site.
- **Statistiques GoatCounter** : événements `pdf-<slug>` (PDF fabriqués) et `recherche-vide/<mot>` (recherche sans résultat, chiffres retirés, une fois par mot) ; annoncés dans À propos et sous la recherche.
- **Robot privé** `Ah6259/documents-tunisie-robot` (dépôt PRIVÉ = dossier `../robot nuit`) : `releve.yml` chaque nuit à 1h07 (relève GoatCounter, clé en secret `GOATCOUNTER_CLE`, compteur **prix-eaux-tunisie** avec x) → `liste des documents demandes.md` ; `controle-matin.yml` à 7h (journal écrit depuis moins de 26 h, pas d'échec signalé, tests du site ; e-mail GitHub sinon).
- **Tâche Claude dans le cloud** `documents-tunisie-nuit` (créée par Ahmed via /schedule, 2h chaque nuit, https://claude.ai/code/routines/trig_01PPNDm6h4qk7N2mtKHJ7tHq) : une nouveauté au plus par nuit ; documents simples publiés seulement si tous les tests passent ; contrats et documents à risque en brouillon (`brouillons/` du dépôt privé) ; compte rendu dans `journal de nuit.md`.
- Contrôle des concurrents étendu (empreintes de mots et de noms de domaine complets ; un nom de rue de Tunis présent dans un crédit photo reste autorisé).
- **Lien vers l'annuaire gratuit « Avocats et notaires Tunisie »** (constante `ANNUAIRE` de generer.mjs, encart `#annuaire` avant les étapes) : 4 grands contrats, 4 démarches expliquées et reconnaissance de dette ; mariage = notaires (عدول الإشهاد) + annuaire des prestataires de mariage. Texte neutre (profession réglementée : jamais « meilleur », pas de classement), jamais dans le PDF (test + 2 sabotages), clic compté par page.js (événements `lien-avocats/<slug>` et `lien-mariage/mariage`).

## Prêt d'honneur (06/10/2026)
- Démarche `pret-d-honneur` + modèle `demande-pret-d-honneur` (textes communs `HONNEUR_*` dans documents.js ; champ `modele` d'un guide = lien vers un modèle, `attention` d'un modèle = encart « Important » avant le formulaire, `motscles` = mots de la recherche). Sources : décret n° 2026-148 (JORT, texte intégral non lu), **circulaire BCT n° 2026-08 lue** (dépôt UNIQUEMENT sur la plateforme en ligne de la banque depuis le 01/10/2026 : une lettre papier n'est pas prise en compte → la lettre sert à préparer), annonce BTS. Liens : annuaire des comptables + calculateur de crédit (événements `lien-comptables/…`, `lien-outils/…`). À revoir quand les banques publient leurs listes de pièces.

## Exemple du document — RETIRÉ le 07/10/2026 (demande d'Ahmed : on pouvait lire et recopier le document sans le télécharger)
- La section `#exemple` n'existe plus (test + sabotage). Les données `exemple` restent dans documents.js : elles servent seulement aux tests (chaque modèle se remplit sans trou).
## (historique) Exemple du document (06/10/2026)
- Section `#exemple` AVANT « Remplir le modèle » : la lettre remplie avec des données **fictives** (champ `exemple` de chaque modèle : `{ id: valeur | [fr, ar] }` ; sinon `ex` du champ ; sinon libellé), même rendu que le PDF (`feuilleExemple` de modele.js, fabriquée par generer.mjs), FR ou AR selon la langue, étiquette + filigrane « EXEMPLE / مثال », réduite (60 % de l'écran) avec `<details>` « Agrandir l'exemple ». **Nouveau modèle → lui donner un `exemple`** (CIN « 0XXXXXXX », jamais de vraie personne). Jamais imprimée (seul `#impression` l'est), pas d'événement GoatCounter ; tests + 3 sabotages.

## Pass Journée — partie payante (accord écrit d'Ahmed, 06/10/2026, même logique que le Pass Examen du Code de la route)
- **1 document PDF gratuit par jour et par appareil** (localStorage `dt-gratuit-v1` = { jour, doc }, dans un try). Retélécharger
  le MÊME modèle le même jour reste permis (correction). Un AUTRE modèle le même jour → écran `#pass-bloque` (« Vous avez téléchargé
  votre document gratuit du jour » → **Pass Journée 7 DT : tous les documents pendant 24 heures**, « Revenez demain », « J'ai déjà un code »
  avec le formulaire du code sur place). Pages et formulaire restent libres (plus d'exemple rempli depuis le 07/10).
- **Aperçu (07/10/2026, demande d'Ahmed)** : section `#apercu-carte` AVANT « Remplir le modèle », fenêtre réduite (420 px, 260 px
  sur téléphone ≤ 600 px) + bouton « ↑ Voir l'aperçu » (`#voir-apercu`) juste après « Télécharger le PDF ». Document gratuit du
  jour déjà pris sur un AUTRE modèle (sans Pass) → la fenêtre RESTE mais le document est figé (ne suit plus la saisie), brouillé
  (`brouiller()` : chaque lettre remplacée, illisible même sans le flou) et flou (`.apercu.fige`), sous le tampon `#apercu-bloque`
  « Pass Journée » (payer pour télécharger et voir plusieurs documents, lien pass/, « ou revenez demain ») qui secoue comme la
  cloche du site de l'eau (5 secousses / 12 s, 3 séries). Redevient lisible avec le Pass (événement `pass`). Testé (+ sabotage).
- `assets/pass.js` (chargé seulement par les 16 pages de modèle et pass/) ; `modele.js` appelle `PassJour.acces/bloquer/noter`.
  Statistique anonyme `pass-bloque/<slug>` (une fois par page ouverte) = mesure de la demande.
- Bouton « Pass Journée » : **jamais sur l'accueil** (décision d'Ahmed) ; seulement près de « Télécharger le PDF » (nouvel onglet,
  la saisie reste) et sur `pass/` (prix, avantages, « Paiement » D17/IZI 24 321 390, WhatsApp vert, formulaire Formspree
  `mwlpakqj` avec ligne `pour_activer`, « J'ai un code ») + `pass/conditions/` (vendeur « l'éditeur du site », jamais de nom de société,
  pas de TTC, pas de renouvellement automatique, aucune période payée remboursée, INPDP sans numéro). Pages fabriquées par generer.mjs.
- Codes : dépôt **PRIVÉ** `Ah6259/documents-pass` (dossier `../pass (prive)`), bouton `pass` (paye / arret / liste) depuis
  l'application GitHub, nettoyage toutes les 6 h. Le site ne reçoit que `donnees/pass.json` : empreinte PBKDF2-SHA-256 salée (100 000 tours)
  + heure de fin UTC (24 h après « paye »). Clé de déploiement « robot-pass » (écriture sur ce dépôt seulement) dans le secret `CLE_SITE`.
- « Gratuit » seulement là où c'est vrai : « 1 PDF gratuit par jour », « étapes gratuites » (accueil, en-tête, pastilles, manifeste, À propos).
- Tests : partie « 4 bis » de test_site (1er PDF permis, 2e bloqué, lendemain permis, code valide/expiré/faux/arrêté, hors connexion,
  formulaire, conditions, pass.json) + 9 sabotages. Vecteur PBKDF2 commun avec le test Python du dépôt privé.

## Lien vers l'annuaire « Avocats et notaires » (06/10/2026, demande d'Ahmed : liens entre site et moteur)
- Bouton à bordure dorée `.cat-annuaire` à la fin de la rangée des catégories de l'accueil (`LIEN_AVOCATS` dans generer.mjs) + lien
  `.entete-annuaire` dans l'en-tête (logo seul sous 560 px) et le pied de page (page.js). Logo copié : `assets/logo-avocats-notaires.svg`
  (la CSP n'autorise que les images du site). Clic compté `lien-site/avocats`. Encarts « Faire relire par un avocat » inchangés. Test + 2 sabotages.
- **Bouton « Partager »** (06/10/2026, demande d'Ahmed) : icône ronde `.partager` dans l'en-tête de toutes les pages (page.js, FR+AR) ; menu de partage du téléphone (`navigator.share`), sinon WhatsApp (`wa.me`) avec l'adresse sans `#` ni `?lang` ; clic compté `partage/<page>` dans GoatCounter. Test dans test_site.

- **Vidéo de présentation** (06/10/2026) : `assets/video/presentation.mp4`, 1080 × 1920, + couverture et aperçu 1200 × 630 (`apercu-video.jpg`). Musique de fond : J. S. Bach, Aria des Variations Goldberg (enregistrement Musopen, CC0, Wikimedia Commons ; preuve dans le dossier privé `videos (outil)/preuves musique/`). Page **`video/`** (lecteur + gros bouton « Ouvrir le site » + Partager, og:video / og:image) : réglages `tools/page_video.json`, fabriquée par appelé par tools/generer.mjs. Le bouton « Partager » envoie un LIEN : la page vidéo + l'adresse du site dans le texte (`window.partagerLien`, bloc « vidéo de présentation » en fin du JS commun), jamais le fichier. Test `node tools/test_video.mjs`.
  Pour la refaire : `python fabriquer.py documents` puis `python brancher_partage.py documents` dans le dossier PRIVÉ du PC `videos (outil)/`.

- **Langue en mémoire (06/10/2026)** : la mémoire du navigateur (localStorage) est PARTAGÉE par tous les sites d'ah6259.github.io : `page.js` n'accepte que « fr » ou « ar » (sinon langue par défaut). Ne jamais écrire une autre valeur sous la clé « langue ».
- **Schéma « Case par case » (07/10/2026, demande d'Ahmed)** : champ `schema` d'un guide (img, cases {n, qui T/A/G, fr, ar},
  gris) → section `#schema` (.protege) après « Explication seulement ». Traite : `assets/illustrations/traite-cases.svg`,
  dessin ORIGINAL (disposition de la traite normalisée observée sur des exemples publics, jamais leurs photos), marqué
  « SPÉCIMEN · نموذج », sans vrai RIB ni vrai nom (le test le vérifie). Défile horizontalement sur téléphone.

## ANETI (08/10/2026, règle d'Ahmed)
L'ANETI (emploi.nat.tn) refuse les connexions venant de l'étranger (GitHub, cloud) : elle est lue DEPUIS LE PC d'Ahmed par la tâche
Windows « Concours-ANETI » du dépôt `alerte-concours-tunisie` (`tools/aneti_pc.py`, pages listées dans `tools/aneti_a_lire.json`).
Les pages brutes arrivent dans `alerte-concours-tunisie/donnees/aneti/` : ce site pourra y chercher de NOUVEAUX documents
(formulaires, attestations, démarches) — à écrire dès le 1er relevé, en ajoutant au besoin les pages utiles dans aneti_a_lire.json.
- **Documents des ministères (08/10/2026)** : la veille hebdomadaire du site des concours (`robot/veille_ministeres.py`) relève aussi les
  formulaires officiels des sites des ministères → liste `documents` de `alerte-concours-tunisie/donnees/ministeres.json`
  (titre + lien officiel). Liste PROPOSÉE à Ahmed : on ne crée un document ici qu'avec son accord.
- **5 formulaires officiels ajoutés (09/10/2026, « ajoute 1, 2, 3 et 4 » d'Ahmed)**, rubriques reprises des formulaires des ministères
  (relevés par la veille du site des concours) : `demande-acces-information`, `recours-acces-information` (tadhallom auprès du chef
  de l'organisme), `requete-inai-acces-information` (le « modèle de requête » de la Justice est en fait la requête à l'INAI),
  `requisition-immatriculation-fonciere` (مطلب تسجيل اختياري, réf. 03-06.01-02) et `demande-mise-a-jour-titre-foncier` (مطلب تحيين,
  réf. 03-06.33-02). Sources ajoutées : `inai`, `pm_acces`, `opf` (Domaines de l'État / ONPF). Délais de la loi 2016-22 marqués « à vérifier ».

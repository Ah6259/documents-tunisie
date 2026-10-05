# Guide — comment ce site a été fabriqué (réutilisable)

1. **Étude** (privée, hors dépôt) : suggestions de recherche Google en français et en arabe → liste de 55 documents,
   classés par popularité et par risque ; top 15 des documents simples ; les 4 contrats à risque attendent un avocat.
2. **Légalité des sources** : robots.txt et conditions d'utilisation lus et sauvegardés (HTML, PDF, SHA-256,
   Internet Archive). On n'écrit que nos propres textes, à partir des sites officiels ; aucun concurrent cité.
3. **Données séparées du code** : un objet par document dans `assets/documents.js` (champs, modèle FR, modèle AR,
   étapes, pièces, où aller, pièges, « à vérifier », FAQ, sources).
4. **Moteur** `assets/modele.js` : construit le formulaire, met l'aperçu à jour à chaque frappe, écrit les montants
   en lettres (français et arabe), refuse le PDF s'il manque une information, puis lance l'impression A4
   (« Enregistrer au format PDF »). Aucune bibliothèque, aucune donnée envoyée.
5. **Arabe** : documents en `dir="rtl"`, police Noto Naskh Arabic ; chaque valeur saisie et chaque mot latin ou nombre
   est isolé (U+2068…U+2069) pour garder l'ordre de lecture.
6. **Pages** fabriquées par `tools/generer.mjs` : titre pensé pour Google (« Modèle de … en Tunisie (PDF, français et
   arabe) »), FAQ en JSON-LD, plan du site, `?v=` calculé automatiquement (fins de ligne normalisées).
7. **Photos** : recherche sur l'API Wikimedia Commons, choix sur planche contact, licence vérifiée par le script,
   preuves sauvegardées, recadrage en bandeau et compression ≤ 150 Ko (Pillow), crédit affiché.
8. **Image d'aperçu** 1200×630 : page `tools/og.html` photographiée par Chrome sans écran.
9. **Sécurité** : robots.txt (IA interdites), meta noai, CSP, anti-copie légère, anti-cadre, test « aucun secret ».
10. **Tests** : `tools/test_site.mjs` charge chaque page comme un navigateur (jsdom), remplit chaque formulaire avec
    les exemples, essaie chaque choix des listes, vérifie qu'aucun trou ne reste dans le PDF ; puis `tools/sabotage.mjs`
    abîme une copie 17 fois pour prouver que le test attrape les erreurs.
11. **Captures** 340/390 px en français et en arabe (`tools/captures.sh`), regardées une par une et corrigées.
12. **Robots** GitHub : surveillance mensuelle des sources (+ battement de cœur), tests à chaque modification.
13. **Publier** (avec l'accord d'Ahmed) : créer le dépôt public `Ah6259/documents-tunisie`, pousser `site/` à la racine,
    activer GitHub Pages (branche main), puis Search Console + sitemap.

## 05/10/2026 — Installation complète sur le téléphone (service worker)
- `sw.js` à la racine (portée `/documents-tunisie/`), enregistré par `assets/page.js` (https seulement, jamais en `file:`).
- **Réseau d'abord** pour les pages et les données (dernière version toujours servie ; cache seulement hors connexion,
  sinon page « Hors connexion » FR + AR) ; fichiers `?v=` : cache puis mise à jour.
- Meta iPhone dans le gabarit `tools/generer.mjs` : `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`.
- Test `node tools/test_sw.mjs` (faux navigateur) ; sabotage vérifié (HTML en cache d'abord, POST intercepté, mauvaise portée).
- Vieille version bloquée sur un téléphone : changer `CACHE_VERSION` dans `sw.js`.

## 05/10/2026 (soir) — PDF, statistiques, robot de nuit
- PDF : mise en page de lettre administrative, aucune mention du site (test + sabotage).
- GoatCounter (compteur prix-eaux-tunisie, avec x) : filtrer sur `pdf-` (documents les plus fabriqués) et `recherche-vide/` (documents qui manquent).
- Chaque nuit, sans PC : relevé à 1h07 (dépôt privé documents-tunisie-robot), tâche Claude à 2h (une nouveauté au plus), contrôle à 7h (e-mail si problème).

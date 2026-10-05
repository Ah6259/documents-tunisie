#!/bin/sh
# Captures d'écran « téléphone » (340 et 390 px, français et arabe) avec Chrome sans écran.
# Usage (Git Bash, depuis le dossier site) :  sh tools/captures.sh [page ...]
# Prérequis : un serveur local lancé dans le dossier site :  python -m http.server 8931 --bind 127.0.0.1
# Les images vont dans captures/ (ignoré par git). Les petites fenêtres étant ignorées par Chrome,
# la page est affichée dans un cadre (iframe) de la bonne largeur.
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
PORT=${PORT:-8931}
HAUT=${HAUT:-3600}
mkdir -p captures
PROFIL=$(mktemp -d)
PAGES=${*:-"index.html procuration-conduite-vehicule/ vente-voiture/"}
for p in $PAGES; do
  for l in fr ar; do
    for w in 340 390; do
      nom=$(echo "${p%/}" | sed 's/index.html/accueil/; s#/#-#g')-$l-$w
      printf '<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#888}iframe{border:0;display:block}</style><iframe src="/%s?lang=%s" width="%s" height="%s"></iframe>' "$p" "$l" "$w" "$HAUT" > "captures/cadre-$nom.html"
      "$CHROME" --headless=new --hide-scrollbars --disable-gpu --user-data-dir="$(cygpath -m "$PROFIL")" --virtual-time-budget=10000 \
        --window-size=$((w)),$HAUT --screenshot="$(cygpath -m "$PWD/captures/$nom.png")" "http://127.0.0.1:$PORT/captures/cadre-$nom.html" >/dev/null 2>&1
      echo "captures/$nom.png"
    done
  done
done
rm -rf "$PROFIL"

# 8funder — démonstration des animations

Copie statique du site 8funder tel qu'il est rendu par la version **1.16.0** de
l'extension. À ouvrir ici :

**https://anirudhatalmale6-alt.github.io/8funder-demo/**

## À quoi ça sert

Les animations sont entièrement côté navigateur (CSS + `f8-vue.js`). Une copie
statique les conserve donc à l'identique : c'est le même HTML, le même CSS et le
même JavaScript que ceux que sert le WordPress une fois l'extension installée.

Autrement dit, ce qui bouge ici bougera exactement pareil sur 8funder.com.

## Ce qui est animé, et où le voir

| Effet | Où |
|---|---|
| Le titre et le chapô montent à l'ouverture, en deux temps | toutes les pages |
| Jauge de défilement en haut de l'écran | toutes les pages |
| Apparition des blocs au défilement | accueil, pages de service |
| Compteurs qui montent jusqu'à leur valeur | accueil, répertoire |
| Tracé progressif des courbes | `/taux/` |
| Mise en évidence du résultat calculé | `/comparateur/`, `/diagnostic/` |

`prefers-reduced-motion` coupe **tout** — pas « ralentit », coupe. C'est une
exigence d'accessibilité, pas une option.

## Ce que la copie n'est pas

Une démonstration, pas un miroir. Le site complet compte près de 5 000 adresses ;
ici il y a l'accueil, les 21 pages réelles, les 6 pages de services, et un
échantillon plafonné à 40 fiches par section (répertoire, organismes, agences).
Les liens au-delà de ce plafond ne mènent nulle part — c'est voulu.

Les formulaires ne soumettent rien : il n'y a pas de serveur derrière une copie
statique. Le simulateur et le comparateur, eux, fonctionnent, parce qu'ils
calculent dans le navigateur.

Reconstruction : `python3 miroir-demo.py` dans le dossier du projet.

# ADH IDE 237 - Transaction Nouv vente avec GP

> **Analyse**: 2026-01-29 18:02
> **Pipeline**: V7.0 Deep Analysis

## RESUME EXECUTIF

- **Fonction**: Transaction Nouv vente avec GP
- **Tables modifiees**: 9
- **Complexite**: **HAUTE** (85/100)
- **Statut**: NON_ORPHELIN
- **Raison**: Appele par 3 programme(s): Menu caisse GM - scroll (IDE 163), Menu Choix Saisie/Annul vente (IDE 242), Saisie transaction Nouv vente (IDE 316)

## MOTS-CLES RECHERCHE

Transaction, Nouv, vente, avec

## CE PROGRAMME EST CONCERNE SI...

- Bug sur les tables: reseau_cloture___rec, prestations, mvt_prestation___mpr, compte_gm________cgm, compteurs________cpt, tempo_ecran_police, stat_lieu_vente_date, Boo_ResultsRechercheHoraire, Table_1037
- Probleme dans le flux depuis: Menu caisse GM - scroll (IDE 163), Menu Choix Saisie/Annul vente (IDE 242), Saisie transaction Nouv vente (IDE 316)
- Erreur dans les appels vers: Recup Classe et Lib du MOP (IDE 152),     SP Caractères Interdits (IDE 84), Appel Print ticket vente PMS28 (IDE 233), Reinit Aff PYR (IDE 249), Selection Vols /t Ville à côté (IDE 277)

## PROGRAMMES LIES

| Direction | Programmes |
|-----------|------------|
| **Appele par** | Menu caisse GM - scroll (IDE 163), Menu Choix Saisie/Annul vente (IDE 242), Saisie transaction Nouv vente (IDE 316) |
| **Appelle** | Recup Classe et Lib du MOP (IDE 152),     SP Caractères Interdits (IDE 84), Appel Print ticket vente PMS28 (IDE 233), Reinit Aff PYR (IDE 249), Selection Vols /t Ville à côté (IDE 277), Recuperation du titre (IDE 43), Calcul stock produit WS (IDE 149), Get Printer (IDE 179), Printer choice (IDE 180), Set Listing Number (IDE 181), Raz Current Printer (IDE 182), Get Fidelisation et Remise (IDE 225), Get Matricule (IDE 227), Gestion Chèque (IDE 228), Solde Gift Pass (IDE 241), Deversement Transaction (IDE 247), Choix PYR (plusieurs chambres) (IDE 248), Solde Resort Credit (IDE 254), Zoom articles (IDE 257), Zoom services village (IDE 269) |

## STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Taches | 49 |
| Lignes Logic | 1818 |
| Expressions | 305 |
| Tables | 30 |

---
*Spec SUMMARY generee par Pipeline V7.0*

# PMS-1427 - POS Edition Income

> **Analyse**: 2026-01-29 09:30 -> 09:55

## Informations Jira

| Champ | Valeur |
|-------|--------|
| **Type** | Bug |
| **Statut** | Ouvert |
| **Priorite** | Moderee |
| **Rapporteur** | Alan Lecorre |
| **Label** | PVE |

## Symptome

Lorsqu'un client a **2 ventes avec le meme package ID** sur 2 services differents, et que l'une d'elles est "full GP" (Grand Passage), **aucune de ces ventes n'apparait** dans l'edition Income.

**Cas concret** : Base KIPC, ventes du 29 novembre :
- Une vente GP sur le service ESTH (esthetique)
- Une vente classique sur le service REST (restaurant)
- La vente REST n'apparait pas dans l'edition Income

## Programmes concernes

| Programme | Description | Impact |
|-----------|-------------|--------|
| **PVE IDE 379** | Print Income | **CRITIQUE** - Programme principal |
| PVE IDE 41 | Report - Selection/Tempo (generique) | **HAUT** - Generateur tempo utilise par 20+ editions |
| PVE IDE 358 | Report - Selection/Tempo_V3 | MOYEN - Variante |
| PVE IDE 388 | Report - Selection/Tempo (copie) | MOYEN - Variante |
| PVE IDE 380 | Print Global Income | HAUT - Meme logique |
| PVE IDE 381 | Print Global Income Tout serv | HAUT - Meme logique |
| PVE IDE 389 | Menu Service cloture v2 | Appelant |
| PVE IDE 394 | Menu Service cloture | Appelant |

## Analyse technique

### Structure PVE IDE 379 (Print Income)

| Tache | Description | Role |
|-------|-------------|------|
| 379.1 | Print Income | Racine (5 params: Masque, Date mini/maxi, Filtre PREPAID) |
| 379.3 | Print | Impression, appelle SELECTION et EDITION |
| 379.4 | SELECTION | Lit `_pv_packages_dat01` + `_pv_cafil18_dat01` |
| 379.5 | Selection compta | Sous-selection comptable |
| **379.6** | **Temp generation** | **SOURCE DU BUG** - Ecrit dans `_pv_ca01` |
| 379.7 | EDITION | Impression du rapport |

### Tables utilisees dans la tache 379.6

| Table | PublicName | Access | Role |
|-------|-----------|--------|------|
| obj=534 | `_pv_packages_dat01` | R (Main) | Iteration sur les packages |
| obj=523 | `_pv_cafil18_dat01` | R | CA par filiere |
| obj=522 | `_pv_ca01` | **W** | **Table tempo de sortie** |
| obj=526 | `_pv_customer_dat01` | R | Donnees client |
| obj=379 | `pv_cat_dat01` | R | Categories PV |

### Expressions cles

- Expression 16 : `{2,8}<>'PREPAID'` - Filtre non-prepaid
- Expression 17 : `{2,8}='PREPAID'` - Filtre prepaid
- Expression 10 : `{0,11}+{1,4}` - Accumulation montants
- Expression 11 : `{0,11}+{2,12}` - Accumulation alternative

## Cause probable

Le **Link Write** vers la table tempo `_pv_ca01` utilise le `package_id` comme cle de jointure (SortType="19"). Quand 2 ventes partagent le meme package_id sur 2 services differents :

1. La tache SELECTION (379.4) itere sur `_pv_packages_dat01` avec un Range sur dates + service
2. Le Link Write vers `_pv_ca01` ecrase ou filtre les donnees du meme package_id
3. Le filtre GP s'applique au niveau package_id et exclut TOUTES les ventes liees

**Root cause** : La cle de deduplication dans le Link Write ne distingue pas les services differents pour un meme package_id.

## Impact

| Scope | Detail |
|-------|--------|
| Edition Income (379) | Directement affecte |
| Global Income (380, 381) | Potentiellement affecte |
| **20+ editions utilisant PVE IDE 41** | Potentiellement affectes |
| Bases concernees | KIPC (confirme), potentiellement toutes |

## Piste de correction

Verifier la cle du Link Write dans la tache 379.6 : le couple `(package_id, service)` devrait etre la cle composite au lieu de `package_id` seul.

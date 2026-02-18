# PMS-1479 - Analyse

> **Analyse**: 2026-02-17 10:00 → 11:15

## 1. Contexte Ticket

| Champ | Valeur |
|-------|--------|
| **Titre** | [Caisse Adherent] Facture + document envoye apres solde en ECO |
| **Sujet reel** | Libelle taxe de sejour affiche "Caisse" au lieu de "TAXE DE SEJOUR" |
| **Village** | Pragelato (PHU) |
| **Priorite** | Moderee |
| **Labels** | ADH |

### Symptome

Sur le village Pragelato, la taxe de sejour apparait avec le libelle **"Caisse"** au lieu de **"TAXE DE SEJOUR"** (ou "TAXE SEJOURS") dans :
1. La facture (releve de depenses)
2. L'extrait de compte (ecran caisse)
3. Le ticket imprime

### Preuves (3 screenshots)

| Screenshot | Observation |
|------------|-------------|
| `image-20260204-092040.png` | Facture : ligne du 31/01/2026, designation "Caisse", 4.00 EUR x 14 = 56.00 |
| `image-20260204-092824.png` | Extrait compte CA0122 : Libelle = "Caisse", Libelle Supplementaire = "TAXE SEJOURS" |
| `image-20260204-093109.png` | Ticket imprime : label "Caisse" |

## 2. Analyse Technique

### 2.1 Table impactee

**Table #40 - comptable (cafil018_dat)** - 9349 lignes, 47 colonnes

| Colonne | Type | Contenu constate | Contenu attendu |
|---------|------|------------------|-----------------|
| `cte_libelle` (col 6) | nvarchar(20) | **"Caisse"** | "TAXE DE SEJOUR" ou "TAXE SEJOURS" |
| `cte_libelle_supplem_` (col 7) | nvarchar(20) | "TAXE SEJOURS" (correct) | "TAXE SEJOURS" |
| `cte_service` (col 26) | nvarchar(4) | Code service (ex: "GEST") | Code service |
| `cte_code_type` (col 10) | nvarchar(1) | "O" (OD) | "O" |
| `cte_mode_de_paiement` (col 13) | nvarchar(4) | "OD" | "OD" |

### 2.2 Origine du libelle "Caisse"

Le libelle "Caisse" correspond au **nom du service** dans la table de reference VSERV (#67 cafil045_dat).
La table des services (`tab_nom_table='VSERV'`) contient un `tab_libelle20` par service.

**Hypothese confirmee** : Lors de la creation de l'OD de taxe de sejour, le programme ecrit dans `cte_libelle` le libelle du **service** (ex: "Caisse" pour le service caisse) au lieu du libelle descriptif de l'operation ("TAXE DE SEJOUR").

Le `cte_libelle_supplem_` recoit correctement "TAXE SEJOURS", ce qui confirme que l'information est connue mais placee dans le mauvais champ (ou le champ principal n'est pas renseigne avec la bonne valeur).

### 2.3 Programmes impliques

#### Ecriture comptable (table #40)

| Programme | Role | Access |
|-----------|------|--------|
| **ADH IDE 61** - Maj des lignes saisies | Ecrit dans cafil018_dat | WRITE |
| **ADH IDE 105** - Maj des lignes saisies V3 | Version V3 (parametre "Facture ECO") | WRITE |
| **ADH IDE 94** - Maj des lignes saisies archive | Version archive | WRITE |

Ces 3 programmes sont des **sous-programmes d'ecriture** : ils recoivent les donnees via parametres (Societe, Compte, Flague, NumFac) et ecrivent dans la table #40. Ils ne **decident pas** du libelle - c'est l'appelant qui le fournit.

**Aucun callers statiques trouves** dans la KB pour IDE 61 et 105 (pas de PublicName non plus). Ils sont probablement appeles comme sous-taches internes d'un programme parent.

#### Calcul taxe de sejour

| Programme | Projet | Role |
|-----------|--------|------|
| **PBG IDE 343** - Gestion Taxes Sejour | PBG | Calcule les taxes par jour de sejour |
| **REF IDE 770** - Calcul_Taxe | REF | Calcul generique taxe (27 parametres, PublicName) |
| **PBS IDE 57** - Parametrage Taxe sejour | PBS | Configuration des parametres taxes |

PBG IDE 343 travaille sur les tables :
- #30 gm-recherche (cafil008_dat) - fiche adherent
- #31 gm-complet (cafil009_dat) - adherent complet
- #372 pv_budget - budget
- #834 pv_customer (temp) - sous-tache

**PBG IDE 343 ne touche PAS la table comptable** (#40). Il calcule le montant de la taxe et met a jour la fiche adherent. La creation de l'OD comptable se fait dans un autre programme (probablement dans la chaine d'appel de la cloture/checkout).

### 2.4 Chaine d'execution probable

```
Checkout / Solde ECO
  └── Calcul taxes (PBG 343 ou REF 770)
        → retourne montant taxe
  └── Creation OD comptable
        → ADH 61 ou ADH 105 (ecrit dans cafil018_dat)
           └── cte_libelle ← libelle du SERVICE ("Caisse")     ← BUG ICI
           └── cte_libelle_supplem_ ← "TAXE SEJOURS"           ← CORRECT
```

### 2.5 Diagnostic

| Aspect | Constat |
|--------|---------|
| **Type de bug** | Donnees ecrites (WRITE), pas affichage |
| **Cause probable** | Le programme qui cree l'OD de taxe de sejour utilise le libelle du service (lookup VSERV → tab_libelle20) au lieu d'un libelle descriptif |
| **Champ impacte** | `cte_libelle` dans cafil018_dat |
| **Champ correct** | `cte_libelle_supplem_` contient la bonne info "TAXE SEJOURS" |
| **Scope** | Toutes les OD de taxe de sejour sur tous les villages |

## 3. Programmes analyses

### ADH IDE 61 - Maj des lignes saisies

- 1 tache, table principale #40 (Write)
- Links: #263 vente, #863 maj_appli_tpe, #867 Rayons_Boutique
- 8 parametres (Societe, Compte, Flague, NumFac, retours)
- Pas de PublicName, pas de callers KB

### ADH IDE 105 - Maj des lignes saisies V3

- 1 tache, table principale #40 (Write)
- 11 parametres (idem + SelectionManuelle, TypeReglement, **Facture ECO**)
- Pas de PublicName, pas de callers KB
- Le parametre "Facture ECO" (Boolean) est directement lie au scenario du ticket

### PBG IDE 343 - Gestion Taxes Sejour

- 2 taches (principale + sous-tache "Taxes pdt Sejour")
- Tables: #30 Read/Write, #31 Read/Write, #372 Read, #834 Read (sous-tache)
- 4 parametres (No Compte, Filiation, Toutes filiations?, Validation?)
- Variables: Montant taxe personnelle, Montant taxe, Age debut/fin sejour
- Ne touche PAS la table comptable

## 4. Cartographie

```
ADH IDE 105 (Maj lignes saisies V3)
  └── Ecrit dans #40 comptable (cafil018_dat)
       ├── cte_libelle ← valeur recue en parametre
       └── cte_libelle_supplem_ ← valeur recue en parametre

PBG IDE 343 (Gestion Taxes Sejour)
  ├── Lit #30 gm-recherche (cafil008_dat)
  ├── Ecrit #31 gm-complet (cafil009_dat)
  ├── Link #372 pv_budget
  └── Sous-tache: Lit #834 pv_customer
```

## 5. Impact

| Impact | Detail |
|--------|--------|
| **Fonctionnel** | Le client voit "Caisse" au lieu de "TAXE DE SEJOUR" sur facture/extrait |
| **Operationnel** | Confusion possible pour le caissier et le client |
| **Donnees** | Les OD existantes dans cafil018_dat ont deja le mauvais libelle |
| **Autres villages** | A verifier - meme chaine de programmes utilisee partout |

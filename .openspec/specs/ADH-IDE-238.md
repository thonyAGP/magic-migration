# ADH IDE 238 - Transaction Nouv vente PMS-584

> **Version spec** : 2.0
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_234.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 238 |
| **Fichier XML** | Prg_234.xml |
| **Description** | Transaction Nouv vente PMS-584 |
| **Type** | O (Online) |
| **Parametres** | 22 |
| **Module** | ADH (Adherents/Caisse) |
| **Dossier IDE** | Ventes (IDE 232-255) |

> **IMPORTANT**: Ce programme est Prg_234.xml, PAS Prg_238.xml. L'ID XML (234) differe de la position IDE (238).

---

## 2. OBJECTIF METIER

**Quoi ?** Programme de transaction pour la saisie d'une nouvelle vente dans le systeme PMS (Point Management System).

**Pour qui ?** Operateurs de caisse et personnel de vente du Club Med.

**Pourquoi ?** Permet d'enregistrer une vente avec tous les details (article, quantite, prix, mode de paiement) et de mettre a jour le compte du client.

---

## 3. TABLES (100% decodees)

| IDE# | Nom Physique | Nom Logique | Access | Role |
|------|--------------|-------------|--------|------|
| #103 | `cafil081_dat` | logement_client__loc | R | Logement client |
| #70 | `cafil048_dat` | date_comptable___dat | R | Date comptable |
| #26 | `cafil004_dat` | comptes_speciaux_spc | R | Comptes speciaux |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | Recherche GM |
| #34 | `cafil012_dat` | hebergement______heb | R | Hebergement |
| #77 | `cafil055_dat` | articles_________art | R | Articles (catalogue) |
| #197 | `caisse_artstock` | articles_en_stock | R | Stock articles |
| #372 | `pv_budget_dat` | pv_budget | R | Budget PV |
| #697 | `droits` | droits_applications | R | Droits utilisateur |
| #801 | `moyens_reglement_complem` | moyens_reglement_complem | R | Moyens de reglement |
| #818 | `zcircafil146` | Circuit supprime | R | Circuit (obsolete) |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | R | Stats lieu/date vente |

---

## 4. PARAMETRES D'ENTREE (22)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | Alpha(1) | Code societe |
| P2 | P0 devise locale | Alpha(3) | Code devise (EUR, USD...) |
| P3 | P0 masque montant | Alpha(16) | Format affichage montant |
| P4 | P0 solde compte | Num(11,3) | Solde actuel du compte |
| P5 | P0 code GM | Num(8) | Code adherent GM |
| P6 | P0 filiation | Num(3) | Filiation adherent |
| P7 | P0 date fin sejour | Date | Date de depart |
| P8 | P0 etat compte | Alpha(1) | Etat du compte |
| P9 | P0 date solde | Date | Date du dernier solde |
| P10 | P0 garanti O/N | Alpha(1) | Compte garanti (O/N) |
| P11 | P0 Nom & prenom | Alpha(60) | Identite adherent |
| P12 | P0 UNI/BI | Alpha(1) | Mode de change |
| P13 | P0 Date debut sejour | Date | Date d'arrivee |
| P14 | P0 Valide ? | Bool | Compte valide |
| P15 | P0 Nb decimales | Num | Nombre de decimales devise |
| P16-22 | ... | ... | Variables de travail (boutons, flags) |

---

## 5. VARIABLES PRINCIPALES

### 5.1 Variables de travail (W0)

| Ref | Nom | Type | Role |
|-----|-----|------|------|
| `{0,1}` | W0 Code Devise | Num | Code devise pour la transaction |
| `{0,5}` | W0 Retour Lecture TPE | Bool | Retour lecture terminal |
| `{0,6}` | W0 Fin Transaction TPE | Bool | Fin transaction terminal |
| `{0,7}` | v. titre | Alpha | Titre affiche |
| `{0,8}` | W0 Total_Vente | Num | Total de la vente |
| `{0,9}` | W0 Annulation OD active | Bool | Flag annulation active |
| `{0,10}` | W0 Compte garanti | Bool | Compte garanti |
| `{0,11}` | W0 confirmation si non garanti | Alpha | Message confirmation |
| `{0,23}` | W0 Pourcentage reduction | Alpha | Code reduction (VRL, VSL) |
| `{0,50}` | W0 Titre | Num | ID article |
| `{0,54}` | W0 Nom de la rue | Alpha | Sens trajet (ALLER/RETOUR) |

### 5.2 Variables globales (VG)

| Ref | Decode | Role |
|-----|--------|------|
| `{32768,0}` | VG.LOGIN | Login utilisateur |
| `{32768,1}` | VG.USER | Nom utilisateur |
| `{32768,2}` | VG.Retour Chariot | Caractere retour chariot |
| `{32768,3}` | VG.DROIT ACCES IT ? | Droit acces informatique |
| `{32768,4}` | VG.DROIT ACCES CAISSE ? | Droit acces caisse |
| `{32768,38}` | VG.GIFT PASS_V2.00 | Flag Gift Pass actif |

---

## 6. EXPRESSIONS CLES (decodees)

| # | Expression brute | Decode | Signification |
|---|------------------|--------|---------------|
| 1 | `DStr({0,7},'DD/MM/YYYY')` | `DStr(v.titre,'DD/MM/YYYY')` | Format date titre |
| 2 | `IF(Trim({0,54})='1','ALLER',...)` | Sens trajet | Determine ALLER/RETOUR/ALLER-RETOUR |
| 3 | `MlsTrans('Verifier...')&Trim({0,11})` | Message confirmation | Verification transaction |
| 5 | `IF({0,184}=0,IF({0,23}='VSL',...))` | Date achat | Calcul date selon type |
| 6 | `NOT {32768,38}` | `NOT VG.GIFT PASS` | Verifier si pas Gift Pass |
| 10 | `{0,1}` | `W0 Code Devise` | Code devise transaction |
| 22 | `{0,50}>0 AND {0,49}=0` | Validation article | Article selectionne, quantite nulle |
| 26 | `{0,23}='VRL' OR {0,23}='VSL'` | Type reduction | VRL=Village, VSL=Soldes |

> Total: 1052 expressions dans ce programme

---

## 7. FLUX DE DECISION

```
+-----------------------------------------------+
|     ENTREE TRANSACTION (ADH IDE 238)          |
|     Prg_234.xml                               |
+----------------------+------------------------+
                       |
                       v
            +--------------------+
            | Verifier session   |
            | VG.DROIT ACCES     |
            +----------+---------+
                       |
                       v
            +--------------------+
            | Charger infos      |
            | - Article (#77)    |
            | - Stock (#197)     |
            | - Client (#30,#103)|
            +----------+---------+
                       |
                       v
            +--------------------+
            | Saisie vente       |
            | - Code article     |
            | - Quantite         |
            | - Mode paiement    |
            +----------+---------+
                       |
                       v
            +--------------------+
            | Validation TPE ?   |
            | W0 Retour TPE      |
            +----------+---------+
                       |
              +--------+--------+
              |                 |
        OUI   v           NON   v
     +-------------+    +-------------+
     | Transaction |    | Annuler     |
     | enregistree |    | transaction |
     +-------------+    +-------------+
```

---

## 8. CALL GRAPH

### 8.1 Programmes appelants (Callers)

Ce programme est appele depuis le menu Ventes (ADH IDE 232+).

### 8.2 Programmes appeles (Callees)

| Callee | IDE | Nom probable | Type Appel |
|--------|-----|--------------|------------|
| ADH IDE 152 | 152 | RECUP_CLASSE_MOP | CallProg() |
| ADH IDE 149 | 149 | CALC_STOCK_PRODUIT | CallProg() |

---

## 9. NOTES DE MIGRATION

### 9.1 Complexite

| Critere | Score | Justification |
|---------|-------|---------------|
| Nombre de taches | 1 | Simple |
| Tables en lecture | 12 | Moyen |
| Expressions complexes | 1052 | Eleve |
| Appels externes | 2+ | Faible |
| **Total** | **Moyen-Eleve** | Nombreuses expressions |

### 9.2 Points d'attention

1. **TPE Integration** : Variables W0 pour terminal de paiement - necessitent adapter l'interface
2. **Gift Pass** : Logique speciale via VG.GIFT_PASS_V2.00
3. **Reduction VRL/VSL** : Codes speciaux pour reductions Village/Soldes
4. **Stock temps reel** : Verification stock via table #197

### 9.3 Architecture cible suggere

```
API Endpoint: POST /api/ventes/transaction
+-- Request: { societe, codeGM, filiation, article, quantite, modePaiement }
+-- Middleware: AuthService.checkDroitCaisse()
+-- Controller: VentesController.createTransaction()
|   +-- ArticleService.checkStock(articleId)
|   +-- PaymentService.processTPE(montant)
|   +-- VenteService.enregistrerVente(...)
+-- Response: { success, transactionId, total }
```

---

## 10. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 - Correction programme source | Claude |
| 2026-01-26 | v1.0 (OBSOLETE) analysait Prg_238.xml au lieu de Prg_234.xml | - |

---

*Specification v2.0 - Programme Prg_234.xml correctement identifie*

# Migration MECANO - Magic Unipaas vers SQL Server

## Vue d'ensemble

Ce dossier contient la migration du module **MECANO** (Liste Mécanographique) de Magic Unipaas v12.03 vers SQL Server.

### Objectif

Le module MECANO génère une liste des clients présents dans un établissement sur une période donnée, avec leurs informations personnelles, d'hébergement et de séjour.

## Architecture Magic (Source)

### Flux des programmes

```
Prg_18 (Liste Mecanographique) - Point d'entrée PBP
│
├── Prg_206 (RaZ tempos Mecano)
│       ↳ Reset des tables temporaires
│
├── Prg_243/664 (Liste mec preparation planning)
│       ↳ Prépare les données depuis gm-complet + hebergement
│
├── Prg_244/665 (Preparation Mecano) - Orchestrateur
│       ├── Prg_247/668 (Traitement Mecano 1) → tempo_mecano_1 (604)
│       ├── Prg_248/669 (Traitement Mecano 2) → tempo_mecano_2 (605)
│       ├── Prg_249/670 (Traitement Mecano 3) → tempo_mecano_3 (606)
│       └── Prg_250/671 (Groupage Mecano)
│
├── Prg_245/666 (Creation tempo ecran par nom)
│       ↳ Lit tempo_mecano_3 (606) → Écrit tempo_ecran_mecano (594)
│
└── Prg_246/667 (Creation tempo ecran par doss)
        ↳ Alternative tri par dossier
```

> **Note**: Les programmes existent en double dans PBP (243-250) et REF (664-671).
> La logique est similaire mais les IDs diffèrent.

### Tables impliquées

| ID | Nom | Fichier | Rôle |
|----|-----|---------|------|
| 31 | gm-complet | cafil009_dat | Données clients |
| 34 | hebergement | cafil012_dat | Séjours/hébergements |
| 604 | tempo_mecano_1 | tmp_mec01_dat | Intermédiaire niveau 1 |
| 605 | tempo_mecano_2 | tmp_mec02_dat | Intermédiaire niveau 2 |
| 606 | tempo_mecano_3 | tmp_mec03_dat | Intermédiaire niveau 3 |
| 594 | tempo_ecran_mecano | tmp_ecrmec_dat | Sortie REF |
| 612 | tempo_present_excel | tmp_prex_dat | Sortie PBP |

## Architecture SQL Server (Cible)

### Fichiers SQL

#### Scripts de test (base PMS_Test)
| Fichier | Description |
|---------|-------------|
| `00_create_test_database.sql` | Creation base de test et tables |
| `01_tables_structure.sql` | Structure des tables sources et cibles |
| `02_vw_mecano_source.sql` | Vue source (jointure gm-complet + hebergement) |
| `03_vw_mecano_traitement.sql` | Vue des traitements intermediaires |
| `04_vw_mecano_ecran.sql` | Vue finale format tempo_ecran |
| `05_sp_mecano_generer.sql` | Procedure stockee principale |
| `06_insert_test_data.sql` | Donnees de test fictives |
| `07_test_views.sql` | Tests des vues |
| `08_expected_results.md` | Resultats attendus |
| `99_run_all_tests.sql` | Script consolide |

#### Scripts production (base CSK0912)
| Fichier | Description |
|---------|-------------|
| `10_vw_mecano_real.sql` | Vues adaptees au schema reel CSK0912 |
| `11_sp_mecano_real.sql` | Procedure stockee validee |
| `12_comparison_report.md` | Rapport de comparaison Magic vs SQL |

### Ordre d'exécution

```sql
-- 1. Créer les tables (si nécessaire)
-- Les tables sources (gm_complet, hebergement) doivent exister

-- 2. Créer la table de sortie
CREATE TABLE dbo.tempo_ecran_mecano (...);

-- 3. Créer les vues
-- 02_vw_mecano_source.sql
-- 03_vw_mecano_traitement.sql
-- 04_vw_mecano_ecran.sql

-- 4. Créer la procédure stockée
-- 05_sp_mecano_generer.sql
```

### Utilisation

```sql
-- Générer la liste MECANO
EXEC dbo.sp_mecano_generer
    @p_societe = 'CM',
    @p_date_debut = '2024-01-01',
    @p_date_fin = '2024-01-31',
    @p_tri = 'N';  -- N=Nom, D=Dossier

-- Consulter via vue
SELECT * FROM dbo.vw_mecano_ecran
WHERE txe_societe = 'CM';

-- Ou directement la table temporaire
SELECT * FROM dbo.tempo_ecran_mecano
WHERE txe_societe = 'CM'
  AND txe_user = SYSTEM_USER
ORDER BY txe_sequence;
```

## Mapping des colonnes

### tempo_ecran_mecano (sortie) - Schema reel CSK0912

| Colonne | Source | Description |
|---------|--------|-------------|
| eme_societe | gmc_societe | Code societe |
| eme_user | SYSTEM_USER | Utilisateur courant |
| eme_sequence | ROW_NUMBER() | Numero de sequence |
| eme_code_vente | gmc_code_vente | Code vente (FR, SU, MA...) |
| eme_sexe | gmc_titre | Civilite (Me/Mr) |
| eme_nom | gmc_nom_complet | Nom |
| eme_prenom | gmc_prenom_complet | Prenom |
| eme_numero | gmc_numero_adherent | N adherent (format 10 chiffres) |
| eme_age | heb_age | Age (caractere) |
| eme_age_num | heb_age_num | Age (numerique) |
| eme_num_accompagnant | - | Numero accompagnant |
| eme_fil____accompagn | - | Filiation accompagnant |
| eme_seminaire | - | Code seminaire |
| eme_dossier | gmc_numero_dossier | Numero dossier |
| eme_lieu_sejour | heb_lieu_de_sejour | Code lieu (G, P...) |
| eme_code_logement | heb_code_logement | Code logement (C2D...) |
| eme__u_p__nb_occup | heb_u_p_nb_occup | Nb occupants (U1, U2...) |
| eme_fin_sejour | heb_date_fin | Date fin sejour |
| eme_circuit | - | Circuit |
| eme_bebe | code_fidelite? | 'S' si client fidelite |
| eme_millesia | gmc_code_fidelite | Code fidelite (M, V...) |
| eme_nom_logement | heb_nom_logement | Nom logement |

## Validation

### Statut: VALIDE

La procedure SQL `sp_mecano_generer_real` a ete comparee avec succes
a la sortie du programme Magic MECANO (fichier `DSIOPtmp_ecrmec_dat.TXT`).

Voir le rapport detaille: `sql/12_comparison_report.md`

### Exemple de validation (Famille LASBLEIS)

| Colonne | Magic | SQL | Statut |
|---------|-------|-----|--------|
| sequence | 1,2,3,4 | 1,2,3,4 | OK |
| code_vente | FR | FR | OK |
| sexe | Me,Mr,Me,Mr | Me,Mr,Me,Mr | OK |
| nom | LASBLEIS | LASBLEIS | OK |
| prenom | Marion,Klet,Anais,Axel | Marion,Klet,Anais,Axel | OK |
| numero | 0017558025 | 0017558025 | OK |
| age | 43,45,14,11 | 43,45,14,11 | OK |
| dossier | 159176735 | 159176735 | OK |
| lieu | G | G | OK |
| code_logement | C2D | C2D | OK |
| nb_occupants | U2 | U2 | OK |
| fin_sejour | 03/01/2026 | 03/01/2026 | OK |
| bebe | S | S | OK |
| millesia | M | M | OK |

## Différences PBP vs REF

| Aspect | PBP | REF |
|--------|-----|-----|
| IDs Programmes | 243-252 | 664-675 |
| Table sortie | 612 (tempo_present_excel) | 594 (tempo_ecran_mecano) |
| Point d'entrée | Prg_18 | Prg_664 |

## Limites et améliorations futures

### Non implémenté dans cette version

1. **Prestations** (txe_prestation_01..10)
   - Nécessite jointure avec table des prestations client

2. **Commentaires** (txe_comment_01..05)
   - Nécessite table des commentaires

3. **Email** (txe_email)
   - Nécessite table des contacts

4. **Filiation titulaire** (txe_nom_filiation_0, txe_prenom_filiation_0)
   - Nécessite self-join sur gm_complet pour filiation=0

5. **Séminaires**
   - Filtre par code séminaire non implémenté

### Améliorations suggérées

1. Ajouter index sur les colonnes de filtrage
2. Partitionner par société si gros volumes
3. Implémenter la purge automatique des données anciennes
4. Ajouter logging des exécutions

## Auteur

Genere par Claude Code - Migration Magic Unipaas
Date initiale: 2024
Derniere validation: 2025-12-22 (comparaison avec donnees reelles CSK0912)

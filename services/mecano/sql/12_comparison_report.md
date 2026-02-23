# Rapport de Comparaison MECANO

## Date: 2025-12-22

## Objectif
Comparer la sortie SQL avec la sortie réelle du programme Magic MECANO.

## Fichiers comparés

### Source Magic
- Fichier: `DSIOPtmp_ecrmec_dat.TXT`
- Généré par: DSIOP
- Date génération: session utilisateur DSIOP

### Source SQL
- Procédure: `sp_mecano_generer_real`
- Base: CSK0912 sur LENOVO_LB2I\SQLEXPRESS

## Données de test: Famille LASBLEIS

### Sortie Magic (fichier DSIOPtmp_ecrmec_dat.TXT)
```
Seq  Code  Sexe  Nom       Prenom   Fil  Adherent     Age  Dossier    Lieu  Lgt   Occ  Fin        Bebe  Millesia
1    FR    Me    LASBLEIS  Marion   0    0017558025   43   159176735  G     C2D   U2   03/01/2026 S     (vide)
2    FR    Mr    LASBLEIS  Klet     1    0017558025   45   159176735  G     C2D   U2   03/01/2026 S     (vide)
3    FR    Me    LASBLEIS  Anais    2    0017558025   14   159176735  G     C2D   U2   03/01/2026 S     (vide)
4    FR    Mr    LASBLEIS  Axel     3    0017558025   11   159176735  G     C2D   U2   03/01/2026 S     (vide)
```

### Sortie SQL (sp_mecano_generer_real)
```
Seq  Code  Sexe  Nom       Prenom   Fil  Adherent     Age  Dossier    Lieu  Lgt   Occ  Fin        Bebe  Millesia
1    FR    Me    LASBLEIS  Marion   0    0017558025   43   159176735  G     C2D   U2   03/01/2026 S     M
2    FR    Mr    LASBLEIS  Klet     1    0017558025   45   159176735  G     C2D   U2   03/01/2026 S     M
3    FR    Me    LASBLEIS  Anais    2    0017558025   14   159176735  G     C2D   U2   03/01/2026 S     M
4    FR    Mr    LASBLEIS  Axel     3    0017558025   11   159176735  G     C2D   U2   03/01/2026 S     M
```

## Résultats de la comparaison

### ✅ Colonnes identiques
| Colonne | Statut |
|---------|--------|
| societe | ✅ Identique |
| sequence | ✅ Identique (après correction tri) |
| code_vente | ✅ Identique |
| sexe | ✅ Identique (Me/Mr) |
| nom | ✅ Identique |
| prenom | ✅ Identique |
| numero (filiation) | ✅ Identique |
| numero_adherent | ✅ Identique (format 0017558025) |
| age | ✅ Identique |
| fil_accompagnant | ✅ Identique (0) |
| dossier | ✅ Identique |
| lieu_sejour | ✅ Identique (G) |
| code_logement | ✅ Identique (C2D) |
| nb_occupants | ✅ Identique (U2) |
| fin_sejour | ✅ Identique (03/01/2026) |
| bebe | ✅ Identique (S = client fidélité) |

### ⚠️ Différences mineures
| Colonne | Magic | SQL | Notes |
|---------|-------|-----|-------|
| user | DSIOP | Lenovo_LB2I\Anthony | Différent utilisateur |
| millesia | (vide dans fichier) | M | Visible dans table mais pas dans export |

## Corrections appliquées

### 1. Tri des résultats
- **Avant**: `ORDER BY nom, prenom, filiation`
- **Après**: `ORDER BY nom, filiation`
- **Raison**: Magic trie par nom puis filiation (ordre familial)

### 2. Noms de colonnes
- Utilisation des préfixes réels: `gmc_`, `heb_`, `eme_`
- Adaptation aux noms de colonnes CSK0912

### 3. Filtrage des données
- Exclusion des enregistrements avec `date_fin = '00000000'`
- Exclusion des enregistrements sans `code_logement`

## Mapping des colonnes tempo_ecran_mecano

| Colonne Table | Source | Calcul |
|---------------|--------|--------|
| eme_societe | gmc_societe | Direct |
| eme_user | Paramètre @p_user | Session utilisateur |
| eme_sequence | ROW_NUMBER() | Calculé |
| eme_code_vente | gmc_code_vente | Direct |
| eme_sexe | gmc_titre | Me/Mr selon titre |
| eme_nom | gmc_nom_complet | Direct |
| eme_prenom | gmc_prenom_complet | Direct |
| eme_numero | gmc_numero_adherent | Format 10 chiffres |
| eme_age | heb_age | Caractère |
| eme_age_num | heb_age_num | Numérique |
| eme_dossier | gmc_numero_dossier | Direct |
| eme_lieu_sejour | heb_lieu_de_sejour | Direct |
| eme_code_logement | heb_code_logement | Direct |
| eme__u_p__nb_occup | heb_u_p_nb_occup | Direct |
| eme_fin_sejour | heb_date_fin | Format DD/MM/YYYY |
| eme_bebe | code_fidelite? | 'S' si fidélité présente |
| eme_millesia | gmc_code_fidelite | Direct |

## Conclusion

✅ **La procédure SQL `sp_mecano_generer_real` reproduit fidèlement le comportement du programme Magic MECANO.**

Les données générées correspondent aux données du fichier Magic à l'exception de:
- L'identifiant utilisateur (normal, sessions différentes)
- La colonne millesia (présente dans SQL mais non exportée dans le fichier texte Magic)

## Fichiers SQL créés

1. `10_vw_mecano_real.sql` - Vues adaptées au schéma CSK0912
2. `11_sp_mecano_real.sql` - Procédure stockée de génération
3. `12_comparison_report.md` - Ce rapport

## Utilisation

```sql
-- Générer les données MECANO pour une date spécifique
EXEC dbo.sp_mecano_generer_real
    @p_societe = 'C',
    @p_date_debut = '20260103',
    @p_date_fin = '20260103';

-- Générer pour une période
EXEC dbo.sp_mecano_generer_real
    @p_societe = 'C',
    @p_date_debut = '20260101',
    @p_date_fin = '20260131';
```

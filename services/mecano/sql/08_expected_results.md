# Résultats Attendus des Tests MECANO

## Données de Test

### 5 Dossiers - 14 Personnes

| Dossier | Famille | Nb Pers | Pays | Période | Logement | Fidelité |
|---------|---------|---------|------|---------|----------|----------|
| 1001 | DUPONT | 4 | FR | 06-13/01 | Bungalow 12 | GOLD |
| 1002 | MARTIN | 2 | FR | 08-15/01 | Suite 05 | PLAT (VIP) |
| 1003 | GARCIA | 3 | ES | 10-17/01 | Chambre 22 | - |
| 1004 | MUELLER | 1 | DE | 05-12/01 | Chambre 08 | - |
| 1005 | JOHNSON | 5 | US | 12-20/01 | Villa 03 | - |

---

## TEST 1: Vue vw_mecano_source

**Requête:**
```sql
SELECT societe, compte, filiation, nom, prenom, age, qualite,
       date_arrivee, date_depart, logement, code_logement, statut_sejour
FROM dbo.vw_mecano_source
ORDER BY date_arrivee, nom, prenom;
```

**Résultat attendu (14 lignes):**

| societe | compte | filiation | nom | prenom | age | qualite | date_arrivee | date_depart | logement | statut |
|---------|--------|-----------|-----|--------|-----|---------|--------------|-------------|----------|--------|
| CM | 1004 | 0 | MUELLER | Hans | 33 | ADU | 2024-01-05 | 2024-01-12 | Chambre 08 | PR |
| CM | 1001 | 0 | DUPONT | Jean | 48 | ADU | 2024-01-06 | 2024-01-13 | Bungalow 12 | PR |
| CM | 1001 | 3 | DUPONT | Emma | 1 | BB | 2024-01-06 | 2024-01-13 | Bungalow 12 | PR |
| CM | 1001 | 2 | DUPONT | Lucas | 13 | ENF | 2024-01-06 | 2024-01-13 | Bungalow 12 | PR |
| CM | 1001 | 1 | DUPONT | Marie | 45 | ADU | 2024-01-06 | 2024-01-13 | Bungalow 12 | PR |
| CM | 1002 | 0 | MARTIN | Pierre | 58 | ADU | 2024-01-08 | 2024-01-15 | Suite 05 | PR |
| CM | 1002 | 1 | MARTIN | Sophie | 55 | ADU | 2024-01-08 | 2024-01-15 | Suite 05 | PR |
| CM | 1003 | 0 | GARCIA | Carlos | 43 | ADU | 2024-01-10 | 2024-01-17 | Chambre 22 | AR |
| CM | 1003 | 1 | GARCIA | Ana | 41 | ADU | 2024-01-10 | 2024-01-17 | Chambre 22 | AR |
| CM | 1003 | 2 | GARCIA | Pablo | 8 | ENF | 2024-01-10 | 2024-01-17 | Chambre 22 | AR |
| CM | 1005 | 4 | JOHNSON | Baby | 0 | BB | 2024-01-12 | 2024-01-20 | Villa 03 | CO |
| CM | 1005 | 2 | JOHNSON | Emily | 18 | ADU | 2024-01-12 | 2024-01-20 | Villa 03 | CO |
| CM | 1005 | 3 | JOHNSON | James | 15 | ADO | 2024-01-12 | 2024-01-20 | Villa 03 | CO |
| CM | 1005 | 0 | JOHNSON | Michael | 51 | ADU | 2024-01-12 | 2024-01-20 | Villa 03 | CO |
| CM | 1005 | 1 | JOHNSON | Sarah | 48 | ADU | 2024-01-12 | 2024-01-20 | Villa 03 | CO |

---

## TEST 2: Vue vw_mecano_traitement

**Résultat attendu (colonnes calculées):**

| seq | nom | prenom | sexe | qualite | age | logement | retour | millesias | LB | bebe |
|-----|-----|--------|------|---------|-----|----------|--------|-----------|----|----|
| 1 | DUPONT | Emma | | BB | 1 BB | B12 Bungalow | RET | GOLD | | BB |
| 2 | DUPONT | Jean | M. | M. ADU | 48 | B12 Bungalow | RET | GOLD | | |
| 3 | DUPONT | Lucas | M. | M. ENF | 13 | B12 Bungalow | | | | |
| 4 | DUPONT | Marie | Mme | Mme ADU | 45 | B12 Bungalow | RET | GOLD | | |
| 5 | GARCIA | Ana | Mme | Mme ADU | 41 | C22 Chambre | | | | |
| 6 | GARCIA | Carlos | M. | M. ADU | 43 | C22 Chambre | | | | |
| 7 | GARCIA | Pablo | M. | M. ENF | 8 | C22 Chambre | | | | |
| 8 | JOHNSON | Baby | M. | M. BB | 0 BB | V03 Villa 0 | | | | BB |
| 9 | JOHNSON | Emily | Mme | Mme ADU | 18 | V03 Villa 0 | | | | |
| 10 | JOHNSON | James | M. | M. ADO | 15 | V03 Villa 0 | | | | |
| 11 | JOHNSON | Michael | M. | M. ADU | 51 | V03 Villa 0 | | | | |
| 12 | JOHNSON | Sarah | Mme | Mme ADU | 48 | V03 Villa 0 | | | | |
| 13 | MARTIN | Pierre | M. | M. ADU | 58 | S05 Suite 0 | RET | PLAT | LB | |
| 14 | MARTIN | Sophie | Mme | Mme ADU | 55 | S05 Suite 0 | RET | PLAT | LB | |
| 15 | MUELLER | Hans | M. | M. ADU | 33 | C08 Chambre | | | | |

---

## TEST 3: Vue vw_mecano_ecran (format final)

**Format équivalent à tempo_ecran_mecano:**

| Seq | Nom | Prenom | Sx | Qualite | Age | Logement | Pays | Arr | Dep | BB | Fidel | LB | Ret |
|-----|-----|--------|-------|---------|-----|----------|------|-----|-----|-----|-------|----|----|
| 1 | DUPONT | Emma | | BB | 1 | B12 Bungal | FR | 06/01 | 13/01 | BB | GOLD | | RET |
| 2 | DUPONT | Jean | M. | M. ADU | 48 | B12 Bungal | FR | 06/01 | 13/01 | | GOLD | | RET |
| 3 | DUPONT | Lucas | M. | M. ENF | 13 | B12 Bungal | FR | 06/01 | 13/01 | | | | |
| 4 | DUPONT | Marie | Mm | Mme ADU | 45 | B12 Bungal | FR | 06/01 | 13/01 | | GOLD | | RET |
| 5 | GARCIA | Ana | Mm | Mme ADU | 41 | C22 Chambr | ES | 10/01 | 17/01 | | | | |
| 6 | GARCIA | Carlos | M. | M. ADU | 43 | C22 Chambr | ES | 10/01 | 17/01 | | | | |
| 7 | GARCIA | Pablo | M. | M. ENF | 8 | C22 Chambr | ES | 10/01 | 17/01 | | | | |
| 8 | JOHNSON | Baby | M. | M. BB | 0 | V03 Villa | US | 12/01 | 20/01 | BB | | | |
| 9 | JOHNSON | Emily | Mm | Mme ADU | 18 | V03 Villa | US | 12/01 | 20/01 | | | | |
| 10 | JOHNSON | James | M. | M. ADO | 15 | V03 Villa | US | 12/01 | 20/01 | | | | |
| 11 | JOHNSON | Michael | M. | M. ADU | 51 | V03 Villa | US | 12/01 | 20/01 | | | | |
| 12 | JOHNSON | Sarah | Mm | Mme ADU | 48 | V03 Villa | US | 12/01 | 20/01 | | | | |
| 13 | MARTIN | Pierre | M. | M. ADU | 58 | S05 Suite | FR | 08/01 | 15/01 | | PLAT | LB | RET |
| 14 | MARTIN | Sophie | Mm | Mme ADU | 55 | S05 Suite | FR | 08/01 | 15/01 | | PLAT | LB | RET |
| 15 | MUELLER | Hans | M. | M. ADU | 33 | C08 Chambr | DE | 05/01 | 12/01 | | | | |

---

## TEST 4: Procédure stockée sp_mecano_generer

**Exécution complète:**
```sql
EXEC dbo.sp_mecano_generer
    @p_societe = 'CM',
    @p_date_debut = '2024-01-01',
    @p_date_fin = '2024-01-31',
    @p_tri = 'N';
```

**Résultat attendu:** 14 enregistrements insérés dans tempo_ecran_mecano

---

## TEST 5: Filtres spécifiques

### Filtre VIP uniquement
```sql
EXEC dbo.sp_mecano_generer @p_societe='CM', @p_date_debut='2024-01-01',
    @p_date_fin='2024-01-31', @p_categorie='VIP';
```
**Résultat:** 2 enregistrements (MARTIN Pierre et Sophie)

### Filtre fidélité uniquement
```sql
EXEC dbo.sp_mecano_generer @p_societe='CM', @p_date_debut='2024-01-01',
    @p_date_fin='2024-01-31', @p_filtre_fidelite=1;
```
**Résultat:** 6 enregistrements (DUPONT x4 + MARTIN x2)

### Tri par dossier
```sql
EXEC dbo.sp_mecano_generer @p_societe='CM', @p_date_debut='2024-01-01',
    @p_date_fin='2024-01-31', @p_tri='D';
```
**Résultat:** Ordre des séquences par compte puis nom

| seq | dossier | nom | prenom |
|-----|---------|-----|--------|
| 1 | 1001/0 | DUPONT | Jean |
| 2 | 1001/1 | DUPONT | Marie |
| 3 | 1001/2 | DUPONT | Lucas |
| 4 | 1001/3 | DUPONT | Emma |
| 5 | 1002/0 | MARTIN | Pierre |
| 6 | 1002/1 | MARTIN | Sophie |
| 7 | 1003/0 | GARCIA | Carlos |
| 8 | 1003/1 | GARCIA | Ana |
| 9 | 1003/2 | GARCIA | Pablo |
| 10 | 1004/0 | MUELLER | Hans |
| 11 | 1005/0 | JOHNSON | Michael |
| 12 | 1005/1 | JOHNSON | Sarah |
| 13 | 1005/2 | JOHNSON | Emily |
| 14 | 1005/3 | JOHNSON | James |
| 15 | 1005/4 | JOHNSON | Baby |

---

## Validation

✅ **Critères de succès:**
1. 14 personnes affichées pour la période complète
2. Bébés (age ≤ 2) marqués avec "BB"
3. Enfants (age ≤ 12) marqués "ENF"
4. Adolescents (age ≤ 17) marqués "ADO"
5. Adultes marqués "ADU"
6. VIP marqués "LB" (Liste Blanche)
7. Fidélité présente → "RET" (Retour)
8. Single (1 occupant) marqué "Y"
9. Tri par nom/dossier fonctionnel
10. Filtres catégorie/fidélité fonctionnels

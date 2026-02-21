# Résumé Exécutif - Inventaire Tables ADH

> **Date**: 2026-02-09
> **Rapport complet**: `ADH_DATA_MODEL_ANALYSIS.md`

## 📊 CHIFFRES CLES

| Métrique | Valeur |
|----------|--------|
| **Tables uniques identifiées** | ~120 tables |
| **Tables critiques MVP (Lot 0+1+2)** | 45 tables |
| **Tables partagées (≥3 lots)** | 15 tables cross-domaines |
| **Tables temporaires (TMP/MEM)** | 9 tables |
| **Domaines fonctionnels** | 13 domaines |

## 🎯 TABLES MVP (45 tables critiques)

### ⭐⭐⭐ Priorité CRITIQUE (16 tables)

| Table | Nom | Domaine | Raison |
|-------|-----|---------|--------|
| **47** | compte_gm | Comptes | Coeur métier comptes GM |
| **30** | gm-recherche | Index | Index principal adhérents |
| **246** | histo_sessions_caisse | Caisse | Session caisse ouverture/fermeture |
| **249** | histo_sessions_caisse_detail | Caisse | Détail sessions comptabilité |
| **232** | gestion_devise_session | Caisse | Devises session multi-devises |
| **40** | comptable | Comptabilité | Comptabilité générale |
| **23** | reseau_cloture | Système | Clôture réseau cohérence |
| **70** | date_comptable | Comptabilité | Date comptable traçabilité |
| **67** | tables | Référentiel | Tables génériques |
| **89** | moyen_paiement | Paiements | Moyens de paiement ventes |
| **50** | moyens_reglement | Paiements | Règlements encaissements |
| **263** | vente | Ventes | Ventes transactions |
| **32** | prestations | Prestations | Prestations vendues |
| **77** | articles | Stock | Articles catalogue |
| **697** | droits_applications | Sécurité | Droits contrôle accès |
| **911** | log_booker | Logs | Logging audit trail |

### ⭐⭐ Priorité HAUTE (14 tables)

Tables temporaires UI (596, 493, 491, 492, 847, 899), comptage caisse (222, 200), stock (197), mouvements (46), compteurs (68, 31), garanties (39), devises (141).

### ⭐ Priorité MOYENNE (15 tables)

Sessions coffre2 (248, 244, 227), pointage fermeture (242, 243, 241), règlements (139, 140), mémoire (945, 1037), hébergement (34), prestations (96), gratuités (79, 26, 38).

## 🔗 TABLES PARTAGEES (cross-lot)

### Tables critiques partagées (≥4 lots)

| Table | Nom | Lots | Type accès |
|-------|-----|------|------------|
| **47** | compte_gm | 6 lots | R/W |
| **30** | gm-recherche | 6 lots | R/W |
| **40** | comptable | 5 lots | R/W |
| **23** | reseau_cloture | 5 lots | R/W |
| **70** | date_comptable | 5 lots | R |
| **68** | compteurs | 4 lots | W |
| **67** | tables | 4 lots | R |
| **31** | gm-complet | 4 lots | R/W |

## 📦 DOMAINES FONCTIONNELS

| Domaine | Tables | Criticité MVP |
|---------|--------|---------------|
| **Caisse & Sessions** | 13 tables | ⭐⭐⭐ |
| **Comptes & Comptabilité** | 12 tables | ⭐⭐⭐ |
| **Paiements & Règlements** | 7 tables | ⭐⭐⭐ |
| **Ventes & Prestations** | 11 tables | ⭐⭐⭐ |
| **Stock & Articles** | 5 tables | ⭐⭐⭐ |
| **Change & Devises** | 10 tables | ⭐⭐ |
| **Hébergement & Clients** | 7 tables | ⭐⭐ |
| **Garanties & Dépôts** | 3 tables | ⭐⭐ |
| **Historiques & Logs** | 10 tables | ⭐⭐ |
| **Système & Configuration** | 15 tables | ⭐⭐ |
| **Cartes & Fidélité** | 5 tables | ⭐ |
| **Factures & TPE** | 6 tables | ⭐ |
| **Communication** | 3 tables | ⭐ |

## 🏗️ ARCHITECTURE API RECOMMANDEE

### Services backend

| Service | Responsabilité | Tables principales |
|---------|----------------|-------------------|
| **SessionService** | Gestion sessions caisse | 246, 249, 232, 222 |
| **CompteService** | Gestion comptes GM | 47, 30, 31, 40 |
| **VenteService** | Transactions ventes | 263, 32, 46, 596 |
| **PaiementService** | Encaissements | 89, 50, 139, 140 |
| **ChangeService** | Opérations change | 44, 141, 147, 693 |
| **GarantieService** | Garanties dépôts | 39, 91, 111 |
| **StockService** | Gestion articles | 77, 197, 740, 242 |
| **ComptabiliteService** | Écritures comptables | 40, 70, 68, 23 |

### Schémas SQL Server recommandés

```sql
CREATE SCHEMA caisse;      -- 15 tables sessions
CREATE SCHEMA comptes;     -- 5 tables comptes GM
CREATE SCHEMA ventes;      -- 7 tables ventes
CREATE SCHEMA paiements;   -- 4 tables paiements
CREATE SCHEMA stock;       -- 3 tables articles
CREATE SCHEMA change;      -- 9 tables devises
CREATE SCHEMA garanties;   -- 3 tables garanties
CREATE SCHEMA compta;      -- 8 tables comptabilité
CREATE SCHEMA systeme;     -- 13 tables système
```

## ✅ LIVRABLES DISPONIBLES

1. **Rapport complet** : `ADH_DATA_MODEL_ANALYSIS.md` (détail 120 tables)
2. **Inventaire par lot** : tables Lot 1 à 6 avec type accès R/W/L
3. **Tables partagées** : matrice cross-lot
4. **Relations** : FK identifiées entre tables principales
5. **Recommandations** : endpoints API, services, schémas SQL

## 🚀 PROCHAINES ETAPES

1. **Valider le modèle** : Revoir 45 tables MVP + relations FK
2. **Spec OpenAPI** : Endpoints Lot 1 (Sessions) + Lot 2 (Ventes)
3. **Schema Prisma** : Migrations pour 45 tables MVP
4. **Règles métier** : Documenter contraintes validation
5. **Tests** : Planifier tests unitaires/intégration/E2E

## ❓ QUESTIONS OUVERTES

1. **Multi-devise** : Stratégie formatage/calculs dans React ?
2. **Temps réel** : Sessions caisse nécessitent WebSocket ?
3. **Offline** : Caisse doit fonctionner offline (IndexedDB) ?
4. **Impressions** : Tickets PDF ou impression directe ?
5. **Sécurité** : Token JWT par session caisse ou utilisateur ?

---

**STATUT** : ✅ INVENTAIRE COMPLET
**Source** : Analyse 16 programmes ADH (specs V7.2)
**Tables analysées** : ~120 tables SQL Server

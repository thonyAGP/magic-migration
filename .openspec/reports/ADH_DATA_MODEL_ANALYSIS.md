# Inventaire Complet des Tables ADH - Migration Web

> **Date**: 2026-02-09
> **Analyse**: Toutes les tables SQL Server utilisées par les 30 programmes ADH
> **Objectif**: Modèle de données pour migration React + Vite

## RESUME EXECUTIF

### Volumétrie globale

| Métrique | Total |
|----------|-------|
| **Tables uniques** | ~120 tables distinctes |
| **Tables critiques MVP** | 45 tables (Lot 0+1+2) |
| **Tables partagées (≥3 lots)** | 15 tables cross-domaines |
| **Tables temporaires** | 8 tables (TMP/MEM) |

### Tables par lot

| Lot | Nom | Programmes | Tables distinctes | Tables critiques |
|-----|-----|------------|-------------------|------------------|
| **Lot 1** | Ouverture/Fermeture | 163, 121, 122, 120, 131 | ~35 | ⭐ HAUTE |
| **Lot 2** | Vente | 237, 238, 242 | ~30 | ⭐ CRITIQUE |
| **Lot 3** | Consultation/Change | 25, 69 | ~18 | MOYENNE |
| **Lot 4** | Garanties/Factures | 97, 111 | ~22 | MOYENNE |
| **Lot 5** | Fidélité/Data | 7, 77 | ~14 | BASSE |
| **Lot 6** | Opérations rares | 28, 37, 151, 247 | ~40 | BASSE |

---

## LOT 1: OUVERTURE/FERMETURE CAISSE

### 📋 IDE 163 - Menu caisse (41 tables)

#### Tables modifiées (R+W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **30** | gm-recherche_____gmr | Index de recherche | R/W/L | 7 |
| **47** | compte_gm________cgm | Comptes GM (généraux) | R/W/L | 5 |
| **340** | histo_fusionseparation | Historique / journal | R/W/L | 4 |
| **31** | gm-complet_______gmc | Comptes GM complet | W/L | 4 |
| **23** | reseau_cloture___rec | Données réseau/clôture | W | 2 |
| **911** | log_booker | Logging système | W | 1 |

#### Tables consultées uniquement (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **246** | histo_sessions_caisse | Sessions de caisse | Caisse | 2 |
| **63** | parametres___par | Paramètres système | Config | 1 |
| **78** | param__telephone_tel | Paramètres téléphone | Config | 1 |
| **697** | droits_applications | Droits opérateur | Sécurité | 1 |
| **219** | communication_ims | Communication IMS | Système | 1 |
| **257** | numero_des_terminaux_ims | Numéros terminaux | Système | 2 |
| **67** | tables___________tab | Tables génériques | Référentiel | 2 |
| **878** | categorie_operation_mw | Opérations comptables | Comptabilité | 2 |
| **740** | pv_stock_movements | Mouvements de stock | Stock | 1 |
| **122** | unilateral_bilateral | Config échanges | Référentiel | 1 |

#### Tables Link uniquement (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **39** | depot_garantie___dga | Dépôts et garanties | Garanties | 3 |
| **34** | hebergement______heb | Hébergement (chambres) | Hébergement | 2 |
| **69** | initialisation___ini | Init système | Système | 2 |
| **263** | vente | Données de ventes | Ventes | 1 |
| **43** | solde_devises____sda | Devises / taux de change | Change | 1 |
| **29** | voyages__________voy | Voyages | Hébergement | 1 |

---

### 📋 IDE 121 - Gestion caisse (12 tables)

#### Tables modifiées (R+W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **246** | histo_sessions_caisse | Sessions de caisse | R/W/L | 6 |
| **248** | sessions_coffre2 | Sessions coffre2 | W/L | 3 |
| **244** | saisie_approvisionnement | Comptage appro | W/L | 2 |
| **227** | concurrence_sessions | Concurrence sessions | W | 1 |

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **249** | histo_sessions_caisse_detail | Détail sessions | Caisse | 4 |
| **740** | pv_stock_movements | Mouvements de stock | Stock | 2 |
| **697** | droits_applications | Droits opérateur | Sécurité | 2 |
| **70** | date_comptable___dat | Date comptable | Comptabilité | 1 |
| **198** | coupures_monnaie_locale | Coupures monnaie | Change | 1 |
| **232** | gestion_devise_session | Devises session | Caisse | 1 |
| **23** | reseau_cloture___rec | Réseau clôture | Système | 1 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **197** | articles_en_stock | Articles stock | Stock | 1 |

---

### 📋 IDE 122 - Ouverture caisse (3 tables)

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **232** | gestion_devise_session | Devises session | Caisse | 2 (R/L) |
| **693** | devise_in | Devises entrantes | Change | 1 |
| **67** | tables___________tab | Tables génériques | Référentiel | 1 |

---

### 📋 IDE 120 - Saisie contenu caisse (27 tables)

⚠️ **Programme le plus complexe du lot** : 105 tâches, moteur de calcul des dénominations

#### Tables modifiées (R+W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **493** | edition_ticket | Edition tickets | TMP R/W/L | 23 |
| **491** | soldes_par_mop | Soldes par moyen paiement | TMP R/W/L | 22 |
| **492** | edition_tableau_recap | Edition tableau recap | DB R/W/L | 16 |
| **501** | email_reprise | Email reprise | TMP W/L | 4 |
| **232** | gestion_devise_session | Devises session | DB W/L | 2 |

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **222** | comptage_caisse_histo | Comptage caisse historique | Caisse | 10 (R/L) |
| **89** | moyen_paiement___mop | Moyens de paiement | Paiements | 8 (R/L) |
| **40** | comptable________cte | Comptable | Comptabilité | 3 |
| **263** | vente | Ventes | Ventes | 3 |
| **246** | histo_sessions_caisse | Sessions caisse | Caisse | 2 (R/L) |
| **249** | histo_sessions_caisse_detail | Détail sessions | Caisse | 2 |
| **200** | fond_de_caisse_std | Fond de caisse standard | Caisse | 2 (R/L) |
| **140** | moyen_paiement___mop | Moyens paiement (2) | Paiements | 2 |
| **77** | articles_________art | Articles | Stock | 2 |
| **139** | moyens_reglement_mor | Moyens règlement | Paiements | 1 |
| **70** | date_comptable___dat | Date comptable | Comptabilité | 1 |
| **50** | moyens_reglement_mor | Moyens règlement (2) | Paiements | 1 |
| **219** | communication_ims | Communication IMS | Système | 1 |
| **372** | pv_budget | Budget | Comptabilité | 1 |
| **67** | tables___________tab | Tables génériques | Référentiel | 1 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **197** | articles_en_stock | Articles en stock | Stock | 1 |
| **220** | comptage_caisse_devise_histo | Comptage devise historique | Caisse | 1 |
| **223** | comptage_caisse_montant_histo | Comptage montant historique | Caisse | 1 |
| **90** | devises__________dev | Devises | Change | 1 |
| **199** | fond_de_caisse_std_montant | Fond caisse montant | Caisse | 1 |
| **198** | coupures_monnaie_locale | Coupures monnaie | Change | 1 |
| **141** | devises__________dev | Devises (2) | Change | 1 |

---

### 📋 IDE 131 - Fermeture caisse (10 tables)

#### Tables modifiées (W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **242** | pointage_article | Pointage article | W | 2 |
| **243** | pointage_devise | Pointage devise | W | 2 |
| **241** | pointage_appro_remise | Pointage appro/remise | W | 2 |

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **232** | gestion_devise_session | Devises session | Caisse | 2 (R/L) |
| **249** | histo_sessions_caisse_detail | Détail sessions | Caisse | 2 |
| **139** | moyens_reglement_mor | Moyens règlement | Paiements | 2 |
| **50** | moyens_reglement_mor | Moyens règlement (2) | Paiements | 2 |
| **67** | tables___________tab | Tables génériques | Référentiel | 1 |
| **693** | devise_in | Devises entrantes | Change | 1 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **250** | histo_sessions_caisse_devise | Sessions devise | Caisse | 2 |

---

## LOT 2: VENTE

### 📋 IDE 237 - Vente GP (30 tables)

⚠️ **Programme critique vente** : 12 écrans, ~28 transactions

#### Tables modifiées (R+W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **596** | tempo_ecran_police | Table temporaire écran | TMP R/W/L | 7 |
| **899** | Boo_ResultsRechercheHoraire | Résultats recherche horaire | DB R/W | 8 |
| **847** | stat_lieu_vente_date | Stats point de vente | TMP W/L | 13 |
| **32** | prestations | Prestations/services vendus | DB R/W | 3 |
| **23** | reseau_cloture___rec | Réseau clôture | DB R/W | 5 |
| **46** | mvt_prestation___mpr | Mouvements prestations | DB W/L | 2 |
| **47** | compte_gm________cgm | Comptes GM | DB W | 2 |
| **68** | compteurs________cpt | Compteurs | DB W | 1 |
| **1037** | Table_1037 | Table mémoire | MEM W | 3 |

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **30** | gm-recherche_____gmr | Index recherche | Index | 3 (R/L) |
| **50** | moyens_reglement_mor | Moyens règlement | Paiements | 3 |
| **89** | moyen_paiement___mop | Moyens paiement | Paiements | 8 (R/L) |
| **77** | articles_________art | Articles | Stock | 4 (R/L) |
| **79** | gratuites________gra | Gratuites | Comptabilité | 1 |
| **103** | logement_client__loc | Logement client | Hébergement | 1 |
| **109** | table_utilisateurs | Utilisateurs | Sécurité | 1 |
| **139** | moyens_reglement_mor | Moyens règlement (2) | Paiements | 1 |
| **39** | depot_garantie___dga | Dépôts garanties | Garanties | 1 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **26** | comptes_speciaux_spc | Comptes spéciaux | Comptes | 1 |
| **34** | hebergement______heb | Hébergement | Hébergement | 1 |
| **67** | tables___________tab | Tables génériques | Référentiel | 1 |
| **70** | date_comptable___dat | Date comptable | Comptabilité | 1 |
| **96** | table_prestation_pre | Table prestations | Prestations | 1 |
| **140** | moyen_paiement___mop | Moyens paiement (2) | Paiements | 1 |
| **197** | articles_en_stock | Articles stock | Stock | 1 |
| **372** | pv_budget | Budget | Comptabilité | 1 |
| **697** | droits_applications | Droits | Sécurité | 1 |
| **728** | arc_cc_total | Archive CC total | Archive | 1 |
| **801** | moyens_reglement_complem | Règlements complément | Paiements | 1 |
| **818** | Circuit supprime | Circuit (supprimé) | Archive | 1 |

---

### 📋 IDE 238 - Vente annulation (34 tables)

⚠️ **Jumeau de IDE 237** : partage ~80% de l'UI (1112x279 DLU)

#### Tables modifiées (R+W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **596** | tempo_ecran_police | Table temporaire écran | TMP R/W/L | 11 |
| **899** | Boo_ResultsRechercheHoraire | Résultats recherche | DB R/W | 9 |
| **32** | prestations | Prestations | DB R/W | 5 |
| **23** | reseau_cloture___rec | Réseau clôture | DB R/W | 5 |
| **847** | stat_lieu_vente_date | Stats point vente | TMP W/L | 14 |
| **46** | mvt_prestation___mpr | Mouvements prestations | DB W/L | 3 |
| **1037** | Table_1037 | Table mémoire | MEM W | 4 |
| **47** | compte_gm________cgm | Comptes GM | DB W | 2 |
| **945** | Table_945 | Table mémoire (2) | MEM W | 1 |
| **911** | log_booker | Logging | DB W | 1 |
| **68** | compteurs________cpt | Compteurs | DB W | 1 |

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **89** | moyen_paiement___mop | Moyens paiement | Paiements | 10 (R/L) |
| **77** | articles_________art | Articles | Stock | 5 (R/L) |
| **30** | gm-recherche_____gmr | Index recherche | Index | 3 (R/L) |
| **96** | table_prestation_pre | Table prestations | Prestations | 2 (R/L) |
| **50** | moyens_reglement_mor | Moyens règlement | Paiements | 4 |
| **139** | moyens_reglement_mor | Moyens règlement (2) | Paiements | 1 |
| **79** | gratuites________gra | Gratuites | Comptabilité | 1 |
| **39** | depot_garantie___dga | Dépôts garanties | Garanties | 1 |
| **109** | table_utilisateurs | Utilisateurs | Sécurité | 1 |
| **103** | logement_client__loc | Logement client | Hébergement | 1 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **197** | articles_en_stock | Articles stock | Stock | 2 |
| **67** | tables___________tab | Tables génériques | Référentiel | 1 |
| **910** | classification_memory | Classification | Référentiel | 1 |
| **70** | date_comptable___dat | Date comptable | Comptabilité | 1 |
| **818** | Circuit supprime | Circuit (supprimé) | Archive | 1 |
| **34** | hebergement______heb | Hébergement | Hébergement | 1 |
| **140** | moyen_paiement___mop | Moyens paiement (2) | Paiements | 1 |
| **372** | pv_budget | Budget | Comptabilité | 1 |
| **26** | comptes_speciaux_spc | Comptes spéciaux | Comptes | 1 |
| **108** | code_logement____clo | Code logement | Hébergement | 1 |
| **697** | droits_applications | Droits | Sécurité | 1 |
| **801** | moyens_reglement_complem | Règlements complément | Paiements | 1 |
| **728** | arc_cc_total | Archive CC total | Archive | 1 |

---

### 📋 IDE 242 - Menu Choix Saisie/Annulation (4 tables)

#### Tables modifiées (R+W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **38** | comptable_gratuite | Comptable gratuites | DB R/W | 2 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **264** | vente_gratuite | Ventes gratuites | Ventes | 1 |
| **400** | pv_cust_rentals | Locations clients | Hébergement | 1 |
| **804** | valeur_credit_bar_defaut | Crédit bar défaut | Ventes | 1 |

---

## LOT 3: CONSULTATION & CHANGE

### 📋 IDE 25 - Change GM (14 tables)

#### Tables modifiées (R+W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **44** | change___________chg | Change | DB R/W/L | 4 |
| **23** | reseau_cloture___rec | Réseau clôture | DB R/W | 5 |
| **474** | comptage_caisse_devise | Comptage devise | TMP R/W | 3 |
| **147** | change_vente_____chg | Change vente | DB W/L | 4 |
| **47** | compte_gm________cgm | Comptes GM | DB W | 2 |
| **945** | Table_945 | Table mémoire | MEM W | 1 |
| **68** | compteurs________cpt | Compteurs | DB W | 1 |

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **30** | gm-recherche_____gmr | Index recherche | Index | 2 (R/L) |
| **50** | moyens_reglement_mor | Moyens règlement | Paiements | 2 (R/L) |
| **141** | devises__________dev | Devises | Change | 1 |
| **35** | personnel_go______go | Personnel GO | Personnel | 1 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **139** | moyens_reglement_mor | Moyens règlement (2) | Paiements | 3 |
| **70** | date_comptable___dat | Date comptable | Comptabilité | 1 |
| **124** | type_taux_change | Types taux change | Change | 1 |

---

### 📋 IDE 69 - Extrait de compte (15 tables)

#### Tables modifiées (R+W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **40** | comptable________cte | Comptable | DB R/W | 3 |
| **47** | compte_gm________cgm | Comptes GM | DB R/W | 3 |
| **911** | log_booker | Logging | DB W | 1 |
| **367** | pms_print_param_default | Paramètres impression | DB W | 1 |

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **945** | Table_945 | Table mémoire | MEM | 2 (R/L) |
| **377** | pv_contracts | Contrats | Hébergement | 1 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **396** | pv_cust_packages | Packages clients | Hébergement | 2 |
| **728** | arc_cc_total | Archive CC total | Archive | 1 |
| **30** | gm-recherche_____gmr | Index recherche | Index | 1 |
| **70** | date_comptable___dat | Date comptable | Comptabilité | 1 |
| **395** | pv_ownership | Propriété | Hébergement | 1 |
| **473** | comptage_caisse | Comptage caisse | TMP | 1 |
| **67** | tables___________tab | Tables génériques | Référentiel | 1 |
| **786** | qualite_avant_reprise | Qualité avant reprise | Qualité | 1 |
| **285** | email | Email | Communication | 1 |

---

## LOT 4: GARANTIES & FACTURES

### 📋 IDE 97 - Factures (16 tables)

#### Tables modifiées (R+W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **866** | maj_appli_tpe | MAJ application TPE | DB R/W/L | 12 |
| **870** | Rayons_Boutique | Rayons boutique | DB R/W/L | 7 |
| **868** | Affectation_Gift_Pass | Affectation Gift Pass | DB R/W | 2 |
| **911** | log_booker | Logging | DB W | 1 |
| **40** | comptable________cte | Comptable | DB W | 1 |

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **867** | log_maj_tpe | Log MAJ TPE | Logs | 2 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **746** | projet | Projet | Gestion | 1 |
| **30** | gm-recherche_____gmr | Index recherche | Index | 1 |
| **372** | pv_budget | Budget | Comptabilité | 1 |
| **744** | pv_lieux_vente | Lieux de vente | Ventes | 1 |
| **786** | qualite_avant_reprise | Qualité avant reprise | Qualité | 1 |
| **871** | Activite | Activités | Référentiel | 1 |
| **31** | gm-complet_______gmc | Comptes GM complet | Comptes | 1 |
| **932** | taxe_add_param | Paramètres taxes | Comptabilité | 1 |
| **263** | vente | Ventes | Ventes | 1 |
| **121** | tables_pays_ventes | Tables pays ventes | Référentiel | 1 |

---

### 📋 IDE 111 - Garantie sur compte (22 tables)

#### Tables modifiées (R+W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **39** | depot_garantie___dga | Dépôts garanties | DB R/W/L | 6 |
| **31** | gm-complet_______gmc | Comptes GM complet | DB R/W/L | 4 |
| **47** | compte_gm________cgm | Comptes GM | DB W/L | 7 |
| **68** | compteurs________cpt | Compteurs | DB W | 2 |
| **945** | Table_945 | Table mémoire | MEM W | 2 |
| **911** | log_booker | Logging | DB W | 2 |
| **370** | pv_accounting_date | Date comptable PV | DB W | 2 |

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **91** | garantie_________gar | Garanties | Garanties | 4 (R/L) |
| **30** | gm-recherche_____gmr | Index recherche | Index | 4 |
| **23** | reseau_cloture___rec | Réseau clôture | Système | 2 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **40** | comptable________cte | Comptable | Comptabilité | 2 |
| **285** | email | Email | Communication | 2 |
| **69** | initialisation___ini | Init système | Système | 2 |
| **66** | imputations______imp | Imputations | Comptabilité | 2 |
| **70** | date_comptable___dat | Date comptable | Comptabilité | 2 |
| **88** | historik_station | Historique station | Historique | 2 |
| **140** | moyen_paiement___mop | Moyens paiement | Paiements | 1 |
| **910** | classification_memory | Classification | Référentiel | 1 |
| **50** | moyens_reglement_mor | Moyens règlement | Paiements | 1 |
| **312** | ez_card | Carte EZ | Cartes | 1 |
| **89** | moyen_paiement___mop | Moyens paiement (2) | Paiements | 1 |
| **139** | moyens_reglement_mor | Moyens règlement (2) | Paiements | 1 |

---

## LOT 5: FIDELITE & DATA CATCHING

### 📋 IDE 7 - Data Catching (13 tables)

⚠️ **Application complète** : 15 écrans, domaine fidélité/data

#### Tables modifiées (R+W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **783** | vrl_hp | VRL HP | DB R/W/L | 6 |
| **47** | compte_gm________cgm | Comptes GM | DB R/W/L | 5 |
| **22** | address_data_catching | Adresses data catching | DB R/W | 5 |
| **785** | effectif_quotidien | Effectif quotidien | DB W/L | 5 |
| **312** | ez_card | Carte EZ | DB W | 1 |

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **31** | gm-complet_______gmc | Comptes GM complet | Comptes | 6 (R/L) |
| **30** | gm-recherche_____gmr | Index recherche | Index | 4 (R/L) |
| **40** | comptable________cte | Comptable | Comptabilité | 2 (R/L) |
| **786** | qualite_avant_reprise | Qualité avant reprise | Qualité | 1 |
| **780** | log_affec_auto_detail | Log affectation auto détail | Logs | 1 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **34** | hebergement______heb | Hébergement | Hébergement | 3 |
| **784** | type_repas_nenc_vill | Types repas village | Hébergement | 2 |
| **781** | log_affec_auto_entete | Log affectation auto entête | Logs | 1 |

---

### 📋 IDE 77 - Club Med Pass menu (10 tables)

#### Tables modifiées (W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **312** | ez_card | Carte EZ | DB W/L | 4 |

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **31** | gm-complet_______gmc | Comptes GM complet | Comptes | 2 |
| **786** | qualite_avant_reprise | Qualité avant reprise | Qualité | 1 |
| **728** | arc_cc_total | Archive CC total | Archive | 1 |
| **14** | transac_detail_bar | Transactions détail bar | Ventes | 1 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **131** | fichier_validation | Validation | Système | 1 |
| **47** | compte_gm________cgm | Comptes GM | Comptes | 1 |
| **470** | comptage_coffre | Comptage coffre | TMP | 1 |
| **34** | hebergement______heb | Hébergement | Hébergement | 1 |
| **15** | transac_entete_bar | Transactions entête bar | Ventes | 1 |

---

## LOT 6: OPERATIONS RARES

### 📋 IDE 28 - Fusion/Separation (40+ tables)

⚠️ **Programme complexe** : opérations rares mais impactantes

#### Tables modifiées (R+W) - top 20

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **343** | histo_fusionseparation_saisie | Historique fusion/séparation saisie | DB R/W/L | 9 |
| **30** | gm-recherche_____gmr | Index recherche | DB R/W/L | 8 |
| **39** | depot_garantie___dga | Dépôts garanties | DB R/W/L | 6 |
| **340** | histo_fusionseparation | Historique fusion/séparation | DB R/W/L | 5 |
| **47** | compte_gm________cgm | Comptes GM | DB R/W | 12 |
| **23** | reseau_cloture___rec | Réseau clôture | DB R/W | 5 |
| **51** | fusion_eclatementfec | Fusion éclatement | DB R/W | 4 |
| **33** | prestations______pre | Prestations | DB R/W | 3 |
| **131** | fichier_validation | Validation | DB R/W | 3 |
| **37** | commentaire_gm_________acc | Commentaires GM | DB R/W | 3 |
| **831** | import_go_erreur_affection | Import GO erreur | DB R/W | 3 |
| **837** | ##_pv_customer_dat | Données client PV | DB R/W | 3 |
| **46** | mvt_prestation___mpr | Mouvements prestations | DB R/W | 3 |
| **79** | gratuites________gra | Gratuites | DB R/W | 3 |
| **137** | fichier_histotel | Historique hôtel | DB R/W | 3 |
| **834** | tpe_par_terminal | TPE par terminal | DB R/W | 3 |
| **805** | vente_par_moyen_paiement | Ventes par moyen paiement | DB R/W | 3 |
| **40** | comptable________cte | Comptable | DB R/W | 3 |
| **807** | plafond_lit | Plafond lit | DB R/W | 3 |
| **32** | prestations | Prestations (2) | DB R/W | 3 |

---

### 📋 IDE 37 - Menu changement compte

⚠️ **Pas de section tables détectée dans la spec** - à vérifier

---

### 📋 IDE 151 - Réimpression tickets fermeture (2 tables)

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **249** | histo_sessions_caisse_detail | Détail sessions | Caisse | 1 |
| **246** | histo_sessions_caisse | Sessions caisse | Caisse | 1 |

---

### 📋 IDE 247 - Vente gratuite (20 tables)

#### Tables modifiées (W)

| Table | Nom | Description | Type accès | Usages |
|-------|-----|-------------|------------|--------|
| **34** | hebergement______heb | Hébergement | DB W/L | 3 |
| **38** | comptable_gratuite | Comptable gratuites | DB W/L | 3 |
| **47** | compte_gm________cgm | Comptes GM | DB W | 2 |
| **68** | compteurs________cpt | Compteurs | DB W | 1 |
| **473** | comptage_caisse | Comptage caisse | TMP W | 1 |

#### Tables consultées (R)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **65** | comptes_recette__cre | Comptes recette | Comptabilité | 7 (R/L) |
| **263** | vente | Ventes | DB R/W/L | 5 |
| **26** | comptes_speciaux_spc | Comptes spéciaux | Comptes | 1 |

#### Tables Link (L)

| Table | Nom | Description | Domaine | Usages |
|-------|-----|-------------|---------|--------|
| **30** | gm-recherche_____gmr | Index recherche | Index | 1 |
| **31** | gm-complet_______gmc | Comptes GM complet | Comptes | 1 |
| **40** | comptable________cte | Comptable | Comptabilité | 3 |
| **67** | tables___________tab | Tables génériques | Référentiel | 2 |
| **77** | articles_________art | Articles | Stock | 4 |
| **89** | moyen_paiement___mop | Moyens paiement | Paiements | 3 |
| **113** | tables_village | Tables village | Référentiel | 1 |
| **264** | vente_gratuite | Ventes gratuites | Ventes | 4 |
| **268** | cc_total_par_type | CC total par type | Archive | 1 |
| **271** | cc_total | CC total | Archive | 1 |
| **382** | pv_discount_reasons | Raisons réductions | Ventes | 1 |
| **596** | tempo_ecran_police | Table temporaire écran | TMP | 2 |

---

## TABLES PARTAGEES (CROSS-LOT)

### ⭐ Tables critiques partagées (≥4 lots)

| Table | Nom | Description | Domaine | Lots | Accès |
|-------|-----|-------------|---------|------|-------|
| **47** | compte_gm________cgm | Comptes GM (généraux) | Comptes | 6 lots | R/W |
| **30** | gm-recherche_____gmr | Index de recherche | Index | 6 lots | R/W |
| **40** | comptable________cte | Comptable | Comptabilité | 5 lots | R/W |
| **23** | reseau_cloture___rec | Réseau clôture | Système | 5 lots | R/W |
| **70** | date_comptable___dat | Date comptable | Comptabilité | 5 lots | R |
| **68** | compteurs________cpt | Compteurs | Comptes | 4 lots | W |
| **67** | tables___________tab | Tables génériques | Référentiel | 4 lots | R |
| **31** | gm-complet_______gmc | Comptes GM complet | Comptes | 4 lots | R/W |

### 🔄 Tables session/caisse (Lot 1+2)

| Table | Nom | Description | Domaine | Lots | Accès |
|-------|-----|-------------|---------|------|-------|
| **246** | histo_sessions_caisse | Sessions de caisse | Caisse | 2 lots | R/W |
| **249** | histo_sessions_caisse_detail | Détail sessions | Caisse | 2 lots | R |
| **232** | gestion_devise_session | Devises session | Caisse | 2 lots | R/W |

### 💳 Tables paiements (Lot 1+2+3+4)

| Table | Nom | Description | Domaine | Lots | Accès |
|-------|-----|-------------|---------|------|-------|
| **89** | moyen_paiement___mop | Moyens de paiement | Paiements | 4 lots | R |
| **50** | moyens_reglement_mor | Moyens règlement | Paiements | 4 lots | R |
| **139** | moyens_reglement_mor | Moyens règlement (2) | Paiements | 4 lots | R |

### 🏨 Tables hébergement/clients (Lot 2+5+6)

| Table | Nom | Description | Domaine | Lots | Accès |
|-------|-----|-------------|---------|------|-------|
| **34** | hebergement______heb | Hébergement (chambres) | Hébergement | 4 lots | R/W |
| **39** | depot_garantie___dga | Dépôts et garanties | Garanties | 4 lots | R/W |

### 🛒 Tables ventes/stock (Lot 2+4+6)

| Table | Nom | Description | Domaine | Lots | Accès |
|-------|-----|-------------|---------|------|-------|
| **77** | articles_________art | Articles | Stock | 3 lots | R |
| **263** | vente | Ventes | Ventes | 3 lots | R/W |
| **32** | prestations | Prestations | Prestations | 3 lots | R/W |
| **46** | mvt_prestation___mpr | Mouvements prestations | Prestations | 3 lots | W |

### 🔒 Tables système (tous lots)

| Table | Nom | Description | Domaine | Lots | Accès |
|-------|-----|-------------|---------|------|-------|
| **911** | log_booker | Logging système | Système | 5 lots | W |
| **697** | droits_applications | Droits opérateur | Sécurité | 3 lots | R |
| **786** | qualite_avant_reprise | Qualité avant reprise | Qualité | 4 lots | R |
| **285** | email | Email | Communication | 3 lots | R |

### 🧮 Tables temporaires (TMP/MEM)

| Table | Nom | Description | Type | Lots | Accès |
|-------|-----|-------------|------|------|-------|
| **596** | tempo_ecran_police | Table temporaire écran | TMP | 3 lots | R/W |
| **945** | Table_945 | Table mémoire | MEM | 3 lots | W |
| **473** | comptage_caisse | Comptage caisse | TMP | 2 lots | W |
| **470** | comptage_coffre | Comptage coffre | TMP | 1 lot | R |

---

## DOMAINES FONCTIONNELS

### 🏦 Caisse & Sessions (13 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|------------|---------------|
| **246** | histo_sessions_caisse | 163, 121, 120, 131, 151 | ⭐⭐⭐ |
| **249** | histo_sessions_caisse_detail | 121, 120, 131, 151 | ⭐⭐⭐ |
| **232** | gestion_devise_session | 122, 120, 131 | ⭐⭐⭐ |
| **248** | sessions_coffre2 | 121 | ⭐⭐ |
| **244** | saisie_approvisionnement | 121 | ⭐⭐ |
| **227** | concurrence_sessions | 121 | ⭐⭐ |
| **222** | comptage_caisse_histo | 120 | ⭐⭐ |
| **220** | comptage_caisse_devise_histo | 120 | ⭐⭐ |
| **223** | comptage_caisse_montant_histo | 120 | ⭐⭐ |
| **200** | fond_de_caisse_std | 120 | ⭐⭐ |
| **199** | fond_de_caisse_std_montant | 120 | ⭐⭐ |
| **250** | histo_sessions_caisse_devise | 131 | ⭐⭐ |
| **473** | comptage_caisse | 69, 247 | ⭐ |

### 💰 Comptes & Comptabilité (12 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|------------|---------------|
| **47** | compte_gm________cgm | 163, 237, 238, 25, 69, 7, 111, 28, 247, 77 | ⭐⭐⭐ |
| **30** | gm-recherche_____gmr | 163, 237, 238, 25, 69, 7, 111, 28, 97, 247 | ⭐⭐⭐ |
| **40** | comptable________cte | 163, 120, 69, 97, 111, 28, 7, 247 | ⭐⭐⭐ |
| **31** | gm-complet_______gmc | 163, 111, 7, 77, 97, 247 | ⭐⭐ |
| **68** | compteurs________cpt | 237, 238, 25, 111, 247 | ⭐⭐ |
| **26** | comptes_speciaux_spc | 237, 238, 247 | ⭐⭐ |
| **65** | comptes_recette__cre | 247 | ⭐ |
| **70** | date_comptable___dat | 121, 120, 25, 69, 111 | ⭐⭐⭐ |
| **38** | comptable_gratuite | 242, 247 | ⭐ |
| **66** | imputations______imp | 111 | ⭐ |
| **370** | pv_accounting_date | 111 | ⭐ |
| **372** | pv_budget | 120, 237, 238, 97 | ⭐ |

### 💳 Paiements & Règlements (7 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|------------|---------------|
| **89** | moyen_paiement___mop | 120, 237, 238, 111, 247 | ⭐⭐⭐ |
| **50** | moyens_reglement_mor | 120, 131, 237, 238, 25, 111 | ⭐⭐⭐ |
| **139** | moyens_reglement_mor | 120, 131, 237, 238, 25, 111 | ⭐⭐⭐ |
| **140** | moyen_paiement___mop | 120, 237, 238, 111 | ⭐⭐ |
| **801** | moyens_reglement_complem | 237, 238 | ⭐⭐ |
| **805** | vente_par_moyen_paiement | 163, 28 | ⭐ |

### 🛍️ Ventes & Prestations (11 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|------------|---------------|
| **263** | vente | 163, 120, 237, 97, 247 | ⭐⭐⭐ |
| **32** | prestations | 237, 238, 28 | ⭐⭐⭐ |
| **46** | mvt_prestation___mpr | 237, 238, 28 | ⭐⭐⭐ |
| **264** | vente_gratuite | 242, 247 | ⭐ |
| **79** | gratuites________gra | 237, 238, 28 | ⭐⭐ |
| **33** | prestations______pre | 28 | ⭐ |
| **96** | table_prestation_pre | 237, 238 | ⭐⭐ |
| **147** | change_vente_____chg | 25 | ⭐ |
| **847** | stat_lieu_vente_date | 237, 238 | ⭐⭐⭐ |
| **728** | arc_cc_total | 163, 237, 238, 69, 77 | ⭐ |
| **744** | pv_lieux_vente | 97 | ⭐ |

### 📦 Stock & Articles (5 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|------------|---------------|
| **77** | articles_________art | 120, 237, 238, 247 | ⭐⭐⭐ |
| **197** | articles_en_stock | 121, 120, 237, 238 | ⭐⭐⭐ |
| **740** | pv_stock_movements | 163, 121 | ⭐⭐ |
| **242** | pointage_article | 131 | ⭐⭐ |

### 💱 Change & Devises (10 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|-------------|---------------|
| **44** | change___________chg | 25 | ⭐⭐ |
| **141** | devises__________dev | 120, 25 | ⭐⭐ |
| **90** | devises__________dev | 120 | ⭐⭐ |
| **693** | devise_in | 122, 131 | ⭐⭐ |
| **243** | pointage_devise | 131 | ⭐⭐ |
| **198** | coupures_monnaie_locale | 121, 120 | ⭐⭐ |
| **474** | comptage_caisse_devise | 25 | ⭐ |
| **124** | type_taux_change | 25 | ⭐ |
| **43** | solde_devises____sda | 163 | ⭐ |

### 🏨 Hébergement & Clients (7 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|-------------|---------------|
| **34** | hebergement______heb | 163, 237, 238, 7, 77, 247 | ⭐⭐ |
| **103** | logement_client__loc | 237, 238 | ⭐⭐ |
| **108** | code_logement____clo | 238 | ⭐ |
| **29** | voyages__________voy | 163 | ⭐ |
| **377** | pv_contracts | 69 | ⭐ |
| **396** | pv_cust_packages | 69 | ⭐ |
| **395** | pv_ownership | 69 | ⭐ |

### 🔐 Garanties & Dépôts (3 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|-------------|---------------|
| **39** | depot_garantie___dga | 163, 237, 238, 111, 28 | ⭐⭐⭐ |
| **91** | garantie_________gar | 111 | ⭐⭐ |
| **41** | depot_objets_____doa | 163 | ⭐ |

### 📊 Historiques & Logs (10 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|-------------|---------------|
| **911** | log_booker | 163, 238, 69, 97, 111 | ⭐⭐⭐ |
| **340** | histo_fusionseparation | 163, 28 | ⭐ |
| **343** | histo_fusionseparation_saisie | 28 | ⭐ |
| **88** | historik_station | 111 | ⭐ |
| **137** | fichier_histotel | 28 | ⭐ |
| **867** | log_maj_tpe | 97 | ⭐ |
| **780** | log_affec_auto_detail | 7 | ⭐ |
| **781** | log_affec_auto_entete | 7 | ⭐ |

### ⚙️ Système & Configuration (15 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|-------------|---------------|
| **67** | tables___________tab | 163, 122, 120, 131, 237, 238, 69, 247 | ⭐⭐⭐ |
| **23** | reseau_cloture___rec | 163, 121, 237, 238, 25, 111, 28 | ⭐⭐⭐ |
| **697** | droits_applications | 163, 121, 237, 238 | ⭐⭐⭐ |
| **63** | parametres___par | 163 | ⭐⭐ |
| **78** | param__telephone_tel | 163 | ⭐ |
| **219** | communication_ims | 163, 120 | ⭐ |
| **257** | numero_des_terminaux_ims | 163 | ⭐ |
| **69** | initialisation___ini | 163, 111 | ⭐ |
| **122** | unilateral_bilateral | 163 | ⭐ |
| **878** | categorie_operation_mw | 163 | ⭐ |
| **131** | fichier_validation | 77, 28 | ⭐ |
| **113** | tables_village | 247 | ⭐ |
| **367** | pms_print_param_default | 69 | ⭐ |

### 💳 Cartes & Fidélité (5 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|-------------|---------------|
| **312** | ez_card | 163, 7, 77, 111 | ⭐⭐ |
| **783** | vrl_hp | 7 | ⭐ |
| **22** | address_data_catching | 7 | ⭐ |
| **785** | effectif_quotidien | 7 | ⭐ |

### 🧾 Factures & TPE (6 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|-------------|---------------|
| **866** | maj_appli_tpe | 97 | ⭐ |
| **870** | Rayons_Boutique | 97 | ⭐ |
| **868** | Affectation_Gift_Pass | 97 | ⭐ |
| **834** | tpe_par_terminal | 28 | ⭐ |

### 📧 Communication (3 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|-------------|---------------|
| **285** | email | 163, 69, 111 | ⭐⭐ |
| **123** | fichier_messagerie | 163 | ⭐ |

### 🧮 Tables temporaires (9 tables)

| Table | Nom | Type | Programmes | Criticité MVP |
|-------|-----|------|------------|---------------|
| **596** | tempo_ecran_police | TMP | 237, 238, 247 | ⭐⭐⭐ |
| **493** | edition_ticket | TMP | 120 | ⭐⭐⭐ |
| **491** | soldes_par_mop | TMP | 120 | ⭐⭐⭐ |
| **492** | edition_tableau_recap | DB | 120 | ⭐⭐⭐ |
| **847** | stat_lieu_vente_date | TMP | 237, 238 | ⭐⭐⭐ |
| **899** | Boo_ResultsRechercheHoraire | DB | 237, 238 | ⭐⭐⭐ |
| **945** | Table_945 | MEM | 238, 25, 111, 69 | ⭐⭐ |
| **1037** | Table_1037 | MEM | 237, 238 | ⭐⭐ |
| **501** | email_reprise | TMP | 120 | ⭐⭐ |
| **473** | comptage_caisse | TMP | 69, 247 | ⭐ |
| **474** | comptage_caisse_devise | TMP | 25 | ⭐ |
| **470** | comptage_coffre | TMP | 77 | ⭐ |

### 🗄️ Qualité & Référentiels (6 tables)

| Table | Nom | Programmes | Criticité MVP |
|-------|-----|-------------|---------------|
| **786** | qualite_avant_reprise | 163, 69, 7, 77, 97 | ⭐⭐ |
| **910** | classification_memory | 238, 111 | ⭐ |
| **871** | Activite | 97 | ⭐ |
| **121** | tables_pays_ventes | 97 | ⭐ |
| **932** | taxe_add_param | 97 | ⭐ |
| **382** | pv_discount_reasons | 247 | ⭐ |

---

## TABLES CRITIQUES MVP (LOT 0+1+2)

### ⭐⭐⭐ Priorité CRITIQUE (16 tables)

| Table | Nom | Domaine | Raison criticité |
|-------|-----|---------|------------------|
| **47** | compte_gm________cgm | Comptes | Coeur métier : comptes GM utilisés partout |
| **30** | gm-recherche_____gmr | Index | Index principal : recherche adhérents |
| **246** | histo_sessions_caisse | Caisse | Session caisse : ouverture/fermeture |
| **249** | histo_sessions_caisse_detail | Caisse | Détail sessions : comptabilité caisse |
| **232** | gestion_devise_session | Caisse | Devises session : gestion multi-devises |
| **40** | comptable________cte | Comptabilité | Comptabilité générale |
| **23** | reseau_cloture___rec | Système | Clôture réseau : cohérence données |
| **70** | date_comptable___dat | Comptabilité | Date comptable : traçabilité |
| **67** | tables___________tab | Référentiel | Tables génériques : référentiel |
| **89** | moyen_paiement___mop | Paiements | Moyens de paiement : ventes |
| **50** | moyens_reglement_mor | Paiements | Règlements : encaissements |
| **263** | vente | Ventes | Ventes : transactions |
| **32** | prestations | Prestations | Prestations vendues |
| **77** | articles_________art | Stock | Articles : catalogue |
| **697** | droits_applications | Sécurité | Droits : contrôle accès |
| **911** | log_booker | Logs | Logging : audit trail |

### ⭐⭐ Priorité HAUTE (14 tables)

| Table | Nom | Domaine | Raison criticité |
|-------|-----|---------|------------------|
| **493** | edition_ticket | TMP | Edition tickets caisse |
| **491** | soldes_par_mop | TMP | Soldes par moyen paiement |
| **492** | edition_tableau_recap | DB | Tableau récap caisse |
| **596** | tempo_ecran_police | TMP | Écran police (UI vente) |
| **847** | stat_lieu_vente_date | TMP | Stats ventes |
| **899** | Boo_ResultsRechercheHoraire | DB | Résultats recherche vente |
| **222** | comptage_caisse_histo | Caisse | Comptage caisse historique |
| **200** | fond_de_caisse_std | Caisse | Fond de caisse standard |
| **197** | articles_en_stock | Stock | Stock disponible |
| **46** | mvt_prestation___mpr | Prestations | Mouvements prestations |
| **68** | compteurs________cpt | Comptes | Compteurs (numéros) |
| **31** | gm-complet_______gmc | Comptes | Comptes GM complet |
| **39** | depot_garantie___dga | Garanties | Dépôts garanties |
| **141** | devises__________dev | Change | Devises |

### ⭐ Priorité MOYENNE (15 tables)

| Table | Nom | Domaine | Raison criticité |
|-------|-----|---------|------------------|
| **248** | sessions_coffre2 | Caisse | Sessions coffre2 |
| **244** | saisie_approvisionnement | Caisse | Approvisionnements |
| **227** | concurrence_sessions | Caisse | Concurrence sessions |
| **242** | pointage_article | Stock | Pointage article fermeture |
| **243** | pointage_devise | Change | Pointage devise fermeture |
| **241** | pointage_appro_remise | Caisse | Pointage appro/remise |
| **139** | moyens_reglement_mor | Paiements | Règlements (table 2) |
| **140** | moyen_paiement___mop | Paiements | Paiements (table 2) |
| **945** | Table_945 | MEM | Table mémoire temporaire |
| **1037** | Table_1037 | MEM | Table mémoire temporaire |
| **34** | hebergement______heb | Hébergement | Chambres (context vente) |
| **96** | table_prestation_pre | Prestations | Table prestations |
| **79** | gratuites________gra | Comptabilité | Gratuités |
| **26** | comptes_speciaux_spc | Comptes | Comptes spéciaux |
| **38** | comptable_gratuite | Comptabilité | Comptable gratuités |

**TOTAL MVP : 45 tables critiques** (16 critiques + 14 hautes + 15 moyennes)

---

## RELATIONS ENTRE TABLES

### Relations principales identifiées

#### Comptes ↔ Recherche
- **47** (compte_gm) ← FK → **30** (gm-recherche) : recherche adhérents
- **47** (compte_gm) ← FK → **31** (gm-complet) : compléments compte

#### Sessions ↔ Détails
- **246** (histo_sessions_caisse) ← 1:N → **249** (histo_sessions_caisse_detail)
- **246** (histo_sessions_caisse) ← 1:N → **232** (gestion_devise_session)

#### Ventes ↔ Prestations
- **263** (vente) ← FK → **47** (compte_gm) : compte client
- **32** (prestations) ← 1:N → **46** (mvt_prestation) : mouvements

#### Comptabilité
- **40** (comptable) ← FK → **47** (compte_gm) : écritures comptables
- **40** (comptable) ← FK → **70** (date_comptable) : date compta

#### Paiements
- **89** (moyen_paiement) ← FK → **50** (moyens_reglement) : règlements
- **263** (vente) ← FK → **89** (moyen_paiement) : encaissements

---

## RECOMMANDATIONS TECHNIQUES

### Architecture API Backend

#### Endpoints par domaine

**Sessions Caisse** (Lot 1)
```
POST   /api/caisse/sessions/ouvrir
POST   /api/caisse/sessions/fermer
GET    /api/caisse/sessions/{id}
POST   /api/caisse/sessions/{id}/comptage
GET    /api/caisse/sessions/{id}/rapport
```

**Ventes** (Lot 2)
```
POST   /api/ventes
PUT    /api/ventes/{id}/annuler
GET    /api/ventes/{id}
POST   /api/ventes/{id}/ticket
GET    /api/prestations/search
```

**Comptes GM** (Lot 1+2+3)
```
GET    /api/comptes/search?nom={nom}
GET    /api/comptes/{id}
POST   /api/comptes/{id}/extrait
GET    /api/comptes/{id}/solde
```

**Change** (Lot 3)
```
POST   /api/change/operations
GET    /api/change/taux
GET    /api/change/historique/{compteId}
```

**Garanties** (Lot 4)
```
POST   /api/garanties
PUT    /api/garanties/{id}/liberer
GET    /api/garanties/{compteId}
```

#### Services backend

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

### Modèle de données SQL Server

#### Schémas recommandés

```sql
-- Schéma CAISSE
CREATE SCHEMA caisse;
-- Tables: 246, 249, 232, 248, 244, 227, 222, 220, 223, 200, 199, 250, 241, 242, 243

-- Schéma COMPTES
CREATE SCHEMA comptes;
-- Tables: 47, 30, 31, 26, 68

-- Schéma VENTES
CREATE SCHEMA ventes;
-- Tables: 263, 264, 32, 33, 46, 847, 805

-- Schéma PAIEMENTS
CREATE SCHEMA paiements;
-- Tables: 89, 50, 139, 140, 801

-- Schéma STOCK
CREATE SCHEMA stock;
-- Tables: 77, 197, 740

-- Schéma CHANGE
CREATE SCHEMA change;
-- Tables: 44, 141, 90, 147, 693, 243, 43, 124

-- Schéma GARANTIES
CREATE SCHEMA garanties;
-- Tables: 39, 91, 41

-- Schéma COMPTABILITE
CREATE SCHEMA compta;
-- Tables: 40, 70, 66, 38, 65, 372

-- Schéma SYSTEME
CREATE SCHEMA systeme;
-- Tables: 67, 23, 911, 697, 63, 78, 219, 257, 69, 122, 878
```

### Migration des données

#### Ordre de migration

1. **Phase 1 : Référentiels**
   - Tables système (67, 63, 78, 219)
   - Droits (697)
   - Paramètres (date_comptable 70)

2. **Phase 2 : Comptes**
   - Comptes GM (47, 30, 31)
   - Compteurs (68)
   - Comptes spéciaux (26)

3. **Phase 3 : Transactionnel**
   - Paiements (89, 50, 139, 140)
   - Articles (77, 197)
   - Prestations (32, 96)

4. **Phase 4 : Historiques**
   - Sessions caisse (246, 249)
   - Ventes (263)
   - Comptabilité (40)

5. **Phase 5 : Logs**
   - Logs système (911)
   - Historiques (340, 343, 88)

---

## VOLUMETRIE ESTIMEE

### Taille des tables (estimation)

| Domaine | Tables | Enregistrements estimés | Criticité MVP |
|---------|--------|-------------------------|---------------|
| **Comptes GM** | 47, 30, 31 | 50K-100K adhérents | ⭐⭐⭐ |
| **Sessions caisse** | 246, 249 | 10K sessions/an | ⭐⭐⭐ |
| **Ventes** | 263, 32, 46 | 500K transactions/an | ⭐⭐⭐ |
| **Paiements** | 89, 50, 139 | 100 moyens paiement | ⭐⭐⭐ |
| **Articles** | 77, 197 | 5K-10K articles | ⭐⭐ |
| **Logs** | 911 | 1M+ logs/an | ⭐⭐ |

### Index critiques à créer

```sql
-- Index comptes
CREATE INDEX idx_compte_gm_recherche ON comptes.compte_gm (nom, prenom);
CREATE INDEX idx_gm_recherche_compte ON comptes.gm_recherche (compte_id);

-- Index sessions
CREATE INDEX idx_sessions_caisse_date ON caisse.histo_sessions_caisse (date_ouverture, date_fermeture);
CREATE INDEX idx_sessions_detail_session ON caisse.histo_sessions_caisse_detail (session_id);

-- Index ventes
CREATE INDEX idx_ventes_date ON ventes.vente (date_vente);
CREATE INDEX idx_ventes_compte ON ventes.vente (compte_id);
CREATE INDEX idx_ventes_mop ON ventes.vente (moyen_paiement_id);

-- Index paiements
CREATE INDEX idx_moyen_paiement_code ON paiements.moyen_paiement (code);
```

---

## PROCHAINES ETAPES

### Actions prioritaires

1. **Valider le modèle de données**
   - Revoir les 45 tables critiques MVP
   - Valider les relations FK
   - Vérifier les contraintes métier

2. **Définir les endpoints API**
   - Spec OpenAPI pour Lot 1 (Sessions)
   - Spec OpenAPI pour Lot 2 (Ventes)
   - DTOs TypeScript

3. **Créer les migrations Prisma**
   - Schema Prisma pour les 45 tables MVP
   - Migrations initiales
   - Seeders données de référence

4. **Documenter les règles métier**
   - Contraintes de validation
   - Calculs métier (dénominations, totaux)
   - Workflows transactionnels

5. **Planifier les tests**
   - Tests unitaires services
   - Tests intégration API
   - Tests E2E workflows caisse

---

## NOTES COMPLEMENTAIRES

### Programmes sans section tables détectée

- **IDE 37** : Menu changement compte (pas de section tables dans la spec)

### Tables à investiguer

- **Tables MEM** : 945, 1037 (nature exacte ?)
- **Tables TMP** : Stratégie cleanup (session-based? daily?)
- **Tables arc_** : Archives (728, 720) - politique rétention ?

### Questions ouvertes

1. **Stratégie multi-devise** : Comment gérer les devises dans React (formatage, calculs) ?
2. **Temps réel** : Les sessions caisse nécessitent-elles du temps réel (WebSocket) ?
3. **Offline** : La caisse doit-elle fonctionner offline (IndexedDB + sync) ?
4. **Impressions** : Comment gérer l'impression tickets (PDF? impression directe?) ?
5. **Sécurité** : Token JWT par session caisse ou par utilisateur ?

---

**FIN DU RAPPORT**

*Généré le 2026-02-09 par DATA-MODEL agent*
*Source : Analyse de 16 programmes ADH (specs V7.2)*
*Tables analysées : ~120 tables distinctes*

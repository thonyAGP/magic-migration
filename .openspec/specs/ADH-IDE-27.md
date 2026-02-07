# ADH IDE 27 - Separation

> **Analyse**: Phases 1-4 2026-02-07 03:41 -> 03:41 (28s) | Assemblage 03:41
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 27 |
| Nom Programme | Separation |
| Fichier source | `Prg_27.xml` |
| Dossier IDE | General |
| Taches | 183 (10 ecrans visibles) |
| Tables modifiees | 57 |
| Programmes appeles | 11 |

## 2. DESCRIPTION FONCTIONNELLE

**Separation** assure la gestion complete de ce processus, accessible depuis [Menu changement compte (IDE 37)](ADH-IDE-37.md).

Le flux de traitement s'organise en **5 blocs fonctionnels** :

- **Traitement** (130 taches) : traitements metier divers
- **Creation** (44 taches) : insertion d'enregistrements en base (mouvements, prestations)
- **Calcul** (5 taches) : calculs de montants, stocks ou compteurs
- **Consultation** (3 taches) : ecrans de recherche, selection et consultation
- **Validation** (1 tache) : controles et verifications de coherence

**Donnees modifiees** : 57 tables en ecriture (transac_entete_bar, bl_detail, reseau_cloture___rec, voyages__________voy, gm-recherche_____gmr, gm-complet_______gmc, prestations, prestations______pre, hebergement______heb, personnel_go______go, client_gm, commentaire_gm_________acc, comptable_gratuite, depot_garantie___dga, comptable________cte, change___________chg, mvt_prestation___mpr, compte_gm________cgm, fusion_eclatementfec, compteurs________cpt, gratuites________gra, codes_autocom____aut, vendeurs_________ven, fichier_messagerie, fichier_validation, fichier_histotel, change_vente_____chg, troncon__________tro, heb_circuit______hci, commentaire______com, vente, cc_comptable, cc_total_par_type, cc_total, cc_type_detail, email, participants_____par, details_partici__dpa, vente_option_veo, vente____________vep, ez_card, histo_fusionseparation, histo_fusionseparation_saisie, import_mod, pms_print_param, pv_contracts, pv_discount_reasons, heure_de_passage, qualite_avant_reprise, valeur_credit_bar_defaut, vente_par_moyen_paiement, plafond_lit, import_go_erreur_affection, tpe_par_terminal, ##_pv_customer_dat, Table_947, Table_1059).

**Logique metier** : 3 regles identifiees couvrant conditions metier.

<details>
<summary>Detail : phases du traitement</summary>

#### Phase 1 : Traitement (130 taches)

- **27** - Veuillez patienter... **[[ECRAN]](#ecran-t1)**
- **27.1** - Test si cloture en cours
- **27.1.1** - Blocage cloture v1
- **27.1.2** - Blocage cloture v1
- **27.2** - Test reseau
- **27.3.3.1** - Veuillez patienter... **[[ECRAN]](#ecran-t12)**
- **27.3.3.3.1** - Veuillez patienter... **[[ECRAN]](#ecran-t15)**
- **27.3.4** - supprime non pointes
- **27.4** - Message Depots et garantie **[[ECRAN]](#ecran-t17)**
- **27.5** - Traitement fichiers:code+fil **[[ECRAN]](#ecran-t18)**
- **27.5.1** - Veuillez patienter... **[[ECRAN]](#ecran-t19)**
- **27.5.1.2** - Suppression DGA
- **27.5.2** - Veuillez patienter... **[[ECRAN]](#ecran-t22)**
- **27.5.2.2** - Suppression DGA
- **27.5.3** - Veuillez patienter... **[[ECRAN]](#ecran-t25)**
- **27.5.3.2** - Suppression DGA
- **27.5.4** - Veuillez patienter... **[[ECRAN]](#ecran-t28)**
- **27.5.4.2** - Suppression DGA
- **27.5.5** - Veuillez patienter... **[[ECRAN]](#ecran-t31)**
- **27.5.5.2** - Suppression DGA
- **27.5.6** - Veuillez patienter... **[[ECRAN]](#ecran-t34)**
- **27.5.6.2** - Suppression DGA
- **27.5.7** - Veuillez patienter... **[[ECRAN]](#ecran-t37)**
- **27.5.8** - Veuillez patienter... **[[ECRAN]](#ecran-t39)**
- **27.5.8.2** - Suppression DGA
- **27.5.9** - Veuillez patienter... **[[ECRAN]](#ecran-t42)**
- **27.5.9.2** - Suppression DGA
- **27.5.10** - Veuillez patienter... **[[ECRAN]](#ecran-t45)**
- **27.5.11** - Veuillez patienter... **[[ECRAN]](#ecran-t46)**
- **27.5.12** - Veuillez patienter... **[[ECRAN]](#ecran-t47)**
- **27.5.13** - Veuillez patienter... **[[ECRAN]](#ecran-t48)**
- **27.5.13.2** - Suppression DGA
- **27.5.14** - Veuillez patienter... **[[ECRAN]](#ecran-t51)**
- **27.5.14.2** - Suppression DGA
- **27.5.15** - Veuillez patienter... **[[ECRAN]](#ecran-t54)**
- **27.5.15.1** - Lecture CAM
- **27.5.16** - Veuillez patienter... **[[ECRAN]](#ecran-t57)**
- **27.5.16.2** - Suppression DGA
- **27.5.17** - Veuillez patienter... **[[ECRAN]](#ecran-t60)**
- **27.5.17.1** - Lecture CAM
- **27.5.18** - Veuillez patienter... **[[ECRAN]](#ecran-t63)**
- **27.5.18.2** - Suppression DGA
- **27.5.19** - Veuillez patienter... **[[ECRAN]](#ecran-t66)**
- **27.5.19.1** - Lecture CAM
- **27.5.20** - Veuillez patienter... **[[ECRAN]](#ecran-t69)**
- **27.5.20.2** - Suppression DGA
- **27.5.21** - Veuillez patienter... **[[ECRAN]](#ecran-t72)**
- **27.5.21.2** - Suppression DGA
- **27.5.22** - Veuillez patienter... **[[ECRAN]](#ecran-t75)**
- **27.5.22.1** - Lecture
- **27.5.23** - Veuillez patienter... **[[ECRAN]](#ecran-t78)**
- **27.5.23.1** - Lecture
- **27.5.24** - Veuillez patienter... **[[ECRAN]](#ecran-t81)**
- **27.5.25** - Veuillez patienter... **[[ECRAN]](#ecran-t82)**
- **27.5.25.1** - Lecture CAM
- **27.5.26** - Veuillez patienter... **[[ECRAN]](#ecran-t85)**
- **27.5.26.1** - Lecture CAM
- **27.5.27** - Veuillez patienter... **[[ECRAN]](#ecran-t88)**
- **27.5.27.1** - Lecture CAM
- **27.5.28** - Veuillez patienter... **[[ECRAN]](#ecran-t91)**
- **27.5.28.2** - Suppression DGA
- **27.5.29** - Veuillez patienter... **[[ECRAN]](#ecran-t94)**
- **27.5.29.2** - Suppression DGA
- **27.5.30** - Veuillez patienter... **[[ECRAN]](#ecran-t97)**
- **27.5.30.1** - Message
- **27.5.31** - Veuillez patienter... **[[ECRAN]](#ecran-t100)**
- **27.5.31.2** - Suppression DGA
- **27.5.32** - Veuillez patienter... **[[ECRAN]](#ecran-t103)**
- **27.5.32.2** - Suppression DGA
- **27.5.33** - Veuillez patienter... **[[ECRAN]](#ecran-t106)**
- **27.5.34** - Veuillez patienter... **[[ECRAN]](#ecran-t107)**
- **27.5.35** - Veuillez patienter... **[[ECRAN]](#ecran-t108)**
- **27.5.35.2** - Suppression DGA
- **27.5.36** - Veuillez patienter... **[[ECRAN]](#ecran-t111)**
- **27.5.36.2** - Suppression DGA
- **27.5.36.3** - Suppression DGA
- **27.5.37** - Veuillez patienter... **[[ECRAN]](#ecran-t115)**
- **27.5.37.2** - Suppression DGA
- **27.5.38** - Veuillez patienter... **[[ECRAN]](#ecran-t118)**
- **27.5.38.2** - Suppression DGA
- **27.5.39** - Veuillez patienter... **[[ECRAN]](#ecran-t121)**
- **27.5.39.2** - Suppression DGA
- **27.5.40** - Veuillez patienter... **[[ECRAN]](#ecran-t124)**
- **27.5.40.2** - Suppression DGA
- **27.5.41** - Veuillez patienter... **[[ECRAN]](#ecran-t127)**
- **27.5.41.2** - Suppression DGA
- **27.5.42** - Veuillez patienter... **[[ECRAN]](#ecran-t130)**
- **27.5.42.2** - Suppression DGA
- **27.5.43** - Veuillez patienter... **[[ECRAN]](#ecran-t133)**
- **27.5.43.2** - Suppression DGA
- **27.5.44** - Veuillez patienter... **[[ECRAN]](#ecran-t136)**
- **27.5.44.2** - Suppression DGA
- **27.5.45** - Veuillez patienter... **[[ECRAN]](#ecran-t139)**
- **27.5.45.2** - Suppression DGA
- **27.5.46** - Veuillez patienter... **[[ECRAN]](#ecran-t142)**
- **27.5.46.2** - Suppression DGA
- **27.5.47** - Veuillez patienter... **[[ECRAN]](#ecran-t145)**
- **27.5.47.2** - Suppression DGA
- **27.5.48** - Veuillez patienter... **[[ECRAN]](#ecran-t148)**
- **27.5.49** - Veuillez patienter... **[[ECRAN]](#ecran-t149)**
- **27.5.50** - Veuillez patienter... **[[ECRAN]](#ecran-t150)**
- **27.6** - Veuillez patienter... **[[ECRAN]](#ecran-t153)**
- **27.6.1** - Cumul
- **27.6.2** - Sejour
- **27.6.3** - Garantie
- **27.7.1** - Veuillez patienter... **[[ECRAN]](#ecran-t158)**
- **27.7.1.1** - Cumul
- **27.7.1.2** - Date de sejour
- **27.7.1.3** - Garantie
- **27.8** - Traitement n CGM nouveau **[[ECRAN]](#ecran-t162)**
- **27.8.1** - Veuillez patienter... **[[ECRAN]](#ecran-t163)**
- **27.8.1.1** - Cumul
- **27.8.1.2** - Date de sejour
- **27.8.1.3** - Garantie
- **27.9** - Veuillez patienter... **[[ECRAN]](#ecran-t167)**
- **27.11** - Deblocage cloture v1
- **27.12** - Deblocage cloture v1
- **27.13** - Existe ecritures
- **27.14** - Lecture histo
- **27.14.1** - Chrono LOG reprise
- **27.17** - Veuillez patienter SVP ... **[[ECRAN]](#ecran-t176)**
- **27.18** - Reprise virtuelles
- **27.5.51** - Veuillez patienter... **[[ECRAN]](#ecran-t180)**
- **27.5.52** - Veuillez patienter... **[[ECRAN]](#ecran-t183)**
- **27.5.48.1** - Veuillez patienter... **[[ECRAN]](#ecran-t193)**
- **27.5.53** - Veuillez patienter... **[[ECRAN]](#ecran-t196)**
- **27.5.53.1** - Veuillez patienter... **[[ECRAN]](#ecran-t197)**
- **27.5.54** - (sans nom)
- **27.5.55** - Veuillez patienter... **[[ECRAN]](#ecran-t202)**
- **27.5.55.2** - Suppression DGA

Delegue a : [Write histo_Fus_Sep_Log (IDE 35)](ADH-IDE-35.md), [Read histo Fus_Sep_Det (IDE 30)](ADH-IDE-30.md), [Write histo_Fus_Sep_Det (IDE 31)](ADH-IDE-31.md), [Write histo Fus_Sep (IDE 29)](ADH-IDE-29.md), [Read histo_Fus_Sep_Log (IDE 34)](ADH-IDE-34.md), [Recuperation du titre (IDE 43)](ADH-IDE-43.md), [Set Listing Number (IDE 181)](ADH-IDE-181.md)

#### Phase 2 : Consultation (3 taches)

- **27.3** - Selection GM **[[ECRAN]](#ecran-t6)**
- **27.3.2** - Affichage filiations **[[ECRAN]](#ecran-t8)**
- **27.10** - Reaffichage infos reseau

Delegue a : [Recuperation du titre (IDE 43)](ADH-IDE-43.md)

#### Phase 3 : Creation (44 taches)

- **27.3.1** - Creation histo
- **27.5.1.1** - Creation DGA
- **27.5.2.1** - Creation DGA
- **27.5.3.1** - Creation DGA
- **27.5.4.1** - Creation DGA
- **27.5.5.1** - Creation DGA
- **27.5.6.1** - Creation DGA
- **27.5.8.1** - Creation DGA
- **27.5.9.1** - Creation DGA
- **27.5.13.1** - Creation DGA
- **27.5.14.1** - Creation DGA
- **27.5.15.2** - Creation DGA
- **27.5.16.1** - Creation DGA
- **27.5.17.2** - Creation DGA
- **27.5.18.1** - Creation DGA
- **27.5.19.2** - Creation DGA
- **27.5.20.1** - Creation DGA
- **27.5.21.1** - Creation DGA
- **27.5.22.2** - Creation DGA
- **27.5.23.2** - Creation DGA
- **27.5.25.2** - Creation DGA
- **27.5.26.2** - Creation DGA
- **27.5.27.2** - Creation DGA
- **27.5.28.1** - Creation DGA
- **27.5.29.1** - Creation DGA
- **27.5.30.2** - Creation DGA
- **27.5.31.1** - Creation DGA
- **27.5.32.1** - Creation DGA
- **27.5.35.1** - Creation DGA
- **27.5.36.1** - Creation DGA
- **27.5.37.1** - Creation DGA
- **27.5.38.1** - Creation DGA
- **27.5.39.1** - Creation DGA
- **27.5.40.1** - Creation DGA
- **27.5.41.1** - Creation DGA
- **27.5.42.1** - Creation DGA
- **27.5.43.1** - Creation DGA
- **27.5.44.1** - Creation DGA
- **27.5.45.1** - Creation DGA
- **27.5.46.1** - Creation DGA
- **27.5.47.1** - Creation DGA
- **27.15** - creation histo v1
- **27.16** - creation histo v1
- **27.5.55.1** - Creation DGA

#### Phase 4 : Calcul (5 taches)

- **27.3.2.1** - compteur
- **27.3.3** - Nouveaux comptes
- **27.3.3.2** - UN compte
- **27.3.3.3** - N comptes
- **27.7** - nouveau compte **[[ECRAN]](#ecran-t157)**

#### Phase 5 : Validation (1 tache)

- **27.3.2.2** - Validation **[[ECRAN]](#ecran-t10)**

#### Tables impactees

| Table | Operations | Role metier |
|-------|-----------|-------------|
| histo_fusionseparation_saisie | R/**W**/L (11 usages) | Historique / journal |
| gm-recherche_____gmr | R/**W**/L (10 usages) | Index de recherche |
| comptable________cte | R/**W** (10 usages) |  |
| depot_garantie___dga | R/**W**/L (6 usages) | Depots et garanties |
| compte_gm________cgm | **W** (5 usages) | Comptes GM (generaux) |
| reseau_cloture___rec | R/**W** (5 usages) | Donnees reseau/cloture |
| histo_fusionseparation | R/**W**/L (5 usages) | Historique / journal |
| vente____________vep | **W** (4 usages) | Donnees de ventes |
| mvt_prestation___mpr | **W** (3 usages) | Prestations/services vendus |
| cc_comptable | **W** (3 usages) |  |
| commentaire_gm_________acc | **W** (3 usages) |  |
| import_go_erreur_affection | **W** (3 usages) |  |
| participants_____par | **W** (3 usages) |  |
| prestations | **W** (3 usages) | Prestations/services vendus |
| cc_total | **W** (3 usages) |  |
| compteurs________cpt | **W** (3 usages) | Comptes GM (generaux) |
| cc_type_detail | **W** (3 usages) |  |
| heure_de_passage | **W** (3 usages) |  |
| Table_947 | **W** (3 usages) |  |
| gratuites________gra | **W** (3 usages) |  |
| vente_option_veo | **W** (3 usages) | Donnees de ventes |
| transac_entete_bar | **W** (3 usages) |  |
| prestations______pre | R/**W** (3 usages) | Prestations/services vendus |
| plafond_lit | **W** (3 usages) |  |
| tpe_par_terminal | **W** (3 usages) |  |
| voyages__________voy | **W** (3 usages) |  |
| details_partici__dpa | **W** (3 usages) |  |
| bl_detail | **W** (3 usages) |  |
| hebergement______heb | **W** (3 usages) | Hebergement (chambres) |
| fichier_validation | R/**W** (3 usages) |  |
| pms_print_param | **W** (3 usages) |  |
| fichier_histotel | R/**W** (3 usages) | Historique / journal |
| vente_par_moyen_paiement | **W** (3 usages) | Donnees de ventes |
| cc_total_par_type | **W** (3 usages) |  |
| import_mod | **W** (3 usages) |  |
| comptable_gratuite | **W** (3 usages) |  |
| heb_circuit______hci | **W** (3 usages) | Hebergement (chambres) |
| ##_pv_customer_dat | **W** (3 usages) |  |
| gm-complet_______gmc | R/**W** (2 usages) |  |
| personnel_go______go | R/**W** (2 usages) |  |
| pv_contracts | **W** (2 usages) |  |
| qualite_avant_reprise | R/**W** (2 usages) |  |
| change___________chg | R/**W** (2 usages) |  |
| vente | **W** (2 usages) | Donnees de ventes |
| fichier_messagerie | R/**W** (2 usages) |  |
| codes_autocom____aut | R/**W** (2 usages) |  |
| change_vente_____chg | R/**W** (2 usages) | Donnees de ventes |
| pv_discount_reasons | **W** (2 usages) |  |
| ez_card | R/**W** (2 usages) |  |
| client_gm | R/**W** (2 usages) |  |
| Table_1059 | **W** (1 usages) |  |
| troncon__________tro | **W** (1 usages) |  |
| vendeurs_________ven | **W** (1 usages) |  |
| valeur_credit_bar_defaut | **W** (1 usages) |  |
| fusion_eclatementfec | **W** (1 usages) |  |
| email | **W** (1 usages) |  |
| commentaire______com | **W** (1 usages) |  |

</details>

## 3. BLOCS FONCTIONNELS

### 3.1 Traitement (130 taches)

Traitements internes.

---

#### <a id="t1"></a>27 - Veuillez patienter... [[ECRAN]](#ecran-t1)

**Role** : Tache d'orchestration : point d'entree du programme (130 sous-taches). Coordonne l'enchainement des traitements.
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t1)

<details>
<summary>129 sous-taches directes</summary>

| Tache | Nom | Bloc |
|-------|-----|------|
| [27.1](#t2) | Test si cloture en cours | Traitement |
| [27.1.1](#t3) | Blocage cloture v1 | Traitement |
| [27.1.2](#t4) | Blocage cloture v1 | Traitement |
| [27.2](#t5) | Test reseau | Traitement |
| [27.3.3.1](#t12) | Veuillez patienter... **[[ECRAN]](#ecran-t12)** | Traitement |
| [27.3.3.3.1](#t15) | Veuillez patienter... **[[ECRAN]](#ecran-t15)** | Traitement |
| [27.3.4](#t16) | supprime non pointes | Traitement |
| [27.4](#t17) | Message Depots et garantie **[[ECRAN]](#ecran-t17)** | Traitement |
| [27.5](#t18) | Traitement fichiers:code+fil **[[ECRAN]](#ecran-t18)** | Traitement |
| [27.5.1](#t19) | Veuillez patienter... **[[ECRAN]](#ecran-t19)** | Traitement |
| [27.5.1.2](#t21) | Suppression DGA | Traitement |
| [27.5.2](#t22) | Veuillez patienter... **[[ECRAN]](#ecran-t22)** | Traitement |
| [27.5.2.2](#t24) | Suppression DGA | Traitement |
| [27.5.3](#t25) | Veuillez patienter... **[[ECRAN]](#ecran-t25)** | Traitement |
| [27.5.3.2](#t27) | Suppression DGA | Traitement |
| [27.5.4](#t28) | Veuillez patienter... **[[ECRAN]](#ecran-t28)** | Traitement |
| [27.5.4.2](#t30) | Suppression DGA | Traitement |
| [27.5.5](#t31) | Veuillez patienter... **[[ECRAN]](#ecran-t31)** | Traitement |
| [27.5.5.2](#t33) | Suppression DGA | Traitement |
| [27.5.6](#t34) | Veuillez patienter... **[[ECRAN]](#ecran-t34)** | Traitement |
| [27.5.6.2](#t36) | Suppression DGA | Traitement |
| [27.5.7](#t37) | Veuillez patienter... **[[ECRAN]](#ecran-t37)** | Traitement |
| [27.5.8](#t39) | Veuillez patienter... **[[ECRAN]](#ecran-t39)** | Traitement |
| [27.5.8.2](#t41) | Suppression DGA | Traitement |
| [27.5.9](#t42) | Veuillez patienter... **[[ECRAN]](#ecran-t42)** | Traitement |
| [27.5.9.2](#t44) | Suppression DGA | Traitement |
| [27.5.10](#t45) | Veuillez patienter... **[[ECRAN]](#ecran-t45)** | Traitement |
| [27.5.11](#t46) | Veuillez patienter... **[[ECRAN]](#ecran-t46)** | Traitement |
| [27.5.12](#t47) | Veuillez patienter... **[[ECRAN]](#ecran-t47)** | Traitement |
| [27.5.13](#t48) | Veuillez patienter... **[[ECRAN]](#ecran-t48)** | Traitement |
| [27.5.13.2](#t50) | Suppression DGA | Traitement |
| [27.5.14](#t51) | Veuillez patienter... **[[ECRAN]](#ecran-t51)** | Traitement |
| [27.5.14.2](#t53) | Suppression DGA | Traitement |
| [27.5.15](#t54) | Veuillez patienter... **[[ECRAN]](#ecran-t54)** | Traitement |
| [27.5.15.1](#t55) | Lecture CAM | Traitement |
| [27.5.16](#t57) | Veuillez patienter... **[[ECRAN]](#ecran-t57)** | Traitement |
| [27.5.16.2](#t59) | Suppression DGA | Traitement |
| [27.5.17](#t60) | Veuillez patienter... **[[ECRAN]](#ecran-t60)** | Traitement |
| [27.5.17.1](#t61) | Lecture CAM | Traitement |
| [27.5.18](#t63) | Veuillez patienter... **[[ECRAN]](#ecran-t63)** | Traitement |
| [27.5.18.2](#t65) | Suppression DGA | Traitement |
| [27.5.19](#t66) | Veuillez patienter... **[[ECRAN]](#ecran-t66)** | Traitement |
| [27.5.19.1](#t67) | Lecture CAM | Traitement |
| [27.5.20](#t69) | Veuillez patienter... **[[ECRAN]](#ecran-t69)** | Traitement |
| [27.5.20.2](#t71) | Suppression DGA | Traitement |
| [27.5.21](#t72) | Veuillez patienter... **[[ECRAN]](#ecran-t72)** | Traitement |
| [27.5.21.2](#t74) | Suppression DGA | Traitement |
| [27.5.22](#t75) | Veuillez patienter... **[[ECRAN]](#ecran-t75)** | Traitement |
| [27.5.22.1](#t76) | Lecture | Traitement |
| [27.5.23](#t78) | Veuillez patienter... **[[ECRAN]](#ecran-t78)** | Traitement |
| [27.5.23.1](#t79) | Lecture | Traitement |
| [27.5.24](#t81) | Veuillez patienter... **[[ECRAN]](#ecran-t81)** | Traitement |
| [27.5.25](#t82) | Veuillez patienter... **[[ECRAN]](#ecran-t82)** | Traitement |
| [27.5.25.1](#t83) | Lecture CAM | Traitement |
| [27.5.26](#t85) | Veuillez patienter... **[[ECRAN]](#ecran-t85)** | Traitement |
| [27.5.26.1](#t86) | Lecture CAM | Traitement |
| [27.5.27](#t88) | Veuillez patienter... **[[ECRAN]](#ecran-t88)** | Traitement |
| [27.5.27.1](#t89) | Lecture CAM | Traitement |
| [27.5.28](#t91) | Veuillez patienter... **[[ECRAN]](#ecran-t91)** | Traitement |
| [27.5.28.2](#t93) | Suppression DGA | Traitement |
| [27.5.29](#t94) | Veuillez patienter... **[[ECRAN]](#ecran-t94)** | Traitement |
| [27.5.29.2](#t96) | Suppression DGA | Traitement |
| [27.5.30](#t97) | Veuillez patienter... **[[ECRAN]](#ecran-t97)** | Traitement |
| [27.5.30.1](#t98) | Message | Traitement |
| [27.5.31](#t100) | Veuillez patienter... **[[ECRAN]](#ecran-t100)** | Traitement |
| [27.5.31.2](#t102) | Suppression DGA | Traitement |
| [27.5.32](#t103) | Veuillez patienter... **[[ECRAN]](#ecran-t103)** | Traitement |
| [27.5.32.2](#t105) | Suppression DGA | Traitement |
| [27.5.33](#t106) | Veuillez patienter... **[[ECRAN]](#ecran-t106)** | Traitement |
| [27.5.34](#t107) | Veuillez patienter... **[[ECRAN]](#ecran-t107)** | Traitement |
| [27.5.35](#t108) | Veuillez patienter... **[[ECRAN]](#ecran-t108)** | Traitement |
| [27.5.35.2](#t110) | Suppression DGA | Traitement |
| [27.5.36](#t111) | Veuillez patienter... **[[ECRAN]](#ecran-t111)** | Traitement |
| [27.5.36.2](#t113) | Suppression DGA | Traitement |
| [27.5.36.3](#t114) | Suppression DGA | Traitement |
| [27.5.37](#t115) | Veuillez patienter... **[[ECRAN]](#ecran-t115)** | Traitement |
| [27.5.37.2](#t117) | Suppression DGA | Traitement |
| [27.5.38](#t118) | Veuillez patienter... **[[ECRAN]](#ecran-t118)** | Traitement |
| [27.5.38.2](#t120) | Suppression DGA | Traitement |
| [27.5.39](#t121) | Veuillez patienter... **[[ECRAN]](#ecran-t121)** | Traitement |
| [27.5.39.2](#t123) | Suppression DGA | Traitement |
| [27.5.40](#t124) | Veuillez patienter... **[[ECRAN]](#ecran-t124)** | Traitement |
| [27.5.40.2](#t126) | Suppression DGA | Traitement |
| [27.5.41](#t127) | Veuillez patienter... **[[ECRAN]](#ecran-t127)** | Traitement |
| [27.5.41.2](#t129) | Suppression DGA | Traitement |
| [27.5.42](#t130) | Veuillez patienter... **[[ECRAN]](#ecran-t130)** | Traitement |
| [27.5.42.2](#t132) | Suppression DGA | Traitement |
| [27.5.43](#t133) | Veuillez patienter... **[[ECRAN]](#ecran-t133)** | Traitement |
| [27.5.43.2](#t135) | Suppression DGA | Traitement |
| [27.5.44](#t136) | Veuillez patienter... **[[ECRAN]](#ecran-t136)** | Traitement |
| [27.5.44.2](#t138) | Suppression DGA | Traitement |
| [27.5.45](#t139) | Veuillez patienter... **[[ECRAN]](#ecran-t139)** | Traitement |
| [27.5.45.2](#t141) | Suppression DGA | Traitement |
| [27.5.46](#t142) | Veuillez patienter... **[[ECRAN]](#ecran-t142)** | Traitement |
| [27.5.46.2](#t144) | Suppression DGA | Traitement |
| [27.5.47](#t145) | Veuillez patienter... **[[ECRAN]](#ecran-t145)** | Traitement |
| [27.5.47.2](#t147) | Suppression DGA | Traitement |
| [27.5.48](#t148) | Veuillez patienter... **[[ECRAN]](#ecran-t148)** | Traitement |
| [27.5.49](#t149) | Veuillez patienter... **[[ECRAN]](#ecran-t149)** | Traitement |
| [27.5.50](#t150) | Veuillez patienter... **[[ECRAN]](#ecran-t150)** | Traitement |
| [27.6](#t153) | Veuillez patienter... **[[ECRAN]](#ecran-t153)** | Traitement |
| [27.6.1](#t154) | Cumul | Traitement |
| [27.6.2](#t155) | Sejour | Traitement |
| [27.6.3](#t156) | Garantie | Traitement |
| [27.7.1](#t158) | Veuillez patienter... **[[ECRAN]](#ecran-t158)** | Traitement |
| [27.7.1.1](#t159) | Cumul | Traitement |
| [27.7.1.2](#t160) | Date de sejour | Traitement |
| [27.7.1.3](#t161) | Garantie | Traitement |
| [27.8](#t162) | Traitement n CGM nouveau **[[ECRAN]](#ecran-t162)** | Traitement |
| [27.8.1](#t163) | Veuillez patienter... **[[ECRAN]](#ecran-t163)** | Traitement |
| [27.8.1.1](#t164) | Cumul | Traitement |
| [27.8.1.2](#t165) | Date de sejour | Traitement |
| [27.8.1.3](#t166) | Garantie | Traitement |
| [27.9](#t167) | Veuillez patienter... **[[ECRAN]](#ecran-t167)** | Traitement |
| [27.11](#t169) | Deblocage cloture v1 | Traitement |
| [27.12](#t170) | Deblocage cloture v1 | Traitement |
| [27.13](#t171) | Existe ecritures | Traitement |
| [27.14](#t172) | Lecture histo | Traitement |
| [27.14.1](#t173) | Chrono LOG reprise | Traitement |
| [27.17](#t176) | Veuillez patienter SVP ... **[[ECRAN]](#ecran-t176)** | Traitement |
| [27.18](#t177) | Reprise virtuelles | Traitement |
| [27.5.51](#t180) | Veuillez patienter... **[[ECRAN]](#ecran-t180)** | Traitement |
| [27.5.52](#t183) | Veuillez patienter... **[[ECRAN]](#ecran-t183)** | Traitement |
| [27.5.48.1](#t193) | Veuillez patienter... **[[ECRAN]](#ecran-t193)** | Traitement |
| [27.5.53](#t196) | Veuillez patienter... **[[ECRAN]](#ecran-t196)** | Traitement |
| [27.5.53.1](#t197) | Veuillez patienter... **[[ECRAN]](#ecran-t197)** | Traitement |
| [27.5.54](#t198) | (sans nom) | Traitement |
| [27.5.55](#t202) | Veuillez patienter... **[[ECRAN]](#ecran-t202)** | Traitement |
| [27.5.55.2](#t204) | Suppression DGA | Traitement |

</details>

---

#### <a id="t2"></a>27.1 - Test si cloture en cours

**Role** : Verification : Test si cloture en cours.

---

#### <a id="t3"></a>27.1.1 - Blocage cloture v1

**Role** : Traitement : Blocage cloture v1.

---

#### <a id="t4"></a>27.1.2 - Blocage cloture v1

**Role** : Traitement : Blocage cloture v1.

---

#### <a id="t5"></a>27.2 - Test reseau

**Role** : Verification : Test reseau.
**Variables liees** : O (W0 reseau)

---

#### <a id="t12"></a>27.3.3.1 - Veuillez patienter... [[ECRAN]](#ecran-t12)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t12)

---

#### <a id="t15"></a>27.3.3.3.1 - Veuillez patienter... [[ECRAN]](#ecran-t15)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t15)

---

#### <a id="t16"></a>27.3.4 - supprime non pointes

**Role** : Traitement : supprime non pointes.

---

#### <a id="t17"></a>27.4 - Message Depots et garantie [[ECRAN]](#ecran-t17)

**Role** : Traitement : Message Depots et garantie.
**Ecran** : 477 x 63 DLU (MDI) | [Voir mockup](#ecran-t17)
**Variables liees** : E (P0 garantie), BI (W0.ListeNom_Prenom_Garantie)

---

#### <a id="t18"></a>27.5 - Traitement fichiers:code+fil [[ECRAN]](#ecran-t18)

**Role** : Traitement : Traitement fichiers:code+fil.
**Ecran** : 308 x 56 DLU (MDI) | [Voir mockup](#ecran-t18)

---

#### <a id="t19"></a>27.5.1 - Veuillez patienter... [[ECRAN]](#ecran-t19)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t19)

---

#### <a id="t21"></a>27.5.1.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t22"></a>27.5.2 - Veuillez patienter... [[ECRAN]](#ecran-t22)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t22)

---

#### <a id="t24"></a>27.5.2.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t25"></a>27.5.3 - Veuillez patienter... [[ECRAN]](#ecran-t25)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t25)

---

#### <a id="t27"></a>27.5.3.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t28"></a>27.5.4 - Veuillez patienter... [[ECRAN]](#ecran-t28)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t28)

---

#### <a id="t30"></a>27.5.4.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t31"></a>27.5.5 - Veuillez patienter... [[ECRAN]](#ecran-t31)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t31)

---

#### <a id="t33"></a>27.5.5.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t34"></a>27.5.6 - Veuillez patienter... [[ECRAN]](#ecran-t34)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t34)

---

#### <a id="t36"></a>27.5.6.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t37"></a>27.5.7 - Veuillez patienter... [[ECRAN]](#ecran-t37)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t37)

---

#### <a id="t39"></a>27.5.8 - Veuillez patienter... [[ECRAN]](#ecran-t39)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 57 DLU (MDI) | [Voir mockup](#ecran-t39)

---

#### <a id="t41"></a>27.5.8.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t42"></a>27.5.9 - Veuillez patienter... [[ECRAN]](#ecran-t42)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 57 DLU (MDI) | [Voir mockup](#ecran-t42)

---

#### <a id="t44"></a>27.5.9.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t45"></a>27.5.10 - Veuillez patienter... [[ECRAN]](#ecran-t45)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 57 DLU (MDI) | [Voir mockup](#ecran-t45)

---

#### <a id="t46"></a>27.5.11 - Veuillez patienter... [[ECRAN]](#ecran-t46)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 57 DLU (MDI) | [Voir mockup](#ecran-t46)

---

#### <a id="t47"></a>27.5.12 - Veuillez patienter... [[ECRAN]](#ecran-t47)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 57 DLU (MDI) | [Voir mockup](#ecran-t47)

---

#### <a id="t48"></a>27.5.13 - Veuillez patienter... [[ECRAN]](#ecran-t48)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t48)

---

#### <a id="t50"></a>27.5.13.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t51"></a>27.5.14 - Veuillez patienter... [[ECRAN]](#ecran-t51)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 57 DLU (MDI) | [Voir mockup](#ecran-t51)

---

#### <a id="t53"></a>27.5.14.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t54"></a>27.5.15 - Veuillez patienter... [[ECRAN]](#ecran-t54)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t54)

---

#### <a id="t55"></a>27.5.15.1 - Lecture CAM

**Role** : Traitement : Lecture CAM.

---

#### <a id="t57"></a>27.5.16 - Veuillez patienter... [[ECRAN]](#ecran-t57)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t57)

---

#### <a id="t59"></a>27.5.16.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t60"></a>27.5.17 - Veuillez patienter... [[ECRAN]](#ecran-t60)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 58 DLU (MDI) | [Voir mockup](#ecran-t60)

---

#### <a id="t61"></a>27.5.17.1 - Lecture CAM

**Role** : Traitement : Lecture CAM.

---

#### <a id="t63"></a>27.5.18 - Veuillez patienter... [[ECRAN]](#ecran-t63)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t63)

---

#### <a id="t65"></a>27.5.18.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t66"></a>27.5.19 - Veuillez patienter... [[ECRAN]](#ecran-t66)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t66)

---

#### <a id="t67"></a>27.5.19.1 - Lecture CAM

**Role** : Traitement : Lecture CAM.

---

#### <a id="t69"></a>27.5.20 - Veuillez patienter... [[ECRAN]](#ecran-t69)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t69)

---

#### <a id="t71"></a>27.5.20.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t72"></a>27.5.21 - Veuillez patienter... [[ECRAN]](#ecran-t72)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t72)

---

#### <a id="t74"></a>27.5.21.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t75"></a>27.5.22 - Veuillez patienter... [[ECRAN]](#ecran-t75)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t75)

---

#### <a id="t76"></a>27.5.22.1 - Lecture

**Role** : Traitement : Lecture.

---

#### <a id="t78"></a>27.5.23 - Veuillez patienter... [[ECRAN]](#ecran-t78)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t78)

---

#### <a id="t79"></a>27.5.23.1 - Lecture

**Role** : Traitement : Lecture.

---

#### <a id="t81"></a>27.5.24 - Veuillez patienter... [[ECRAN]](#ecran-t81)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t81)

---

#### <a id="t82"></a>27.5.25 - Veuillez patienter... [[ECRAN]](#ecran-t82)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t82)

---

#### <a id="t83"></a>27.5.25.1 - Lecture CAM

**Role** : Traitement : Lecture CAM.

---

#### <a id="t85"></a>27.5.26 - Veuillez patienter... [[ECRAN]](#ecran-t85)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t85)

---

#### <a id="t86"></a>27.5.26.1 - Lecture CAM

**Role** : Traitement : Lecture CAM.

---

#### <a id="t88"></a>27.5.27 - Veuillez patienter... [[ECRAN]](#ecran-t88)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t88)

---

#### <a id="t89"></a>27.5.27.1 - Lecture CAM

**Role** : Traitement : Lecture CAM.

---

#### <a id="t91"></a>27.5.28 - Veuillez patienter... [[ECRAN]](#ecran-t91)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t91)

---

#### <a id="t93"></a>27.5.28.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t94"></a>27.5.29 - Veuillez patienter... [[ECRAN]](#ecran-t94)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t94)

---

#### <a id="t96"></a>27.5.29.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t97"></a>27.5.30 - Veuillez patienter... [[ECRAN]](#ecran-t97)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 57 DLU (MDI) | [Voir mockup](#ecran-t97)

---

#### <a id="t98"></a>27.5.30.1 - Message

**Role** : Traitement : Message.

---

#### <a id="t100"></a>27.5.31 - Veuillez patienter... [[ECRAN]](#ecran-t100)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t100)

---

#### <a id="t102"></a>27.5.31.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t103"></a>27.5.32 - Veuillez patienter... [[ECRAN]](#ecran-t103)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t103)

---

#### <a id="t105"></a>27.5.32.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t106"></a>27.5.33 - Veuillez patienter... [[ECRAN]](#ecran-t106)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t106)

---

#### <a id="t107"></a>27.5.34 - Veuillez patienter... [[ECRAN]](#ecran-t107)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t107)

---

#### <a id="t108"></a>27.5.35 - Veuillez patienter... [[ECRAN]](#ecran-t108)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t108)

---

#### <a id="t110"></a>27.5.35.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t111"></a>27.5.36 - Veuillez patienter... [[ECRAN]](#ecran-t111)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t111)

---

#### <a id="t113"></a>27.5.36.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t114"></a>27.5.36.3 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t115"></a>27.5.37 - Veuillez patienter... [[ECRAN]](#ecran-t115)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t115)

---

#### <a id="t117"></a>27.5.37.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t118"></a>27.5.38 - Veuillez patienter... [[ECRAN]](#ecran-t118)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t118)

---

#### <a id="t120"></a>27.5.38.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t121"></a>27.5.39 - Veuillez patienter... [[ECRAN]](#ecran-t121)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t121)

---

#### <a id="t123"></a>27.5.39.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t124"></a>27.5.40 - Veuillez patienter... [[ECRAN]](#ecran-t124)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t124)

---

#### <a id="t126"></a>27.5.40.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t127"></a>27.5.41 - Veuillez patienter... [[ECRAN]](#ecran-t127)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t127)

---

#### <a id="t129"></a>27.5.41.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t130"></a>27.5.42 - Veuillez patienter... [[ECRAN]](#ecran-t130)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t130)

---

#### <a id="t132"></a>27.5.42.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t133"></a>27.5.43 - Veuillez patienter... [[ECRAN]](#ecran-t133)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t133)

---

#### <a id="t135"></a>27.5.43.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t136"></a>27.5.44 - Veuillez patienter... [[ECRAN]](#ecran-t136)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t136)

---

#### <a id="t138"></a>27.5.44.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t139"></a>27.5.45 - Veuillez patienter... [[ECRAN]](#ecran-t139)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t139)

---

#### <a id="t141"></a>27.5.45.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t142"></a>27.5.46 - Veuillez patienter... [[ECRAN]](#ecran-t142)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t142)

---

#### <a id="t144"></a>27.5.46.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t145"></a>27.5.47 - Veuillez patienter... [[ECRAN]](#ecran-t145)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t145)

---

#### <a id="t147"></a>27.5.47.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t148"></a>27.5.48 - Veuillez patienter... [[ECRAN]](#ecran-t148)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t148)

---

#### <a id="t149"></a>27.5.49 - Veuillez patienter... [[ECRAN]](#ecran-t149)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t149)

---

#### <a id="t150"></a>27.5.50 - Veuillez patienter... [[ECRAN]](#ecran-t150)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t150)

---

#### <a id="t153"></a>27.6 - Veuillez patienter... [[ECRAN]](#ecran-t153)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t153)

---

#### <a id="t154"></a>27.6.1 - Cumul

**Role** : Traitement : Cumul.

---

#### <a id="t155"></a>27.6.2 - Sejour

**Role** : Traitement : Sejour.

---

#### <a id="t156"></a>27.6.3 - Garantie

**Role** : Traitement : Garantie.
**Variables liees** : E (P0 garantie), BI (W0.ListeNom_Prenom_Garantie)

---

#### <a id="t158"></a>27.7.1 - Veuillez patienter... [[ECRAN]](#ecran-t158)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t158)

---

#### <a id="t159"></a>27.7.1.1 - Cumul

**Role** : Traitement : Cumul.

---

#### <a id="t160"></a>27.7.1.2 - Date de sejour

**Role** : Traitement : Date de sejour.
**Variables liees** : G (P0 date limite solde), S (W0 date operation)

---

#### <a id="t161"></a>27.7.1.3 - Garantie

**Role** : Traitement : Garantie.
**Variables liees** : E (P0 garantie), BI (W0.ListeNom_Prenom_Garantie)

---

#### <a id="t162"></a>27.8 - Traitement n CGM nouveau [[ECRAN]](#ecran-t162)

**Role** : Creation d'enregistrement : Traitement n CGM nouveau.
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t162)

---

#### <a id="t163"></a>27.8.1 - Veuillez patienter... [[ECRAN]](#ecran-t163)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t163)

---

#### <a id="t164"></a>27.8.1.1 - Cumul

**Role** : Traitement : Cumul.

---

#### <a id="t165"></a>27.8.1.2 - Date de sejour

**Role** : Traitement : Date de sejour.
**Variables liees** : G (P0 date limite solde), S (W0 date operation)

---

#### <a id="t166"></a>27.8.1.3 - Garantie

**Role** : Traitement : Garantie.
**Variables liees** : E (P0 garantie), BI (W0.ListeNom_Prenom_Garantie)

---

#### <a id="t167"></a>27.9 - Veuillez patienter... [[ECRAN]](#ecran-t167)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t167)

---

#### <a id="t169"></a>27.11 - Deblocage cloture v1

**Role** : Traitement : Deblocage cloture v1.

---

#### <a id="t170"></a>27.12 - Deblocage cloture v1

**Role** : Traitement : Deblocage cloture v1.

---

#### <a id="t171"></a>27.13 - Existe ecritures

**Role** : Traitement : Existe ecritures.
**Variables liees** : Y (W0 Existe ecriture), BF (W0 code LOG existe)

---

#### <a id="t172"></a>27.14 - Lecture histo

**Role** : Traitement : Lecture histo.
**Variables liees** : L (P0.Chrono histo sans interface), BE (W0 chrono histo)

---

#### <a id="t173"></a>27.14.1 - Chrono LOG reprise

**Role** : Traitement : Chrono LOG reprise.
**Variables liees** : J (P0 Reprise Auto), L (P0.Chrono histo sans interface), BA (W0 reprise), BB (W0 chrono reprise), BE (W0 chrono histo)

---

#### <a id="t176"></a>27.17 - Veuillez patienter SVP ... [[ECRAN]](#ecran-t176)

**Role** : Traitement : Veuillez patienter SVP ....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t176)

---

#### <a id="t177"></a>27.18 - Reprise virtuelles

**Role** : Traitement : Reprise virtuelles.
**Variables liees** : J (P0 Reprise Auto), BA (W0 reprise), BB (W0 chrono reprise), BH (W0 reprise confirmee)

---

#### <a id="t180"></a>27.5.51 - Veuillez patienter... [[ECRAN]](#ecran-t180)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t180)

---

#### <a id="t183"></a>27.5.52 - Veuillez patienter... [[ECRAN]](#ecran-t183)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t183)

---

#### <a id="t193"></a>27.5.48.1 - Veuillez patienter... [[ECRAN]](#ecran-t193)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 57 DLU (MDI) | [Voir mockup](#ecran-t193)

---

#### <a id="t196"></a>27.5.53 - Veuillez patienter... [[ECRAN]](#ecran-t196)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t196)

---

#### <a id="t197"></a>27.5.53.1 - Veuillez patienter... [[ECRAN]](#ecran-t197)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 57 DLU (MDI) | [Voir mockup](#ecran-t197)

---

#### <a id="t198"></a>27.5.54 - (sans nom)

**Role** : Traitement interne.

---

#### <a id="t202"></a>27.5.55 - Veuillez patienter... [[ECRAN]](#ecran-t202)

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t202)

---

#### <a id="t204"></a>27.5.55.2 - Suppression DGA

**Role** : Traitement : Suppression DGA.


### 3.2 Consultation (3 taches)

Ecrans de recherche et consultation.

---

#### <a id="t6"></a>27.3 - Selection GM [[ECRAN]](#ecran-t6)

**Role** : Selection par l'operateur : Selection GM.
**Ecran** : 1035 x 272 DLU (MDI) | [Voir mockup](#ecran-t6)

---

#### <a id="t8"></a>27.3.2 - Affichage filiations [[ECRAN]](#ecran-t8)

**Role** : Reinitialisation : Affichage filiations.
**Ecran** : 1035 x 272 DLU (MDI) | [Voir mockup](#ecran-t8)

---

#### <a id="t168"></a>27.10 - Reaffichage infos reseau

**Role** : Reinitialisation : Reaffichage infos reseau.
**Variables liees** : O (W0 reseau)


### 3.3 Creation (44 taches)

Insertion de nouveaux enregistrements en base.

---

#### <a id="t7"></a>27.3.1 - Creation histo

**Role** : Creation d'enregistrement : Creation histo.
**Variables liees** : L (P0.Chrono histo sans interface), BE (W0 chrono histo)

---

#### <a id="t20"></a>27.5.1.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t23"></a>27.5.2.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t26"></a>27.5.3.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t29"></a>27.5.4.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t32"></a>27.5.5.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t35"></a>27.5.6.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t40"></a>27.5.8.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t43"></a>27.5.9.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t49"></a>27.5.13.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t52"></a>27.5.14.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t56"></a>27.5.15.2 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t58"></a>27.5.16.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t62"></a>27.5.17.2 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t64"></a>27.5.18.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t68"></a>27.5.19.2 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t70"></a>27.5.20.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t73"></a>27.5.21.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t77"></a>27.5.22.2 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t80"></a>27.5.23.2 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t84"></a>27.5.25.2 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t87"></a>27.5.26.2 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t90"></a>27.5.27.2 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t92"></a>27.5.28.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t95"></a>27.5.29.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t99"></a>27.5.30.2 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t101"></a>27.5.31.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t104"></a>27.5.32.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t109"></a>27.5.35.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t112"></a>27.5.36.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t116"></a>27.5.37.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t119"></a>27.5.38.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t122"></a>27.5.39.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t125"></a>27.5.40.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t128"></a>27.5.41.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t131"></a>27.5.42.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t134"></a>27.5.43.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t137"></a>27.5.44.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t140"></a>27.5.45.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t143"></a>27.5.46.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t146"></a>27.5.47.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t174"></a>27.15 - creation histo v1

**Role** : Creation d'enregistrement : creation histo v1.
**Variables liees** : L (P0.Chrono histo sans interface), BE (W0 chrono histo)

---

#### <a id="t175"></a>27.16 - creation histo v1

**Role** : Creation d'enregistrement : creation histo v1.
**Variables liees** : L (P0.Chrono histo sans interface), BE (W0 chrono histo)

---

#### <a id="t203"></a>27.5.55.1 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.


### 3.4 Calcul (5 taches)

Calculs metier : montants, stocks, compteurs.

---

#### <a id="t9"></a>27.3.2.1 - compteur

**Role** : Calcul : compteur.
**Variables liees** : Q (W0 n° compteur)

---

#### <a id="t11"></a>27.3.3 - Nouveaux comptes

**Role** : Creation d'enregistrement : Nouveaux comptes.

---

#### <a id="t13"></a>27.3.3.2 - UN compte

**Role** : Traitement : UN compte.
**Variables liees** : Q (W0 n° compteur), V (W0 qualite compte), X (W0 separation n compte unique)

---

#### <a id="t14"></a>27.3.3.3 - N comptes

**Role** : Traitement : N comptes.

---

#### <a id="t157"></a>27.7 - nouveau compte [[ECRAN]](#ecran-t157)

**Role** : Creation d'enregistrement : nouveau compte.
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t157)
**Variables liees** : Q (W0 n° compteur), V (W0 qualite compte), X (W0 separation n compte unique)


### 3.5 Validation (1 tache)

Controles de coherence : 1 tache verifie les donnees et conditions.

---

#### <a id="t10"></a>27.3.2.2 - Validation [[ECRAN]](#ecran-t10)

**Role** : Verification : Validation.
**Ecran** : 144 x 8 DLU (MDI) | [Voir mockup](#ecran-t10)
**Variables liees** : P (W0 validation)


## 5. REGLES METIER

3 regles identifiees:

### Autres (3 regles)

#### <a id="rm-RM-001"></a>[RM-001] Si [AJ] alors IF ([AH] sinon 'RETRY','DONE'),'PASSED')

| Element | Detail |
|---------|--------|
| **Condition** | `[AJ]` |
| **Si vrai** | IF ([AH] |
| **Si faux** | 'RETRY','DONE'),'PASSED') |
| **Expression source** | Expression 71 : `IF ([AJ],IF ([AH],'RETRY','DONE'),'PASSED')` |
| **Exemple** | Si [AJ] â†’ IF ([AH]. Sinon â†’ 'RETRY','DONE'),'PASSED') |

#### <a id="rm-RM-002"></a>[RM-002] Condition toujours vraie (flag actif)

| Element | Detail |
|---------|--------|
| **Condition** | `[AH]` |
| **Si vrai** | ExpCalc('29'EXP) |
| **Si faux** | 'TRUE'LOG) |
| **Expression source** | Expression 76 : `IF ([AH],ExpCalc('29'EXP),'TRUE'LOG)` |
| **Exemple** | Si [AH] â†’ ExpCalc('29'EXP). Sinon â†’ 'TRUE'LOG) |

#### <a id="rm-RM-003"></a>[RM-003] Si [AE] alors 'NNN' sinon 'ONE')

| Element | Detail |
|---------|--------|
| **Condition** | `[AE]` |
| **Si vrai** | 'NNN' |
| **Si faux** | 'ONE') |
| **Expression source** | Expression 78 : `IF ([AE],'NNN','ONE')` |
| **Exemple** | Si [AE] â†’ 'NNN'. Sinon â†’ 'ONE') |

## 6. CONTEXTE

- **Appele par**: [Menu changement compte (IDE 37)](ADH-IDE-37.md)
- **Appelle**: 11 programmes | **Tables**: 60 (W:57 R:20 L:5) | **Taches**: 183 | **Expressions**: 84

<!-- TAB:Ecrans -->

## 8. ECRANS

### 8.1 Forms visibles (10 / 183)

| # | Position | Tache | Nom | Type | Largeur | Hauteur | Bloc |
|---|----------|-------|-----|------|---------|---------|------|
| 1 | 27 | 27 | Veuillez patienter... | MDI | 422 | 56 | Traitement |
| 2 | 27.3.2 | 27.3.2 | Affichage filiations | MDI | 1035 | 272 | Consultation |
| 3 | 27.3.3.1 | 27.3.3.1 | Veuillez patienter... | MDI | 422 | 57 | Traitement |
| 4 | 27.3.3.3.1 | 27.3.3.3.1 | Veuillez patienter... | MDI | 422 | 57 | Traitement |
| 5 | 27.5.8 | 27.5.7 | Veuillez patienter... | MDI | 424 | 56 | Traitement |
| 6 | 27.5.53 | 27.5.49 | Veuillez patienter... | MDI | 422 | 57 | Traitement |
| 7 | 27.6 | 27.6 | Veuillez patienter... | MDI | 422 | 56 | Traitement |
| 8 | 27.7.1 | 27.7.1 | Veuillez patienter... | MDI | 424 | 56 | Traitement |
| 9 | 27.8.1 | 27.8.1 | Veuillez patienter... | MDI | 424 | 56 | Traitement |
| 10 | 27.17 | 27.17 | Veuillez patienter SVP ... | MDI | 422 | 56 | Traitement |

### 8.2 Mockups Ecrans

---

#### <a id="ecran-t1"></a>27 - Veuillez patienter...
**Tache** : [27](#t1) | **Type** : MDI | **Dimensions** : 422 x 56 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter...

<!-- FORM-DATA:
{
    "width":  422,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  0,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  120,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  221,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "7",
                         "text":  "Traitement en cours...",
                         "parent":  null
                     },
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  29,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  27,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  72,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  280,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Separation de comptes",
                         "parent":  null
                     },
                     {
                         "x":  4,
                         "type":  "image",
                         "var":  "",
                         "y":  2,
                         "w":  72,
                         "fmt":  "",
                         "name":  "",
                         "h":  25,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "27",
    "height":  56
}
-->

---

#### <a id="ecran-t8"></a>27.3.2 - Affichage filiations
**Tache** : [27.3.2](#t8) | **Type** : MDI | **Dimensions** : 1035 x 272 DLU
**Bloc** : Consultation | **Titre IDE** : Affichage filiations

<!-- FORM-DATA:
{
    "width":  1035,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  1,
                         "w":  962,
                         "fmt":  "",
                         "name":  "",
                         "h":  19,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  31,
                         "type":  "label",
                         "var":  "",
                         "y":  27,
                         "w":  973,
                         "fmt":  "",
                         "name":  "",
                         "h":  22,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  386,
                         "type":  "label",
                         "var":  "",
                         "y":  34,
                         "w":  117,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "152",
                         "text":  "Compte N°",
                         "parent":  null
                     },
                     {
                         "x":  31,
                         "type":  "label",
                         "var":  "",
                         "y":  49,
                         "w":  973,
                         "fmt":  "",
                         "name":  "",
                         "h":  190,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  38,
                         "type":  "label",
                         "var":  "",
                         "y":  225,
                         "w":  185,
                         "fmt":  "",
                         "name":  "",
                         "h":  10,
                         "color":  "",
                         "text":  "Nombre selectionnes",
                         "parent":  8
                     },
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  247,
                         "w":  1033,
                         "fmt":  "",
                         "name":  "",
                         "h":  24,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  59,
                         "type":  "table",
                         "var":  "",
                         "name":  "",
                         "titleH":  12,
                         "color":  "6",
                         "w":  925,
                         "y":  56,
                         "fmt":  "",
                         "parent":  null,
                         "text":  "",
                         "rowH":  20,
                         "h":  164,
                         "cols":  [
                                      {
                                          "title":  "",
                                          "layer":  1,
                                          "w":  866
                                      },
                                      {
                                          "title":  "",
                                          "layer":  2,
                                          "w":  51
                                      }
                                  ],
                         "rows":  2
                     },
                     {
                         "x":  233,
                         "type":  "edit",
                         "var":  "",
                         "y":  225,
                         "w":  37,
                         "fmt":  "",
                         "name":  "",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  8
                     },
                     {
                         "x":  939,
                         "type":  "checkbox",
                         "var":  "",
                         "y":  61,
                         "w":  24,
                         "fmt":  "",
                         "name":  "SELECTION",
                         "h":  12,
                         "color":  "6",
                         "text":  "Check",
                         "parent":  12
                     },
                     {
                         "x":  110,
                         "type":  "edit",
                         "var":  "",
                         "y":  59,
                         "w":  42,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  671,
                         "type":  "edit",
                         "var":  "",
                         "y":  59,
                         "w":  120,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  802,
                         "type":  "edit",
                         "var":  "",
                         "y":  59,
                         "w":  19,
                         "fmt":  "1",
                         "name":  "",
                         "h":  8,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  868,
                         "type":  "edit",
                         "var":  "",
                         "y":  59,
                         "w":  42,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  346,
                         "type":  "edit",
                         "var":  "",
                         "y":  67,
                         "w":  120,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  502,
                         "type":  "edit",
                         "var":  "",
                         "y":  67,
                         "w":  120,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  19,
                         "type":  "edit",
                         "var":  "",
                         "y":  7,
                         "w":  267,
                         "fmt":  "20",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  754,
                         "type":  "edit",
                         "var":  "",
                         "y":  7,
                         "w":  203,
                         "fmt":  "WWW DD MMM YYYYT",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  925,
                         "type":  "image",
                         "var":  "",
                         "y":  28,
                         "w":  73,
                         "fmt":  "",
                         "name":  "",
                         "h":  20,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  525,
                         "type":  "edit",
                         "var":  "",
                         "y":  34,
                         "w":  123,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "152",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  68,
                         "type":  "edit",
                         "var":  "",
                         "y":  59,
                         "w":  37,
                         "fmt":  "30",
                         "name":  "",
                         "h":  15,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  167,
                         "type":  "edit",
                         "var":  "",
                         "y":  59,
                         "w":  277,
                         "fmt":  "24",
                         "name":  "",
                         "h":  8,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  463,
                         "type":  "edit",
                         "var":  "",
                         "y":  59,
                         "w":  30,
                         "fmt":  "3",
                         "name":  "",
                         "h":  8,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  505,
                         "type":  "edit",
                         "var":  "",
                         "y":  59,
                         "w":  53,
                         "fmt":  "4",
                         "name":  "",
                         "h":  8,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  832,
                         "type":  "edit",
                         "var":  "",
                         "y":  59,
                         "w":  19,
                         "fmt":  "1",
                         "name":  "",
                         "h":  8,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  167,
                         "type":  "edit",
                         "var":  "",
                         "y":  67,
                         "w":  109,
                         "fmt":  "9",
                         "name":  "",
                         "h":  8,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  475,
                         "type":  "edit",
                         "var":  "",
                         "y":  67,
                         "w":  30,
                         "fmt":  "2",
                         "name":  "",
                         "h":  8,
                         "color":  "6",
                         "text":  "",
                         "parent":  12
                     },
                     {
                         "x":  6,
                         "type":  "button",
                         "var":  "",
                         "y":  251,
                         "w":  144,
                         "fmt":  "\u0026Quitter",
                         "name":  "",
                         "h":  18,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  853,
                         "type":  "button",
                         "var":  "",
                         "y":  251,
                         "w":  168,
                         "fmt":  "Printer",
                         "name":  "",
                         "h":  18,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "27.3.2",
    "height":  272
}
-->

<details>
<summary><strong>Champs : 18 champs</strong></summary>

| Pos (x,y) | Nom | Variable | Type |
|-----------|-----|----------|------|
| 233,225 | (sans nom) | - | edit |
| 939,61 | SELECTION | - | checkbox |
| 110,59 | (sans nom) | - | edit |
| 671,59 | (sans nom) | - | edit |
| 802,59 | 1 | - | edit |
| 868,59 | (sans nom) | - | edit |
| 346,67 | (sans nom) | - | edit |
| 502,67 | (sans nom) | - | edit |
| 19,7 | 20 | - | edit |
| 754,7 | WWW DD MMM YYYYT | - | edit |
| 525,34 | (sans nom) | - | edit |
| 68,59 | 30 | - | edit |
| 167,59 | 24 | - | edit |
| 463,59 | 3 | - | edit |
| 505,59 | 4 | - | edit |
| 832,59 | 1 | - | edit |
| 167,67 | 9 | - | edit |
| 475,67 | 2 | - | edit |

</details>

<details>
<summary><strong>Boutons : 2 boutons</strong></summary>

| Bouton | Pos (x,y) | Action |
|--------|-----------|--------|
| Quitter | 6,251 | Quitte le programme |
| Printer | 853,251 | Appel [Print Separation ou fusion (IDE 36)](ADH-IDE-36.md) |

</details>

---

#### <a id="ecran-t12"></a>27.3.3.1 - Veuillez patienter...
**Tache** : [27.3.3.1](#t12) | **Type** : MDI | **Dimensions** : 422 x 57 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter...

<!-- FORM-DATA:
{
    "width":  422,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  0,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  120,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  221,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "7",
                         "text":  "Traitement en cours...",
                         "parent":  null
                     },
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  29,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  27,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  49,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  325,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Attribution N° de compte",
                         "parent":  null
                     },
                     {
                         "x":  4,
                         "type":  "image",
                         "var":  "",
                         "y":  2,
                         "w":  72,
                         "fmt":  "",
                         "name":  "",
                         "h":  25,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "27.3.3.1",
    "height":  57
}
-->

---

#### <a id="ecran-t15"></a>27.3.3.3.1 - Veuillez patienter...
**Tache** : [27.3.3.3.1](#t15) | **Type** : MDI | **Dimensions** : 422 x 57 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter...

<!-- FORM-DATA:
{
    "width":  422,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  0,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  120,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  221,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "7",
                         "text":  "Traitement en cours...",
                         "parent":  null
                     },
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  29,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  27,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  49,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  325,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Attribution N° de compte",
                         "parent":  null
                     },
                     {
                         "x":  4,
                         "type":  "image",
                         "var":  "",
                         "y":  2,
                         "w":  72,
                         "fmt":  "",
                         "name":  "",
                         "h":  25,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "27.3.3.3.1",
    "height":  57
}
-->

---

#### <a id="ecran-t37"></a>27.5.8 - Veuillez patienter...
**Tache** : [27.5.7](#t37) | **Type** : MDI | **Dimensions** : 424 x 56 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter...

<!-- FORM-DATA:
{
    "width":  424,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  0,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  120,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  221,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "7",
                         "text":  "Traitement en cours...",
                         "parent":  null
                     },
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  29,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  27,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  62,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  298,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Enregistrement de la separation",
                         "parent":  null
                     },
                     {
                         "x":  4,
                         "type":  "image",
                         "var":  "",
                         "y":  2,
                         "w":  72,
                         "fmt":  "",
                         "name":  "",
                         "h":  25,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "27.5.8",
    "height":  56
}
-->

---

#### <a id="ecran-t149"></a>27.5.53 - Veuillez patienter...
**Tache** : [27.5.49](#t149) | **Type** : MDI | **Dimensions** : 422 x 57 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter...

<!-- FORM-DATA:
{
    "width":  422,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  0,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  120,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  221,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "7",
                         "text":  "Traitement en cours...",
                         "parent":  null
                     },
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  29,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  27,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  49,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  325,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Attribution N° de compte",
                         "parent":  null
                     },
                     {
                         "x":  4,
                         "type":  "image",
                         "var":  "",
                         "y":  2,
                         "w":  72,
                         "fmt":  "",
                         "name":  "",
                         "h":  25,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "27.5.53",
    "height":  57
}
-->

---

#### <a id="ecran-t153"></a>27.6 - Veuillez patienter...
**Tache** : [27.6](#t153) | **Type** : MDI | **Dimensions** : 422 x 56 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter...

<!-- FORM-DATA:
{
    "width":  422,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  0,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  120,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  221,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "7",
                         "text":  "Traitement en cours...",
                         "parent":  null
                     },
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  29,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  27,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  72,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  280,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Calcul du solde",
                         "parent":  null
                     },
                     {
                         "x":  4,
                         "type":  "image",
                         "var":  "",
                         "y":  2,
                         "w":  72,
                         "fmt":  "",
                         "name":  "",
                         "h":  25,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "27.6",
    "height":  56
}
-->

---

#### <a id="ecran-t158"></a>27.7.1 - Veuillez patienter...
**Tache** : [27.7.1](#t158) | **Type** : MDI | **Dimensions** : 424 x 56 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter...

<!-- FORM-DATA:
{
    "width":  424,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  0,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  120,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  221,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "7",
                         "text":  "Traitement en cours...",
                         "parent":  null
                     },
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  29,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  27,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  72,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  280,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Calcul du solde",
                         "parent":  null
                     },
                     {
                         "x":  4,
                         "type":  "image",
                         "var":  "",
                         "y":  2,
                         "w":  72,
                         "fmt":  "",
                         "name":  "",
                         "h":  25,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "27.7.1",
    "height":  56
}
-->

---

#### <a id="ecran-t163"></a>27.8.1 - Veuillez patienter...
**Tache** : [27.8.1](#t163) | **Type** : MDI | **Dimensions** : 424 x 56 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter...

<!-- FORM-DATA:
{
    "width":  424,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  0,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  120,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  221,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "7",
                         "text":  "Traitement en cours...",
                         "parent":  null
                     },
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  29,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  27,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  72,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  280,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Calcul du solde",
                         "parent":  null
                     },
                     {
                         "x":  4,
                         "type":  "image",
                         "var":  "",
                         "y":  2,
                         "w":  72,
                         "fmt":  "",
                         "name":  "",
                         "h":  25,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "27.8.1",
    "height":  56
}
-->

---

#### <a id="ecran-t176"></a>27.17 - Veuillez patienter SVP ...
**Tache** : [27.17](#t176) | **Type** : MDI | **Dimensions** : 422 x 56 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter SVP ...

<!-- FORM-DATA:
{
    "width":  422,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  0,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  120,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  221,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "7",
                         "text":  "Traitement en cours ...",
                         "parent":  null
                     },
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  29,
                         "w":  423,
                         "fmt":  "",
                         "name":  "",
                         "h":  27,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  55,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  315,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Reprise eclatement de comptes",
                         "parent":  null
                     },
                     {
                         "x":  4,
                         "type":  "image",
                         "var":  "",
                         "y":  2,
                         "w":  72,
                         "fmt":  "",
                         "name":  "",
                         "h":  25,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "27.17",
    "height":  56
}
-->

## 9. NAVIGATION

### 9.1 Enchainement des ecrans

```mermaid
flowchart TD
    START([Entree])
    style START fill:#3fb950
    VF1[27 Veuillez patienter...]
    style VF1 fill:#58a6ff
    VF8[27.3.2 Affichage filiations]
    style VF8 fill:#58a6ff
    VF12[27.3.3.1 Veuillez patienter...]
    style VF12 fill:#58a6ff
    VF15[27.3.3.3.1 Veuillez patienter...]
    style VF15 fill:#58a6ff
    VF37[27.5.7 Veuillez patienter...]
    style VF37 fill:#58a6ff
    VF149[27.5.49 Veuillez patiente...]
    style VF149 fill:#58a6ff
    VF153[27.6 Veuillez patiente...]
    style VF153 fill:#58a6ff
    VF158[27.7.1 Veuillez patiente...]
    style VF158 fill:#58a6ff
    VF163[27.8.1 Veuillez patiente...]
    style VF163 fill:#58a6ff
    VF176[27.17 Veuillez patiente...]
    style VF176 fill:#58a6ff
    EXT35[IDE 35 Write histo_Fus...]
    style EXT35 fill:#3fb950
    EXT30[IDE 30 Read histo Fus_...]
    style EXT30 fill:#3fb950
    EXT31[IDE 31 Write histo_Fus...]
    style EXT31 fill:#3fb950
    EXT29[IDE 29 Write histo Fus...]
    style EXT29 fill:#3fb950
    EXT34[IDE 34 Read histo_Fus_...]
    style EXT34 fill:#3fb950
    EXT36[IDE 36 Print Separatio...]
    style EXT36 fill:#3fb950
    EXT43[IDE 43 Recuperation du...]
    style EXT43 fill:#3fb950
    EXT179[IDE 179 Get Printer]
    style EXT179 fill:#3fb950
    EXT180[IDE 180 Printer choice]
    style EXT180 fill:#3fb950
    EXT181[IDE 181 Set Listing Nu...]
    style EXT181 fill:#3fb950
    EXT182[IDE 182 Raz Current Pr...]
    style EXT182 fill:#3fb950
    FIN([Sortie])
    style FIN fill:#f85149
    START --> VF1
    VF1 -->|Historique/consultation| EXT35
    VF1 -->|Historique/consultation| EXT30
    VF1 -->|Historique/consultation| EXT31
    VF1 -->|Historique/consultation| EXT29
    VF1 -->|Historique/consultation| EXT34
    VF1 -->|Impression ticket/document| EXT36
    VF1 -->|Recuperation donnees| EXT43
    VF1 -->|Impression ticket/document| EXT179
    EXT182 --> FIN
```

**Detail par enchainement :**

| Depuis | Action | Vers | Retour |
|--------|--------|------|--------|
| Veuillez patienter... | Historique/consultation | [Write histo_Fus_Sep_Log (IDE 35)](ADH-IDE-35.md) | Retour ecran |
| Veuillez patienter... | Historique/consultation | [Read histo Fus_Sep_Det (IDE 30)](ADH-IDE-30.md) | Retour ecran |
| Veuillez patienter... | Historique/consultation | [Write histo_Fus_Sep_Det (IDE 31)](ADH-IDE-31.md) | Retour ecran |
| Veuillez patienter... | Historique/consultation | [Write histo Fus_Sep (IDE 29)](ADH-IDE-29.md) | Retour ecran |
| Veuillez patienter... | Historique/consultation | [Read histo_Fus_Sep_Log (IDE 34)](ADH-IDE-34.md) | Retour ecran |
| Veuillez patienter... | Impression ticket/document | [Print Separation ou fusion (IDE 36)](ADH-IDE-36.md) | Retour ecran |
| Veuillez patienter... | Recuperation donnees | [Recuperation du titre (IDE 43)](ADH-IDE-43.md) | Retour ecran |
| Veuillez patienter... | Impression ticket/document | [Get Printer (IDE 179)](ADH-IDE-179.md) | Retour ecran |
| Veuillez patienter... | Impression ticket/document | [Printer choice (IDE 180)](ADH-IDE-180.md) | Retour ecran |
| Veuillez patienter... | Configuration impression | [Set Listing Number (IDE 181)](ADH-IDE-181.md) | Retour ecran |
| Veuillez patienter... | Impression ticket/document | [Raz Current Printer (IDE 182)](ADH-IDE-182.md) | Retour ecran |

### 9.3 Structure hierarchique (183 taches)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|
| **27.1** | [**Veuillez patienter...** (27)](#t1) [mockup](#ecran-t1) | MDI | 422x56 | Traitement |
| 27.1.1 | [Test si cloture en cours (27.1)](#t2) | MDI | - | |
| 27.1.2 | [Blocage cloture v1 (27.1.1)](#t3) | MDI | - | |
| 27.1.3 | [Blocage cloture v1 (27.1.2)](#t4) | MDI | - | |
| 27.1.4 | [Test reseau (27.2)](#t5) | MDI | - | |
| 27.1.5 | [Veuillez patienter... (27.3.3.1)](#t12) [mockup](#ecran-t12) | MDI | 422x57 | |
| 27.1.6 | [Veuillez patienter... (27.3.3.3.1)](#t15) [mockup](#ecran-t15) | MDI | 422x57 | |
| 27.1.7 | [supprime non pointes (27.3.4)](#t16) | MDI | - | |
| 27.1.8 | [Message Depots et garantie (27.4)](#t17) [mockup](#ecran-t17) | MDI | 477x63 | |
| 27.1.9 | [Traitement fichiers:code+fil (27.5)](#t18) [mockup](#ecran-t18) | MDI | 308x56 | |
| 27.1.10 | [Veuillez patienter... (27.5.1)](#t19) [mockup](#ecran-t19) | MDI | 424x56 | |
| 27.1.11 | [Suppression DGA (27.5.1.2)](#t21) | MDI | - | |
| 27.1.12 | [Veuillez patienter... (27.5.2)](#t22) [mockup](#ecran-t22) | MDI | 422x57 | |
| 27.1.13 | [Suppression DGA (27.5.2.2)](#t24) | MDI | - | |
| 27.1.14 | [Veuillez patienter... (27.5.3)](#t25) [mockup](#ecran-t25) | MDI | 422x57 | |
| 27.1.15 | [Suppression DGA (27.5.3.2)](#t27) | MDI | - | |
| 27.1.16 | [Veuillez patienter... (27.5.4)](#t28) [mockup](#ecran-t28) | MDI | 422x57 | |
| 27.1.17 | [Suppression DGA (27.5.4.2)](#t30) | MDI | - | |
| 27.1.18 | [Veuillez patienter... (27.5.5)](#t31) [mockup](#ecran-t31) | MDI | 422x57 | |
| 27.1.19 | [Suppression DGA (27.5.5.2)](#t33) | MDI | - | |
| 27.1.20 | [Veuillez patienter... (27.5.6)](#t34) [mockup](#ecran-t34) | MDI | 422x57 | |
| 27.1.21 | [Suppression DGA (27.5.6.2)](#t36) | MDI | - | |
| 27.1.22 | [Veuillez patienter... (27.5.7)](#t37) [mockup](#ecran-t37) | MDI | 424x56 | |
| 27.1.23 | [Veuillez patienter... (27.5.8)](#t39) [mockup](#ecran-t39) | MDI | 424x57 | |
| 27.1.24 | [Suppression DGA (27.5.8.2)](#t41) | MDI | - | |
| 27.1.25 | [Veuillez patienter... (27.5.9)](#t42) [mockup](#ecran-t42) | MDI | 424x57 | |
| 27.1.26 | [Suppression DGA (27.5.9.2)](#t44) | MDI | - | |
| 27.1.27 | [Veuillez patienter... (27.5.10)](#t45) [mockup](#ecran-t45) | MDI | 424x57 | |
| 27.1.28 | [Veuillez patienter... (27.5.11)](#t46) [mockup](#ecran-t46) | MDI | 424x57 | |
| 27.1.29 | [Veuillez patienter... (27.5.12)](#t47) [mockup](#ecran-t47) | MDI | 424x57 | |
| 27.1.30 | [Veuillez patienter... (27.5.13)](#t48) [mockup](#ecran-t48) | MDI | 422x56 | |
| 27.1.31 | [Suppression DGA (27.5.13.2)](#t50) | MDI | - | |
| 27.1.32 | [Veuillez patienter... (27.5.14)](#t51) [mockup](#ecran-t51) | MDI | 424x57 | |
| 27.1.33 | [Suppression DGA (27.5.14.2)](#t53) | MDI | - | |
| 27.1.34 | [Veuillez patienter... (27.5.15)](#t54) [mockup](#ecran-t54) | MDI | 422x56 | |
| 27.1.35 | [Lecture CAM (27.5.15.1)](#t55) | MDI | - | |
| 27.1.36 | [Veuillez patienter... (27.5.16)](#t57) [mockup](#ecran-t57) | MDI | 422x56 | |
| 27.1.37 | [Suppression DGA (27.5.16.2)](#t59) | MDI | - | |
| 27.1.38 | [Veuillez patienter... (27.5.17)](#t60) [mockup](#ecran-t60) | MDI | 422x58 | |
| 27.1.39 | [Lecture CAM (27.5.17.1)](#t61) | MDI | - | |
| 27.1.40 | [Veuillez patienter... (27.5.18)](#t63) [mockup](#ecran-t63) | MDI | 422x57 | |
| 27.1.41 | [Suppression DGA (27.5.18.2)](#t65) | MDI | - | |
| 27.1.42 | [Veuillez patienter... (27.5.19)](#t66) [mockup](#ecran-t66) | MDI | 422x56 | |
| 27.1.43 | [Lecture CAM (27.5.19.1)](#t67) | MDI | - | |
| 27.1.44 | [Veuillez patienter... (27.5.20)](#t69) [mockup](#ecran-t69) | MDI | 424x56 | |
| 27.1.45 | [Suppression DGA (27.5.20.2)](#t71) | MDI | - | |
| 27.1.46 | [Veuillez patienter... (27.5.21)](#t72) [mockup](#ecran-t72) | MDI | 422x56 | |
| 27.1.47 | [Suppression DGA (27.5.21.2)](#t74) | MDI | - | |
| 27.1.48 | [Veuillez patienter... (27.5.22)](#t75) [mockup](#ecran-t75) | MDI | 422x56 | |
| 27.1.49 | [Lecture (27.5.22.1)](#t76) | MDI | - | |
| 27.1.50 | [Veuillez patienter... (27.5.23)](#t78) [mockup](#ecran-t78) | MDI | 422x56 | |
| 27.1.51 | [Lecture (27.5.23.1)](#t79) | MDI | - | |
| 27.1.52 | [Veuillez patienter... (27.5.24)](#t81) [mockup](#ecran-t81) | MDI | 422x57 | |
| 27.1.53 | [Veuillez patienter... (27.5.25)](#t82) [mockup](#ecran-t82) | MDI | 422x56 | |
| 27.1.54 | [Lecture CAM (27.5.25.1)](#t83) | MDI | - | |
| 27.1.55 | [Veuillez patienter... (27.5.26)](#t85) [mockup](#ecran-t85) | MDI | 422x56 | |
| 27.1.56 | [Lecture CAM (27.5.26.1)](#t86) | MDI | - | |
| 27.1.57 | [Veuillez patienter... (27.5.27)](#t88) [mockup](#ecran-t88) | MDI | 422x56 | |
| 27.1.58 | [Lecture CAM (27.5.27.1)](#t89) | MDI | - | |
| 27.1.59 | [Veuillez patienter... (27.5.28)](#t91) [mockup](#ecran-t91) | MDI | 422x57 | |
| 27.1.60 | [Suppression DGA (27.5.28.2)](#t93) | MDI | - | |
| 27.1.61 | [Veuillez patienter... (27.5.29)](#t94) [mockup](#ecran-t94) | MDI | 422x56 | |
| 27.1.62 | [Suppression DGA (27.5.29.2)](#t96) | MDI | - | |
| 27.1.63 | [Veuillez patienter... (27.5.30)](#t97) [mockup](#ecran-t97) | MDI | 424x57 | |
| 27.1.64 | [Message (27.5.30.1)](#t98) | MDI | - | |
| 27.1.65 | [Veuillez patienter... (27.5.31)](#t100) [mockup](#ecran-t100) | MDI | 422x56 | |
| 27.1.66 | [Suppression DGA (27.5.31.2)](#t102) | MDI | - | |
| 27.1.67 | [Veuillez patienter... (27.5.32)](#t103) [mockup](#ecran-t103) | MDI | 422x56 | |
| 27.1.68 | [Suppression DGA (27.5.32.2)](#t105) | MDI | - | |
| 27.1.69 | [Veuillez patienter... (27.5.33)](#t106) [mockup](#ecran-t106) | MDI | 422x56 | |
| 27.1.70 | [Veuillez patienter... (27.5.34)](#t107) [mockup](#ecran-t107) | MDI | 424x56 | |
| 27.1.71 | [Veuillez patienter... (27.5.35)](#t108) [mockup](#ecran-t108) | MDI | 424x56 | |
| 27.1.72 | [Suppression DGA (27.5.35.2)](#t110) | MDI | - | |
| 27.1.73 | [Veuillez patienter... (27.5.36)](#t111) [mockup](#ecran-t111) | MDI | 424x56 | |
| 27.1.74 | [Suppression DGA (27.5.36.2)](#t113) | MDI | - | |
| 27.1.75 | [Suppression DGA (27.5.36.3)](#t114) | MDI | - | |
| 27.1.76 | [Veuillez patienter... (27.5.37)](#t115) [mockup](#ecran-t115) | MDI | 424x56 | |
| 27.1.77 | [Suppression DGA (27.5.37.2)](#t117) | MDI | - | |
| 27.1.78 | [Veuillez patienter... (27.5.38)](#t118) [mockup](#ecran-t118) | MDI | 424x56 | |
| 27.1.79 | [Suppression DGA (27.5.38.2)](#t120) | MDI | - | |
| 27.1.80 | [Veuillez patienter... (27.5.39)](#t121) [mockup](#ecran-t121) | MDI | 424x56 | |
| 27.1.81 | [Suppression DGA (27.5.39.2)](#t123) | MDI | - | |
| 27.1.82 | [Veuillez patienter... (27.5.40)](#t124) [mockup](#ecran-t124) | MDI | 424x56 | |
| 27.1.83 | [Suppression DGA (27.5.40.2)](#t126) | MDI | - | |
| 27.1.84 | [Veuillez patienter... (27.5.41)](#t127) [mockup](#ecran-t127) | MDI | 424x56 | |
| 27.1.85 | [Suppression DGA (27.5.41.2)](#t129) | MDI | - | |
| 27.1.86 | [Veuillez patienter... (27.5.42)](#t130) [mockup](#ecran-t130) | MDI | 424x56 | |
| 27.1.87 | [Suppression DGA (27.5.42.2)](#t132) | MDI | - | |
| 27.1.88 | [Veuillez patienter... (27.5.43)](#t133) [mockup](#ecran-t133) | MDI | 424x56 | |
| 27.1.89 | [Suppression DGA (27.5.43.2)](#t135) | MDI | - | |
| 27.1.90 | [Veuillez patienter... (27.5.44)](#t136) [mockup](#ecran-t136) | MDI | 424x56 | |
| 27.1.91 | [Suppression DGA (27.5.44.2)](#t138) | MDI | - | |
| 27.1.92 | [Veuillez patienter... (27.5.45)](#t139) [mockup](#ecran-t139) | MDI | 424x56 | |
| 27.1.93 | [Suppression DGA (27.5.45.2)](#t141) | MDI | - | |
| 27.1.94 | [Veuillez patienter... (27.5.46)](#t142) [mockup](#ecran-t142) | MDI | 424x56 | |
| 27.1.95 | [Suppression DGA (27.5.46.2)](#t144) | MDI | - | |
| 27.1.96 | [Veuillez patienter... (27.5.47)](#t145) [mockup](#ecran-t145) | MDI | 424x56 | |
| 27.1.97 | [Suppression DGA (27.5.47.2)](#t147) | MDI | - | |
| 27.1.98 | [Veuillez patienter... (27.5.48)](#t148) [mockup](#ecran-t148) | MDI | 424x56 | |
| 27.1.99 | [Veuillez patienter... (27.5.49)](#t149) [mockup](#ecran-t149) | MDI | 422x57 | |
| 27.1.100 | [Veuillez patienter... (27.5.50)](#t150) [mockup](#ecran-t150) | MDI | 422x57 | |
| 27.1.101 | [Veuillez patienter... (27.6)](#t153) [mockup](#ecran-t153) | MDI | 422x56 | |
| 27.1.102 | [Cumul (27.6.1)](#t154) | MDI | - | |
| 27.1.103 | [Sejour (27.6.2)](#t155) | MDI | - | |
| 27.1.104 | [Garantie (27.6.3)](#t156) | MDI | - | |
| 27.1.105 | [Veuillez patienter... (27.7.1)](#t158) [mockup](#ecran-t158) | MDI | 424x56 | |
| 27.1.106 | [Cumul (27.7.1.1)](#t159) | MDI | - | |
| 27.1.107 | [Date de sejour (27.7.1.2)](#t160) | MDI | - | |
| 27.1.108 | [Garantie (27.7.1.3)](#t161) | MDI | - | |
| 27.1.109 | [Traitement n CGM nouveau (27.8)](#t162) [mockup](#ecran-t162) | MDI | 424x56 | |
| 27.1.110 | [Veuillez patienter... (27.8.1)](#t163) [mockup](#ecran-t163) | MDI | 424x56 | |
| 27.1.111 | [Cumul (27.8.1.1)](#t164) | MDI | - | |
| 27.1.112 | [Date de sejour (27.8.1.2)](#t165) | MDI | - | |
| 27.1.113 | [Garantie (27.8.1.3)](#t166) | MDI | - | |
| 27.1.114 | [Veuillez patienter... (27.9)](#t167) [mockup](#ecran-t167) | MDI | 422x57 | |
| 27.1.115 | [Deblocage cloture v1 (27.11)](#t169) | MDI | - | |
| 27.1.116 | [Deblocage cloture v1 (27.12)](#t170) | MDI | - | |
| 27.1.117 | [Existe ecritures (27.13)](#t171) | MDI | - | |
| 27.1.118 | [Lecture histo (27.14)](#t172) | MDI | - | |
| 27.1.119 | [Chrono LOG reprise (27.14.1)](#t173) | MDI | - | |
| 27.1.120 | [Veuillez patienter SVP ... (27.17)](#t176) [mockup](#ecran-t176) | MDI | 422x56 | |
| 27.1.121 | [Reprise virtuelles (27.18)](#t177) | MDI | - | |
| 27.1.122 | [Veuillez patienter... (27.5.51)](#t180) [mockup](#ecran-t180) | MDI | 422x57 | |
| 27.1.123 | [Veuillez patienter... (27.5.52)](#t183) [mockup](#ecran-t183) | MDI | 422x57 | |
| 27.1.124 | [Veuillez patienter... (27.5.48.1)](#t193) [mockup](#ecran-t193) | MDI | 424x57 | |
| 27.1.125 | [Veuillez patienter... (27.5.53)](#t196) [mockup](#ecran-t196) | MDI | 424x56 | |
| 27.1.126 | [Veuillez patienter... (27.5.53.1)](#t197) [mockup](#ecran-t197) | MDI | 424x57 | |
| 27.1.127 | [(sans nom) (27.5.54)](#t198) | - | - | |
| 27.1.128 | [Veuillez patienter... (27.5.55)](#t202) [mockup](#ecran-t202) | MDI | 424x56 | |
| 27.1.129 | [Suppression DGA (27.5.55.2)](#t204) | MDI | - | |
| **27.2** | [**Selection GM** (27.3)](#t6) [mockup](#ecran-t6) | MDI | 1035x272 | Consultation |
| 27.2.1 | [Affichage filiations (27.3.2)](#t8) [mockup](#ecran-t8) | MDI | 1035x272 | |
| 27.2.2 | [Reaffichage infos reseau (27.10)](#t168) | MDI | - | |
| **27.3** | [**Creation histo** (27.3.1)](#t7) | MDI | - | Creation |
| 27.3.1 | [Creation DGA (27.5.1.1)](#t20) | MDI | - | |
| 27.3.2 | [Creation DGA (27.5.2.1)](#t23) | MDI | - | |
| 27.3.3 | [Creation DGA (27.5.3.1)](#t26) | MDI | - | |
| 27.3.4 | [Creation DGA (27.5.4.1)](#t29) | MDI | - | |
| 27.3.5 | [Creation DGA (27.5.5.1)](#t32) | MDI | - | |
| 27.3.6 | [Creation DGA (27.5.6.1)](#t35) | MDI | - | |
| 27.3.7 | [Creation DGA (27.5.8.1)](#t40) | MDI | - | |
| 27.3.8 | [Creation DGA (27.5.9.1)](#t43) | MDI | - | |
| 27.3.9 | [Creation DGA (27.5.13.1)](#t49) | MDI | - | |
| 27.3.10 | [Creation DGA (27.5.14.1)](#t52) | MDI | - | |
| 27.3.11 | [Creation DGA (27.5.15.2)](#t56) | MDI | - | |
| 27.3.12 | [Creation DGA (27.5.16.1)](#t58) | MDI | - | |
| 27.3.13 | [Creation DGA (27.5.17.2)](#t62) | MDI | - | |
| 27.3.14 | [Creation DGA (27.5.18.1)](#t64) | MDI | - | |
| 27.3.15 | [Creation DGA (27.5.19.2)](#t68) | MDI | - | |
| 27.3.16 | [Creation DGA (27.5.20.1)](#t70) | MDI | - | |
| 27.3.17 | [Creation DGA (27.5.21.1)](#t73) | MDI | - | |
| 27.3.18 | [Creation DGA (27.5.22.2)](#t77) | MDI | - | |
| 27.3.19 | [Creation DGA (27.5.23.2)](#t80) | MDI | - | |
| 27.3.20 | [Creation DGA (27.5.25.2)](#t84) | MDI | - | |
| 27.3.21 | [Creation DGA (27.5.26.2)](#t87) | MDI | - | |
| 27.3.22 | [Creation DGA (27.5.27.2)](#t90) | MDI | - | |
| 27.3.23 | [Creation DGA (27.5.28.1)](#t92) | MDI | - | |
| 27.3.24 | [Creation DGA (27.5.29.1)](#t95) | MDI | - | |
| 27.3.25 | [Creation DGA (27.5.30.2)](#t99) | MDI | - | |
| 27.3.26 | [Creation DGA (27.5.31.1)](#t101) | MDI | - | |
| 27.3.27 | [Creation DGA (27.5.32.1)](#t104) | MDI | - | |
| 27.3.28 | [Creation DGA (27.5.35.1)](#t109) | MDI | - | |
| 27.3.29 | [Creation DGA (27.5.36.1)](#t112) | MDI | - | |
| 27.3.30 | [Creation DGA (27.5.37.1)](#t116) | MDI | - | |
| 27.3.31 | [Creation DGA (27.5.38.1)](#t119) | MDI | - | |
| 27.3.32 | [Creation DGA (27.5.39.1)](#t122) | MDI | - | |
| 27.3.33 | [Creation DGA (27.5.40.1)](#t125) | MDI | - | |
| 27.3.34 | [Creation DGA (27.5.41.1)](#t128) | MDI | - | |
| 27.3.35 | [Creation DGA (27.5.42.1)](#t131) | MDI | - | |
| 27.3.36 | [Creation DGA (27.5.43.1)](#t134) | MDI | - | |
| 27.3.37 | [Creation DGA (27.5.44.1)](#t137) | MDI | - | |
| 27.3.38 | [Creation DGA (27.5.45.1)](#t140) | MDI | - | |
| 27.3.39 | [Creation DGA (27.5.46.1)](#t143) | MDI | - | |
| 27.3.40 | [Creation DGA (27.5.47.1)](#t146) | MDI | - | |
| 27.3.41 | [creation histo v1 (27.15)](#t174) | MDI | - | |
| 27.3.42 | [creation histo v1 (27.16)](#t175) | MDI | - | |
| 27.3.43 | [Creation DGA (27.5.55.1)](#t203) | MDI | - | |
| **27.4** | [**compteur** (27.3.2.1)](#t9) | MDI | - | Calcul |
| 27.4.1 | [Nouveaux comptes (27.3.3)](#t11) | MDI | - | |
| 27.4.2 | [UN compte (27.3.3.2)](#t13) | MDI | - | |
| 27.4.3 | [N comptes (27.3.3.3)](#t14) | MDI | - | |
| 27.4.4 | [nouveau compte (27.7)](#t157) [mockup](#ecran-t157) | MDI | 424x56 | |
| **27.5** | [**Validation** (27.3.2.2)](#t10) [mockup](#ecran-t10) | MDI | 144x8 | Validation |

### 9.4 Algorigramme

```mermaid
flowchart TD
    START([START])
    INIT[Init controles]
    SAISIE[Traitement CGM ancien]
    UPDATE[MAJ 57 tables]
    ENDOK([END OK])

    START --> INIT --> SAISIE
    SAISIE --> UPDATE --> ENDOK

    style START fill:#3fb950,color:#000
    style ENDOK fill:#3fb950,color:#000
```

> **Legende**: Vert = START/END OK | Rouge = END KO | Bleu = Decisions
> *Algorigramme auto-genere. Utiliser `/algorigramme` pour une synthese metier detaillee.*

<!-- TAB:Donnees -->

## 10. TABLES

### Tables utilisees (60)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 15 | transac_entete_bar |  | DB |   | **W** |   | 3 |
| 19 | bl_detail |  | DB |   | **W** |   | 3 |
| 23 | reseau_cloture___rec | Donnees reseau/cloture | DB | R | **W** |   | 5 |
| 29 | voyages__________voy |  | DB |   | **W** |   | 3 |
| 30 | gm-recherche_____gmr | Index de recherche | DB | R | **W** | L | 10 |
| 31 | gm-complet_______gmc |  | DB | R | **W** |   | 2 |
| 32 | prestations | Prestations/services vendus | DB |   | **W** |   | 3 |
| 33 | prestations______pre | Prestations/services vendus | DB | R | **W** |   | 3 |
| 34 | hebergement______heb | Hebergement (chambres) | DB |   | **W** |   | 3 |
| 35 | personnel_go______go |  | DB | R | **W** |   | 2 |
| 36 | client_gm |  | DB | R | **W** |   | 2 |
| 37 | commentaire_gm_________acc |  | DB |   | **W** |   | 3 |
| 38 | comptable_gratuite |  | DB |   | **W** |   | 3 |
| 39 | depot_garantie___dga | Depots et garanties | DB | R | **W** | L | 6 |
| 40 | comptable________cte |  | DB | R | **W** |   | 10 |
| 44 | change___________chg |  | DB | R | **W** |   | 2 |
| 46 | mvt_prestation___mpr | Prestations/services vendus | DB |   | **W** |   | 3 |
| 47 | compte_gm________cgm | Comptes GM (generaux) | DB |   | **W** |   | 5 |
| 51 | fusion_eclatementfec |  | DB |   | **W** |   | 1 |
| 68 | compteurs________cpt | Comptes GM (generaux) | DB |   | **W** |   | 3 |
| 70 | date_comptable___dat |  | DB | R |   |   | 1 |
| 79 | gratuites________gra |  | DB |   | **W** |   | 3 |
| 80 | codes_autocom____aut |  | DB | R | **W** |   | 2 |
| 93 | vendeurs_________ven |  | DB |   | **W** |   | 1 |
| 123 | fichier_messagerie |  | DB | R | **W** |   | 2 |
| 131 | fichier_validation |  | DB | R | **W** |   | 3 |
| 137 | fichier_histotel | Historique / journal | DB | R | **W** |   | 3 |
| 147 | change_vente_____chg | Donnees de ventes | DB | R | **W** |   | 2 |
| 167 | troncon__________tro |  | DB |   | **W** |   | 1 |
| 168 | heb_circuit______hci | Hebergement (chambres) | DB |   | **W** |   | 3 |
| 171 | commentaire______com |  | DB |   | **W** |   | 1 |
| 263 | vente | Donnees de ventes | DB |   | **W** |   | 2 |
| 266 | cc_comptable |  | DB |   | **W** |   | 3 |
| 268 | cc_total_par_type |  | DB |   | **W** |   | 3 |
| 271 | cc_total |  | DB |   | **W** |   | 3 |
| 272 | cc_type_detail |  | DB |   | **W** |   | 3 |
| 285 | email |  | DB |   | **W** |   | 1 |
| 298 | participants_____par |  | DB |   | **W** |   | 3 |
| 301 | details_partici__dpa |  | DB |   | **W** |   | 3 |
| 307 | vente_option_veo | Donnees de ventes | DB |   | **W** |   | 3 |
| 309 | vente____________vep | Donnees de ventes | DB |   | **W** |   | 4 |
| 312 | ez_card |  | DB | R | **W** |   | 2 |
| 340 | histo_fusionseparation | Historique / journal | DB | R | **W** | L | 5 |
| 342 | histo__fusionseparation_log | Historique / journal | DB | R |   |   | 2 |
| 343 | histo_fusionseparation_saisie | Historique / journal | DB | R | **W** | L | 11 |
| 358 | import_mod |  | DB |   | **W** |   | 3 |
| 366 | pms_print_param |  | DB |   | **W** |   | 3 |
| 377 | pv_contracts |  | DB |   | **W** |   | 2 |
| 382 | pv_discount_reasons |  | DB |   | **W** |   | 2 |
| 400 | pv_cust_rentals |  | DB |   |   | L | 2 |
| 463 | heure_de_passage |  | DB |   | **W** |   | 3 |
| 786 | qualite_avant_reprise |  | DB | R | **W** |   | 2 |
| 804 | valeur_credit_bar_defaut |  | DB |   | **W** |   | 1 |
| 805 | vente_par_moyen_paiement | Donnees de ventes | DB |   | **W** |   | 3 |
| 807 | plafond_lit |  | DB |   | **W** |   | 3 |
| 831 | import_go_erreur_affection |  | DB |   | **W** |   | 3 |
| 834 | tpe_par_terminal |  | DB |   | **W** |   | 3 |
| 837 | ##_pv_customer_dat |  | DB |   | **W** |   | 3 |
| 947 | Table_947 |  | MEM |   | **W** |   | 3 |
| 1059 | Table_1059 |  | MEM |   | **W** |   | 1 |

### Colonnes par table (26 / 59 tables avec colonnes identifiees)

<details>
<summary>Table 15 - transac_entete_bar (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 19 - bl_detail (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 23 - reseau_cloture___rec (R/**W**) - 5 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W1 fin tache | W | Alpha |
| B | W1 cloture en cours | W | Numeric |

</details>

<details>
<summary>Table 29 - voyages__________voy (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 30 - gm-recherche_____gmr (R/**W**/L) - 10 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W1 nbre de choix | W | Numeric |
| B | W1 validation (O/N) | W | Logical |
| C | W1 separation compte | W | Numeric |
| D | v.titre | W | Alpha |
| E | v.numero adherent | W | Numeric |
| F | v.filiation adherent | W | Numeric |
| G | v.type client | W | Alpha |

</details>

<details>
<summary>Table 31 - gm-complet_______gmc (R/**W**) - 2 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 32 - prestations (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 33 - prestations______pre (R/**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 34 - hebergement______heb (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 35 - personnel_go______go (R/**W**) - 2 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 36 - client_gm (R/**W**) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W2 type client | W | Alpha |
| G | v.type client | W | Alpha |

</details>

<details>
<summary>Table 37 - commentaire_gm_________acc (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 38 - comptable_gratuite (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| F | W2 date comptable | W | Date |

</details>

<details>
<summary>Table 39 - depot_garantie___dga (R/**W**/L) - 6 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W1 message garantie | W | Unicode |
| B | W1 ret.lien ancien | W | Numeric |
| C | W1 ret.lien nouveau | W | Numeric |
| D | W1 No garantie en cours | W | Numeric |
| E | W1 Nom Prénom | W | Unicode |

</details>

<details>
<summary>Table 40 - comptable________cte (R/**W**) - 10 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| F | W2 date comptable | W | Date |

</details>

<details>
<summary>Table 44 - change___________chg (R/**W**) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| D | W2 change GM | W | Alpha |
| L | W2 taux change | W | Numeric |

</details>

<details>
<summary>Table 46 - mvt_prestation___mpr (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 47 - compte_gm________cgm (**W**) - 5 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W1 cumul montant | W | Numeric |
| B | W1 date fin sejour | W | Date |
| C | W1 garantie | W | Alpha |
| D | W1 fin tache | W | Alpha |

</details>

<details>
<summary>Table 51 - fusion_eclatementfec (**W**) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| B | v.garantie_fusion? | W | Logical |

</details>

<details>
<summary>Table 68 - compteurs________cpt (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 70 - date_comptable___dat (R) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| B | W1 date fin sejour | R | Date |
| D | W2 date operation | R | Date |
| F | W2 date comptable | R | Date |
| G | P0 date limite solde | R | Date |
| S | W0 date operation | R | Date |

</details>

<details>
<summary>Table 79 - gratuites________gra (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 80 - codes_autocom____aut (R/**W**) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W2 code autocom | W | Numeric |

</details>

<details>
<summary>Table 93 - vendeurs_________ven (**W**) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 123 - fichier_messagerie (R/**W**) - 2 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 131 - fichier_validation (R/**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W2 validation | W | Numeric |
| B | W1 validation (O/N) | W | Logical |
| P | W0 validation | W | Logical |

</details>

<details>
<summary>Table 137 - fichier_histotel (R/**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 147 - change_vente_____chg (R/**W**) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| D | W2 change GM | W | Alpha |
| L | W2 taux change | W | Numeric |

</details>

<details>
<summary>Table 167 - troncon__________tro (**W**) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 168 - heb_circuit______hci (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 171 - commentaire______com (**W**) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 263 - vente (**W**) - 2 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 266 - cc_comptable (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| F | W2 date comptable | W | Date |

</details>

<details>
<summary>Table 268 - cc_total_par_type (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W2 type client | W | Alpha |
| G | v.type client | W | Alpha |
| M | P0.Type ope separation | W | Alpha |

</details>

<details>
<summary>Table 271 - cc_total (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 272 - cc_type_detail (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W2 type client | W | Alpha |
| G | v.type client | W | Alpha |
| M | P0.Type ope separation | W | Alpha |

</details>

<details>
<summary>Table 285 - email (**W**) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 298 - participants_____par (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 301 - details_partici__dpa (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 307 - vente_option_veo (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 309 - vente____________vep (**W**) - 4 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 312 - ez_card (R/**W**) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| B | W2 numero ez card | W | Alpha |

</details>

<details>
<summary>Table 340 - histo_fusionseparation (R/**W**/L) - 5 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| BE | W0 chrono histo | W | Numeric |
| L | P0.Chrono histo sans interface | W | Numeric |

</details>

<details>
<summary>Table 342 - histo__fusionseparation_log (R) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| BE | W0 chrono histo | R | Numeric |
| L | P0.Chrono histo sans interface | R | Numeric |

</details>

<details>
<summary>Table 343 - histo_fusionseparation_saisie (R/**W**/L) - 11 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| BE | W0 chrono histo | W | Numeric |
| L | P0.Chrono histo sans interface | W | Numeric |

</details>

<details>
<summary>Table 358 - import_mod (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 366 - pms_print_param (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 377 - pv_contracts (**W**) - 2 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 382 - pv_discount_reasons (**W**) - 2 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 463 - heure_de_passage (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| E | W2 heure operation | W | Time |
| H | W2 heure operation | W | Time |
| T | W0 heure operation | W | Time |

</details>

<details>
<summary>Table 786 - qualite_avant_reprise (R/**W**) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| BA | W0 reprise | W | Logical |
| BB | W0 chrono reprise | W | Numeric |
| BH | W0 reprise confirmee | W | Numeric |
| J | P0 Reprise Auto | W | Logical |
| V | W0 qualite compte | W | Alpha |

</details>

<details>
<summary>Table 804 - valeur_credit_bar_defaut (**W**) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 805 - vente_par_moyen_paiement (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| J | W2 mode paiement | W | Alpha |

</details>

<details>
<summary>Table 807 - plafond_lit (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 831 - import_go_erreur_affection (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 834 - tpe_par_terminal (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 837 - ##_pv_customer_dat (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 947 - Table_947 (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| F | W2 date comptable | W | Date |

</details>

<details>
<summary>Table 1059 - Table_1059 (**W**) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| F | W2 date comptable | W | Date |

</details>

## 11. VARIABLES

### 11.1 Parametres entrants (13)

Variables recues du programme appelant ([Menu changement compte (IDE 37)](ADH-IDE-37.md)).

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| A | P0 societe | Alpha | 2x parametre entrant |
| B | P0 code GM | Numeric | [27.5](#t18) |
| C | P0 filiation | Numeric | [27.3.2](#t8) |
| D | P0 masque montant | Alpha | - |
| E | P0 garantie | Alpha | - |
| F | P0 solde | Numeric | - |
| G | P0 date limite solde | Date | - |
| H | P0 nom village | Alpha | - |
| I | P0 Uni/Bilateral | Alpha | - |
| J | P0 Reprise Auto | Logical | [27.14.1](#t173), [27.18](#t177) |
| K | P0.Sans interface ecran | Logical | 1x parametre entrant |
| L | P0.Chrono histo sans interface | Numeric | - |
| M | P0.Type ope separation | Alpha | - |

### 11.2 Variables de travail (22)

Variables internes au programme.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| N | W0 imprimante | Numeric | - |
| O | W0 reseau | Alpha | [27.2](#t5), [27.10](#t168) |
| P | W0 validation | Logical | [27.3.2.2](#t10) |
| Q | W0 n° compteur | Numeric | [27.3.2.1](#t9) |
| R | W0 nbre filiation | Numeric | - |
| S | W0 date operation | Date | - |
| T | W0 heure operation | Time | - |
| U | W0 nom/prenom newcpt | Alpha | - |
| V | W0 qualite compte | Alpha | - |
| W | W0 fin tâche | Alpha | - |
| X | W0 separation n compte unique | Logical | - |
| Y | W0 Existe ecriture | Logical | - |
| Z | W0 normal | Logical | - |
| BA | W0 reprise | Logical | - |
| BB | W0 chrono reprise | Numeric | - |
| BC | W0 toDo | Logical | - |
| BD | W0 Log | Logical | - |
| BE | W0 chrono histo | Numeric | - |
| BF | W0 code LOG existe | Logical | - |
| BG | W0 chrono du LOG | Numeric | - |
| BH | W0 reprise confirmee | Numeric | - |
| BI | W0.ListeNom_Prenom_Garantie | Blob | - |

<details>
<summary>Toutes les 35 variables (liste complete)</summary>

| Cat | Lettre | Nom Variable | Type |
|-----|--------|--------------|------|
| P0 | **A** | P0 societe | Alpha |
| P0 | **B** | P0 code GM | Numeric |
| P0 | **C** | P0 filiation | Numeric |
| P0 | **D** | P0 masque montant | Alpha |
| P0 | **E** | P0 garantie | Alpha |
| P0 | **F** | P0 solde | Numeric |
| P0 | **G** | P0 date limite solde | Date |
| P0 | **H** | P0 nom village | Alpha |
| P0 | **I** | P0 Uni/Bilateral | Alpha |
| P0 | **J** | P0 Reprise Auto | Logical |
| P0 | **K** | P0.Sans interface ecran | Logical |
| P0 | **L** | P0.Chrono histo sans interface | Numeric |
| P0 | **M** | P0.Type ope separation | Alpha |
| W0 | **N** | W0 imprimante | Numeric |
| W0 | **O** | W0 reseau | Alpha |
| W0 | **P** | W0 validation | Logical |
| W0 | **Q** | W0 n° compteur | Numeric |
| W0 | **R** | W0 nbre filiation | Numeric |
| W0 | **S** | W0 date operation | Date |
| W0 | **T** | W0 heure operation | Time |
| W0 | **U** | W0 nom/prenom newcpt | Alpha |
| W0 | **V** | W0 qualite compte | Alpha |
| W0 | **W** | W0 fin tâche | Alpha |
| W0 | **X** | W0 separation n compte unique | Logical |
| W0 | **Y** | W0 Existe ecriture | Logical |
| W0 | **Z** | W0 normal | Logical |
| W0 | **BA** | W0 reprise | Logical |
| W0 | **BB** | W0 chrono reprise | Numeric |
| W0 | **BC** | W0 toDo | Logical |
| W0 | **BD** | W0 Log | Logical |
| W0 | **BE** | W0 chrono histo | Numeric |
| W0 | **BF** | W0 code LOG existe | Logical |
| W0 | **BG** | W0 chrono du LOG | Numeric |
| W0 | **BH** | W0 reprise confirmee | Numeric |
| W0 | **BI** | W0.ListeNom_Prenom_Garantie | Blob |

</details>

## 12. EXPRESSIONS

**84 / 84 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| CONDITION | 7 | 2 |
| CAST_LOGIQUE | 4 | 5 |
| CONSTANTE | 47 | 0 |
| DATE | 1 | 0 |
| OTHER | 17 | 0 |
| NEGATION | 7 | 0 |
| REFERENCE_VG | 1 | 0 |

### 12.2 Expressions cles par type

#### CONDITION (7 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONDITION | 78 | `IF ([AE],'NNN','ONE')` | [RM-003](#rm-RM-003) |
| CONDITION | 71 | `IF ([AJ],IF ([AH],'RETRY','DONE'),'PASSED')` | [RM-001](#rm-RM-001) |
| CONDITION | 9 | `[AD]='F'` | - |
| CONDITION | 29 | `[AO]=6 OR P0 Reprise Auto [J]` | - |
| CONDITION | 5 | `W0 reseau [O]<>'R'` | - |
| ... | | *+2 autres* | |

#### CAST_LOGIQUE (4 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CAST_LOGIQUE | 76 | `IF ([AH],ExpCalc('29'EXP),'TRUE'LOG)` | [RM-002](#rm-RM-002) |
| CAST_LOGIQUE | 26 | `'TRUE'LOG` | - |
| CAST_LOGIQUE | 24 | `'FALSE'LOG` | - |
| CAST_LOGIQUE | 22 | `'FALSE'LOG` | - |

#### CONSTANTE (47 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONSTANTE | 57 | `'2T/10 - Traitement des fichiers'` | - |
| CONSTANTE | 56 | `'1F/30 - Selection des GM'` | - |
| CONSTANTE | 58 | `'3E/10 - Edition du ticket'` | - |
| CONSTANTE | 60 | `'3E/30 - calcul ancien compte'` | - |
| CONSTANTE | 59 | `'3E/20 - calcul compte GM'` | - |
| ... | | *+42 autres* | |

#### DATE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| DATE | 10 | `Date ()` | - |

#### OTHER (17 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 30 | `[AJ]` | - |
| OTHER | 74 | `[AK]` | - |
| OTHER | 20 | `[AF]` | - |
| OTHER | 28 | `[AH]` | - |
| OTHER | 81 | `P0.Chrono histo sans i... [L]` | - |
| ... | | *+12 autres* | |

#### NEGATION (7 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| NEGATION | 75 | `NOT ([AM])` | - |
| NEGATION | 80 | `NOT P0.Sans interface ecran [K]` | - |
| NEGATION | 82 | `NOT VG78` | - |
| NEGATION | 27 | `NOT ([AH])` | - |
| NEGATION | 7 | `NOT (W0 validation [P])` | - |
| ... | | *+2 autres* | |

#### REFERENCE_VG (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| REFERENCE_VG | 83 | `VG78` | - |

### 12.3 Toutes les expressions (84)

<details>
<summary>Voir les 84 expressions</summary>

#### CONDITION (7)

| IDE | Expression Decodee |
|-----|-------------------|
| 71 | `IF ([AJ],IF ([AH],'RETRY','DONE'),'PASSED')` |
| 78 | `IF ([AE],'NNN','ONE')` |
| 1 | `P0 societe [A]=''` |
| 4 | `[AD]<>'F'` |
| 5 | `W0 reseau [O]<>'R'` |
| 9 | `[AD]='F'` |
| 29 | `[AO]=6 OR P0 Reprise Auto [J]` |

#### CAST_LOGIQUE (4)

| IDE | Expression Decodee |
|-----|-------------------|
| 76 | `IF ([AH],ExpCalc('29'EXP),'TRUE'LOG)` |
| 22 | `'FALSE'LOG` |
| 24 | `'FALSE'LOG` |
| 26 | `'TRUE'LOG` |

#### CONSTANTE (47)

| IDE | Expression Decodee |
|-----|-------------------|
| 2 | `'C'` |
| 8 | `'F'` |
| 19 | `27` |
| 23 | `'SEPAR'` |
| 25 | `0` |
| 31 | `'00/00'` |
| 32 | `'1F'` |
| 33 | `'2T'` |
| 34 | `'3E'` |
| 35 | `10` |
| 36 | `20` |
| 37 | `30` |
| 38 | `40` |
| 39 | `50` |
| 40 | `60` |
| 41 | `'00/00'` |
| 42 | `'1F/10'` |
| 43 | `'1F/20'` |
| 44 | `'1F/30'` |
| 45 | `'2T/10'` |
| 46 | `'3E/10'` |
| 47 | `'3E/20'` |
| 48 | `'3E/30'` |
| 49 | `'3E/40'` |
| 50 | `'3E/50'` |
| 51 | `'3E/60'` |
| 52 | `'99/99'` |
| 53 | `'00/00 - Debut Separation'` |
| 54 | `'1F/10 - Blocage clôture'` |
| 55 | `'1F/20 - Blocage compte reference'` |
| 56 | `'1F/30 - Selection des GM'` |
| 57 | `'2T/10 - Traitement des fichiers'` |
| 58 | `'3E/10 - Edition du ticket'` |
| 59 | `'3E/20 - calcul compte GM'` |
| 60 | `'3E/30 - calcul ancien compte'` |
| 61 | `'3E/40 - calcul nouveau compte. 1 compte'` |
| 62 | `'3E/40 - calcul nouveau compte. N comptes'` |
| 63 | `'3E/50 - deblocage compte reference'` |
| 64 | `'3E/60 - deblocage clôture'` |
| 65 | `'99/99 - fin separation'` |
| 66 | `'DATEHEURE'` |
| 67 | `'UPDFIRST'` |
| 68 | `'UPDTABLE'` |
| 69 | `'UPDEND'` |
| 70 | `'FIN'` |
| 72 | `'DONE'` |
| 73 | `'E'` |

#### DATE (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 10 | `Date ()` |

#### OTHER (17)

| IDE | Expression Decodee |
|-----|-------------------|
| 3 | `P0 societe [A]` |
| 6 | `W0 validation [P]` |
| 11 | `Time ()` |
| 12 | `P0 code GM [B]` |
| 13 | `P0 filiation [C]` |
| 14 | `SetCrsr (2)` |
| 15 | `SetCrsr (1)` |
| 16 | `W0 n° compteur [Q]` |
| 18 | `[AE]` |
| 20 | `[AF]` |
| 28 | `[AH]` |
| 30 | `[AJ]` |
| 74 | `[AK]` |
| 77 | `W0 validation [P]` |
| 79 | `NOT(P0 Reprise Auto [J])` |
| 81 | `P0.Chrono histo sans i... [L]` |
| 84 | `NULL()` |

#### NEGATION (7)

| IDE | Expression Decodee |
|-----|-------------------|
| 7 | `NOT (W0 validation [P])` |
| 17 | `NOT ([AE])` |
| 21 | `NOT ([AF])` |
| 27 | `NOT ([AH])` |
| 75 | `NOT ([AM])` |
| 80 | `NOT P0.Sans interface ecran [K]` |
| 82 | `NOT VG78` |

#### REFERENCE_VG (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 83 | `VG78` |

</details>

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> [Menu changement compte (IDE 37)](ADH-IDE-37.md) -> **Separation (IDE 27)**

```mermaid
graph LR
    T27[27 Separation]
    style T27 fill:#58a6ff
    CC1[1 Main Program]
    style CC1 fill:#8b5cf6
    CC163[163 Menu caisse GM - s...]
    style CC163 fill:#f59e0b
    CC37[37 Menu changement compte]
    style CC37 fill:#3fb950
    CC163 --> CC37
    CC1 --> CC163
    CC37 --> T27
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| [37](ADH-IDE-37.md) | Menu changement compte | 1 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T27[27 Separation]
    style T27 fill:#58a6ff
    C35[35 Write histo_Fus_Sep...]
    T27 --> C35
    style C35 fill:#3fb950
    C30[30 Read histo Fus_Sep_Det]
    T27 --> C30
    style C30 fill:#3fb950
    C31[31 Write histo_Fus_Sep...]
    T27 --> C31
    style C31 fill:#3fb950
    C29[29 Write histo Fus_Sep]
    T27 --> C29
    style C29 fill:#3fb950
    C34[34 Read histo_Fus_Sep_Log]
    T27 --> C34
    style C34 fill:#3fb950
    C36[36 Print Separation ou...]
    T27 --> C36
    style C36 fill:#3fb950
    C43[43 Recuperation du titre]
    T27 --> C43
    style C43 fill:#3fb950
    C179[179 Get Printer]
    T27 --> C179
    style C179 fill:#3fb950
    C180[180 Printer choice]
    T27 --> C180
    style C180 fill:#3fb950
    C181[181 Set Listing Number]
    T27 --> C181
    style C181 fill:#3fb950
    C182[182 Raz Current Printer]
    T27 --> C182
    style C182 fill:#3fb950
```

### 13.4 Detail Callees avec contexte

| IDE | Nom Programme | Appels | Contexte |
|-----|---------------|--------|----------|
| [35](ADH-IDE-35.md) | Write histo_Fus_Sep_Log | 14 | Historique/consultation |
| [30](ADH-IDE-30.md) | Read histo Fus_Sep_Det | 11 | Historique/consultation |
| [31](ADH-IDE-31.md) | Write histo_Fus_Sep_Det | 11 | Historique/consultation |
| [29](ADH-IDE-29.md) | Write histo Fus_Sep | 6 | Historique/consultation |
| [34](ADH-IDE-34.md) | Read histo_Fus_Sep_Log | 1 | Historique/consultation |
| [36](ADH-IDE-36.md) | Print Separation ou fusion | 1 | Impression ticket/document |
| [43](ADH-IDE-43.md) | Recuperation du titre | 1 | Recuperation donnees |
| [179](ADH-IDE-179.md) | Get Printer | 1 | Impression ticket/document |
| [180](ADH-IDE-180.md) | Printer choice | 1 | Impression ticket/document |
| [181](ADH-IDE-181.md) | Set Listing Number | 1 | Configuration impression |
| [182](ADH-IDE-182.md) | Raz Current Printer | 1 | Impression ticket/document |

## 14. RECOMMANDATIONS MIGRATION

### 14.1 Profil du programme

| Metrique | Valeur | Impact migration |
|----------|--------|-----------------|
| Lignes de logique | 3421 | Programme volumineux |
| Expressions | 84 | Logique moderee |
| Tables WRITE | 57 | Fort impact donnees |
| Sous-programmes | 11 | Forte dependance |
| Ecrans visibles | 10 | Interface complexe multi-ecrans |
| Code desactive | 0% (1 / 3421) | Code sain |
| Regles metier | 3 | Quelques regles a preserver |

### 14.2 Plan de migration par bloc

#### Traitement (130 taches: 67 ecrans, 63 traitements)

- **Strategie** : Orchestrateur avec 67 ecrans (Razor/React) et 63 traitements backend (services).
- Les ecrans deviennent des composants UI, les traitements invisibles deviennent des services injectables.
- 11 sous-programme(s) a migrer ou a reutiliser depuis les services existants.
- Decomposer les taches en services unitaires testables.

#### Consultation (3 taches: 2 ecrans, 1 traitement)

- **Strategie** : Composants de recherche/selection en modales.
- 2 ecrans : Selection GM, Affichage filiations

#### Creation (44 taches: 0 ecran, 44 traitements)

- **Strategie** : Repository pattern avec Entity Framework Core.
- Insertion via `IRepository<T>.CreateAsync()`

#### Calcul (5 taches: 1 ecran, 4 traitements)

- **Strategie** : Services de calcul purs (Domain Services).
- Migrer la logique de calcul (stock, compteurs, montants)

#### Validation (1 tache: 1 ecran, 0 traitement)

- **Strategie** : FluentValidation avec validators specifiques.
- Chaque tache de validation -> un validator injectable

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|
| transac_entete_bar | Table WRITE (Database) | 3x | Schema + repository |
| bl_detail | Table WRITE (Database) | 3x | Schema + repository |
| reseau_cloture___rec | Table WRITE (Database) | 4x | Schema + repository |
| voyages__________voy | Table WRITE (Database) | 3x | Schema + repository |
| gm-recherche_____gmr | Table WRITE (Database) | 1x | Schema + repository |
| gm-complet_______gmc | Table WRITE (Database) | 1x | Schema + repository |
| prestations | Table WRITE (Database) | 3x | Schema + repository |
| prestations______pre | Table WRITE (Database) | 2x | Schema + repository |
| hebergement______heb | Table WRITE (Database) | 3x | Schema + repository |
| personnel_go______go | Table WRITE (Database) | 1x | Schema + repository |
| client_gm | Table WRITE (Database) | 1x | Schema + repository |
| commentaire_gm_________acc | Table WRITE (Database) | 3x | Schema + repository |
| comptable_gratuite | Table WRITE (Database) | 3x | Schema + repository |
| depot_garantie___dga | Table WRITE (Database) | 1x | Schema + repository |
| comptable________cte | Table WRITE (Database) | 6x | Schema + repository |
| change___________chg | Table WRITE (Database) | 1x | Schema + repository |
| mvt_prestation___mpr | Table WRITE (Database) | 3x | Schema + repository |
| compte_gm________cgm | Table WRITE (Database) | 5x | Schema + repository |
| fusion_eclatementfec | Table WRITE (Database) | 1x | Schema + repository |
| compteurs________cpt | Table WRITE (Database) | 3x | Schema + repository |
| gratuites________gra | Table WRITE (Database) | 3x | Schema + repository |
| codes_autocom____aut | Table WRITE (Database) | 1x | Schema + repository |
| vendeurs_________ven | Table WRITE (Database) | 1x | Schema + repository |
| fichier_messagerie | Table WRITE (Database) | 1x | Schema + repository |
| fichier_validation | Table WRITE (Database) | 2x | Schema + repository |
| fichier_histotel | Table WRITE (Database) | 2x | Schema + repository |
| change_vente_____chg | Table WRITE (Database) | 1x | Schema + repository |
| troncon__________tro | Table WRITE (Database) | 1x | Schema + repository |
| heb_circuit______hci | Table WRITE (Database) | 3x | Schema + repository |
| commentaire______com | Table WRITE (Database) | 1x | Schema + repository |
| vente | Table WRITE (Database) | 2x | Schema + repository |
| cc_comptable | Table WRITE (Database) | 3x | Schema + repository |
| cc_total_par_type | Table WRITE (Database) | 3x | Schema + repository |
| cc_total | Table WRITE (Database) | 3x | Schema + repository |
| cc_type_detail | Table WRITE (Database) | 3x | Schema + repository |
| email | Table WRITE (Database) | 1x | Schema + repository |
| participants_____par | Table WRITE (Database) | 3x | Schema + repository |
| details_partici__dpa | Table WRITE (Database) | 3x | Schema + repository |
| vente_option_veo | Table WRITE (Database) | 3x | Schema + repository |
| vente____________vep | Table WRITE (Database) | 4x | Schema + repository |
| ez_card | Table WRITE (Database) | 1x | Schema + repository |
| histo_fusionseparation | Table WRITE (Database) | 2x | Schema + repository |
| histo_fusionseparation_saisie | Table WRITE (Database) | 3x | Schema + repository |
| import_mod | Table WRITE (Database) | 3x | Schema + repository |
| pms_print_param | Table WRITE (Database) | 3x | Schema + repository |
| pv_contracts | Table WRITE (Database) | 2x | Schema + repository |
| pv_discount_reasons | Table WRITE (Database) | 2x | Schema + repository |
| heure_de_passage | Table WRITE (Database) | 3x | Schema + repository |
| qualite_avant_reprise | Table WRITE (Database) | 1x | Schema + repository |
| valeur_credit_bar_defaut | Table WRITE (Database) | 1x | Schema + repository |
| vente_par_moyen_paiement | Table WRITE (Database) | 3x | Schema + repository |
| plafond_lit | Table WRITE (Database) | 3x | Schema + repository |
| import_go_erreur_affection | Table WRITE (Database) | 3x | Schema + repository |
| tpe_par_terminal | Table WRITE (Database) | 3x | Schema + repository |
| ##_pv_customer_dat | Table WRITE (Database) | 3x | Schema + repository |
| Table_947 | Table WRITE (Memory) | 3x | Schema + repository |
| Table_1059 | Table WRITE (Memory) | 1x | Schema + repository |
| [Write histo_Fus_Sep_Log (IDE 35)](ADH-IDE-35.md) | Sous-programme | 14x | **CRITIQUE** - Historique/consultation |
| [Write histo_Fus_Sep_Det (IDE 31)](ADH-IDE-31.md) | Sous-programme | 11x | **CRITIQUE** - Historique/consultation |
| [Read histo Fus_Sep_Det (IDE 30)](ADH-IDE-30.md) | Sous-programme | 11x | **CRITIQUE** - Historique/consultation |
| [Write histo Fus_Sep (IDE 29)](ADH-IDE-29.md) | Sous-programme | 6x | **CRITIQUE** - Historique/consultation |
| [Printer choice (IDE 180)](ADH-IDE-180.md) | Sous-programme | 1x | Normale - Impression ticket/document |
| [Set Listing Number (IDE 181)](ADH-IDE-181.md) | Sous-programme | 1x | Normale - Configuration impression |
| [Raz Current Printer (IDE 182)](ADH-IDE-182.md) | Sous-programme | 1x | Normale - Impression ticket/document |
| [Get Printer (IDE 179)](ADH-IDE-179.md) | Sous-programme | 1x | Normale - Impression ticket/document |
| [Read histo_Fus_Sep_Log (IDE 34)](ADH-IDE-34.md) | Sous-programme | 1x | Normale - Historique/consultation |
| [Print Separation ou fusion (IDE 36)](ADH-IDE-36.md) | Sous-programme | 1x | Normale - Impression ticket/document |

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 03:41*

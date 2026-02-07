# ADH IDE 28 - Fusion

> **Analyse**: Phases 1-4 2026-02-07 03:41 -> 03:41 (29s) | Assemblage 13:04
> **Pipeline**: V7.2 Enrichi
> **Structure**: 4 onglets (Resume | Ecrans | Donnees | Connexions)

<!-- TAB:Resume -->

## 1. FICHE D'IDENTITE

| Attribut | Valeur |
|----------|--------|
| Projet | ADH |
| IDE Position | 28 |
| Nom Programme | Fusion |
| Fichier source | `Prg_28.xml` |
| Dossier IDE | General |
| Taches | 192 (11 ecrans visibles) |
| Tables modifiees | 60 |
| Programmes appeles | 13 |
| Complexite | **MOYENNE** (score 65/100) |

## 2. DESCRIPTION FONCTIONNELLE

Le programme **ADH IDE 28 - Fusion** gère la fusion de comptes clients dans le système de gestion hôtelière. Appelé depuis le menu de changement de compte (IDE 37), il orchestre un processus complexe impliquant plusieurs vérifications préalables : test de clôture en cours, blocages de clôture, et vérification de l'état réseau. Le programme sélectionne ensuite le compte GM (Guest Management) cible et récupère l'état actuel du compte avant de procéder aux opérations de fusion.

L'opération elle-même modifie un nombre considérable de tables couvrant les transactions, prestations, hébergement, comptes clients, mouvements financiers, et données d'historique. La fusion synchronise les données historiques via des appels spécialisés (IDE 29-34) qui gèrent l'écriture et la lecture des logs de fusion/séparation, puis consolide les informations du compte fusionné.

À l'issue de la fusion, le programme génère des documents d'impression via les modules d'édition (IDE 36, 179-182) pour confirmer l'opération. Cette architecture en cascades de tâches reflète la complexité métier d'une fusion de compte : validation préalable, transformation données multi-tables, traçabilité complète via historique, et génération de preuves documentaires.

## 3. BLOCS FONCTIONNELS

### 3.1 Traitement (131 taches)

Traitements internes.

---

#### <a id="t1"></a>T1 - (sans nom) [ECRAN]

**Role** : Tache d'orchestration : point d'entree du programme (131 sous-taches). Coordonne l'enchainement des traitements.
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t1)

<details>
<summary>130 sous-taches directes</summary>

| Tache | Nom | Bloc |
|-------|-----|------|
| [T2](#t2) | Test si cloture en cours | Traitement |
| [T3](#t3) | Blocage cloture v1 | Traitement |
| [T4](#t4) | Blocage cloture v1 | Traitement |
| [T5](#t5) | Test reseau | Traitement |
| [T6](#t6) | (sans nom) **[ECRAN]** | Traitement |
| [T11](#t11) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T13](#t13) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T14](#t14) | Mise à Oui des filiations | Traitement |
| [T15](#t15) | Genère filiations new | Traitement |
| [T17](#t17) | listing garanties | Traitement |
| [T18](#t18) | listing garanties | Traitement |
| [T20](#t20) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T21](#t21) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T23](#t23) | Suppression DGA | Traitement |
| [T24](#t24) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T25](#t25) | Suppression DGA | Traitement |
| [T26](#t26) | Suppression DGA | Traitement |
| [T27](#t27) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T29](#t29) | Suppression DGA | Traitement |
| [T30](#t30) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T32](#t32) | Suppression DGA | Traitement |
| [T33](#t33) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T35](#t35) | Suppression DGA | Traitement |
| [T36](#t36) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T38](#t38) | Suppression DGA | Traitement |
| [T39](#t39) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T41](#t41) | Suppression DGA | Traitement |
| [T43](#t43) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T45](#t45) | Suppression DGA | Traitement |
| [T46](#t46) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T48](#t48) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T50](#t50) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T51](#t51) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T52](#t52) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T53](#t53) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T55](#t55) | Suppression DGA | Traitement |
| [T56](#t56) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T58](#t58) | Suppression DGA | Traitement |
| [T59](#t59) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T61](#t61) | Suppression DGA | Traitement |
| [T62](#t62) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T63](#t63) | Lecture CAM | Traitement |
| [T65](#t65) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T67](#t67) | Suppression DGA | Traitement |
| [T68](#t68) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T69](#t69) | Lecture CAM | Traitement |
| [T71](#t71) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T73](#t73) | Suppression DGA | Traitement |
| [T74](#t74) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T75](#t75) | Lecture CAM | Traitement |
| [T77](#t77) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T79](#t79) | Suppression DGA | Traitement |
| [T80](#t80) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T82](#t82) | Suppression DGA | Traitement |
| [T83](#t83) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T85](#t85) | Suppression DGA | Traitement |
| [T86](#t86) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T88](#t88) | Suppression DGA | Traitement |
| [T89](#t89) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T90](#t90) | Lecture | Traitement |
| [T93](#t93) | Lecture | Traitement |
| [T95](#t95) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T97](#t97) | Suppression DGA | Traitement |
| [T98](#t98) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T100](#t100) | Suppression DGA | Traitement |
| [T101](#t101) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T102](#t102) | Suppression DGA | Traitement |
| [T103](#t103) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T104](#t104) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T105](#t105) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T108](#t108) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T109](#t109) | Lecture CAM | Traitement |
| [T111](#t111) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T112](#t112) | Lecture CAM | Traitement |
| [T114](#t114) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T116](#t116) | Suppression DGA | Traitement |
| [T117](#t117) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T118](#t118) | Lecture CAM | Traitement |
| [T120](#t120) | Veuilez patienter ... **[ECRAN]** | Traitement |
| [T122](#t122) | Suppression DGA | Traitement |
| [T123](#t123) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T125](#t125) | Suppression DGA | Traitement |
| [T126](#t126) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T127](#t127) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T128](#t128) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T130](#t130) | Suppression DGA | Traitement |
| [T131](#t131) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T133](#t133) | Suppression DGA | Traitement |
| [T134](#t134) | Suppression DGA | Traitement |
| [T135](#t135) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T137](#t137) | Suppression DGA | Traitement |
| [T138](#t138) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T140](#t140) | Suppression DGA | Traitement |
| [T141](#t141) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T143](#t143) | Suppression DGA | Traitement |
| [T144](#t144) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T146](#t146) | Suppression DGA | Traitement |
| [T147](#t147) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T149](#t149) | Suppression DGA | Traitement |
| [T150](#t150) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T152](#t152) | Suppression DGA | Traitement |
| [T153](#t153) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T155](#t155) | Suppression DGA | Traitement |
| [T156](#t156) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T158](#t158) | Suppression DGA | Traitement |
| [T159](#t159) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T161](#t161) | Suppression DGA | Traitement |
| [T162](#t162) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T164](#t164) | Suppression DGA | Traitement |
| [T165](#t165) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T167](#t167) | Suppression DGA | Traitement |
| [T168](#t168) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T169](#t169) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T172](#t172) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T173](#t173) | Sejour | Traitement |
| [T174](#t174) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T176](#t176) | Deblocage cloture v1 | Traitement |
| [T177](#t177) | Deblocage cloture v1 | Traitement |
| [T178](#t178) | Existe ecritures | Traitement |
| [T179](#t179) | Lecture histo | Traitement |
| [T180](#t180) | Chrono LOG reprise | Traitement |
| [T184](#t184) | Veuillez patienter SVP ... **[ECRAN]** | Traitement |
| [T185](#t185) | Reprise virtuelles | Traitement |
| [T190](#t190) | Veuillez patienter... **[ECRAN]** | Traitement |
| [T191](#t191) | View pointage **[ECRAN]** | Traitement |
| [T192](#t192) | Update DGA | Traitement |
| [T195](#t195) | (sans nom) | Traitement |
| [T196](#t196) | Traitement VRLVSL | Traitement |
| [T201](#t201) | Veuillez patienter ... **[ECRAN]** | Traitement |
| [T203](#t203) | Suppression DGA | Traitement |

</details>

---

#### <a id="t2"></a>T2 - Test si cloture en cours

**Role** : Verification : Test si cloture en cours.

---

#### <a id="t3"></a>T3 - Blocage cloture v1

**Role** : Traitement : Blocage cloture v1.

---

#### <a id="t4"></a>T4 - Blocage cloture v1

**Role** : Traitement : Blocage cloture v1.

---

#### <a id="t5"></a>T5 - Test reseau

**Role** : Verification : Test reseau.
**Variables liees** : M (W0 reseau)

---

#### <a id="t6"></a>T6 - (sans nom) [ECRAN]

**Role** : Traitement interne.
**Ecran** : 640 x 128 DLU (MDI) | [Voir mockup](#ecran-t6)

---

#### <a id="t11"></a>T11 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t11)

---

#### <a id="t13"></a>T13 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 57 DLU (MDI) | [Voir mockup](#ecran-t13)

---

#### <a id="t14"></a>T14 - Mise à Oui des filiations

**Role** : Traitement : Mise à Oui des filiations.

---

#### <a id="t15"></a>T15 - Genère filiations new

**Role** : Traitement : Genère filiations new.

---

#### <a id="t17"></a>T17 - listing garanties

**Role** : Traitement : listing garanties.

---

#### <a id="t18"></a>T18 - listing garanties

**Role** : Traitement : listing garanties.

---

#### <a id="t20"></a>T20 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 474 x 56 DLU (MDI) | [Voir mockup](#ecran-t20)

---

#### <a id="t21"></a>T21 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 382 x 103 DLU (MDI) | [Voir mockup](#ecran-t21)

---

#### <a id="t23"></a>T23 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t24"></a>T24 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 406 x 60 DLU (MDI) | [Voir mockup](#ecran-t24)

---

#### <a id="t25"></a>T25 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t26"></a>T26 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t27"></a>T27 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 494 x 126 DLU (MDI) | [Voir mockup](#ecran-t27)

---

#### <a id="t29"></a>T29 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t30"></a>T30 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 494 x 126 DLU (MDI) | [Voir mockup](#ecran-t30)

---

#### <a id="t32"></a>T32 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t33"></a>T33 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 494 x 126 DLU (MDI) | [Voir mockup](#ecran-t33)

---

#### <a id="t35"></a>T35 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t36"></a>T36 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 494 x 126 DLU (MDI) | [Voir mockup](#ecran-t36)

---

#### <a id="t38"></a>T38 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t39"></a>T39 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 494 x 126 DLU (MDI) | [Voir mockup](#ecran-t39)

---

#### <a id="t41"></a>T41 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t43"></a>T43 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 494 x 126 DLU (MDI) | [Voir mockup](#ecran-t43)

---

#### <a id="t45"></a>T45 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t46"></a>T46 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 634 x 111 DLU (MDI) | [Voir mockup](#ecran-t46)

---

#### <a id="t48"></a>T48 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 634 x 111 DLU (MDI) | [Voir mockup](#ecran-t48)

---

#### <a id="t50"></a>T50 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 634 x 111 DLU (MDI) | [Voir mockup](#ecran-t50)

---

#### <a id="t51"></a>T51 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 634 x 111 DLU (MDI) | [Voir mockup](#ecran-t51)

---

#### <a id="t52"></a>T52 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 57 DLU (MDI) | [Voir mockup](#ecran-t52)

---

#### <a id="t53"></a>T53 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 506 x 119 DLU (MDI) | [Voir mockup](#ecran-t53)

---

#### <a id="t55"></a>T55 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t56"></a>T56 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 642 x 111 DLU (MDI) | [Voir mockup](#ecran-t56)

---

#### <a id="t58"></a>T58 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t59"></a>T59 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 637 x 109 DLU (MDI) | [Voir mockup](#ecran-t59)

---

#### <a id="t61"></a>T61 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t62"></a>T62 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 403 x 105 DLU (MDI) | [Voir mockup](#ecran-t62)

---

#### <a id="t63"></a>T63 - Lecture CAM

**Role** : Traitement : Lecture CAM.

---

#### <a id="t65"></a>T65 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 406 x 107 DLU (MDI) | [Voir mockup](#ecran-t65)

---

#### <a id="t67"></a>T67 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t68"></a>T68 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 394 x 107 DLU (MDI) | [Voir mockup](#ecran-t68)

---

#### <a id="t69"></a>T69 - Lecture CAM

**Role** : Traitement : Lecture CAM.

---

#### <a id="t71"></a>T71 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 530 x 107 DLU (MDI) | [Voir mockup](#ecran-t71)

---

#### <a id="t73"></a>T73 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t74"></a>T74 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 358 x 108 DLU (MDI) | [Voir mockup](#ecran-t74)

---

#### <a id="t75"></a>T75 - Lecture CAM

**Role** : Traitement : Lecture CAM.

---

#### <a id="t77"></a>T77 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 382 x 103 DLU (MDI) | [Voir mockup](#ecran-t77)

---

#### <a id="t79"></a>T79 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t80"></a>T80 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 386 x 101 DLU (MDI) | [Voir mockup](#ecran-t80)

---

#### <a id="t82"></a>T82 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t83"></a>T83 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 525 x 102 DLU (MDI) | [Voir mockup](#ecran-t83)

---

#### <a id="t85"></a>T85 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t86"></a>T86 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 526 x 103 DLU (MDI) | [Voir mockup](#ecran-t86)

---

#### <a id="t88"></a>T88 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t89"></a>T89 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 650 x 102 DLU (MDI) | [Voir mockup](#ecran-t89)

---

#### <a id="t90"></a>T90 - Lecture

**Role** : Traitement : Lecture.

---

#### <a id="t93"></a>T93 - Lecture

**Role** : Traitement : Lecture.

---

#### <a id="t95"></a>T95 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 390 x 106 DLU (MDI) | [Voir mockup](#ecran-t95)

---

#### <a id="t97"></a>T97 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t98"></a>T98 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 389 x 103 DLU (MDI) | [Voir mockup](#ecran-t98)

---

#### <a id="t100"></a>T100 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t101"></a>T101 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 386 x 102 DLU (MDI) | [Voir mockup](#ecran-t101)

---

#### <a id="t102"></a>T102 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t103"></a>T103 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 411 x 76 DLU (MDI) | [Voir mockup](#ecran-t103)

---

#### <a id="t104"></a>T104 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 528 x 102 DLU (MDI) | [Voir mockup](#ecran-t104)

---

#### <a id="t105"></a>T105 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 389 x 36 DLU (MDI) | [Voir mockup](#ecran-t105)

---

#### <a id="t108"></a>T108 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 378 x 104 DLU (MDI) | [Voir mockup](#ecran-t108)

---

#### <a id="t109"></a>T109 - Lecture CAM

**Role** : Traitement : Lecture CAM.

---

#### <a id="t111"></a>T111 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 389 x 102 DLU (MDI) | [Voir mockup](#ecran-t111)

---

#### <a id="t112"></a>T112 - Lecture CAM

**Role** : Traitement : Lecture CAM.

---

#### <a id="t114"></a>T114 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 390 x 102 DLU (MDI) | [Voir mockup](#ecran-t114)

---

#### <a id="t116"></a>T116 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t117"></a>T117 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 389 x 102 DLU (MDI) | [Voir mockup](#ecran-t117)

---

#### <a id="t118"></a>T118 - Lecture CAM

**Role** : Traitement : Lecture CAM.

---

#### <a id="t120"></a>T120 - Veuilez patienter ... [ECRAN]

**Role** : Traitement : Veuilez patienter ....
**Ecran** : 378 x 104 DLU (MDI) | [Voir mockup](#ecran-t120)

---

#### <a id="t122"></a>T122 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t123"></a>T123 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 480 x 104 DLU (MDI) | [Voir mockup](#ecran-t123)

---

#### <a id="t125"></a>T125 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t126"></a>T126 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 507 x 103 DLU (MDI) | [Voir mockup](#ecran-t126)

---

#### <a id="t127"></a>T127 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 498 x 103 DLU (MDI) | [Voir mockup](#ecran-t127)

---

#### <a id="t128"></a>T128 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 379 x 103 DLU (MDI) | [Voir mockup](#ecran-t128)

---

#### <a id="t130"></a>T130 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t131"></a>T131 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 382 x 103 DLU (MDI) | [Voir mockup](#ecran-t131)

---

#### <a id="t133"></a>T133 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t134"></a>T134 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t135"></a>T135 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 382 x 103 DLU (MDI) | [Voir mockup](#ecran-t135)

---

#### <a id="t137"></a>T137 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t138"></a>T138 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 382 x 103 DLU (MDI) | [Voir mockup](#ecran-t138)

---

#### <a id="t140"></a>T140 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t141"></a>T141 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 382 x 103 DLU (MDI) | [Voir mockup](#ecran-t141)

---

#### <a id="t143"></a>T143 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t144"></a>T144 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t144)

---

#### <a id="t146"></a>T146 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t147"></a>T147 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t147)

---

#### <a id="t149"></a>T149 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t150"></a>T150 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t150)

---

#### <a id="t152"></a>T152 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t153"></a>T153 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t153)

---

#### <a id="t155"></a>T155 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t156"></a>T156 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t156)

---

#### <a id="t158"></a>T158 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t159"></a>T159 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t159)

---

#### <a id="t161"></a>T161 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t162"></a>T162 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t162)

---

#### <a id="t164"></a>T164 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t165"></a>T165 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 382 x 103 DLU (MDI) | [Voir mockup](#ecran-t165)

---

#### <a id="t167"></a>T167 - Suppression DGA

**Role** : Traitement : Suppression DGA.

---

#### <a id="t168"></a>T168 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 424 x 56 DLU (MDI) | [Voir mockup](#ecran-t168)

---

#### <a id="t169"></a>T169 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 494 x 126 DLU (MDI) | [Voir mockup](#ecran-t169)

---

#### <a id="t172"></a>T172 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t172)

---

#### <a id="t173"></a>T173 - Sejour

**Role** : Traitement : Sejour.

---

#### <a id="t174"></a>T174 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 426 x 57 DLU (MDI) | [Voir mockup](#ecran-t174)

---

#### <a id="t176"></a>T176 - Deblocage cloture v1

**Role** : Traitement : Deblocage cloture v1.

---

#### <a id="t177"></a>T177 - Deblocage cloture v1

**Role** : Traitement : Deblocage cloture v1.

---

#### <a id="t178"></a>T178 - Existe ecritures

**Role** : Traitement : Existe ecritures.
**Variables liees** : U (W0 Existe ecriture), BB (W0 code LOG existe)

---

#### <a id="t179"></a>T179 - Lecture histo

**Role** : Traitement : Lecture histo.
**Variables liees** : K (P0.Chrono histo sans interface), BA (W0 chrono histo)

---

#### <a id="t180"></a>T180 - Chrono LOG reprise

**Role** : Traitement : Chrono LOG reprise.
**Variables liees** : I (P0 Reprise Auto), K (P0.Chrono histo sans interface), W (W0 reprise), X (W0 chrono reprise), BA (W0 chrono histo)

---

#### <a id="t184"></a>T184 - Veuillez patienter SVP ... [ECRAN]

**Role** : Traitement : Veuillez patienter SVP ....
**Ecran** : 422 x 56 DLU (MDI) | [Voir mockup](#ecran-t184)

---

#### <a id="t185"></a>T185 - Reprise virtuelles

**Role** : Traitement : Reprise virtuelles.
**Variables liees** : I (P0 Reprise Auto), W (W0 reprise), X (W0 chrono reprise), BD (W0 reprise confirmee)

---

#### <a id="t190"></a>T190 - Veuillez patienter... [ECRAN]

**Role** : Traitement : Veuillez patienter....
**Ecran** : 426 x 57 DLU (MDI) | [Voir mockup](#ecran-t190)

---

#### <a id="t191"></a>T191 - View pointage [ECRAN]

**Role** : Traitement : View pointage.
**Ecran** : 1066 x 0 DLU | [Voir mockup](#ecran-t191)

---

#### <a id="t192"></a>T192 - Update DGA

**Role** : Traitement : Update DGA.

---

#### <a id="t195"></a>T195 - (sans nom)

**Role** : Traitement interne.

---

#### <a id="t196"></a>T196 - Traitement VRLVSL

**Role** : Traitement : Traitement VRLVSL.

---

#### <a id="t201"></a>T201 - Veuillez patienter ... [ECRAN]

**Role** : Traitement : Veuillez patienter ....
**Ecran** : 382 x 103 DLU (MDI) | [Voir mockup](#ecran-t201)

---

#### <a id="t203"></a>T203 - Suppression DGA

**Role** : Traitement : Suppression DGA.


### 3.2 Consultation (4 taches)

Ecrans de recherche et consultation.

---

#### <a id="t7"></a>T7 - Selection GM [ECRAN]

**Role** : Selection par l'operateur : Selection GM.
**Ecran** : 1074 x 208 DLU (MDI) | [Voir mockup](#ecran-t7)

---

#### <a id="t16"></a>T16 - Recherche d'un GM [ECRAN]

**Role** : Traitement : Recherche d'un GM.
**Ecran** : 680 x 90 DLU (MDI) | [Voir mockup](#ecran-t16)

---

#### <a id="t19"></a>T19 - Choix de la garantie [ECRAN]

**Role** : Selection par l'operateur : Choix de la garantie.
**Ecran** : 680 x 90 DLU (MDI) | [Voir mockup](#ecran-t19)
**Variables liees** : BE (W0 Compte garantie à conserver), BF (W0 Filiation garantie à conserv), BG (W0 Garantie Club à conserver?)

---

#### <a id="t175"></a>T175 - Reaffichage infos reseau

**Role** : Reinitialisation : Reaffichage infos reseau.
**Variables liees** : M (W0 reseau)


### 3.3 Calcul (8 taches)

Calculs metier : montants, stocks, compteurs.

---

#### <a id="t8"></a>T8 - Lect. Etat du compte

**Role** : Traitement : Lect. Etat du compte.
**Variables liees** : S (W0 qualite compte), BE (W0 Compte garantie à conserver), BH (W0 Compte utilisé modifié?), BI (W0 Compte remplace à la sortie)

---

#### <a id="t9"></a>T9 - Blocage comptes selectionnes [ECRAN]

**Role** : Selection par l'operateur : Blocage comptes selectionnes.
**Ecran** : 120 x 8 DLU (MDI) | [Voir mockup](#ecran-t9)

---

#### <a id="t10"></a>T10 - Blocage comptes selectionnes [ECRAN]

**Role** : Selection par l'operateur : Blocage comptes selectionnes.
**Ecran** : 120 x 8 DLU (MDI) | [Voir mockup](#ecran-t10)

---

#### <a id="t47"></a>T47 - Calcul solde compte cible

**Role** : Calcul : Calcul solde compte cible.
**Variables liees** : E (P0 solde), F (P0 date limite solde), S (W0 qualite compte), BE (W0 Compte garantie à conserver), BH (W0 Compte utilisé modifié?)

---

#### <a id="t49"></a>T49 - Calcul solde compte cible

**Role** : Calcul : Calcul solde compte cible.
**Variables liees** : E (P0 solde), F (P0 date limite solde), S (W0 qualite compte), BE (W0 Compte garantie à conserver), BH (W0 Compte utilisé modifié?)

---

#### <a id="t181"></a>T181 - Calcul compte GM

**Role** : Calcul : Calcul compte GM.
**Variables liees** : S (W0 qualite compte), BE (W0 Compte garantie à conserver), BH (W0 Compte utilisé modifié?), BI (W0 Compte remplace à la sortie)

---

#### <a id="t193"></a>T193 - MaJ Flag Compte Garanti

**Role** : Traitement : MaJ Flag Compte Garanti.
**Variables liees** : S (W0 qualite compte), BE (W0 Compte garantie à conserver), BF (W0 Filiation garantie à conserv), BG (W0 Garantie Club à conserver?), BH (W0 Compte utilisé modifié?)

---

#### <a id="t194"></a>T194 - Get Compte Tempo

**Role** : Consultation/chargement : Get Compte Tempo.
**Variables liees** : S (W0 qualite compte), BE (W0 Compte garantie à conserver), BH (W0 Compte utilisé modifié?), BI (W0 Compte remplace à la sortie)


### 3.4 Validation (1 tache)

Controles de coherence : 1 tache verifie les donnees et conditions.

---

#### <a id="t12"></a>T12 - Validation [ECRAN]

**Role** : Verification : Validation.
**Ecran** : 72 x 8 DLU (MDI) | [Voir mockup](#ecran-t12)
**Variables liees** : N (W0 validation)


### 3.5 Creation (47 taches)

Insertion de nouveaux enregistrements en base.

---

#### <a id="t22"></a>T22 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t28"></a>T28 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t31"></a>T31 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t34"></a>T34 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t37"></a>T37 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t40"></a>T40 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t42"></a>T42 - Creation FEC [ECRAN]

**Role** : Creation d'enregistrement : Creation FEC.
**Ecran** : 422 x 57 DLU (MDI) | [Voir mockup](#ecran-t42)

---

#### <a id="t44"></a>T44 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t54"></a>T54 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t57"></a>T57 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t60"></a>T60 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t64"></a>T64 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t66"></a>T66 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t70"></a>T70 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t72"></a>T72 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t76"></a>T76 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t78"></a>T78 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t81"></a>T81 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t84"></a>T84 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t87"></a>T87 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t91"></a>T91 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t94"></a>T94 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t96"></a>T96 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t99"></a>T99 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t110"></a>T110 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t113"></a>T113 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t115"></a>T115 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t119"></a>T119 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t121"></a>T121 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t124"></a>T124 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t129"></a>T129 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t132"></a>T132 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t136"></a>T136 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t139"></a>T139 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t142"></a>T142 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t145"></a>T145 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t148"></a>T148 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t151"></a>T151 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t154"></a>T154 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t157"></a>T157 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t160"></a>T160 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t163"></a>T163 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t166"></a>T166 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.

---

#### <a id="t182"></a>T182 - creation histo

**Role** : Creation d'enregistrement : creation histo.
**Variables liees** : K (P0.Chrono histo sans interface), BA (W0 chrono histo)

---

#### <a id="t183"></a>T183 - creation histo

**Role** : Creation d'enregistrement : creation histo.
**Variables liees** : K (P0.Chrono histo sans interface), BA (W0 chrono histo)

---

#### <a id="t197"></a>T197 - Creation

**Role** : Creation d'enregistrement : Creation.

---

#### <a id="t202"></a>T202 - Creation DGA

**Role** : Creation d'enregistrement : Creation DGA.


### 3.6 Saisie (1 tache)

L'operateur saisit les donnees de la transaction via 1 ecran (Traitement CHG vente).

---

#### <a id="t92"></a>T92 - Traitement CHG vente [ECRAN]

**Role** : Saisie des donnees : Traitement CHG vente.
**Ecran** : 629 x 77 DLU (MDI) | [Voir mockup](#ecran-t92)
**Delegue a** : [Write histo_Fus_Sep_Saisie (IDE 32)](ADH-IDE-32.md), [Delete histo_Fus_Sep_Saisie (IDE 33)](ADH-IDE-33.md)


## 5. REGLES METIER

2 regles identifiees:

### Autres (2 regles)

#### <a id="rm-RM-001"></a>[RM-001] Si [AF] alors IF ([AD] sinon 'RETRY','DONE'),'PASSED')

| Element | Detail |
|---------|--------|
| **Condition** | `[AF]` |
| **Si vrai** | IF ([AD] |
| **Si faux** | 'RETRY','DONE'),'PASSED') |
| **Expression source** | Expression 57 : `IF ([AF],IF ([AD],'RETRY','DONE'),'PASSED')` |
| **Exemple** | Si [AF] â†’ IF ([AD]. Sinon â†’ 'RETRY','DONE'),'PASSED') |

#### <a id="rm-RM-002"></a>[RM-002] Condition toujours vraie (flag actif)

| Element | Detail |
|---------|--------|
| **Condition** | `[AD]` |
| **Si vrai** | ExpCalc('71'EXP) |
| **Si faux** | 'TRUE'LOG) |
| **Expression source** | Expression 72 : `IF ([AD],ExpCalc('71'EXP),'TRUE'LOG)` |
| **Exemple** | Si [AD] â†’ ExpCalc('71'EXP). Sinon â†’ 'TRUE'LOG) |

## 6. CONTEXTE

- **Appele par**: [Menu changement compte (IDE 37)](ADH-IDE-37.md)
- **Appelle**: 13 programmes | **Tables**: 62 (W:60 R:30 L:5) | **Taches**: 192 | **Expressions**: 81

<!-- TAB:Ecrans -->

## 8. ECRANS

### 8.1 Forms visibles (11 / 192)

| # | Position | Tache | Nom | Type | Largeur | Hauteur | Bloc |
|---|----------|-------|-----|------|---------|---------|------|
| 1 | 28.3.1 | T7 | Selection GM | MDI | 1074 | 208 | Consultation |
| 2 | 28.3.2 | T11 | Veuillez patienter... | MDI | 422 | 56 | Traitement |
| 3 | 28.3.4 | T13 | Veuillez patienter... | MDI | 424 | 57 | Traitement |
| 4 | 28.3.6 | T16 | Recherche d'un GM | MDI | 680 | 90 | Consultation |
| 5 | 28.3.9 | T19 | Choix de la garantie | MDI | 680 | 90 | Consultation |
| 6 | 28.4 | T20 | Veuillez patienter... | MDI | 474 | 56 | Traitement |
| 7 | 28.5 | T172 | Veuillez patienter... | MDI | 422 | 57 | Traitement |
| 8 | 28.6 | T174 | Veuillez patienter... | MDI | 426 | 57 | Traitement |
| 9 | 28.16 | T184 | Veuillez patienter SVP ... | MDI | 422 | 56 | Traitement |
| 10 | 28.7 | T190 | Veuillez patienter... | MDI | 426 | 57 | Traitement |
| 11 | 28.3.4.2 | T191 | View pointage | Type0 | 1066 | 0 | Traitement |

### 8.2 Mockups Ecrans

---

#### <a id="ecran-t7"></a>28.3.1 - Selection GM
**Tache** : [T7](#t7) | **Type** : MDI | **Dimensions** : 1074 x 208 DLU
**Bloc** : Consultation | **Titre IDE** : Selection GM

<!-- FORM-DATA:
{
    "width":  1074,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  2,
                         "w":  1074,
                         "fmt":  "",
                         "name":  "",
                         "h":  19,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  8,
                         "type":  "label",
                         "var":  "",
                         "y":  28,
                         "w":  1058,
                         "fmt":  "",
                         "name":  "",
                         "h":  149,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  208,
                         "type":  "label",
                         "var":  "",
                         "y":  111,
                         "w":  575,
                         "fmt":  "",
                         "name":  "",
                         "h":  58,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  210,
                         "type":  "label",
                         "var":  "",
                         "y":  112,
                         "w":  571,
                         "fmt":  "",
                         "name":  "",
                         "h":  56,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  453,
                         "type":  "label",
                         "var":  "",
                         "y":  135,
                         "w":  253,
                         "fmt":  "",
                         "name":  "",
                         "h":  10,
                         "color":  "142",
                         "text":  "Selection (O/N) - Recherche (R)",
                         "parent":  null
                     },
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  183,
                         "w":  1073,
                         "fmt":  "",
                         "name":  "",
                         "h":  25,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  28,
                         "type":  "table",
                         "var":  "",
                         "name":  "",
                         "titleH":  12,
                         "color":  "110",
                         "w":  1015,
                         "y":  33,
                         "fmt":  "",
                         "parent":  null,
                         "text":  "",
                         "rowH":  14,
                         "h":  74,
                         "cols":  [
                                      {
                                          "title":  "Garantie",
                                          "layer":  1,
                                          "w":  76
                                      },
                                      {
                                          "title":  "Nom",
                                          "layer":  2,
                                          "w":  189
                                      },
                                      {
                                          "title":  "Prénom",
                                          "layer":  3,
                                          "w":  114
                                      },
                                      {
                                          "title":  "Age",
                                          "layer":  4,
                                          "w":  130
                                      },
                                      {
                                          "title":  "Qualité",
                                          "layer":  5,
                                          "w":  86
                                      },
                                      {
                                          "title":  "Sexe",
                                          "layer":  6,
                                          "w":  80
                                      },
                                      {
                                          "title":  "N° Club / Contrôle / Filiation",
                                          "layer":  7,
                                          "w":  306
                                      }
                                  ],
                         "rows":  7
                     },
                     {
                         "x":  112,
                         "type":  "edit",
                         "var":  "",
                         "y":  48,
                         "w":  176,
                         "fmt":  "U15",
                         "name":  "",
                         "h":  10,
                         "color":  "110",
                         "text":  "",
                         "parent":  11
                     },
                     {
                         "x":  303,
                         "type":  "edit",
                         "var":  "",
                         "y":  48,
                         "w":  98,
                         "fmt":  "",
                         "name":  "",
                         "h":  10,
                         "color":  "110",
                         "text":  "",
                         "parent":  11
                     },
                     {
                         "x":  713,
                         "type":  "edit",
                         "var":  "",
                         "y":  48,
                         "w":  120,
                         "fmt":  "",
                         "name":  "",
                         "h":  10,
                         "color":  "110",
                         "text":  "",
                         "parent":  11
                     },
                     {
                         "x":  879,
                         "type":  "edit",
                         "var":  "",
                         "y":  48,
                         "w":  19,
                         "fmt":  "",
                         "name":  "",
                         "h":  10,
                         "color":  "110",
                         "text":  "",
                         "parent":  11
                     },
                     {
                         "x":  937,
                         "type":  "edit",
                         "var":  "",
                         "y":  48,
                         "w":  42,
                         "fmt":  "",
                         "name":  "",
                         "h":  10,
                         "color":  "110",
                         "text":  "",
                         "parent":  11
                     },
                     {
                         "x":  561,
                         "type":  "edit",
                         "var":  "",
                         "y":  48,
                         "w":  30,
                         "fmt":  "",
                         "name":  "",
                         "h":  10,
                         "color":  "110",
                         "text":  "",
                         "parent":  11
                     },
                     {
                         "x":  496,
                         "type":  "button",
                         "var":  "",
                         "y":  186,
                         "w":  175,
                         "fmt":  "",
                         "name":  "B Affecter",
                         "h":  18,
                         "color":  "",
                         "text":  "",
                         "parent":  10
                     },
                     {
                         "x":  692,
                         "type":  "button",
                         "var":  "",
                         "y":  186,
                         "w":  175,
                         "fmt":  "",
                         "name":  "B Liberer",
                         "h":  18,
                         "color":  "",
                         "text":  "",
                         "parent":  10
                     },
                     {
                         "x":  889,
                         "type":  "button",
                         "var":  "",
                         "y":  186,
                         "w":  175,
                         "fmt":  "",
                         "name":  "B Rechercher",
                         "h":  18,
                         "color":  "",
                         "text":  "",
                         "parent":  10
                     },
                     {
                         "x":  724,
                         "type":  "edit",
                         "var":  "",
                         "y":  135,
                         "w":  26,
                         "fmt":  "",
                         "name":  "",
                         "h":  10,
                         "color":  "6",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  7,
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
                         "x":  788,
                         "type":  "edit",
                         "var":  "",
                         "y":  7,
                         "w":  270,
                         "fmt":  "WWW DD MMM YYYYT",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  425,
                         "type":  "edit",
                         "var":  "",
                         "y":  48,
                         "w":  34,
                         "fmt":  "3",
                         "name":  "",
                         "h":  10,
                         "color":  "110",
                         "text":  "",
                         "parent":  11
                     },
                     {
                         "x":  478,
                         "type":  "edit",
                         "var":  "",
                         "y":  48,
                         "w":  53,
                         "fmt":  "4",
                         "name":  "",
                         "h":  10,
                         "color":  "110",
                         "text":  "",
                         "parent":  11
                     },
                     {
                         "x":  655,
                         "type":  "edit",
                         "var":  "",
                         "y":  48,
                         "w":  19,
                         "fmt":  "2",
                         "name":  "gmr_sexe",
                         "h":  10,
                         "color":  "110",
                         "text":  "",
                         "parent":  11
                     },
                     {
                         "x":  910,
                         "type":  "edit",
                         "var":  "",
                         "y":  48,
                         "w":  19,
                         "fmt":  "1",
                         "name":  "",
                         "h":  10,
                         "color":  "110",
                         "text":  "",
                         "parent":  11
                     },
                     {
                         "x":  235,
                         "type":  "image",
                         "var":  "",
                         "y":  116,
                         "w":  176,
                         "fmt":  "",
                         "name":  "",
                         "h":  49,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  9,
                         "type":  "button",
                         "var":  "",
                         "y":  186,
                         "w":  175,
                         "fmt":  "\u0026OK",
                         "name":  "",
                         "h":  18,
                         "color":  "",
                         "text":  "",
                         "parent":  10
                     },
                     {
                         "x":  198,
                         "type":  "button",
                         "var":  "",
                         "y":  186,
                         "w":  168,
                         "fmt":  "Printer",
                         "name":  "",
                         "h":  18,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  34,
                         "type":  "edit",
                         "var":  "",
                         "y":  48,
                         "w":  67,
                         "fmt":  "30",
                         "name":  "",
                         "h":  10,
                         "color":  "110",
                         "text":  "",
                         "parent":  11
                     }
                 ],
    "taskId":  "28.3.1",
    "height":  208
}
-->

<details>
<summary><strong>Champs : 14 champs</strong></summary>

| Pos (x,y) | Nom | Variable | Type |
|-----------|-----|----------|------|
| 112,48 | U15 | - | edit |
| 303,48 | (sans nom) | - | edit |
| 713,48 | (sans nom) | - | edit |
| 879,48 | (sans nom) | - | edit |
| 937,48 | (sans nom) | - | edit |
| 561,48 | (sans nom) | - | edit |
| 724,135 | (sans nom) | - | edit |
| 7,7 | 20 | - | edit |
| 788,7 | WWW DD MMM YYYYT | - | edit |
| 425,48 | 3 | - | edit |
| 478,48 | 4 | - | edit |
| 655,48 | gmr_sexe | - | edit |
| 910,48 | 1 | - | edit |
| 34,48 | 30 | - | edit |

</details>

<details>
<summary><strong>Boutons : 5 boutons</strong></summary>

| Bouton | Pos (x,y) | Action |
|--------|-----------|--------|
| B Affecter | 496,186 | Bouton fonctionnel |
| B Liberer | 692,186 | Bouton fonctionnel |
| B Rechercher | 889,186 | Ouvre la selection |
| OK | 9,186 | Valide la saisie et enregistre |
| Printer | 198,186 | Appel [Print Separation ou fusion (IDE 36)](ADH-IDE-36.md) |

</details>

---

#### <a id="ecran-t11"></a>28.3.2 - Veuillez patienter...
**Tache** : [T11](#t11) | **Type** : MDI | **Dimensions** : 422 x 56 DLU
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
                         "x":  89,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  245,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Verification des donnees",
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
    "taskId":  "28.3.2",
    "height":  56
}
-->

---

#### <a id="ecran-t13"></a>28.3.4 - Veuillez patienter...
**Tache** : [T13](#t13) | **Type** : MDI | **Dimensions** : 424 x 57 DLU
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
                         "x":  98,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  229,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Selection filiations",
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
    "taskId":  "28.3.4",
    "height":  57
}
-->

---

#### <a id="ecran-t16"></a>28.3.6 - Recherche d'un GM
**Tache** : [T16](#t16) | **Type** : MDI | **Dimensions** : 680 x 90 DLU
**Bloc** : Consultation | **Titre IDE** : Recherche d'un GM

<!-- FORM-DATA:
{
    "width":  680,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  155,
                         "type":  "label",
                         "var":  "",
                         "y":  20,
                         "w":  525,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  183,
                         "type":  "label",
                         "var":  "",
                         "y":  29,
                         "w":  117,
                         "fmt":  "",
                         "name":  "",
                         "h":  10,
                         "color":  "4",
                         "text":  "GM recherche",
                         "parent":  null
                     },
                     {
                         "x":  4,
                         "type":  "label",
                         "var":  "",
                         "y":  66,
                         "w":  674,
                         "fmt":  "",
                         "name":  "",
                         "h":  24,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  311,
                         "type":  "edit",
                         "var":  "",
                         "y":  29,
                         "w":  350,
                         "fmt":  "",
                         "name":  "",
                         "h":  10,
                         "color":  "6",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  12,
                         "type":  "button",
                         "var":  "",
                         "y":  69,
                         "w":  154,
                         "fmt":  "\u0026Ok",
                         "name":  "",
                         "h":  18,
                         "color":  "",
                         "text":  "",
                         "parent":  5
                     },
                     {
                         "x":  179,
                         "type":  "button",
                         "var":  "",
                         "y":  69,
                         "w":  154,
                         "fmt":  "A\u0026bandonner",
                         "name":  "",
                         "h":  18,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  11,
                         "type":  "image",
                         "var":  "",
                         "y":  0,
                         "w":  138,
                         "fmt":  "",
                         "name":  "",
                         "h":  62,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "28.3.6",
    "height":  90
}
-->

<details>
<summary><strong>Champs : 1 champs</strong></summary>

| Pos (x,y) | Nom | Variable | Type |
|-----------|-----|----------|------|
| 311,29 | (sans nom) | - | edit |

</details>

<details>
<summary><strong>Boutons : 2 boutons</strong></summary>

| Bouton | Pos (x,y) | Action |
|--------|-----------|--------|
| Ok | 12,69 | Valide la saisie et enregistre |
| Abandonner | 179,69 | Annule et retour au menu |

</details>

---

#### <a id="ecran-t19"></a>28.3.9 - Choix de la garantie
**Tache** : [T19](#t19) | **Type** : MDI | **Dimensions** : 680 x 90 DLU
**Bloc** : Consultation | **Titre IDE** : Choix de la garantie

<!-- FORM-DATA:
{
    "width":  680,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  155,
                         "type":  "label",
                         "var":  "",
                         "y":  20,
                         "w":  525,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  183,
                         "type":  "label",
                         "var":  "",
                         "y":  29,
                         "w":  117,
                         "fmt":  "",
                         "name":  "",
                         "h":  10,
                         "color":  "4",
                         "text":  "Sélection",
                         "parent":  null
                     },
                     {
                         "x":  4,
                         "type":  "label",
                         "var":  "",
                         "y":  66,
                         "w":  674,
                         "fmt":  "",
                         "name":  "",
                         "h":  24,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  155,
                         "type":  "label",
                         "var":  "",
                         "y":  4,
                         "w":  525,
                         "fmt":  "",
                         "name":  "",
                         "h":  11,
                         "color":  "",
                         "text":  "Veuillez choisir la garantie à conserver",
                         "parent":  null
                     },
                     {
                         "x":  12,
                         "type":  "button",
                         "var":  "",
                         "y":  69,
                         "w":  154,
                         "fmt":  "\u0026Ok",
                         "name":  "",
                         "h":  18,
                         "color":  "",
                         "text":  "",
                         "parent":  4
                     },
                     {
                         "x":  179,
                         "type":  "button",
                         "var":  "",
                         "y":  69,
                         "w":  154,
                         "fmt":  "A\u0026bandonner",
                         "name":  "",
                         "h":  18,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  11,
                         "type":  "image",
                         "var":  "",
                         "y":  0,
                         "w":  138,
                         "fmt":  "",
                         "name":  "",
                         "h":  62,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  274,
                         "type":  "combobox",
                         "var":  "",
                         "y":  28,
                         "w":  384,
                         "fmt":  "",
                         "name":  "W2 nom recherche",
                         "h":  12,
                         "color":  "2",
                         "text":  "",
                         "parent":  null
                     }
                 ],
    "taskId":  "28.3.9",
    "height":  90
}
-->

<details>
<summary><strong>Champs : 1 champs</strong></summary>

| Pos (x,y) | Nom | Variable | Type |
|-----------|-----|----------|------|
| 274,28 | W2 nom recherche | - | combobox |

</details>

<details>
<summary><strong>Boutons : 2 boutons</strong></summary>

| Bouton | Pos (x,y) | Action |
|--------|-----------|--------|
| Ok | 12,69 | Valide la saisie et enregistre |
| Abandonner | 179,69 | Annule et retour au menu |

</details>

---

#### <a id="ecran-t20"></a>28.4 - Veuillez patienter...
**Tache** : [T20](#t20) | **Type** : MDI | **Dimensions** : 474 x 56 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter...

<!-- FORM-DATA:
{
    "width":  474,
    "vFactor":  8,
    "type":  "MDI",
    "hFactor":  8,
    "controls":  [
                     {
                         "x":  0,
                         "type":  "label",
                         "var":  "",
                         "y":  0,
                         "w":  474,
                         "fmt":  "",
                         "name":  "",
                         "h":  29,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  155,
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
                         "w":  474,
                         "fmt":  "",
                         "name":  "",
                         "h":  27,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  7,
                         "type":  "label",
                         "var":  "",
                         "y":  35,
                         "w":  117,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Traitement",
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
                     },
                     {
                         "x":  137,
                         "type":  "edit",
                         "var":  "",
                         "y":  35,
                         "w":  328,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "",
                         "parent":  null
                     },
                     {
                         "x":  8,
                         "type":  "edit",
                         "var":  "",
                         "y":  46,
                         "w":  456,
                         "fmt":  "40",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "",
                         "parent":  4
                     }
                 ],
    "taskId":  "28.4",
    "height":  56
}
-->

<details>
<summary><strong>Champs : 2 champs</strong></summary>

| Pos (x,y) | Nom | Variable | Type |
|-----------|-----|----------|------|
| 137,35 | (sans nom) | - | edit |
| 8,46 | 40 | - | edit |

</details>

---

#### <a id="ecran-t172"></a>28.5 - Veuillez patienter...
**Tache** : [T172](#t172) | **Type** : MDI | **Dimensions** : 422 x 57 DLU
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
                         "x":  95,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  232,
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
                         "x":  72,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  280,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Date limite solde",
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
    "taskId":  "28.5",
    "height":  57
}
-->

---

#### <a id="ecran-t174"></a>28.6 - Veuillez patienter...
**Tache** : [T174](#t174) | **Type** : MDI | **Dimensions** : 426 x 57 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter...

<!-- FORM-DATA:
{
    "width":  426,
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
                         "x":  125,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  229,
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
                         "x":  72,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  280,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Deblocage compte",
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
    "taskId":  "28.6",
    "height":  57
}
-->

---

#### <a id="ecran-t184"></a>28.16 - Veuillez patienter SVP ...
**Tache** : [T184](#t184) | **Type** : MDI | **Dimensions** : 422 x 56 DLU
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
                         "text":  "Reprise groupement de comptes",
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
    "taskId":  "28.16",
    "height":  56
}
-->

---

#### <a id="ecran-t190"></a>28.7 - Veuillez patienter...
**Tache** : [T190](#t190) | **Type** : MDI | **Dimensions** : 426 x 57 DLU
**Bloc** : Traitement | **Titre IDE** : Veuillez patienter...

<!-- FORM-DATA:
{
    "width":  426,
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
                         "x":  125,
                         "type":  "label",
                         "var":  "",
                         "y":  10,
                         "w":  229,
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
                         "x":  72,
                         "type":  "label",
                         "var":  "",
                         "y":  38,
                         "w":  280,
                         "fmt":  "",
                         "name":  "",
                         "h":  8,
                         "color":  "",
                         "text":  "Deblocage compte",
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
    "taskId":  "28.7",
    "height":  57
}
-->

---

#### <a id="ecran-t191"></a>28.3.4.2 - View pointage
**Tache** : [T191](#t191) | **Type** : Type0 | **Dimensions** : 1066 x 0 DLU
**Bloc** : Traitement | **Titre IDE** : View pointage

<!-- FORM-DATA:
{
    "width":  1066,
    "vFactor":  8,
    "type":  "Type0",
    "hFactor":  4,
    "controls":  [
                     {
                         "x":  8,
                         "type":  "table",
                         "var":  "",
                         "name":  "",
                         "titleH":  12,
                         "color":  "",
                         "w":  1034,
                         "y":  8,
                         "fmt":  "",
                         "parent":  null,
                         "text":  "",
                         "rowH":  13,
                         "h":  182,
                         "cols":  [
                                      {
                                          "title":  "chrono_f_e",
                                          "layer":  1,
                                          "w":  68
                                      },
                                      {
                                          "title":  "societe",
                                          "layer":  2,
                                          "w":  30
                                      },
                                      {
                                          "title":  "compte_reference",
                                          "layer":  3,
                                          "w":  72
                                      },
                                      {
                                          "title":  "filiation_reference",
                                          "layer":  4,
                                          "w":  70
                                      },
                                      {
                                          "title":  "compte_pointe_old",
                                          "layer":  5,
                                          "w":  75
                                      },
                                      {
                                          "title":  "filiation_pointe_old",
                                          "layer":  6,
                                          "w":  73
                                      },
                                      {
                                          "title":  "compte_pointe_new",
                                          "layer":  7,
                                          "w":  80
                                      },
                                      {
                                          "title":  "filiation_pointe_new",
                                          "layer":  8,
                                          "w":  78
                                      },
                                      {
                                          "title":  "type_f_e",
                                          "layer":  9,
                                          "w":  36
                                      },
                                      {
                                          "title":  "nom",
                                          "layer":  10,
                                          "w":  178
                                      },
                                      {
                                          "title":  "prenom",
                                          "layer":  11,
                                          "w":  55
                                      },
                                      {
                                          "title":  "nomprenom",
                                          "layer":  12,
                                          "w":  122
                                      },
                                      {
                                          "title":  "pointage_separation",
                                          "layer":  13,
                                          "w":  80
                                      }
                                  ],
                         "rows":  13
                     },
                     {
                         "x":  12,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  61,
                         "fmt":  "",
                         "name":  "chrono_f_e",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  80,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  9,
                         "fmt":  "",
                         "name":  "societe",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  110,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  42,
                         "fmt":  "",
                         "name":  "compte_reference",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  182,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  18,
                         "fmt":  "",
                         "name":  "filiation_reference",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  252,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  42,
                         "fmt":  "",
                         "name":  "compte_pointe_old",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  327,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  18,
                         "fmt":  "",
                         "name":  "filiation_pointe_old",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  400,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  42,
                         "fmt":  "",
                         "name":  "compte_pointe_new",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  480,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  18,
                         "fmt":  "",
                         "name":  "filiation_pointe_new",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  558,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  9,
                         "fmt":  "",
                         "name":  "type_f_e",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  594,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  171,
                         "fmt":  "",
                         "name":  "nom",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  772,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  48,
                         "fmt":  "",
                         "name":  "prenom",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  827,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  115,
                         "fmt":  "",
                         "name":  "nomprenom",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     },
                     {
                         "x":  949,
                         "type":  "edit",
                         "var":  "",
                         "y":  23,
                         "w":  31,
                         "fmt":  "",
                         "name":  "pointage_separation",
                         "h":  10,
                         "color":  "",
                         "text":  "",
                         "parent":  1
                     }
                 ],
    "taskId":  "28.3.4.2",
    "height":  0
}
-->

<details>
<summary><strong>Champs : 13 champs</strong></summary>

| Pos (x,y) | Nom | Variable | Type |
|-----------|-----|----------|------|
| 12,23 | chrono_f_e | - | edit |
| 80,23 | societe | - | edit |
| 110,23 | compte_reference | - | edit |
| 182,23 | filiation_reference | - | edit |
| 252,23 | compte_pointe_old | - | edit |
| 327,23 | filiation_pointe_old | - | edit |
| 400,23 | compte_pointe_new | - | edit |
| 480,23 | filiation_pointe_new | - | edit |
| 558,23 | type_f_e | - | edit |
| 594,23 | nom | - | edit |
| 772,23 | prenom | - | edit |
| 827,23 | nomprenom | - | edit |
| 949,23 | pointage_separation | - | edit |

</details>

## 9. NAVIGATION

### 9.1 Enchainement des ecrans

```mermaid
flowchart TD
    START([Entree])
    style START fill:#3fb950
    VF7[T7 Selection GM]
    style VF7 fill:#58a6ff
    VF11[T11 Veuillez patienter...]
    style VF11 fill:#58a6ff
    VF13[T13 Veuillez patienter...]
    style VF13 fill:#58a6ff
    VF16[T16 Recherche dun GM]
    style VF16 fill:#58a6ff
    VF19[T19 Choix de la garantie]
    style VF19 fill:#58a6ff
    VF20[T20 Veuillez patienter...]
    style VF20 fill:#58a6ff
    VF172[T172 Veuillez patiente...]
    style VF172 fill:#58a6ff
    VF174[T174 Veuillez patiente...]
    style VF174 fill:#58a6ff
    VF184[T184 Veuillez patiente...]
    style VF184 fill:#58a6ff
    VF190[T190 Veuillez patiente...]
    style VF190 fill:#58a6ff
    VF191[T191 View pointage]
    style VF191 fill:#58a6ff
    EXT35[IDE 35 Write histo_Fus...]
    style EXT35 fill:#3fb950
    EXT30[IDE 30 Read histo Fus_...]
    style EXT30 fill:#3fb950
    EXT31[IDE 31 Write histo_Fus...]
    style EXT31 fill:#3fb950
    EXT29[IDE 29 Write histo Fus...]
    style EXT29 fill:#3fb950
    EXT32[IDE 32 Write histo_Fus...]
    style EXT32 fill:#3fb950
    EXT33[IDE 33 Delete histo_Fu...]
    style EXT33 fill:#3fb950
    EXT43[IDE 43 Recuperation du...]
    style EXT43 fill:#3fb950
    EXT34[IDE 34 Read histo_Fus_...]
    style EXT34 fill:#3fb950
    EXT36[IDE 36 Print Separatio...]
    style EXT36 fill:#3fb950
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
    START --> VF7
    VF7 -->|Historique/consultation| EXT35
    VF7 -->|Historique/consultation| EXT30
    VF7 -->|Historique/consultation| EXT31
    VF7 -->|Historique/consultation| EXT29
    VF7 -->|Historique/consultation| EXT32
    VF7 -->|Historique/consultation| EXT33
    VF7 -->|Recuperation donnees| EXT43
    VF7 -->|Historique/consultation| EXT34
    EXT182 --> FIN
```

**Detail par enchainement :**

| Depuis | Action | Vers | Retour |
|--------|--------|------|--------|
| Selection GM | Historique/consultation | [Write histo_Fus_Sep_Log (IDE 35)](ADH-IDE-35.md) | Retour ecran |
| Selection GM | Historique/consultation | [Read histo Fus_Sep_Det (IDE 30)](ADH-IDE-30.md) | Retour ecran |
| Selection GM | Historique/consultation | [Write histo_Fus_Sep_Det (IDE 31)](ADH-IDE-31.md) | Retour ecran |
| Selection GM | Historique/consultation | [Write histo Fus_Sep (IDE 29)](ADH-IDE-29.md) | Retour ecran |
| Selection GM | Historique/consultation | [Write histo_Fus_Sep_Saisie (IDE 32)](ADH-IDE-32.md) | Retour ecran |
| Selection GM | Historique/consultation | [Delete histo_Fus_Sep_Saisie (IDE 33)](ADH-IDE-33.md) | Retour ecran |
| Selection GM | Recuperation donnees | [Recuperation du titre (IDE 43)](ADH-IDE-43.md) | Retour ecran |
| Selection GM | Historique/consultation | [Read histo_Fus_Sep_Log (IDE 34)](ADH-IDE-34.md) | Retour ecran |
| Selection GM | Impression ticket/document | [Print Separation ou fusion (IDE 36)](ADH-IDE-36.md) | Retour ecran |
| Selection GM | Impression ticket/document | [Get Printer (IDE 179)](ADH-IDE-179.md) | Retour ecran |
| Selection GM | Impression ticket/document | [Printer choice (IDE 180)](ADH-IDE-180.md) | Retour ecran |
| Selection GM | Configuration impression | [Set Listing Number (IDE 181)](ADH-IDE-181.md) | Retour ecran |
| Selection GM | Impression ticket/document | [Raz Current Printer (IDE 182)](ADH-IDE-182.md) | Retour ecran |

### 9.3 Structure hierarchique (192 taches)

| Position | Tache | Type | Dimensions | Bloc |
|----------|-------|------|------------|------|
| **28.1** | [**(sans nom)** (T1)](#t1) [mockup](#ecran-t1) | MDI | 422x56 | Traitement |
| 28.1.1 | [Test si cloture en cours (T2)](#t2) | MDI | - | |
| 28.1.2 | [Blocage cloture v1 (T3)](#t3) | MDI | - | |
| 28.1.3 | [Blocage cloture v1 (T4)](#t4) | MDI | - | |
| 28.1.4 | [Test reseau (T5)](#t5) | MDI | - | |
| 28.1.5 | [(sans nom) (T6)](#t6) [mockup](#ecran-t6) | MDI | 640x128 | |
| 28.1.6 | [Veuillez patienter... (T11)](#t11) [mockup](#ecran-t11) | MDI | 422x56 | |
| 28.1.7 | [Veuillez patienter... (T13)](#t13) [mockup](#ecran-t13) | MDI | 424x57 | |
| 28.1.8 | [Mise à Oui des filiations (T14)](#t14) | MDI | - | |
| 28.1.9 | [Genère filiations new (T15)](#t15) | MDI | - | |
| 28.1.10 | [listing garanties (T17)](#t17) | - | - | |
| 28.1.11 | [listing garanties (T18)](#t18) | - | - | |
| 28.1.12 | [Veuillez patienter... (T20)](#t20) [mockup](#ecran-t20) | MDI | 474x56 | |
| 28.1.13 | [Veuillez patienter ... (T21)](#t21) [mockup](#ecran-t21) | MDI | 382x103 | |
| 28.1.14 | [Suppression DGA (T23)](#t23) | MDI | - | |
| 28.1.15 | [Veuillez patienter ... (T24)](#t24) [mockup](#ecran-t24) | MDI | 406x60 | |
| 28.1.16 | [Suppression DGA (T25)](#t25) | MDI | - | |
| 28.1.17 | [Suppression DGA (T26)](#t26) | MDI | - | |
| 28.1.18 | [Veuillez patienter ... (T27)](#t27) [mockup](#ecran-t27) | MDI | 494x126 | |
| 28.1.19 | [Suppression DGA (T29)](#t29) | MDI | - | |
| 28.1.20 | [Veuillez patienter ... (T30)](#t30) [mockup](#ecran-t30) | MDI | 494x126 | |
| 28.1.21 | [Suppression DGA (T32)](#t32) | MDI | - | |
| 28.1.22 | [Veuillez patienter ... (T33)](#t33) [mockup](#ecran-t33) | MDI | 494x126 | |
| 28.1.23 | [Suppression DGA (T35)](#t35) | MDI | - | |
| 28.1.24 | [Veuillez patienter ... (T36)](#t36) [mockup](#ecran-t36) | MDI | 494x126 | |
| 28.1.25 | [Suppression DGA (T38)](#t38) | MDI | - | |
| 28.1.26 | [Veuillez patienter ... (T39)](#t39) [mockup](#ecran-t39) | MDI | 494x126 | |
| 28.1.27 | [Suppression DGA (T41)](#t41) | MDI | - | |
| 28.1.28 | [Veuillez patienter ... (T43)](#t43) [mockup](#ecran-t43) | MDI | 494x126 | |
| 28.1.29 | [Suppression DGA (T45)](#t45) | MDI | - | |
| 28.1.30 | [Veuillez patienter ... (T46)](#t46) [mockup](#ecran-t46) | MDI | 634x111 | |
| 28.1.31 | [Veuillez patienter ... (T48)](#t48) [mockup](#ecran-t48) | MDI | 634x111 | |
| 28.1.32 | [Veuillez patienter ... (T50)](#t50) [mockup](#ecran-t50) | MDI | 634x111 | |
| 28.1.33 | [Veuillez patienter ... (T51)](#t51) [mockup](#ecran-t51) | MDI | 634x111 | |
| 28.1.34 | [Veuillez patienter... (T52)](#t52) [mockup](#ecran-t52) | MDI | 424x57 | |
| 28.1.35 | [Veuillez patienter ... (T53)](#t53) [mockup](#ecran-t53) | MDI | 506x119 | |
| 28.1.36 | [Suppression DGA (T55)](#t55) | MDI | - | |
| 28.1.37 | [Veuillez patienter ... (T56)](#t56) [mockup](#ecran-t56) | MDI | 642x111 | |
| 28.1.38 | [Suppression DGA (T58)](#t58) | MDI | - | |
| 28.1.39 | [Veuillez patienter ... (T59)](#t59) [mockup](#ecran-t59) | MDI | 637x109 | |
| 28.1.40 | [Suppression DGA (T61)](#t61) | MDI | - | |
| 28.1.41 | [Veuillez patienter ... (T62)](#t62) [mockup](#ecran-t62) | MDI | 403x105 | |
| 28.1.42 | [Lecture CAM (T63)](#t63) | MDI | - | |
| 28.1.43 | [Veuillez patienter ... (T65)](#t65) [mockup](#ecran-t65) | MDI | 406x107 | |
| 28.1.44 | [Suppression DGA (T67)](#t67) | MDI | - | |
| 28.1.45 | [Veuillez patienter ... (T68)](#t68) [mockup](#ecran-t68) | MDI | 394x107 | |
| 28.1.46 | [Lecture CAM (T69)](#t69) | MDI | - | |
| 28.1.47 | [Veuillez patienter ... (T71)](#t71) [mockup](#ecran-t71) | MDI | 530x107 | |
| 28.1.48 | [Suppression DGA (T73)](#t73) | MDI | - | |
| 28.1.49 | [Veuillez patienter ... (T74)](#t74) [mockup](#ecran-t74) | MDI | 358x108 | |
| 28.1.50 | [Lecture CAM (T75)](#t75) | MDI | - | |
| 28.1.51 | [Veuillez patienter ... (T77)](#t77) [mockup](#ecran-t77) | MDI | 382x103 | |
| 28.1.52 | [Suppression DGA (T79)](#t79) | MDI | - | |
| 28.1.53 | [Veuillez patienter ... (T80)](#t80) [mockup](#ecran-t80) | MDI | 386x101 | |
| 28.1.54 | [Suppression DGA (T82)](#t82) | MDI | - | |
| 28.1.55 | [Veuillez patienter ... (T83)](#t83) [mockup](#ecran-t83) | MDI | 525x102 | |
| 28.1.56 | [Suppression DGA (T85)](#t85) | MDI | - | |
| 28.1.57 | [Veuillez patienter ... (T86)](#t86) [mockup](#ecran-t86) | MDI | 526x103 | |
| 28.1.58 | [Suppression DGA (T88)](#t88) | MDI | - | |
| 28.1.59 | [Veuillez patienter ... (T89)](#t89) [mockup](#ecran-t89) | MDI | 650x102 | |
| 28.1.60 | [Lecture (T90)](#t90) | MDI | - | |
| 28.1.61 | [Lecture (T93)](#t93) | MDI | - | |
| 28.1.62 | [Veuillez patienter ... (T95)](#t95) [mockup](#ecran-t95) | MDI | 390x106 | |
| 28.1.63 | [Suppression DGA (T97)](#t97) | MDI | - | |
| 28.1.64 | [Veuillez patienter ... (T98)](#t98) [mockup](#ecran-t98) | MDI | 389x103 | |
| 28.1.65 | [Suppression DGA (T100)](#t100) | MDI | - | |
| 28.1.66 | [Veuillez patienter ... (T101)](#t101) [mockup](#ecran-t101) | MDI | 386x102 | |
| 28.1.67 | [Suppression DGA (T102)](#t102) | MDI | - | |
| 28.1.68 | [Veuillez patienter ... (T103)](#t103) [mockup](#ecran-t103) | MDI | 411x76 | |
| 28.1.69 | [Veuillez patienter ... (T104)](#t104) [mockup](#ecran-t104) | MDI | 528x102 | |
| 28.1.70 | [Veuillez patienter ... (T105)](#t105) [mockup](#ecran-t105) | MDI | 389x36 | |
| 28.1.71 | [Veuillez patienter ... (T108)](#t108) [mockup](#ecran-t108) | MDI | 378x104 | |
| 28.1.72 | [Lecture CAM (T109)](#t109) | MDI | - | |
| 28.1.73 | [Veuillez patienter ... (T111)](#t111) [mockup](#ecran-t111) | MDI | 389x102 | |
| 28.1.74 | [Lecture CAM (T112)](#t112) | MDI | - | |
| 28.1.75 | [Veuillez patienter ... (T114)](#t114) [mockup](#ecran-t114) | MDI | 390x102 | |
| 28.1.76 | [Suppression DGA (T116)](#t116) | MDI | - | |
| 28.1.77 | [Veuillez patienter ... (T117)](#t117) [mockup](#ecran-t117) | MDI | 389x102 | |
| 28.1.78 | [Lecture CAM (T118)](#t118) | MDI | - | |
| 28.1.79 | [Veuilez patienter ... (T120)](#t120) [mockup](#ecran-t120) | MDI | 378x104 | |
| 28.1.80 | [Suppression DGA (T122)](#t122) | MDI | - | |
| 28.1.81 | [Veuillez patienter ... (T123)](#t123) [mockup](#ecran-t123) | MDI | 480x104 | |
| 28.1.82 | [Suppression DGA (T125)](#t125) | MDI | - | |
| 28.1.83 | [Veuillez patienter ... (T126)](#t126) [mockup](#ecran-t126) | MDI | 507x103 | |
| 28.1.84 | [Veuillez patienter ... (T127)](#t127) [mockup](#ecran-t127) | MDI | 498x103 | |
| 28.1.85 | [Veuillez patienter ... (T128)](#t128) [mockup](#ecran-t128) | MDI | 379x103 | |
| 28.1.86 | [Suppression DGA (T130)](#t130) | MDI | - | |
| 28.1.87 | [Veuillez patienter ... (T131)](#t131) [mockup](#ecran-t131) | MDI | 382x103 | |
| 28.1.88 | [Suppression DGA (T133)](#t133) | MDI | - | |
| 28.1.89 | [Suppression DGA (T134)](#t134) | MDI | - | |
| 28.1.90 | [Veuillez patienter ... (T135)](#t135) [mockup](#ecran-t135) | MDI | 382x103 | |
| 28.1.91 | [Suppression DGA (T137)](#t137) | MDI | - | |
| 28.1.92 | [Veuillez patienter ... (T138)](#t138) [mockup](#ecran-t138) | MDI | 382x103 | |
| 28.1.93 | [Suppression DGA (T140)](#t140) | MDI | - | |
| 28.1.94 | [Veuillez patienter ... (T141)](#t141) [mockup](#ecran-t141) | MDI | 382x103 | |
| 28.1.95 | [Suppression DGA (T143)](#t143) | MDI | - | |
| 28.1.96 | [Veuillez patienter... (T144)](#t144) [mockup](#ecran-t144) | MDI | 424x56 | |
| 28.1.97 | [Suppression DGA (T146)](#t146) | MDI | - | |
| 28.1.98 | [Veuillez patienter... (T147)](#t147) [mockup](#ecran-t147) | MDI | 424x56 | |
| 28.1.99 | [Suppression DGA (T149)](#t149) | MDI | - | |
| 28.1.100 | [Veuillez patienter... (T150)](#t150) [mockup](#ecran-t150) | MDI | 424x56 | |
| 28.1.101 | [Suppression DGA (T152)](#t152) | MDI | - | |
| 28.1.102 | [Veuillez patienter... (T153)](#t153) [mockup](#ecran-t153) | MDI | 424x56 | |
| 28.1.103 | [Suppression DGA (T155)](#t155) | MDI | - | |
| 28.1.104 | [Veuillez patienter... (T156)](#t156) [mockup](#ecran-t156) | MDI | 424x56 | |
| 28.1.105 | [Suppression DGA (T158)](#t158) | MDI | - | |
| 28.1.106 | [Veuillez patienter... (T159)](#t159) [mockup](#ecran-t159) | MDI | 424x56 | |
| 28.1.107 | [Suppression DGA (T161)](#t161) | MDI | - | |
| 28.1.108 | [Veuillez patienter... (T162)](#t162) [mockup](#ecran-t162) | MDI | 424x56 | |
| 28.1.109 | [Suppression DGA (T164)](#t164) | MDI | - | |
| 28.1.110 | [Veuillez patienter ... (T165)](#t165) [mockup](#ecran-t165) | MDI | 382x103 | |
| 28.1.111 | [Suppression DGA (T167)](#t167) | MDI | - | |
| 28.1.112 | [Veuillez patienter... (T168)](#t168) [mockup](#ecran-t168) | MDI | 424x56 | |
| 28.1.113 | [Veuillez patienter ... (T169)](#t169) [mockup](#ecran-t169) | MDI | 494x126 | |
| 28.1.114 | [Veuillez patienter... (T172)](#t172) [mockup](#ecran-t172) | MDI | 422x57 | |
| 28.1.115 | [Sejour (T173)](#t173) | MDI | - | |
| 28.1.116 | [Veuillez patienter... (T174)](#t174) [mockup](#ecran-t174) | MDI | 426x57 | |
| 28.1.117 | [Deblocage cloture v1 (T176)](#t176) | MDI | - | |
| 28.1.118 | [Deblocage cloture v1 (T177)](#t177) | MDI | - | |
| 28.1.119 | [Existe ecritures (T178)](#t178) | MDI | - | |
| 28.1.120 | [Lecture histo (T179)](#t179) | MDI | - | |
| 28.1.121 | [Chrono LOG reprise (T180)](#t180) | MDI | - | |
| 28.1.122 | [Veuillez patienter SVP ... (T184)](#t184) [mockup](#ecran-t184) | MDI | 422x56 | |
| 28.1.123 | [Reprise virtuelles (T185)](#t185) | MDI | - | |
| 28.1.124 | [Veuillez patienter... (T190)](#t190) [mockup](#ecran-t190) | MDI | 426x57 | |
| 28.1.125 | [View pointage (T191)](#t191) [mockup](#ecran-t191) | - | 1066x0 | |
| 28.1.126 | [Update DGA (T192)](#t192) | - | - | |
| 28.1.127 | [(sans nom) (T195)](#t195) | - | - | |
| 28.1.128 | [Traitement VRLVSL (T196)](#t196) | - | - | |
| 28.1.129 | [Veuillez patienter ... (T201)](#t201) [mockup](#ecran-t201) | MDI | 382x103 | |
| 28.1.130 | [Suppression DGA (T203)](#t203) | MDI | - | |
| **28.2** | [**Selection GM** (T7)](#t7) [mockup](#ecran-t7) | MDI | 1074x208 | Consultation |
| 28.2.1 | [Recherche d'un GM (T16)](#t16) [mockup](#ecran-t16) | MDI | 680x90 | |
| 28.2.2 | [Choix de la garantie (T19)](#t19) [mockup](#ecran-t19) | MDI | 680x90 | |
| 28.2.3 | [Reaffichage infos reseau (T175)](#t175) | MDI | - | |
| **28.3** | [**Lect. Etat du compte** (T8)](#t8) | MDI | - | Calcul |
| 28.3.1 | [Blocage comptes selectionnes (T9)](#t9) [mockup](#ecran-t9) | MDI | 120x8 | |
| 28.3.2 | [Blocage comptes selectionnes (T10)](#t10) [mockup](#ecran-t10) | MDI | 120x8 | |
| 28.3.3 | [Calcul solde compte cible (T47)](#t47) | MDI | - | |
| 28.3.4 | [Calcul solde compte cible (T49)](#t49) | MDI | - | |
| 28.3.5 | [Calcul compte GM (T181)](#t181) | MDI | - | |
| 28.3.6 | [MaJ Flag Compte Garanti (T193)](#t193) | - | - | |
| 28.3.7 | [Get Compte Tempo (T194)](#t194) | - | - | |
| **28.4** | [**Validation** (T12)](#t12) [mockup](#ecran-t12) | MDI | 72x8 | Validation |
| **28.5** | [**Creation DGA** (T22)](#t22) | MDI | - | Creation |
| 28.5.1 | [Creation DGA (T28)](#t28) | MDI | - | |
| 28.5.2 | [Creation DGA (T31)](#t31) | MDI | - | |
| 28.5.3 | [Creation DGA (T34)](#t34) | MDI | - | |
| 28.5.4 | [Creation DGA (T37)](#t37) | MDI | - | |
| 28.5.5 | [Creation DGA (T40)](#t40) | MDI | - | |
| 28.5.6 | [Creation FEC (T42)](#t42) [mockup](#ecran-t42) | MDI | 422x57 | |
| 28.5.7 | [Creation DGA (T44)](#t44) | MDI | - | |
| 28.5.8 | [Creation DGA (T54)](#t54) | MDI | - | |
| 28.5.9 | [Creation DGA (T57)](#t57) | MDI | - | |
| 28.5.10 | [Creation DGA (T60)](#t60) | MDI | - | |
| 28.5.11 | [Creation DGA (T64)](#t64) | MDI | - | |
| 28.5.12 | [Creation DGA (T66)](#t66) | MDI | - | |
| 28.5.13 | [Creation DGA (T70)](#t70) | MDI | - | |
| 28.5.14 | [Creation DGA (T72)](#t72) | MDI | - | |
| 28.5.15 | [Creation DGA (T76)](#t76) | MDI | - | |
| 28.5.16 | [Creation DGA (T78)](#t78) | MDI | - | |
| 28.5.17 | [Creation DGA (T81)](#t81) | MDI | - | |
| 28.5.18 | [Creation DGA (T84)](#t84) | MDI | - | |
| 28.5.19 | [Creation DGA (T87)](#t87) | MDI | - | |
| 28.5.20 | [Creation DGA (T91)](#t91) | MDI | - | |
| 28.5.21 | [Creation DGA (T94)](#t94) | MDI | - | |
| 28.5.22 | [Creation DGA (T96)](#t96) | MDI | - | |
| 28.5.23 | [Creation DGA (T99)](#t99) | MDI | - | |
| 28.5.24 | [Creation DGA (T110)](#t110) | MDI | - | |
| 28.5.25 | [Creation DGA (T113)](#t113) | MDI | - | |
| 28.5.26 | [Creation DGA (T115)](#t115) | MDI | - | |
| 28.5.27 | [Creation DGA (T119)](#t119) | MDI | - | |
| 28.5.28 | [Creation DGA (T121)](#t121) | MDI | - | |
| 28.5.29 | [Creation DGA (T124)](#t124) | MDI | - | |
| 28.5.30 | [Creation DGA (T129)](#t129) | MDI | - | |
| 28.5.31 | [Creation DGA (T132)](#t132) | MDI | - | |
| 28.5.32 | [Creation DGA (T136)](#t136) | MDI | - | |
| 28.5.33 | [Creation DGA (T139)](#t139) | MDI | - | |
| 28.5.34 | [Creation DGA (T142)](#t142) | MDI | - | |
| 28.5.35 | [Creation DGA (T145)](#t145) | MDI | - | |
| 28.5.36 | [Creation DGA (T148)](#t148) | MDI | - | |
| 28.5.37 | [Creation DGA (T151)](#t151) | MDI | - | |
| 28.5.38 | [Creation DGA (T154)](#t154) | MDI | - | |
| 28.5.39 | [Creation DGA (T157)](#t157) | MDI | - | |
| 28.5.40 | [Creation DGA (T160)](#t160) | MDI | - | |
| 28.5.41 | [Creation DGA (T163)](#t163) | MDI | - | |
| 28.5.42 | [Creation DGA (T166)](#t166) | MDI | - | |
| 28.5.43 | [creation histo (T182)](#t182) | MDI | - | |
| 28.5.44 | [creation histo (T183)](#t183) | MDI | - | |
| 28.5.45 | [Creation (T197)](#t197) | - | - | |
| 28.5.46 | [Creation DGA (T202)](#t202) | MDI | - | |
| **28.6** | [**Traitement CHG vente** (T92)](#t92) [mockup](#ecran-t92) | MDI | 629x77 | Saisie |

### 9.4 Algorigramme

```mermaid
flowchart TD
    START([START])
    B1[Traitement (131t)]
    START --> B1
    B2[Consultation (4t)]
    B1 --> B2
    B3[Calcul (8t)]
    B2 --> B3
    B4[Validation (1t)]
    B3 --> B4
    B5[Creation (47t)]
    B4 --> B5
    B6[Saisie (1t)]
    B5 --> B6
    WRITE[MAJ 60 tables]
    B6 --> WRITE
    ENDOK([END])
    WRITE --> ENDOK
    style START fill:#3fb950,color:#000
    style ENDOK fill:#3fb950,color:#000
    style WRITE fill:#ffeb3b,color:#000
```

> *Algorigramme simplifie base sur les blocs fonctionnels. Utiliser `/algorigramme` pour une synthese metier detaillee.*

<!-- TAB:Donnees -->

## 10. TABLES

### Tables utilisees (62)

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 343 | histo_fusionseparation_saisie | Historique / journal | DB | R | **W** | L | 9 |
| 30 | gm-recherche_____gmr | Index de recherche | DB | R | **W** | L | 8 |
| 39 | depot_garantie___dga | Depots et garanties | DB | R | **W** | L | 6 |
| 340 | histo_fusionseparation | Historique / journal | DB | R | **W** | L | 5 |
| 47 | compte_gm________cgm | Comptes GM (generaux) | DB | R | **W** |   | 12 |
| 23 | reseau_cloture___rec | Donnees reseau/cloture | DB | R | **W** |   | 5 |
| 51 | fusion_eclatementfec |  | DB | R | **W** |   | 4 |
| 33 | prestations______pre | Prestations/services vendus | DB | R | **W** |   | 3 |
| 131 | fichier_validation |  | DB | R | **W** |   | 3 |
| 37 | commentaire_gm_________acc |  | DB | R | **W** |   | 3 |
| 831 | import_go_erreur_affection |  | DB | R | **W** |   | 3 |
| 837 | ##_pv_customer_dat |  | DB | R | **W** |   | 3 |
| 46 | mvt_prestation___mpr | Prestations/services vendus | DB | R | **W** |   | 3 |
| 79 | gratuites________gra |  | DB | R | **W** |   | 3 |
| 137 | fichier_histotel | Historique / journal | DB | R | **W** |   | 3 |
| 834 | tpe_par_terminal |  | DB | R | **W** |   | 3 |
| 805 | vente_par_moyen_paiement | Donnees de ventes | DB | R | **W** |   | 3 |
| 40 | comptable________cte |  | DB | R | **W** |   | 3 |
| 807 | plafond_lit |  | DB | R | **W** |   | 3 |
| 32 | prestations | Prestations/services vendus | DB | R | **W** |   | 3 |
| 312 | ez_card |  | DB | R | **W** |   | 2 |
| 31 | gm-complet_______gmc |  | DB | R | **W** |   | 2 |
| 35 | personnel_go______go |  | DB | R | **W** |   | 2 |
| 786 | qualite_avant_reprise |  | DB | R | **W** |   | 2 |
| 123 | fichier_messagerie |  | DB | R | **W** |   | 2 |
| 147 | change_vente_____chg | Donnees de ventes | DB | R | **W** |   | 2 |
| 80 | codes_autocom____aut |  | DB | R | **W** |   | 2 |
| 44 | change___________chg |  | DB | R | **W** |   | 2 |
| 266 | cc_comptable |  | DB |   | **W** |   | 4 |
| 309 | vente____________vep | Donnees de ventes | DB |   | **W** |   | 4 |
| 15 | transac_entete_bar |  | DB |   | **W** |   | 3 |
| 307 | vente_option_veo | Donnees de ventes | DB |   | **W** |   | 3 |
| 41 | depot_objets_____doa | Depots et garanties | DB |   | **W** |   | 3 |
| 463 | heure_de_passage |  | DB |   | **W** |   | 3 |
| 947 | Table_947 |  | MEM |   | **W** |   | 3 |
| 34 | hebergement______heb | Hebergement (chambres) | DB |   | **W** |   | 3 |
| 168 | heb_circuit______hci | Hebergement (chambres) | DB |   | **W** |   | 3 |
| 268 | cc_total_par_type |  | DB |   | **W** |   | 3 |
| 272 | cc_type_detail |  | DB |   | **W** |   | 3 |
| 48 | lignes_de_solde__sld |  | DB |   | **W** |   | 3 |
| 271 | cc_total |  | DB |   | **W** |   | 3 |
| 298 | participants_____par |  | DB |   | **W** |   | 3 |
| 29 | voyages__________voy |  | DB |   | **W** |   | 3 |
| 19 | bl_detail |  | DB |   | **W** |   | 3 |
| 38 | comptable_gratuite |  | DB |   | **W** |   | 3 |
| 358 | import_mod |  | DB |   | **W** |   | 3 |
| 42 | depot_devises____dda | Depots et garanties | DB |   | **W** |   | 3 |
| 366 | pms_print_param |  | DB |   | **W** |   | 3 |
| 301 | details_partici__dpa |  | DB |   | **W** |   | 3 |
| 148 | lignes_de_solde__sld |  | DB |   | **W** |   | 3 |
| 43 | solde_devises____sda | Devises / taux de change | DB |   | **W** |   | 2 |
| 263 | vente | Donnees de ventes | DB |   | **W** |   | 2 |
| 382 | pv_discount_reasons |  | DB |   | **W** |   | 1 |
| 171 | commentaire______com |  | DB |   | **W** |   | 1 |
| 285 | email |  | DB |   | **W** |   | 1 |
| 804 | valeur_credit_bar_defaut |  | DB |   | **W** |   | 1 |
| 36 | client_gm |  | DB |   | **W** |   | 1 |
| 93 | vendeurs_________ven |  | DB |   | **W** |   | 1 |
| 1059 | Table_1059 |  | MEM |   | **W** |   | 1 |
| 167 | troncon__________tro |  | DB |   | **W** |   | 1 |
| 342 | histo__fusionseparation_log | Historique / journal | DB | R |   | L | 2 |
| 70 | date_comptable___dat |  | DB | R |   |   | 1 |

### Colonnes par table (27 / 62 tables avec colonnes identifiees)

<details>
<summary>Table 343 - histo_fusionseparation_saisie (R/**W**/L) - 9 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | v.new filiation | W | Numeric |
| B | v.numero adherent | W | Numeric |
| C | v.filiation adherent | W | Numeric |
| D | v.type client | W | Alpha |

</details>

<details>
<summary>Table 30 - gm-recherche_____gmr (R/**W**/L) - 8 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W2 etat | W | Alpha |
| B | W2 garanti | W | Alpha |
| C | W2 qualite compte | W | Alpha |
| D | W2 fin tache | W | Alpha |
| E | W2 Compte est pointe ? | W | Logical |
| F | W2 Compte Garantie? | W | Logical |
| G | V Affecter | W | Logical |
| H | V Liberer | W | Logical |
| I | V Rechercher | W | Logical |
| J | B Affecter | W | Alpha |
| K | B Liberer | W | Alpha |
| L | B Rechercher | W | Alpha |
| M | W2 selection (O/N) | W | Alpha |
| N | v.titre | W | Alpha |

</details>

<details>
<summary>Table 39 - depot_garantie___dga (R/**W**/L) - 6 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | V Garantie existe | W | Logical |
| B | Nocompte\Fili\GarCLUB | W | Unicode |

</details>

<details>
<summary>Table 340 - histo_fusionseparation (R/**W**/L) - 5 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| BA | W0 chrono histo | W | Numeric |
| K | P0.Chrono histo sans interface | W | Numeric |

</details>

<details>
<summary>Table 47 - compte_gm________cgm (R/**W**) - 12 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W3 fin de tache | W | Alpha |
| B | W3 ret. lien garanti? | W | Logical |

</details>

<details>
<summary>Table 23 - reseau_cloture___rec (R/**W**) - 5 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W1 fin tache | W | Alpha |
| B | W1 cloture en cours | W | Numeric |

</details>

<details>
<summary>Table 51 - fusion_eclatementfec (R/**W**) - 4 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| D | W1 Filiation compte fusionne | W | Numeric |
| E | P.i.Filiation Fusion | W | Numeric |

</details>

<details>
<summary>Table 33 - prestations______pre (R/**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 131 - fichier_validation (R/**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W2 validation | W | Numeric |
| N | W0 validation | W | Alpha |

</details>

<details>
<summary>Table 37 - commentaire_gm_________acc (R/**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 831 - import_go_erreur_affection (R/**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 837 - ##_pv_customer_dat (R/**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 46 - mvt_prestation___mpr (R/**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 79 - gratuites________gra (R/**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 137 - fichier_histotel (R/**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 834 - tpe_par_terminal (R/**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 805 - vente_par_moyen_paiement (R/**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| J | W2 mode paiement | W | Alpha |

</details>

<details>
<summary>Table 40 - comptable________cte (R/**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| F | W2 date comptable | W | Date |

</details>

<details>
<summary>Table 807 - plafond_lit (R/**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 32 - prestations (R/**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 312 - ez_card (R/**W**) - 2 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 31 - gm-complet_______gmc (R/**W**) - 2 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 35 - personnel_go______go (R/**W**) - 2 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 786 - qualite_avant_reprise (R/**W**) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | v. qualite | W | Unicode |
| BD | W0 reprise confirmee | W | Numeric |
| C | W2 qualite compte | W | Alpha |
| I | P0 Reprise Auto | W | Logical |
| S | W0 qualite compte | W | Alpha |
| W | W0 reprise | W | Logical |
| X | W0 chrono reprise | W | Numeric |

</details>

<details>
<summary>Table 123 - fichier_messagerie (R/**W**) - 2 usages</summary>

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
<summary>Table 80 - codes_autocom____aut (R/**W**) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W2 code autocom | W | Numeric |

</details>

<details>
<summary>Table 44 - change___________chg (R/**W**) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| D | W2 change GM | W | Alpha |
| L | W2 taux change | W | Numeric |

</details>

<details>
<summary>Table 266 - cc_comptable (**W**) - 4 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| F | W2 date comptable | W | Date |

</details>

<details>
<summary>Table 309 - vente____________vep (**W**) - 4 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 15 - transac_entete_bar (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 307 - vente_option_veo (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 41 - depot_objets_____doa (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 463 - heure_de_passage (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| H | W2 heure operation | W | Time |
| R | W0 heure operation | W | Time |

</details>

<details>
<summary>Table 947 - Table_947 (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W3 fin tâche | W | Alpha |
| B | P.i.Filiation | W | Numeric |

</details>

<details>
<summary>Table 34 - hebergement______heb (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 168 - heb_circuit______hci (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 268 - cc_total_par_type (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W2 type client | W | Alpha |
| D | v.type client | W | Alpha |
| P | W0 type operation | W | Alpha |

</details>

<details>
<summary>Table 272 - cc_type_detail (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W2 type client | W | Alpha |
| D | v.type client | W | Alpha |
| P | W0 type operation | W | Alpha |

</details>

<details>
<summary>Table 48 - lignes_de_solde__sld (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| E | P0 solde | W | Numeric |
| F | P0 date limite solde | W | Date |

</details>

<details>
<summary>Table 271 - cc_total (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 298 - participants_____par (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 29 - voyages__________voy (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 19 - bl_detail (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 38 - comptable_gratuite (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| F | W2 date comptable | W | Date |

</details>

<details>
<summary>Table 358 - import_mod (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 42 - depot_devises____dda (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 366 - pms_print_param (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 301 - details_partici__dpa (**W**) - 3 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 148 - lignes_de_solde__sld (**W**) - 3 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| E | P0 solde | W | Numeric |
| F | P0 date limite solde | W | Date |

</details>

<details>
<summary>Table 43 - solde_devises____sda (**W**) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| E | P0 solde | W | Numeric |
| F | P0 date limite solde | W | Date |

</details>

<details>
<summary>Table 263 - vente (**W**) - 2 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 382 - pv_discount_reasons (**W**) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 171 - commentaire______com (**W**) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 285 - email (**W**) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 804 - valeur_credit_bar_defaut (**W**) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 36 - client_gm (**W**) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | W2 type client | W | Alpha |
| D | v.type client | W | Alpha |

</details>

<details>
<summary>Table 93 - vendeurs_________ven (**W**) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 1059 - Table_1059 (**W**) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| F | W2 date comptable | W | Date |

</details>

<details>
<summary>Table 167 - troncon__________tro (**W**) - 1 usages</summary>

*Table utilisee uniquement en Link ou aucune colonne Real identifiee dans le DataView.*

</details>

<details>
<summary>Table 342 - histo__fusionseparation_log (R/L) - 2 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| BA | W0 chrono histo | R | Numeric |
| K | P0.Chrono histo sans interface | R | Numeric |

</details>

<details>
<summary>Table 70 - date_comptable___dat (R) - 1 usages</summary>

| Lettre | Variable | Acces | Type |
|--------|----------|-------|------|
| A | P0 societe | R | Alpha |
| B | P0 code GM | R | Numeric |
| C | P0 filiation | R | Numeric |
| D | P0 masque montant | R | Alpha |
| E | P0 solde | R | Numeric |
| F | P0 date limite solde | R | Date |
| G | P0 nom village | R | Alpha |
| H | P0 Bilateral | R | Alpha |
| I | P0 Reprise Auto | R | Logical |
| J | P0.Sans interface | R | Logical |
| K | P0.Chrono histo sans interface | R | Numeric |
| L | W0 imprimante | R | Numeric |
| M | W0 reseau | R | Alpha |
| N | W0 validation | R | Alpha |
| O | W0 filiation libre | R | Numeric |
| P | W0 type operation | R | Alpha |
| Q | W0 date operation | R | Date |
| R | W0 heure operation | R | Time |
| S | W0 qualite compte | R | Alpha |
| T | W0 fin tache | R | Alpha |
| U | W0 Existe ecriture | R | Logical |
| V | W0 normal | R | Logical |
| W | W0 reprise | R | Logical |
| X | W0 chrono reprise | R | Numeric |
| Y | W0 toDo | R | Logical |
| Z | W0 Log | R | Logical |
| BA | W0 chrono histo | R | Numeric |
| BB | W0 code LOG existe | R | Logical |
| BC | W0 chrono du LOG | R | Numeric |
| BD | W0 reprise confirmee | R | Numeric |
| BE | W0 Compte garantie à conserver | R | Numeric |
| BF | W0 Filiation garantie à conserv | R | Numeric |
| BG | W0 Garantie Club à conserver? | R | Logical |
| BH | W0 Compte utilisé modifié? | R | Logical |
| BI | W0 Compte remplace à la sortie | R | Numeric |
| BJ | W0 Filiiation remplace à la sor | R | Numeric |

</details>

## 11. VARIABLES

### 11.1 Parametres entrants (11)

Variables recues du programme appelant ([Menu changement compte (IDE 37)](ADH-IDE-37.md)).

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| A | P0 societe | Alpha | 1x parametre entrant |
| B | P0 code GM | Numeric | 1x parametre entrant |
| C | P0 filiation | Numeric | [T14](#t14), [T15](#t15) |
| D | P0 masque montant | Alpha | - |
| E | P0 solde | Numeric | - |
| F | P0 date limite solde | Date | - |
| G | P0 nom village | Alpha | - |
| H | P0 Bilateral | Alpha | - |
| I | P0 Reprise Auto | Logical | [T180](#t180), [T185](#t185) |
| J | P0.Sans interface | Logical | 1x parametre entrant |
| K | P0.Chrono histo sans interface | Numeric | - |

### 11.2 Variables de travail (25)

Variables internes au programme.

| Lettre | Nom | Type | Usage dans |
|--------|-----|------|-----------|
| L | W0 imprimante | Numeric | - |
| M | W0 reseau | Alpha | [T5](#t5), [T175](#t175) |
| N | W0 validation | Alpha | [T12](#t12) |
| O | W0 filiation libre | Numeric | - |
| P | W0 type operation | Alpha | - |
| Q | W0 date operation | Date | - |
| R | W0 heure operation | Time | - |
| S | W0 qualite compte | Alpha | - |
| T | W0 fin tache | Alpha | - |
| U | W0 Existe ecriture | Logical | - |
| V | W0 normal | Logical | - |
| W | W0 reprise | Logical | - |
| X | W0 chrono reprise | Numeric | - |
| Y | W0 toDo | Logical | - |
| Z | W0 Log | Logical | - |
| BA | W0 chrono histo | Numeric | - |
| BB | W0 code LOG existe | Logical | - |
| BC | W0 chrono du LOG | Numeric | - |
| BD | W0 reprise confirmee | Numeric | - |
| BE | W0 Compte garantie à conserver | Numeric | - |
| BF | W0 Filiation garantie à conserv | Numeric | - |
| BG | W0 Garantie Club à conserver? | Logical | - |
| BH | W0 Compte utilisé modifié? | Logical | - |
| BI | W0 Compte remplace à la sortie | Numeric | - |
| BJ | W0 Filiiation remplace à la sor | Numeric | - |

<details>
<summary>Toutes les 36 variables (liste complete)</summary>

| Cat | Lettre | Nom Variable | Type |
|-----|--------|--------------|------|
| P0 | **A** | P0 societe | Alpha |
| P0 | **B** | P0 code GM | Numeric |
| P0 | **C** | P0 filiation | Numeric |
| P0 | **D** | P0 masque montant | Alpha |
| P0 | **E** | P0 solde | Numeric |
| P0 | **F** | P0 date limite solde | Date |
| P0 | **G** | P0 nom village | Alpha |
| P0 | **H** | P0 Bilateral | Alpha |
| P0 | **I** | P0 Reprise Auto | Logical |
| P0 | **J** | P0.Sans interface | Logical |
| P0 | **K** | P0.Chrono histo sans interface | Numeric |
| W0 | **L** | W0 imprimante | Numeric |
| W0 | **M** | W0 reseau | Alpha |
| W0 | **N** | W0 validation | Alpha |
| W0 | **O** | W0 filiation libre | Numeric |
| W0 | **P** | W0 type operation | Alpha |
| W0 | **Q** | W0 date operation | Date |
| W0 | **R** | W0 heure operation | Time |
| W0 | **S** | W0 qualite compte | Alpha |
| W0 | **T** | W0 fin tache | Alpha |
| W0 | **U** | W0 Existe ecriture | Logical |
| W0 | **V** | W0 normal | Logical |
| W0 | **W** | W0 reprise | Logical |
| W0 | **X** | W0 chrono reprise | Numeric |
| W0 | **Y** | W0 toDo | Logical |
| W0 | **Z** | W0 Log | Logical |
| W0 | **BA** | W0 chrono histo | Numeric |
| W0 | **BB** | W0 code LOG existe | Logical |
| W0 | **BC** | W0 chrono du LOG | Numeric |
| W0 | **BD** | W0 reprise confirmee | Numeric |
| W0 | **BE** | W0 Compte garantie à conserver | Numeric |
| W0 | **BF** | W0 Filiation garantie à conserv | Numeric |
| W0 | **BG** | W0 Garantie Club à conserver? | Logical |
| W0 | **BH** | W0 Compte utilisé modifié? | Logical |
| W0 | **BI** | W0 Compte remplace à la sortie | Numeric |
| W0 | **BJ** | W0 Filiiation remplace à la sor | Numeric |

</details>

## 12. EXPRESSIONS

**81 / 81 expressions decodees (100%)**

### 12.1 Repartition par type

| Type | Expressions | Regles |
|------|-------------|--------|
| CONDITION | 7 | 5 |
| CAST_LOGIQUE | 5 | 5 |
| CONSTANTE | 48 | 0 |
| DATE | 1 | 0 |
| OTHER | 13 | 0 |
| NEGATION | 5 | 0 |
| REFERENCE_VG | 2 | 0 |

### 12.2 Expressions cles par type

#### CONDITION (7 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONDITION | 57 | `IF ([AF],IF ([AD],'RETRY','DONE'),'PASSED')` | [RM-001](#rm-RM-001) |
| CONDITION | 6 | `[AA]='F'` | - |
| CONDITION | 7 | `[AA]<>'F'` | - |
| CONDITION | 71 | `[AK]=6 OR P0 Reprise Auto [I]` | - |
| CONDITION | 2 | `W0 reseau [M]<>'R'` | - |
| ... | | *+2 autres* | |

#### CAST_LOGIQUE (5 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CAST_LOGIQUE | 72 | `IF ([AD],ExpCalc('71'EXP),'TRUE'LOG)` | [RM-002](#rm-RM-002) |
| CAST_LOGIQUE | 69 | `'TRUE'LOG` | - |
| CAST_LOGIQUE | 70 | `'FALSE'LOG` | - |
| CAST_LOGIQUE | 19 | `'FALSE'LOG` | - |
| CAST_LOGIQUE | 59 | `'TRUE'LOG` | - |

#### CONSTANTE (48 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| CONSTANTE | 49 | `'2T/10 - Traitement des Fichiers'` | - |
| CONSTANTE | 48 | `'1F/30 - Selection des GM'` | - |
| CONSTANTE | 47 | `'1F/20 - Blocage Compte Reference'` | - |
| CONSTANTE | 52 | `'3E/30 - Date Solde Compte Reference'` | - |
| CONSTANTE | 51 | `'3E/20 - Edition du Ticket'` | - |
| ... | | *+43 autres* | |

#### DATE (1 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| DATE | 9 | `Date ()` | - |

#### OTHER (13 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| OTHER | 75 | `P0.Chrono histo sans i... [K]` | - |
| OTHER | 73 | `NOT(P0 Reprise Auto [I])` | - |
| OTHER | 32 | `[AG]` | - |
| OTHER | 80 | `[AQ]` | - |
| OTHER | 79 | `[AP]` | - |
| ... | | *+8 autres* | |

#### NEGATION (5 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| NEGATION | 74 | `NOT P0.Sans interface [J]` | - |
| NEGATION | 76 | `NOT VG78` | - |
| NEGATION | 68 | `NOT ([AI])` | - |
| NEGATION | 15 | `NOT ([AB])` | - |
| NEGATION | 60 | `NOT ([AD])` | - |

#### REFERENCE_VG (2 expressions)

| Type | IDE | Expression | Regle |
|------|-----|------------|-------|
| REFERENCE_VG | 81 | `VG95` | - |
| REFERENCE_VG | 77 | `VG78` | - |

### 12.3 Toutes les expressions (81)

<details>
<summary>Voir les 81 expressions</summary>

#### CONDITION (7)

| IDE | Expression Decodee |
|-----|-------------------|
| 57 | `IF ([AF],IF ([AD],'RETRY','DONE'),'PASSED')` |
| 2 | `W0 reseau [M]<>'R'` |
| 3 | `W0 validation [N]='V'` |
| 4 | `W0 validation [N]<>'V'` |
| 6 | `[AA]='F'` |
| 7 | `[AA]<>'F'` |
| 71 | `[AK]=6 OR P0 Reprise Auto [I]` |

#### CAST_LOGIQUE (5)

| IDE | Expression Decodee |
|-----|-------------------|
| 72 | `IF ([AD],ExpCalc('71'EXP),'TRUE'LOG)` |
| 19 | `'FALSE'LOG` |
| 59 | `'TRUE'LOG` |
| 69 | `'TRUE'LOG` |
| 70 | `'FALSE'LOG` |

#### CONSTANTE (48)

| IDE | Expression Decodee |
|-----|-------------------|
| 5 | `'F'` |
| 8 | `'F'` |
| 13 | `28` |
| 16 | `''` |
| 17 | `0` |
| 18 | `'MERGE'` |
| 22 | `0` |
| 23 | `'1F'` |
| 24 | `'2T'` |
| 25 | `'3E'` |
| 26 | `10` |
| 27 | `20` |
| 28 | `30` |
| 29 | `40` |
| 30 | `50` |
| 31 | `60` |
| 33 | `'00/00'` |
| 34 | `'1F/10'` |
| 35 | `'1F/20'` |
| 36 | `'1F/30'` |
| 37 | `'2T/10'` |
| 38 | `'3E/10'` |
| 39 | `'3E/20'` |
| 40 | `'3E/30'` |
| 41 | `'3E/40'` |
| 42 | `'3E/50'` |
| 43 | `'3E/60'` |
| 44 | `'99/99'` |
| 45 | `'00/00 - Debut Fusion'` |
| 46 | `'1F/10 - Blocage Clôture'` |
| 47 | `'1F/20 - Blocage Compte Reference'` |
| 48 | `'1F/30 - Selection des GM'` |
| 49 | `'2T/10 - Traitement des Fichiers'` |
| 50 | `'3E/10 - Calcul Compte GM'` |
| 51 | `'3E/20 - Edition du Ticket'` |
| 52 | `'3E/30 - Date Solde Compte Reference'` |
| 53 | `'3E/40 - Deblocage GM non valide'` |
| 54 | `'3E/50 - Deblocage Compte Reference'` |
| 55 | `'3E/60 - Deblocage Clôture'` |
| 56 | `'99/99 - Fin Fusion'` |
| 58 | `'DONE'` |
| 61 | `'DATEHEURE'` |
| 62 | `'UPDFIRST'` |
| 63 | `'UPDTABLE'` |
| 64 | `'UPDEND'` |
| 65 | `'FIN'` |
| 66 | `''` |
| 67 | `0` |

#### DATE (1)

| IDE | Expression Decodee |
|-----|-------------------|
| 9 | `Date ()` |

#### OTHER (13)

| IDE | Expression Decodee |
|-----|-------------------|
| 1 | `P0 societe [A]` |
| 10 | `Time ()` |
| 11 | `P0 code GM [B]` |
| 12 | `P0 filiation [C]` |
| 14 | `[AB]` |
| 20 | `[AD]` |
| 21 | `[AF]` |
| 32 | `[AG]` |
| 73 | `NOT(P0 Reprise Auto [I])` |
| 75 | `P0.Chrono histo sans i... [K]` |
| 78 | `[AO]` |
| 79 | `[AP]` |
| 80 | `[AQ]` |

#### NEGATION (5)

| IDE | Expression Decodee |
|-----|-------------------|
| 15 | `NOT ([AB])` |
| 60 | `NOT ([AD])` |
| 68 | `NOT ([AI])` |
| 74 | `NOT P0.Sans interface [J]` |
| 76 | `NOT VG78` |

#### REFERENCE_VG (2)

| IDE | Expression Decodee |
|-----|-------------------|
| 77 | `VG78` |
| 81 | `VG95` |

</details>

<!-- TAB:Connexions -->

## 13. GRAPHE D'APPELS

### 13.1 Chaine depuis Main (Callers)

Main -> ... -> [Menu changement compte (IDE 37)](ADH-IDE-37.md) -> **Fusion (IDE 28)**

```mermaid
graph LR
    T28[28 Fusion]
    style T28 fill:#58a6ff
    CC1[1 Main Program]
    style CC1 fill:#8b5cf6
    CC163[163 Menu caisse GM - s...]
    style CC163 fill:#f59e0b
    CC37[37 Menu changement compte]
    style CC37 fill:#3fb950
    CC163 --> CC37
    CC1 --> CC163
    CC37 --> T28
```

### 13.2 Callers

| IDE | Nom Programme | Nb Appels |
|-----|---------------|-----------|
| [37](ADH-IDE-37.md) | Menu changement compte | 1 |

### 13.3 Callees (programmes appeles)

```mermaid
graph LR
    T28[28 Fusion]
    style T28 fill:#58a6ff
    C35[35 Write histo_Fus_Sep...]
    T28 --> C35
    style C35 fill:#3fb950
    C30[30 Read histo Fus_Sep_Det]
    T28 --> C30
    style C30 fill:#3fb950
    C31[31 Write histo_Fus_Sep...]
    T28 --> C31
    style C31 fill:#3fb950
    C29[29 Write histo Fus_Sep]
    T28 --> C29
    style C29 fill:#3fb950
    C32[32 Write histo_Fus_Sep...]
    T28 --> C32
    style C32 fill:#3fb950
    C33[33 Delete histo_Fus_Se...]
    T28 --> C33
    style C33 fill:#3fb950
    C43[43 Recuperation du titre]
    T28 --> C43
    style C43 fill:#3fb950
    C34[34 Read histo_Fus_Sep_Log]
    T28 --> C34
    style C34 fill:#3fb950
    C36[36 Print Separation ou...]
    T28 --> C36
    style C36 fill:#3fb950
    C179[179 Get Printer]
    T28 --> C179
    style C179 fill:#3fb950
    C180[180 Printer choice]
    T28 --> C180
    style C180 fill:#3fb950
    C181[181 Set Listing Number]
    T28 --> C181
    style C181 fill:#3fb950
    C182[182 Raz Current Printer]
    T28 --> C182
    style C182 fill:#3fb950
```

### 13.4 Detail Callees avec contexte

| IDE | Nom Programme | Appels | Contexte |
|-----|---------------|--------|----------|
| [35](ADH-IDE-35.md) | Write histo_Fus_Sep_Log | 13 | Historique/consultation |
| [30](ADH-IDE-30.md) | Read histo Fus_Sep_Det | 10 | Historique/consultation |
| [31](ADH-IDE-31.md) | Write histo_Fus_Sep_Det | 10 | Historique/consultation |
| [29](ADH-IDE-29.md) | Write histo Fus_Sep | 6 | Historique/consultation |
| [32](ADH-IDE-32.md) | Write histo_Fus_Sep_Saisie | 4 | Historique/consultation |
| [33](ADH-IDE-33.md) | Delete histo_Fus_Sep_Saisie | 2 | Historique/consultation |
| [43](ADH-IDE-43.md) | Recuperation du titre | 2 | Recuperation donnees |
| [34](ADH-IDE-34.md) | Read histo_Fus_Sep_Log | 1 | Historique/consultation |
| [36](ADH-IDE-36.md) | Print Separation ou fusion | 1 | Impression ticket/document |
| [179](ADH-IDE-179.md) | Get Printer | 1 | Impression ticket/document |
| [180](ADH-IDE-180.md) | Printer choice | 1 | Impression ticket/document |
| [181](ADH-IDE-181.md) | Set Listing Number | 1 | Configuration impression |
| [182](ADH-IDE-182.md) | Raz Current Printer | 1 | Impression ticket/document |

## 14. RECOMMANDATIONS MIGRATION

### 14.1 Profil du programme

| Metrique | Valeur | Impact migration |
|----------|--------|-----------------|
| Lignes de logique | 3494 | Programme volumineux |
| Expressions | 81 | Logique moderee |
| Tables WRITE | 60 | Fort impact donnees |
| Sous-programmes | 13 | Forte dependance |
| Ecrans visibles | 11 | Interface complexe multi-ecrans |
| Code desactive | 0.1% (3 / 3494) | Code sain |
| Regles metier | 2 | Quelques regles a preserver |

### 14.2 Plan de migration par bloc

#### Traitement (131 taches: 66 ecrans, 65 traitements)

- **Strategie** : Orchestrateur avec 66 ecrans (Razor/React) et 65 traitements backend (services).
- Les ecrans deviennent des composants UI, les traitements invisibles deviennent des services injectables.
- 13 sous-programme(s) a migrer ou a reutiliser depuis les services existants.
- Decomposer les taches en services unitaires testables.

#### Consultation (4 taches: 3 ecrans, 1 traitement)

- **Strategie** : Composants de recherche/selection en modales.
- 3 ecrans : Selection GM, Recherche d'un GM, Choix de la garantie

#### Calcul (8 taches: 2 ecrans, 6 traitements)

- **Strategie** : Services de calcul purs (Domain Services).
- Migrer la logique de calcul (stock, compteurs, montants)

#### Validation (1 tache: 1 ecran, 0 traitement)

- **Strategie** : FluentValidation avec validators specifiques.
- Chaque tache de validation -> un validator injectable

#### Creation (47 taches: 1 ecran, 46 traitements)

- **Strategie** : Repository pattern avec Entity Framework Core.
- Insertion via `IRepository<T>.CreateAsync()`

#### Saisie (1 tache: 1 ecran, 0 traitement)

- **Strategie** : Formulaire React/Blazor avec validation Zod/FluentValidation.
- Reproduire 1 ecran : Traitement CHG vente
- Validation temps reel cote client + serveur

### 14.3 Dependances critiques

| Dependance | Type | Appels | Impact |
|------------|------|--------|--------|
| transac_entete_bar | Table WRITE (Database) | 3x | Schema + repository |
| bl_detail | Table WRITE (Database) | 3x | Schema + repository |
| reseau_cloture___rec | Table WRITE (Database) | 4x | Schema + repository |
| voyages__________voy | Table WRITE (Database) | 3x | Schema + repository |
| gm-recherche_____gmr | Table WRITE (Database) | 1x | Schema + repository |
| gm-complet_______gmc | Table WRITE (Database) | 1x | Schema + repository |
| prestations | Table WRITE (Database) | 2x | Schema + repository |
| prestations______pre | Table WRITE (Database) | 2x | Schema + repository |
| hebergement______heb | Table WRITE (Database) | 3x | Schema + repository |
| personnel_go______go | Table WRITE (Database) | 1x | Schema + repository |
| client_gm | Table WRITE (Database) | 1x | Schema + repository |
| commentaire_gm_________acc | Table WRITE (Database) | 2x | Schema + repository |
| comptable_gratuite | Table WRITE (Database) | 3x | Schema + repository |
| depot_garantie___dga | Table WRITE (Database) | 2x | Schema + repository |
| comptable________cte | Table WRITE (Database) | 2x | Schema + repository |
| depot_objets_____doa | Table WRITE (Database) | 3x | Schema + repository |
| depot_devises____dda | Table WRITE (Database) | 3x | Schema + repository |
| solde_devises____sda | Table WRITE (Database) | 2x | Schema + repository |
| change___________chg | Table WRITE (Database) | 1x | Schema + repository |
| mvt_prestation___mpr | Table WRITE (Database) | 2x | Schema + repository |
| compte_gm________cgm | Table WRITE (Database) | 11x | Schema + repository |
| lignes_de_solde__sld | Table WRITE (Database) | 3x | Schema + repository |
| fusion_eclatementfec | Table WRITE (Database) | 3x | Schema + repository |
| gratuites________gra | Table WRITE (Database) | 2x | Schema + repository |
| codes_autocom____aut | Table WRITE (Database) | 1x | Schema + repository |
| vendeurs_________ven | Table WRITE (Database) | 1x | Schema + repository |
| fichier_messagerie | Table WRITE (Database) | 1x | Schema + repository |
| fichier_validation | Table WRITE (Database) | 2x | Schema + repository |
| fichier_histotel | Table WRITE (Database) | 2x | Schema + repository |
| change_vente_____chg | Table WRITE (Database) | 1x | Schema + repository |
| lignes_de_solde__sld | Table WRITE (Database) | 3x | Schema + repository |
| troncon__________tro | Table WRITE (Database) | 1x | Schema + repository |
| heb_circuit______hci | Table WRITE (Database) | 3x | Schema + repository |
| commentaire______com | Table WRITE (Database) | 1x | Schema + repository |
| vente | Table WRITE (Database) | 2x | Schema + repository |
| cc_comptable | Table WRITE (Database) | 4x | Schema + repository |
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
| histo_fusionseparation_saisie | Table WRITE (Database) | 1x | Schema + repository |
| import_mod | Table WRITE (Database) | 3x | Schema + repository |
| pms_print_param | Table WRITE (Database) | 3x | Schema + repository |
| pv_discount_reasons | Table WRITE (Database) | 1x | Schema + repository |
| heure_de_passage | Table WRITE (Database) | 3x | Schema + repository |
| qualite_avant_reprise | Table WRITE (Database) | 1x | Schema + repository |
| valeur_credit_bar_defaut | Table WRITE (Database) | 1x | Schema + repository |
| vente_par_moyen_paiement | Table WRITE (Database) | 2x | Schema + repository |
| plafond_lit | Table WRITE (Database) | 2x | Schema + repository |
| import_go_erreur_affection | Table WRITE (Database) | 2x | Schema + repository |
| tpe_par_terminal | Table WRITE (Database) | 2x | Schema + repository |
| ##_pv_customer_dat | Table WRITE (Database) | 2x | Schema + repository |
| Table_947 | Table WRITE (Memory) | 3x | Schema + repository |
| Table_1059 | Table WRITE (Memory) | 1x | Schema + repository |
| [Write histo_Fus_Sep_Log (IDE 35)](ADH-IDE-35.md) | Sous-programme | 13x | **CRITIQUE** - Historique/consultation |
| [Write histo_Fus_Sep_Det (IDE 31)](ADH-IDE-31.md) | Sous-programme | 10x | **CRITIQUE** - Historique/consultation |
| [Read histo Fus_Sep_Det (IDE 30)](ADH-IDE-30.md) | Sous-programme | 10x | **CRITIQUE** - Historique/consultation |
| [Write histo Fus_Sep (IDE 29)](ADH-IDE-29.md) | Sous-programme | 6x | **CRITIQUE** - Historique/consultation |
| [Write histo_Fus_Sep_Saisie (IDE 32)](ADH-IDE-32.md) | Sous-programme | 4x | **CRITIQUE** - Historique/consultation |
| [Recuperation du titre (IDE 43)](ADH-IDE-43.md) | Sous-programme | 2x | Haute - Recuperation donnees |
| [Delete histo_Fus_Sep_Saisie (IDE 33)](ADH-IDE-33.md) | Sous-programme | 2x | Haute - Historique/consultation |
| [Printer choice (IDE 180)](ADH-IDE-180.md) | Sous-programme | 1x | Normale - Impression ticket/document |
| [Set Listing Number (IDE 181)](ADH-IDE-181.md) | Sous-programme | 1x | Normale - Configuration impression |
| [Raz Current Printer (IDE 182)](ADH-IDE-182.md) | Sous-programme | 1x | Normale - Impression ticket/document |

---
*Spec DETAILED generee par Pipeline V7.2 - 2026-02-07 13:04*

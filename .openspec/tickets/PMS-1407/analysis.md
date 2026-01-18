# PMS-1407 - Validation automatique Back Office

## Informations Jira

| Champ | Valeur |
|-------|--------|
| **Titre** | [Back Office] impossible de valider en automatique |
| **Type** | Bug |
| **Priorite** | Basse |
| **Statut** | En cours |
| **Reporter** | Jessica Palermo |
| **Cree** | 2025-11-13 |

## Description

Regression: lorsque le valide en automatique, je dois pouvoir valider des GM qui sont en arrivee par VV et par vol. Cela n'est plus possible.

## Analyse Magic IDE

### Programme principal

| Projet | IDE | Nom | Public Name |
|--------|-----|-----|-------------|
| PBG | 121 | Validation Auto filiations | VALID_AUTO_FILIATION |

### Arborescence des taches

```
PBG IDE 121 - Validation Auto filiations
├── 121.1 - Verif Logement et Vol        ← Point de verification VV/Vol
├── 121.2 - Creation VV Aller
├── 121.3 - Creation VV retour
├── 121.4 - Zoom Village/Village
└── 121.5 - Validation Arrivee
    ├── 121.5.1 - Marquage Periodes
    ├── 121.5.2 - Marquage Periodes Circuit
    ├── 121.5.3 - Marquage Recherche
    ├── 121.5.4 - Marquage Validation
    ├── 121.5.5 - Creation Historique
    └── 121.5.6 - Creation Specif Greque
```

### Hypothese

Le bug se situe probablement dans **Tache 121.1 - Verif Logement et Vol** qui bloque la validation si les conditions VV/Vol ne sont pas remplies.

## Pistes d'investigation

1. Analyser la logique de **Tache 121.1** pour comprendre les conditions de validation
2. Verifier si une modification recente a change les regles de verification
3. Comparer avec le comportement attendu (valider par VV OU par vol)

## Statut

- [x] Ticket fetche depuis Jira
- [x] Programme Magic identifie
- [x] Diagnostic initial : **NON REGRESSION**

---

## MISE A JOUR 2026-01-18

### Diagnostic d'Alan Lecorre (17/11/2025)

> "Cela fonctionne sur le serveur mais pas en local car tu as surement un Magic.ini avec une mauvaise configuration. **Ce n'est pas une régression**."

### Suivi (24/12/2025)

> "Il va falloir qu'on regarde ceci ensemble car j'ai refait le test chez moi qu'on avait fait ensemble et c'est OK."

### Conclusion

| Element | Statut |
|---------|--------|
| Bug dans le code | ❌ **NON** - Fonctionne sur serveur |
| Problème Magic.ini local | ✅ **OUI** - Config manquante/incorrecte |
| Action requise | Vérifier Magic.ini avec Jessica |

### Configuration Magic.ini à vérifier

Sections susceptibles d'affecter la validation automatique :
- `[MAGIC_ENV]` - Variables d'environnement
- `[MAGIC_DATABASES]` - Connexions base de données
- `[MAGIC_SERVERS]` - Configuration serveurs

### Prochaine action

⏸️ **En attente** - Retest avec Jessica pour identifier la différence de config entre son poste et le serveur.

---

*Derniere mise a jour: 2026-01-18*
*Status: EN ATTENTE - Problème de configuration locale, pas de bug code*

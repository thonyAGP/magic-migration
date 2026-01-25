# Pattern: Fausse regression (config Magic.ini locale)

> **Source**: PMS-1407
> **Domaine**: Configuration / Environnement
> **Type**: Non-bug (fausse alerte)

---

## Symptomes typiques

- "Ca ne marche plus chez moi"
- "Regression" signalée par un utilisateur
- Fonctionne sur serveur, pas en local
- Comportement different entre postes

---

## Detection

### Mots-cles dans le ticket
- "regression"
- "ne fonctionne plus"
- "impossible de"
- "marche pas"
- "validation auto"
- "chez moi"

### Questions a poser
1. Ca fonctionne sur le serveur de recette/prod ?
2. Depuis quand ca ne marche plus ?
3. Autre poste a le meme probleme ?

---

## Cause racine typique

| Element | Valeur |
|---------|--------|
| Zone | Configuration locale |
| Fichier | Magic.ini ou .opt |
| Erreur | Parametre local different du serveur |
| Exemple | Path, mode debug, variable env |

### Fichiers de config Magic

| Fichier | Emplacement | Contenu |
|---------|-------------|---------|
| Magic.ini | Dossier Magic | Config globale application |
| *.opt | Projet Magic | Options specifiques projet |
| ProgramOptions | Par programme | Options runtime |

---

## Solution type

### Etape 1: Confirmer que c'est local

```
1. Tester sur serveur recette -> Fonctionne ?
2. Tester sur autre poste dev -> Fonctionne ?
3. Si OUI aux deux -> Probleme local confirme
```

### Etape 2: Comparer configs

| Action | Commande |
|--------|----------|
| Diff Magic.ini | `diff local/Magic.ini server/Magic.ini` |
| Verifier .opt | Comparer fichiers .opt du projet |
| Variables env | Comparer %MAGIC% et paths |

### Etape 3: Restaurer config

- Copier Magic.ini du serveur
- Ou regenerer depuis installation propre
- Ne PAS modifier le code source

---

## Resolution

**Ce n'est PAS une regression logicielle.**

| Action | Responsable |
|--------|-------------|
| Documenter la non-regression | Dev |
| Fournir config correcte | Dev |
| Appliquer config | Utilisateur |
| Fermer ticket comme "resolved" | Support |

---

## Cas PMS-1407 specifique

**Contexte**: Validation automatique Back Office

| Element | Valeur |
|---------|--------|
| Programme | **PBG IDE 121** - VALID_AUTO_FILIATION |
| Symptome | Impossible de valider arrivees VV/Vol |
| Diagnostic | Fonctionne sur serveur, pas en local |
| Cause | Magic.ini local mal configure |
| Resolution | Copier Magic.ini du serveur |

### Commentaire resolution

> "Cela fonctionne sur le serveur mais pas en local car tu as surement un Magic.ini avec une mauvaise configuration. **Ce n'est pas une regression**." - Alan Lecorre

---

## Checklist resolution

- [ ] Teste sur serveur (doit fonctionner)
- [ ] Teste sur autre poste (doit fonctionner)
- [ ] Compare configs locale vs serveur
- [ ] Documente la difference trouvee
- [ ] Fourni config correcte a l'utilisateur
- [ ] Marque comme "Non-regression" dans Jira

---

*Pattern capitalise le 2026-01-25*
*Source: PMS-1407 (Recette OK - 2026-01-19)*

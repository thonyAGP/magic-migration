# Methodologie de Verification des Programmes Orphelins

> Document de reference pour valider si un programme Magic est orphelin ou actif

---

## Principe Fondamental

**Le nom du dossier (ex: "Suppr") SUGGERE mais NE PROUVE PAS qu'un programme est orphelin.**

**SEULE l'absence de callers (appels entrants) PROUVE qu'un programme est orphelin.**

---

## Methodologie de Verification

### Etape 1: Identifier le fichier XML

```
IDE Position → Progs.xml → Program id → Prg_XXX.xml
```

**Attention au mapping:** L'IDE position dans Progs.xml peut differer du numero Prg_XXX.xml

### Etape 2: Rechercher les callers

```powershell
# Chercher TaskID obj="XXX" ou XXX est l'id du programme
grep -r 'TaskID.*obj="XXX"' Source/
```

**CallTask avec TaskID obj="NNN"** = appel au programme NNN

### Etape 3: Verifier le PublicName

```powershell
# Dans ProgramHeaders.xml
grep -A5 'ISN="XXX"' Source/ProgramHeaders.xml
```

Si `<PublicName>` existe → programme callable par `ProgIdx('nom')` → NON ORPHELIN

### Etape 4: Verifier l'appartenance ECF

Programmes dans les composants partages (ADH.ecf, REF.ecf) sont appelables depuis d'autres projets.

### Etape 5: Classifier les callers

| Type | Dossier | Compte comme actif |
|------|---------|-------------------|
| Caller actif | Ventes, Menus, etc. | **OUI** |
| Caller orphelin | Suppr | **NON** |

---

## Criteres de Decision

| Situation | Conclusion |
|-----------|------------|
| >= 1 caller actif | **NON ORPHELIN** |
| PublicName existe | **NON ORPHELIN** |
| Dans ECF partage | **POTENTIELLEMENT ACTIF** (verifier cross-projet) |
| 0 callers ET pas de PublicName ET pas dans ECF | **ORPHELIN CONFIRME** |

---

## Exemple: ADH IDE 236 et 237

### ADH IDE 236 (Prg_232.xml)

**Recherche:** `grep -r 'TaskID.*obj="232"' Source/`

**Resultat:**
- Prg_239.xml (ADH IDE 243) - 2 appels
- Prg_234.xml (ADH IDE 238) - 4 appels
- Prg_240.xml (ADH IDE 244) - 2 appels
- Prg_241.xml (ADH IDE 245) - 2 appels

**Conclusion:** 4 callers actifs → **NON ORPHELIN**

### ADH IDE 237 (Prg_233.xml)

**Recherche:** `grep -r 'TaskID.*obj="233"' Source/`

**Resultat:**
- Prg_162.xml (ADH IDE 166) - 1 appel (Menus)
- Prg_238.xml (ADH IDE 242) - 1 appel (Ventes)
- Prg_313.xml (ADH IDE 317) - 1 appel (**Suppr** - ne compte pas)

**Conclusion:** 2 callers actifs → **NON ORPHELIN**

---

## Erreurs Courantes a Eviter

1. **Confondre FlowIsn et TaskID**
   - FlowIsn = numero de ligne interne
   - TaskID obj = programme appele

2. **Confondre IDE position et Prg_XXX**
   - IDE 236 peut correspondre a Prg_232.xml

3. **Se fier au nom du dossier**
   - Dossier "Suppr" = indice, pas preuve

4. **Ignorer les ECF partages**
   - Programme peut etre appele depuis un autre projet

---

*Document cree le 2026-01-26*

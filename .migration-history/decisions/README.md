# Migration Decisions

> Documentation des décisions techniques prises lors de la migration

---

## Objectif

Historiser **pourquoi** une décision a été prise, pas seulement **quoi**.

---

## Quand créer une décision

Créer un fichier de décision quand:
- ✅ Choix entre plusieurs approches techniques (ex: Zustand vs Redux)
- ✅ Pattern de migration choisi pour un type de code Magic
- ✅ Architecture d'un module important
- ✅ Décision qui affecte plusieurs programmes

Ne PAS créer pour:
- ❌ Changements mineurs (typo, refactor simple)
- ❌ Décisions évidentes (eslint config, prettier)
- ❌ Implémentations directes sans alternatives

---

## Format

Nom de fichier: `YYYY-MM-DD-titre-court.md`

Utiliser le template: `TEMPLATE.md`

---

## Exemples

### Bonnes décisions à documenter

- `2026-02-24-validation-zod-vs-yup.md` - Pourquoi Zod choisi pour validation
- `2026-02-24-error-handling-pattern.md` - Comment gérer les erreurs Magic
- `2026-02-24-state-management-zustand.md` - Pourquoi Zustand pour state global
- `2026-02-24-table-mapping-strategy.md` - Comment mapper tables Magic → Prisma

### Mauvaises décisions (ne pas documenter)

- `2026-02-24-renamed-variable.md` - Trop trivial
- `2026-02-24-added-console-log.md` - Changement temporaire
- `2026-02-24-prettier-config.md` - Standard, pas une décision

---

## Recherche

```bash
# Chercher une décision par mot-clé
grep -r "validation" .migration-history/decisions/

# Lister toutes les décisions
ls -1 .migration-history/decisions/*.md | grep -v TEMPLATE | grep -v README
```

---

## Workflow

1. **Créer** depuis template
   ```bash
   cp .migration-history/decisions/TEMPLATE.md \
      .migration-history/decisions/$(date +%Y-%m-%d)-mon-choix.md
   ```

2. **Remplir** les sections (Context, Options, Decision, Why, Test Coverage, Applied To)

3. **Commiter** avec le code concerné
   ```bash
   git add .migration-history/decisions/2026-02-24-mon-choix.md src/
   git commit -m "feat(migration): implement XXX pattern"
   ```

4. **Référencer** dans les PR reviews et docs

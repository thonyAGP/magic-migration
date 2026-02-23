import { describe, it, expect } from 'vitest';
import { parseSpecContent } from '../src/generators/spec-parser.js';

const MINIMAL_SPEC = `# ADH IDE 237 - Vente Gift Pass

| Element | Valeur |
|---------|--------|
| Taches | 3 |
| Tables modifiees | 2 |
| Expressions | 45 |
| Programmes appeles | 4 |
`;

const RULES_SPEC = `# ADH IDE 237 - Vente Gift Pass

## 5. REGLES METIER

#### <a id="rm-001"></a>[RM-001] Verifier solde disponible
| Element | Detail |
|---------|--------|
| **Condition** | \`solde >= montant\` |
| **Variables** | BA (W0 service village), W (W0 imputation) |

#### <a id="rm-002"></a>[RM-002] Calculer TVA
| Element | Detail |
|---------|--------|
| **Condition** | \`montant > 0\` |
| **Variables** | HE (P0 taux tva) |
`;

const TABLES_SPEC = `# ADH IDE 237 - Vente Gift Pass

## 10. TABLES

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 849 | cafil008 | Adherents | Data | R | | | Lecture compte |
| 120 | ccventes | Ventes | Data | R | W | | Ecriture vente |
| 45 | tempo_ecran | Tempo | Memory | R | | | Affichage temp |
`;

const CALLEES_SPEC_13_4 = `# ADH IDE 237 - Vente Gift Pass

### 13.4 Detail des appels

| IDE | Programme | Appels | Contexte |
|-----|-----------|--------|----------|
| [229](link) | Edition ticket | 3 | Impression apres vente |
| [192](link) | SOLDE_COMPTE | 1 | Verif solde |
`;

const CALLEES_SPEC_13_3 = `# ADH IDE 131 - Fermeture

### 13.3 Diagramme

\`\`\`mermaid
graph LR
  C152[152 Recup Classe et Li...]
  C180[180 Set Listing Num...]
\`\`\`
`;

describe('parseSpecContent', () => {
  it('should parse program ID and name from header', () => {
    const result = parseSpecContent(MINIMAL_SPEC);
    expect(result.programId).toBe(237);
    expect(result.programName).toBe('Vente Gift Pass');
  });

  it('should parse metadata numbers', () => {
    const result = parseSpecContent(MINIMAL_SPEC);
    expect(result.tasksCount).toBe(3);
    expect(result.tablesModified).toBe(2);
    expect(result.expressionsCount).toBe(45);
    expect(result.calleesCount).toBe(4);
  });

  it('should parse rules with conditions and variables', () => {
    const result = parseSpecContent(RULES_SPEC);
    expect(result.rules).toHaveLength(2);

    expect(result.rules[0].id).toBe('RM-001');
    expect(result.rules[0].description).toBe('Verifier solde disponible');
    expect(result.rules[0].condition).toBe('solde >= montant');
    expect(result.rules[0].variables).toContain('BA');
    expect(result.rules[0].variables).toContain('W');
    expect(result.rules[0].status).toBe('MISSING');

    expect(result.rules[1].id).toBe('RM-002');
    expect(result.rules[1].condition).toBe('montant > 0');
  });

  it('should parse tables with access modes', () => {
    const result = parseSpecContent(TABLES_SPEC);
    expect(result.tables).toHaveLength(3);

    expect(result.tables[0].id).toBe(849);
    expect(result.tables[0].name).toBe('cafil008');
    expect(result.tables[0].mode).toBe('R');

    expect(result.tables[1].id).toBe(120);
    expect(result.tables[1].name).toBe('ccventes');
    expect(result.tables[1].mode).toBe('RW');

    expect(result.tables[2].id).toBe(45);
    expect(result.tables[2].name).toBe('tempo_ecran');
    expect(result.tables[2].mode).toBe('R');
  });

  it('should parse callees from section 13.4', () => {
    const result = parseSpecContent(CALLEES_SPEC_13_4);
    expect(result.callees).toHaveLength(2);

    expect(result.callees[0].id).toBe(229);
    expect(result.callees[0].name).toBe('Edition ticket');
    expect(result.callees[0].calls).toBe(3);
    expect(result.callees[0].context).toBe('Impression apres vente');
    expect(result.callees[0].status).toBe('MISSING');

    expect(result.callees[1].id).toBe(192);
    expect(result.callees[1].name).toBe('SOLDE_COMPTE');
  });

  it('should fallback to section 13.3 mermaid nodes', () => {
    const result = parseSpecContent(CALLEES_SPEC_13_3);
    expect(result.callees).toHaveLength(2);

    expect(result.callees[0].id).toBe(152);
    expect(result.callees[0].name).toContain('Recup Classe');

    expect(result.callees[1].id).toBe(180);
    expect(result.callees[1].name).toContain('Set Listing');
  });

  it('should extract variables from rule blocks', () => {
    const result = parseSpecContent(RULES_SPEC);
    expect(result.variables.length).toBeGreaterThanOrEqual(2);

    const ba = result.variables.find(v => v.localId === 'BA');
    expect(ba).toBeDefined();
    expect(ba!.name).toContain('W0 service village');
    expect(ba!.type).toBe('Real');

    const he = result.variables.find(v => v.localId === 'HE');
    expect(he).toBeDefined();
    expect(he!.type).toBe('Parameter');
  });

  it('should handle empty content', () => {
    const result = parseSpecContent('# Some header without IDE format');
    expect(result.programId).toBe(0);
    expect(result.programName).toBe('');
    expect(result.rules).toHaveLength(0);
    expect(result.tables).toHaveLength(0);
    expect(result.callees).toHaveLength(0);
    expect(result.variables).toHaveLength(0);
  });

  it('should deduplicate variables across rules', () => {
    const specWithDuplicates = `# ADH IDE 100 - Test

## 5. REGLES METIER

#### [RM-001] Rule 1
| **Variables** | BA (W0 service village), W (W0 imputation) |

#### [RM-002] Rule 2
| **Variables** | BA (W0 service village), HE (P0 taux tva) |
`;
    const result = parseSpecContent(specWithDuplicates);
    const baVars = result.variables.filter(v => v.localId === 'BA');
    expect(baVars).toHaveLength(1);
  });
});

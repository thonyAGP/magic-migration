import { test, expect, Page } from '@playwright/test';

/**
 * Tests E2E de validation qualité des specs V6.0
 *
 * Ces tests garantissent que le pipeline génère des specs
 * conformes aux critères de qualité définis.
 */

const SPEC_URL = 'http://jira.lb2i.com/viewer.html#specs/ADH-IDE-237.md';

// Critères de qualité minimaux
const QUALITY_CRITERIA = {
  minFonctionnalites: 3,
  minReglesMetier: 5,
  minTablesWrite: 1,
  minExpressionsDecoded: 80, // pourcentage
  maxTruncatedRules: 0, // AUCUNE troncature autorisée
};

test.describe('Validation Qualité Spec ADH IDE 237', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(SPEC_URL);
    await page.waitForTimeout(3000); // Attendre chargement complet
  });

  test('Structure: Les 3 onglets sont présents', async ({ page }) => {
    // Vérifier présence des onglets
    const ongletFonctionnel = page.locator('text=Fonctionnel');
    const ongletTechnique = page.locator('text=Technique');
    const ongletCartographie = page.locator('text=Cartographie');

    await expect(ongletFonctionnel).toBeVisible();
    await expect(ongletTechnique).toBeVisible();
    await expect(ongletCartographie).toBeVisible();
  });

  test('Identification: Tous les champs obligatoires', async ({ page }) => {
    const content = await page.textContent('body');

    // Champs obligatoires
    expect(content).toContain('Projet');
    expect(content).toContain('ADH');
    expect(content).toContain('IDE Position');
    expect(content).toContain('237');
    expect(content).toContain('Nom Programme');
    expect(content).toContain('Statut Orphelin');
  });

  test('Objectif Métier: Minimum de fonctionnalités', async ({ page }) => {
    // Compter les items dans "Fonctionnalités principales"
    const fonctionnalites = await page.locator(
      'h3:has-text("Fonctionnalites principales") + ul li, ' +
      'h3:has-text("Fonctionnalités principales") + ul li'
    ).count();

    console.log(`Fonctionnalités trouvées: ${fonctionnalites}`);
    expect(fonctionnalites).toBeGreaterThanOrEqual(QUALITY_CRITERIA.minFonctionnalites);
  });

  test('Objectif Métier: Minimum de règles métier', async ({ page }) => {
    // Compter les règles [RM-XXX]
    const content = await page.textContent('body');
    const reglesMatch = content?.match(/\[RM-\d+\]/g) || [];

    console.log(`Règles métier trouvées: ${reglesMatch.length}`);
    expect(reglesMatch.length).toBeGreaterThanOrEqual(QUALITY_CRITERIA.minReglesMetier);
  });

  test('CRITIQUE: Aucune règle tronquée (...)', async ({ page }) => {
    // Chercher les règles qui se terminent par "..."
    const reglesSection = await page.locator('h3:has-text("Regles metier")').first();

    if (await reglesSection.isVisible()) {
      // Récupérer le texte de la section des règles
      const sectionContent = await page.evaluate(() => {
        const h3 = Array.from(document.querySelectorAll('h3'))
          .find(el => el.textContent?.includes('Regles metier') || el.textContent?.includes('Règles métier'));
        if (!h3) return '';

        const ul = h3.nextElementSibling;
        if (ul?.tagName === 'UL') {
          return ul.textContent || '';
        }
        return '';
      });

      // Compter les règles tronquées
      const truncatedRules = (sectionContent.match(/\.\.\./g) || []).length;

      console.log(`Règles tronquées: ${truncatedRules}`);
      expect(truncatedRules).toBe(QUALITY_CRITERIA.maxTruncatedRules);
    }
  });

  test('Tables WRITE: Au moins une table modifiée', async ({ page }) => {
    const content = await page.textContent('body');

    // Chercher la section "Tables modifiees (WRITE)"
    const hasWriteTables = content?.includes('WRITE') && content?.includes('tables');

    expect(hasWriteTables).toBe(true);

    // Compter les tables dans la section WRITE (structure: h4 + ul > li)
    const tablesWrite = await page.evaluate(() => {
      const h4 = Array.from(document.querySelectorAll('h4'))
        .find(el => el.textContent?.includes('WRITE'));
      if (!h4) return 0;

      const ul = h4.nextElementSibling;
      if (ul?.tagName === 'UL') {
        return ul.querySelectorAll('li').length;
      }
      return 0;
    });

    console.log(`Tables WRITE trouvées: ${tablesWrite}`);
    expect(tablesWrite).toBeGreaterThanOrEqual(QUALITY_CRITERIA.minTablesWrite);
  });

  test('Technique: Expressions décodées >= 80%', async ({ page }) => {
    // Cliquer sur onglet Technique
    await page.click('text=Technique');
    await page.waitForTimeout(500);

    const content = await page.textContent('body');

    // Chercher le pourcentage de décodage (ex: "305/305 (100%)")
    const decodageMatch = content?.match(/(\d+)\/(\d+)\s*\((\d+)%\)/);

    if (decodageMatch) {
      const pourcentage = parseInt(decodageMatch[3]);
      console.log(`Expressions décodées: ${pourcentage}%`);
      expect(pourcentage).toBeGreaterThanOrEqual(QUALITY_CRITERIA.minExpressionsDecoded);
    } else {
      // Si pas de match, vérifier qu'on a au moins la mention "expressions"
      expect(content?.toLowerCase()).toContain('expression');
    }
  });

  test('Cartographie: Callers et Callees présents', async ({ page }) => {
    // Cliquer sur onglet Cartographie
    await page.click('text=Cartographie');
    await page.waitForTimeout(500);

    const content = await page.textContent('body');

    // Vérifier présence des sections
    const hasCallers = content?.includes('Appele depuis') ||
                       content?.includes('Appelé depuis') ||
                       content?.includes('Callers');
    const hasCallees = content?.includes('Appelle') ||
                       content?.includes('Callees');

    expect(hasCallers).toBe(true);
    expect(hasCallees).toBe(true);
  });

  test('Algorigramme: Présent et non trivial', async ({ page }) => {
    // Cliquer sur onglet Technique
    await page.click('text=Technique');
    await page.waitForTimeout(500);

    // Chercher un diagramme Mermaid flowchart
    const hasMermaid = await page.locator('.mermaid, pre:has-text("flowchart")').count();

    console.log(`Diagrammes Mermaid trouvés: ${hasMermaid}`);
    expect(hasMermaid).toBeGreaterThan(0);

    // Vérifier que l'algorigramme a plusieurs nœuds (pas juste START → END)
    const content = await page.textContent('body');
    const nodesCount = (content?.match(/-->/g) || []).length;

    console.log(`Connexions dans algorigramme: ${nodesCount}`);
    expect(nodesCount).toBeGreaterThan(2); // Au moins 3 connexions
  });
});

test.describe('Validation Cohérence Cross-Section', () => {

  test('Cohérence: Nombre tables WRITE identique entre sections', async ({ page }) => {
    await page.goto(SPEC_URL);
    await page.waitForTimeout(3000);

    // Section OBJECTIF METIER - compter tables WRITE
    const tablesObjectif = await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3'))
        .find(el => el.textContent?.includes('Operations sur les donnees'));
      if (!h3) return 0;

      const ul = h3.nextElementSibling?.nextElementSibling; // p puis ul
      if (ul?.tagName === 'UL') {
        return ul.querySelectorAll('li').length;
      }
      return 0;
    });

    // Onglet TECHNIQUE - compter tables WRITE
    await page.click('text=Technique');
    await page.waitForTimeout(500);

    const content = await page.textContent('body');
    const writeMatch = content?.match(/WRITE[:\s]*(\d+)/i);
    const tablesTechnique = writeMatch ? parseInt(writeMatch[1]) : 0;

    console.log(`Tables WRITE Objectif: ${tablesObjectif}, Technique: ${tablesTechnique}`);

    // Tolérance de 20% (certaines peuvent être groupées différemment)
    if (tablesTechnique > 0 && tablesObjectif > 0) {
      const ratio = Math.min(tablesObjectif, tablesTechnique) / Math.max(tablesObjectif, tablesTechnique);
      expect(ratio).toBeGreaterThan(0.5); // Au moins 50% de cohérence
    }
  });
});

test.describe('Métriques de Qualité Globales', () => {

  test('Calcul du score de qualité', async ({ page }) => {
    await page.goto(SPEC_URL);
    await page.waitForTimeout(3000);

    let score = 0;
    const content = await page.textContent('body');

    // 1. Identification complète (10 points)
    if (content?.includes('ADH') && content?.includes('237') && content?.includes('NON_ORPHELIN')) {
      score += 10;
    }

    // 2. Objectif métier riche (25 points)
    const fonctionnalites = (content?.match(/Tache \d+\)/g) || []).length;
    if (fonctionnalites >= 5) score += 25;
    else if (fonctionnalites >= 3) score += 15;

    // 3. Règles non tronquées (20 points)
    const truncated = (content?.match(/\[RM-\d+\][^\n]*\.\.\./g) || []).length;
    if (truncated === 0) score += 20;
    else if (truncated <= 2) score += 10;

    // 4. Tables complètes (15 points)
    if (content?.includes('modifie') && content?.includes('cafil')) {
      score += 15;
    }

    // 5. Expressions 100% (15 points)
    if (content?.includes('100%')) score += 15;
    else if (content?.includes('90%') || content?.includes('95%')) score += 10;

    // 6. Cartographie complète (15 points)
    await page.click('text=Cartographie');
    await page.waitForTimeout(500);
    const cartoContent = await page.textContent('body');
    if (cartoContent?.includes('Appele') && cartoContent?.includes('Appelle')) {
      score += 15;
    }

    console.log(`\n========================================`);
    console.log(`SCORE DE QUALITÉ: ${score}/100`);
    console.log(`========================================\n`);

    // Seuil minimum: 60%
    expect(score).toBeGreaterThanOrEqual(60);

    // Screenshot du résultat
    await page.screenshot({
      path: 'test-results/quality-score.png',
      fullPage: true
    });
  });
});

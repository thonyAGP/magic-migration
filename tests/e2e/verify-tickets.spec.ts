import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test de verification du deploiement des tickets sur jira.lb2i.com
 * Execute apres chaque analyse de ticket pour valider l'affichage
 */

const SITE_URL = 'https://jira.lb2i.com';
const TICKETS_PATH = path.join(__dirname, '../../.openspec/tickets');

// Regex pour valider le format datetime ISO 8601 avec heure (YYYY-MM-DDTHH:MM)
const DATETIME_REGEX = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
// Regex pour detecter une date SANS heure (bug)
const DATE_ONLY_REGEX = /\*(?:Analyse|Dernière mise à jour)\s*:\s*(\d{4}-\d{2}-\d{2})\s*\*/;

test.describe('Verification deploiement tickets', () => {

  test('Le site jira.lb2i.com est accessible', async ({ page }) => {
    const response = await page.goto(SITE_URL);
    expect(response?.status()).toBe(200);
  });

  test('Les tickets actifs sont affiches', async ({ page }) => {
    await page.goto(SITE_URL);

    // Attendre que la page charge
    await page.waitForLoadState('networkidle');

    // Verifier qu'il y a une section tickets
    const ticketsSection = page.locator('text=Tickets').or(page.locator('text=Active'));
    await expect(ticketsSection.first()).toBeVisible({ timeout: 10000 });
  });

  test('PMS-1412 est visible', async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    const ticket = page.locator('text=PMS-1412');
    await expect(ticket).toBeVisible({ timeout: 10000 });
  });

  test('PMS-1400 est visible', async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    const ticket = page.locator('text=PMS-1400');
    await expect(ticket).toBeVisible({ timeout: 10000 });
  });

  test('PMS-1359 est visible', async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    const ticket = page.locator('text=PMS-1359');
    await expect(ticket).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Verification format timestamps tickets', () => {

  test('Tous les fichiers analysis.md ont un timestamp avec heure', async () => {
    const ticketDirs = fs.readdirSync(TICKETS_PATH)
      .filter(dir => dir !== 'TEMPLATE' && fs.statSync(path.join(TICKETS_PATH, dir)).isDirectory());

    const errors: string[] = [];

    for (const ticketDir of ticketDirs) {
      const analysisPath = path.join(TICKETS_PATH, ticketDir, 'analysis.md');
      if (fs.existsSync(analysisPath)) {
        const content = fs.readFileSync(analysisPath, 'utf-8');

        // Chercher le timestamp
        const dateOnlyMatch = content.match(DATE_ONLY_REGEX);
        if (dateOnlyMatch && !DATETIME_REGEX.test(dateOnlyMatch[0])) {
          errors.push(`${ticketDir}/analysis.md: timestamp sans heure "${dateOnlyMatch[1]}"`);
        }

        // Verifier qu'il y a bien un timestamp avec heure
        if (!DATETIME_REGEX.test(content)) {
          errors.push(`${ticketDir}/analysis.md: aucun timestamp au format YYYY-MM-DDTHH:MM trouve`);
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Timestamps invalides:\n${errors.join('\n')}`);
    }
  });

  test('Tous les fichiers resolution.md ont un timestamp avec heure', async () => {
    const ticketDirs = fs.readdirSync(TICKETS_PATH)
      .filter(dir => dir !== 'TEMPLATE' && fs.statSync(path.join(TICKETS_PATH, dir)).isDirectory());

    const errors: string[] = [];

    for (const ticketDir of ticketDirs) {
      const resolutionPath = path.join(TICKETS_PATH, ticketDir, 'resolution.md');
      if (fs.existsSync(resolutionPath)) {
        const content = fs.readFileSync(resolutionPath, 'utf-8');

        const dateOnlyMatch = content.match(DATE_ONLY_REGEX);
        if (dateOnlyMatch && !DATETIME_REGEX.test(dateOnlyMatch[0])) {
          errors.push(`${ticketDir}/resolution.md: timestamp sans heure "${dateOnlyMatch[1]}"`);
        }

        if (!DATETIME_REGEX.test(content)) {
          errors.push(`${ticketDir}/resolution.md: aucun timestamp au format YYYY-MM-DDTHH:MM trouve`);
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Timestamps invalides:\n${errors.join('\n')}`);
    }
  });

  test('Tous les fichiers implementation.md ont un timestamp avec heure', async () => {
    const ticketDirs = fs.readdirSync(TICKETS_PATH)
      .filter(dir => dir !== 'TEMPLATE' && fs.statSync(path.join(TICKETS_PATH, dir)).isDirectory());

    const errors: string[] = [];

    for (const ticketDir of ticketDirs) {
      const implPath = path.join(TICKETS_PATH, ticketDir, 'implementation.md');
      if (fs.existsSync(implPath)) {
        const content = fs.readFileSync(implPath, 'utf-8');

        const dateOnlyMatch = content.match(DATE_ONLY_REGEX);
        if (dateOnlyMatch && !DATETIME_REGEX.test(dateOnlyMatch[0])) {
          errors.push(`${ticketDir}/implementation.md: timestamp sans heure "${dateOnlyMatch[1]}"`);
        }

        if (!DATETIME_REGEX.test(content)) {
          errors.push(`${ticketDir}/implementation.md: aucun timestamp au format YYYY-MM-DDTHH:MM trouve`);
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Timestamps invalides:\n${errors.join('\n')}`);
    }
  });

  test('Les templates utilisent le format {YYYY-MM-DDTHH:MM}', async () => {
    const templatePath = path.join(TICKETS_PATH, 'TEMPLATE');
    const files = ['analysis.md', 'resolution.md', 'implementation.md'];
    const errors: string[] = [];

    for (const file of files) {
      const filePath = path.join(templatePath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');

        // Verifier que le template utilise {YYYY-MM-DDTHH:MM} et pas {DATE}
        if (content.includes('{DATE}')) {
          errors.push(`TEMPLATE/${file}: utilise {DATE} au lieu de {YYYY-MM-DDTHH:MM}`);
        }

        if (!content.includes('{YYYY-MM-DDTHH:MM}')) {
          errors.push(`TEMPLATE/${file}: ne contient pas {YYYY-MM-DDTHH:MM}`);
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Templates invalides:\n${errors.join('\n')}`);
    }
  });
});

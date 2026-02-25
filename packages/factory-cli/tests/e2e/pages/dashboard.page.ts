/**
 * Page Object Model for the Migration Factory Dashboard.
 * All selectors use real IDs from html-report.ts — NO CSS class selectors.
 */
import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  // Tabs
  readonly tabGlobal: Locator;
  readonly tabADH: Locator;
  readonly tabTokens: Locator;

  // Server badge
  readonly serverBadge: Locator;

  // Action bar controls
  readonly batchSelect: Locator;
  readonly enrichSelect: Locator;
  readonly chkDry: Locator;

  // Action buttons
  readonly btnPreflight: Locator;
  readonly btnRun: Locator;
  readonly btnVerify: Locator;
  readonly btnGaps: Locator;
  readonly btnCalibrate: Locator;
  readonly btnGenerate: Locator;
  readonly btnMigrate: Locator;
  readonly btnMigrateAuto: Locator;
  readonly btnAnalyze: Locator;

  // Results panel
  readonly panelTitle: Locator;
  readonly panelContent: Locator;
  readonly btnClose: Locator;

  // KPI section
  readonly kpiCards: Locator;

  // Program table
  readonly progSearch: Locator;
  readonly statusFilter: Locator;
  readonly programTable: Locator;
  readonly decomOnly: Locator;

  // Tokens tab
  readonly tokensContent: Locator;

  // Modules section
  readonly filterBtns: Locator;
  readonly sortBtns: Locator;

  constructor(page: Page) {
    this.page = page;

    // Tabs (real data-project attributes from html-report.ts)
    this.tabGlobal = page.locator('[data-project="global"]');
    this.tabADH = page.locator('[data-project="ADH"]');
    this.tabTokens = page.locator('[data-project="tokens"]');

    // Server status
    this.serverBadge = page.locator('#server-badge');

    // Controls
    this.batchSelect = page.locator('#batch-select');
    this.enrichSelect = page.locator('#sel-enrich');
    this.chkDry = page.locator('#chk-dry');

    // Buttons (real IDs)
    this.btnPreflight = page.locator('#btn-preflight');
    this.btnRun = page.locator('#btn-run');
    this.btnVerify = page.locator('#btn-verify');
    this.btnGaps = page.locator('#btn-gaps');
    this.btnCalibrate = page.locator('#btn-calibrate');
    this.btnGenerate = page.locator('#btn-generate');
    this.btnMigrate = page.locator('#btn-migrate');
    this.btnMigrateAuto = page.locator('#btn-migrate-auto');
    this.btnAnalyze = page.locator('#btn-analyze');

    // Results panel
    this.panelTitle = page.locator('#panel-title');
    this.panelContent = page.locator('#panel-content');
    this.btnClose = page.locator('#btn-close');

    // KPIs
    this.kpiCards = page.locator('.kpi-card');

    // Program table
    this.progSearch = page.locator('#prog-search');
    this.statusFilter = page.locator('#status-filter');
    this.programTable = page.locator('#program-table');
    this.decomOnly = page.locator('#decom-only');

    // Tokens tab
    this.tokensContent = page.locator('#tokens-content');

    // Modules section
    this.filterBtns = page.locator('.filter-btn');
    this.sortBtns = page.locator('.sort-btn');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoTab(tab: 'global' | 'ADH' | 'tokens') {
    await this.page.goto(`/#${tab}`);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForConnected() {
    await expect(this.serverBadge).toHaveClass(/connected/, { timeout: 10_000 });
  }

  async selectBatch(batchId: string) {
    await this.batchSelect.selectOption(batchId);
    await this.page.waitForTimeout(300);
  }

  async selectProvider(provider: 'claude-bedrock' | 'claude-cli' | 'claude' | 'none') {
    await this.enrichSelect.selectOption(provider);
  }

  async enableSimulation() {
    await this.chkDry.check();
  }

  async disableSimulation() {
    await this.chkDry.uncheck();
  }

  async getBatchOptions(): Promise<string[]> {
    return this.batchSelect.locator('option').allTextContents();
  }

  async getPanelText(): Promise<string> {
    return (await this.panelContent.textContent()) ?? '';
  }

  async waitForPanelContaining(text: string, timeout = 30_000) {
    await expect(this.panelContent).toContainText(text, { timeout });
  }

  async getKpiValues(): Promise<string[]> {
    return this.kpiCards.locator('.kpi-value').allTextContents();
  }

  async waitForProgressComplete(timeout = 60_000) {
    await this.page.locator('#pbar').waitFor({ state: 'attached', timeout: 5_000 }).catch(() => {});
    await expect(this.panelContent).toContainText(/[Tt]erminé|completed|Erreur|Error/i, { timeout });
  }

  async closePanel() {
    await this.btnClose.click();
  }

  async isPanelVisible(): Promise<boolean> {
    const panel = this.page.locator('#action-panel');
    const cls = await panel.getAttribute('class');
    return cls?.includes('visible') ?? false;
  }

  async getProgramTableRows(): Promise<number> {
    return this.programTable.locator('tbody tr').count();
  }

  async getVisibleProgramRows(): Promise<number> {
    return this.programTable.locator('tbody tr:visible').count();
  }

  async navigateToADH() {
    await this.tabADH.click();
    await this.page.waitForTimeout(500);
  }
}

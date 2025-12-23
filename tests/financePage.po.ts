import { Page, Locator } from '@playwright/test';

export class FinancePage {
  readonly page: Page;
  readonly gridRoot: Locator;
  readonly gridRows: Locator;
  readonly columnHeaders: Locator;

  constructor(page: Page) {
    this.page = page;
    this.gridRoot = page.locator('div.ag-root');
    this.gridRows = page.locator(
      'div.ag-center-cols-container div[role="row"]'
    );
    this.columnHeaders = page.locator(
      'div.ag-header-cell, div[role="columnheader"], div.ag-header-cell-text'
    );
  }

  async goto() {
    await this.page.goto('https://www.ag-grid.com/example-finance/', {
      waitUntil: 'domcontentloaded',
    });
  }

  async getRowCount(): Promise<number> {
    await this.gridRoot.waitFor({ state: 'visible' });
    await this.gridRows.first().waitFor({ state: 'visible' });
    return await this.gridRows.count();
  }

  async getColumnHeaders(): Promise<string[]> {
    await this.columnHeaders
      .first()
      .waitFor({ state: 'visible', timeout: 15000 });
    const contents = await this.columnHeaders.allTextContents();
    return contents.map((c) => c.trim()).filter(Boolean);
  }

  async getColumnIndex(columnName: string): Promise<number> {
    const headers = await this.getColumnHeaders();
    const idx = headers.findIndex((h) =>
      h
        .replaceAll(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .includes(columnName.toLowerCase())
    );
    if (idx === -1) throw new Error(`Column not found: ${columnName}`);
    return idx;
  }

  async getCellLocatorByColumnName(rowIndex: number, columnName: string) {
    const colIndex = await this.getColumnIndex(columnName);
    return this.gridRows
      .nth(rowIndex)
      .locator('div[role="gridcell"]')
      .nth(colIndex);
  }

  async getNumericCellValueByColumnName(rowIndex: number, columnName: string) {
    const cell = await this.getCellLocatorByColumnName(rowIndex, columnName);
    const handle = await cell.elementHandle();
    if (handle) {
      await this.page
        .waitForFunction(
          (el) => {
            const t = el.textContent || '';
            const cleaned = t.replaceAll(/[^0-9.-]+/g, '');
            return cleaned !== '' && !Number.isNaN(Number.parseFloat(cleaned));
          },
          handle,
          { timeout: 8000 }
        )
        .catch(() => null);
    }
    const text = (await cell.textContent()) ?? '';
    const cleaned = text.replaceAll(/[^0-9.-]+/g, '');
    return Number.parseFloat(cleaned || '0');
  }

  async sortColumn(columnName: string, ascending = true) {
    const headerText = this.page.getByText(columnName).first();
    await headerText.waitFor({ state: 'visible', timeout: 15000 });
    await headerText.click();
    if (!ascending) await headerText.click();
  }

  async filterColumn(columnName: string, filterValue: string) {
    const headerText = this.page.getByText(columnName).first();
    const headerCell = headerText
      .locator('xpath=ancestor::div[contains(@class,"ag-header-cell")]')
      .first();
    const floatingFilter = headerCell.locator('.ag-floating-filter input');
    if ((await floatingFilter.count()) === 0) return;
    await floatingFilter.waitFor({ state: 'visible', timeout: 15000 });
    await floatingFilter.fill(filterValue);
    await floatingFilter.press('Enter');
  }

  async selectRowByIndex(index: number) {
    const row = this.gridRows.nth(index);
    await row.waitFor({ state: 'visible', timeout: 10000 });
    await row.locator('div[role="gridcell"]').first().click();
    return row;
  }

  async isRowSelected(rowIndex: number): Promise<boolean | null> {
    const row = this.gridRows.nth(rowIndex);
    const attr = await row.getAttribute('aria-selected');
    if (attr === null) return null;
    return attr === 'true';
  }

  async getSparklineCount(rowIndex: number) {
    const sparkline = this.gridRows.nth(rowIndex).locator('canvas');
    return await sparkline.count();
  }

  async resizeColumn(columnName: string, widthDelta: number) {
    const headerText = this.page.getByText(columnName).first();
    const headerCell = headerText
      .locator('xpath=ancestor::div[contains(@class,"ag-header-cell")]')
      .first();
    await headerCell.waitFor({ state: 'visible', timeout: 15000 });
    await headerCell.scrollIntoViewIfNeeded();
    await headerCell.hover();
    const resizeHandle = headerCell.locator('.ag-header-cell-resize');
    if ((await resizeHandle.count()) === 0)
      throw new Error('Resize handle not visible');
    await resizeHandle.waitFor({ state: 'visible', timeout: 5000 });
    const box = await resizeHandle.boundingBox();
    if (!box) throw new Error('Resize handle not visible');
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + widthDelta, startY, { steps: 10 });
    await this.page.mouse.up();
  }
}

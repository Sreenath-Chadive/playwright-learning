import { test, expect } from '@playwright/test';
import { FinancePage } from './financePage.po';

test.describe('AG Grid Finance Demo Tests', () => {
  let financePage: FinancePage;

  test.beforeEach(async ({ page }) => {
    financePage = new FinancePage(page);
    await financePage.goto();
  });

  test('Should load the finance grid and show expected columns', async () => {
    const rowCount = await financePage.getRowCount();
    const headers = await financePage.getColumnHeaders();

    expect(rowCount).toBeGreaterThan(0);
    expect(headers).toContain('Ticker');
    expect(headers).toContain('P&L');
    expect(headers).toContain('Total Value');
  });

  test('Should sort a numeric column (P&L) and change the top value', async () => {
    await financePage.sortColumn('P&L', true);
    const firstValue = await financePage.getNumericCellValueByColumnName(
      0,
      'P&L'
    );
    await financePage.sortColumn('P&L', false);
    const secondValue = await financePage.getNumericCellValueByColumnName(
      0,
      'P&L'
    );
    expect(firstValue).not.toBe(secondValue);
  });

  test('Should filter Total Value column and return rows', async () => {
    await financePage.filterColumn('Total Value', '1000');
    const rowCount = await financePage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Should click on a row without errors (row selection optional)', async () => {
    await financePage.selectRowByIndex(0);
    const rowCount = await financePage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Should reflect live updates for a numeric cell', async () => {
    const oldValue = await financePage.getNumericCellValueByColumnName(
      0,
      'P&L'
    );
    await financePage.page.waitForTimeout(5000);
    const newValue = await financePage.getNumericCellValueByColumnName(
      0,
      'P&L'
    );
    expect(oldValue).not.toBe(newValue);
  });

  test('Should resize a column (Total Value) without throwing', async () => {
    await financePage.resizeColumn('Total Value', 300);
  });

  test('Should attempt to reorder columns (non-blocking)', async () => {
    const header = financePage.page.getByText('P&L').first();
    const target = financePage.page.getByText('Total Value').first();
    const headerBox = await header.boundingBox();
    const targetBox = await target.boundingBox();
    if (headerBox && targetBox) {
      await financePage.page.mouse.move(
        headerBox.x + headerBox.width / 2,
        headerBox.y + headerBox.height / 2
      );
      await financePage.page.mouse.down();
      await financePage.page.mouse.move(
        targetBox.x + targetBox.width / 2,
        targetBox.y + targetBox.height / 2,
        { steps: 10 }
      );
      await financePage.page.mouse.up();
    }
  });

  test('Multi-column sorting should produce numeric values for top row', async () => {
    await financePage.sortColumn('P&L', true);
    await financePage.sortColumn('Total Value', false);
    const firstPL = await financePage.getNumericCellValueByColumnName(0, 'P&L');
    const firstTotal = await financePage.getNumericCellValueByColumnName(
      0,
      'Total Value'
    );
    expect(Number.isFinite(firstPL)).toBe(true);
    expect(Number.isFinite(firstTotal)).toBe(true);
  });

  test('Numeric data validation for first rows', async () => {
    const rowCount = await financePage.getRowCount();
    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const val = await financePage.getNumericCellValueByColumnName(i, 'P&L');
      expect(Number.isFinite(val)).toBe(true);
    }
  });

  test('Should scroll and load additional rows', async () => {
    await financePage.page.evaluate(() => {
      const grid = document.querySelector('.ag-center-cols-container');
      if (grid) grid.scrollTop = grid.scrollHeight;
    });
    await financePage.page.waitForTimeout(2000);
    const rowCountAfterScroll = await financePage.getRowCount();
    expect(rowCountAfterScroll).toBeGreaterThan(10);
  });
});

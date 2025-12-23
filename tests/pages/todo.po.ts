import { Page, Locator, expect } from '@playwright/test';

export class TodoPage {
  readonly page: Page;
  readonly todoInput: Locator;
  readonly todoListItems: Locator;
  readonly itemsLeftLabel: Locator;
  readonly clearCompletedButton: Locator;
  readonly toggleAllButton: Locator;
  readonly allFilterLink: Locator;
  readonly activeFilterLink: Locator;
  readonly completedFilterLink: Locator;
  readonly mainContainer: Locator;
  readonly footerContainer: Locator;
  

  constructor(page: Page) {
    this.page = page;
    this.todoInput = page.locator('.new-todo');
    this.todoListItems = page.locator('.todo-list li');
    this.itemsLeftLabel = page.locator('.todo-count');
    this.clearCompletedButton = page.locator('.clear-completed');
    this.toggleAllButton = page.locator('.toggle-all');
    this.mainContainer = page.locator('.main');
    this.footerContainer = page.locator('.footer');
    this.allFilterLink = page.locator('a[href="#/"]');
    this.activeFilterLink = page.locator('a[href="#/active"]');
    this.completedFilterLink = page.locator('a[href="#/completed"]');
  }

  async goto() {
    await this.page.goto('https://demo.playwright.dev/todomvc/');
  }

  async addTodo(text: string) {
    await this.todoInput.fill(text);
    await this.todoInput.press('Enter');
  }

  async addMultipleTodos(texts: string[]) {
    for (const text of texts) {
      await this.addTodo(text);
    }
  }

  async getTodoItem(index: number): Promise<Locator> {
    return this.todoListItems.nth(index);
  }

  async getTodoItemByText(text: string): Promise<Locator> {
    return this.todoListItems.filter({ hasText: text });
  }

  async toggleTodoComplete(index: number) {
    const todo = await this.getTodoItem(index);
    await todo.locator('.toggle').check();
  }

  async toggleTodoIncomplete(index: number) {
    const todo = await this.getTodoItem(index);
    await todo.locator('.toggle').uncheck();
  }

  async deleteTodo(index: number) {
    const todo = await this.getTodoItem(index);
    await todo.hover();
    await todo.locator('.destroy').click();
  }

  async editTodo(index: number, newText: string) {
    const todo = await this.getTodoItem(index);
    await todo.dblclick();
    const editInput = todo.locator('.edit');
    await editInput.fill(newText);
    await editInput.press('Enter');
  }

  async cancelEdit(index: number) {
    const todo = await this.getTodoItem(index);
    await todo.dblclick();
    const editInput = todo.locator('.edit');
    await editInput.press('Escape');
  }

  async clearCompleted() {
    await this.clearCompletedButton.click();
  }

  async toggleAll() {
    await this.toggleAllButton.check();
  }

  async untoggleAll() {
    await this.toggleAllButton.uncheck();
  }

  async filterByAll() {
    await this.allFilterLink.click();
  }

  async filterByActive() {
    await this.activeFilterLink.click();
  }

  async filterByCompleted() {
    await this.completedFilterLink.click();
  }

  async getTodoCount(): Promise<number> {
    return await this.todoListItems.count();
  }

  async getActiveTodoCount(): Promise<string> {
    return await this.itemsLeftLabel.textContent() || '0';
  }

  async isTodoCompleted(index: number): Promise<boolean> {
    const todo = await this.getTodoItem(index);
    return await todo.locator('.toggle').isChecked();
  }

  async getTodoText(index: number): Promise<string> {
    const todo = await this.getTodoItem(index);
    return await todo.locator('label').textContent() || '';
  }

  async verifyTodoCount(count: number) {
    await expect(this.todoListItems).toHaveCount(count);
  }

  async verifyTodoText(index: number, text: string) {
    const todo = await this.getTodoItem(index);
    await expect(todo.locator('label')).toHaveText(text);
  }

  async verifyTodoCompleted(index: number) {
    const todo = await this.getTodoItem(index);
    await expect(todo).toHaveClass(/completed/);
  }

  async verifyTodoNotCompleted(index: number) {
    const todo = await this.getTodoItem(index);
    await expect(todo).not.toHaveClass(/completed/);
  }

  async verifyMainSectionVisible() {
    await expect(this.mainContainer).toBeVisible();
  }

  async verifyMainSectionHidden() {
    await expect(this.mainContainer).toBeHidden();
  }

  async verifyFooterVisible() {
    await expect(this.footerContainer).toBeVisible();
  }

  async verifyFooterHidden() {
    await expect(this.footerContainer).toBeHidden();
  }

  async verifyClearCompletedVisible() {
    await expect(this.clearCompletedButton).toBeVisible();
  }

  async verifyClearCompletedHidden() {
    await expect(this.clearCompletedButton).toBeHidden();
  }

  async verifyActiveFilterSelected() {
    await expect(this.activeFilterLink).toHaveClass(/selected/);
  }

  async verifyCompletedFilterSelected() {
    await expect(this.completedFilterLink).toHaveClass(/selected/);
  }

  async verifyAllFilterSelected() {
    await expect(this.allFilterLink).toHaveClass(/selected/);
  }
}
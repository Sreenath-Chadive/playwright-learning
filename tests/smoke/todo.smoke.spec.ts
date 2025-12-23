import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo.po';

test.describe('@smoke tests', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('should display newly added todo item in the list', async () => {
    await todoPage.addTodo('Learn Playwright');
    await todoPage.verifyTodoText(0, 'Learn Playwright');
  });

  test('should mark todo as completed and update remaining items counter to zero', async () => {
    await todoPage.addTodo('Complete me');
    await todoPage.toggleTodoComplete(0);
    await expect(todoPage.itemsLeftLabel).toHaveText('0 items left');
  });

  test('should remove todo item from the list when deleted', async () => {
    await todoPage.addTodo('Delete me');
    await todoPage.deleteTodo(0);
    await todoPage.verifyTodoCount(0);
  });

  test('should decrement remaining items counter when todo is marked as complete', async () => {
    await todoPage.addTodo('Task 1');
    await todoPage.addTodo('Task 2');
    await todoPage.toggleTodoComplete(0);
    await expect(todoPage.itemsLeftLabel).toHaveText('1 item left');
  });
});

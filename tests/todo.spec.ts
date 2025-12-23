
import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/todo.po';

test.describe('TodoMVC - React', () => {
  let todoPage: TodoPage;

  const TODO_ITEM_ONE = 'buy some cheese';
  const TODO_ITEM_TWO = 'feed the cat';
  const TODO_ITEM_THREE = 'book a doctors appointment';

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('Should focus the input field on load', async () => {
    await expect(todoPage.todoInput).toBeFocused();
  });

  test('Should add new todo items to the list', async () => {
    await todoPage.addTodo(TODO_ITEM_ONE);
    await todoPage.verifyTodoText(0, TODO_ITEM_ONE);

    await todoPage.addTodo(TODO_ITEM_TWO);
    await todoPage.verifyTodoText(0, TODO_ITEM_ONE);
    await todoPage.verifyTodoText(1, TODO_ITEM_TWO);
  });

  test('Should clear the input field after adding an item', async () => {
    await todoPage.addTodo(TODO_ITEM_ONE);
    await expect(todoPage.todoInput).toHaveValue('');
  });

  test('Should append new items to the bottom of the list', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    
    await todoPage.verifyTodoCount(3);
    await todoPage.verifyTodoText(0, TODO_ITEM_ONE);
    await todoPage.verifyTodoText(1, TODO_ITEM_TWO);
    await todoPage.verifyTodoText(2, TODO_ITEM_THREE);
  });

  test('Should trim whitespace from input text', async () => {
    await todoPage.addTodo(`  ${TODO_ITEM_ONE}  `);
    await todoPage.verifyTodoText(0, TODO_ITEM_ONE);
  });

  test('Should mark all items as completed', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    await todoPage.toggleAll();
    
    await todoPage.verifyTodoCompleted(0);
    await todoPage.verifyTodoCompleted(1);
    await todoPage.verifyTodoCompleted(2);
  });

  test('Should clear the completion state of all items', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    await todoPage.toggleAll();
    await todoPage.untoggleAll();
    
    await todoPage.verifyTodoNotCompleted(0);
    await todoPage.verifyTodoNotCompleted(1);
    await todoPage.verifyTodoNotCompleted(2);
  });

  test('Should update the complete all checkbox state when items are completed manually', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    await todoPage.toggleTodoComplete(0);
    await expect(todoPage.toggleAllButton).not.toBeChecked();
    
    await todoPage.toggleTodoComplete(1);
    await todoPage.toggleTodoComplete(2);
    await expect(todoPage.toggleAllButton).toBeChecked();
  });

  test('Should allow marking items as complete', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO]);
    
    await todoPage.toggleTodoComplete(0);
    await todoPage.verifyTodoCompleted(0);
    await todoPage.verifyTodoNotCompleted(1);
    
    await todoPage.toggleTodoComplete(1);
    await todoPage.verifyTodoCompleted(0);
    await todoPage.verifyTodoCompleted(1);
  });

  test('Should allow un-marking items as complete', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO]);
    
    await todoPage.toggleTodoComplete(0);
    await todoPage.verifyTodoCompleted(0);
    await todoPage.verifyTodoNotCompleted(1);
    
    await todoPage.toggleTodoIncomplete(0);
    await todoPage.verifyTodoNotCompleted(0);
    await todoPage.verifyTodoNotCompleted(1);
  });

  test('Should allow editing an item', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    
    await todoPage.editTodo(1, 'buy some sausages');
    
    await todoPage.verifyTodoText(0, TODO_ITEM_ONE);
    await todoPage.verifyTodoText(1, 'buy some sausages');
    await todoPage.verifyTodoText(2, TODO_ITEM_THREE);
  });

  test('Should hide other controls when editing', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    const todo = await todoPage.getTodoItem(1);
    await todo.dblclick();
    
    await expect(todo.locator('.toggle')).toBeHidden();
    await expect(todo.locator('label')).toBeHidden();
  });

  test('Should save edits on enter', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    await todoPage.editTodo(1, 'buy some sausages');
    await todoPage.verifyTodoText(1, 'buy some sausages');
  });

  test('Should save edits on blur', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    const todo = await todoPage.getTodoItem(1);
    await todo.dblclick();
    const editInput = todo.locator('.edit');
    await editInput.fill('buy some sausages');
    await editInput.blur();
    
    await todoPage.verifyTodoText(1, 'buy some sausages');
  });

  test('Should trim entered text during edit', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    const todo = await todoPage.getTodoItem(1);
    await todo.dblclick();
    const editInput = todo.locator('.edit');
    await editInput.fill('    buy some sausages    ');
    await editInput.press('Enter');
    
    await todoPage.verifyTodoText(1, 'buy some sausages');
  });

  test('Should remove the item if an empty text string is entered during edit', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    const todo = await todoPage.getTodoItem(1);
    await todo.dblclick();
    const editInput = todo.locator('.edit');
    await editInput.fill('');
    await editInput.press('Enter');
    
    await todoPage.verifyTodoCount(2);
  });

  test('Should cancel edits on escape', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    await todoPage.cancelEdit(1);
    await todoPage.verifyTodoText(1, TODO_ITEM_TWO);
  });

  test('Should display the current number of todo items', async () => {
    await todoPage.addTodo(TODO_ITEM_ONE);
    await expect(todoPage.itemsLeftLabel).toContainText('1 item left');
    
    await todoPage.addTodo(TODO_ITEM_TWO);
    await expect(todoPage.itemsLeftLabel).toContainText('2 items left');
  });

  test('Should display the correct text for Clear Completed button', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    await todoPage.toggleTodoComplete(0);
    await expect(todoPage.clearCompletedButton).toContainText('Clear completed');
  });

  test('Should remove completed items when Clear Completed is clicked', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    await todoPage.toggleTodoComplete(1);
    await todoPage.clearCompleted();
    
    await todoPage.verifyTodoCount(2);
    await todoPage.verifyTodoText(0, TODO_ITEM_ONE);
    await todoPage.verifyTodoText(1, TODO_ITEM_THREE);
  });

  test('Should hide Clear Completed button when there are no completed items', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    await todoPage.toggleTodoComplete(0);
    await todoPage.verifyClearCompletedVisible();
    
    await todoPage.clearCompleted();
    await todoPage.verifyClearCompletedHidden();
  });

  test('Should persist data after reload', async ({ page }) => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO]);
    await todoPage.toggleTodoComplete(0);
    
    await page.reload();
    
    await todoPage.verifyTodoCount(2);
    await todoPage.verifyTodoText(0, TODO_ITEM_ONE);
    await todoPage.verifyTodoCompleted(0);
    await todoPage.verifyTodoText(1, TODO_ITEM_TWO);
    await todoPage.verifyTodoNotCompleted(1);
  });

  test('Should allow displaying active items', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    await todoPage.toggleTodoComplete(1);
    await todoPage.filterByActive();
    await todoPage.verifyActiveFilterSelected();
    
    await todoPage.verifyTodoCount(2);
    await todoPage.verifyTodoText(0, TODO_ITEM_ONE);
    await todoPage.verifyTodoText(1, TODO_ITEM_THREE);
  });

  test('Should allow displaying completed items', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    await todoPage.toggleTodoComplete(1);
    await todoPage.filterByCompleted();
    await todoPage.verifyCompletedFilterSelected();
    
    await todoPage.verifyTodoCount(1);
    await todoPage.verifyTodoText(0, TODO_ITEM_TWO);
  });

  test('Should allow displaying all items', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    await todoPage.toggleTodoComplete(1);
    await todoPage.filterByActive();
    await todoPage.filterByCompleted();
    await todoPage.filterByAll();
    
    await todoPage.verifyAllFilterSelected();
    await todoPage.verifyTodoCount(3);
  });

  test('Should highlight the currently applied filter', async () => {
    await todoPage.addMultipleTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    await todoPage.toggleTodoComplete(1);
    await todoPage.verifyAllFilterSelected();
    
    await todoPage.filterByActive();
    await todoPage.verifyActiveFilterSelected();
    
    await todoPage.filterByCompleted();
    await todoPage.verifyCompletedFilterSelected();
  });
});
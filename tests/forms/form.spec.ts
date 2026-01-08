import { test, expect } from '@playwright/test';
import { FormPage } from './form.page';

test.describe('e2e form testing', () => {
  let form: FormPage;

  test.beforeEach(async ({ page }) => {
    form = new FormPage(page);
    await form.navigateToFormPage();
  });

  test('user successfully submits the form with all valid details', async () => {
    await form.fillAllFields();
    await form.selectDateOfBirth('1998', '5', '20');
    await form.selectSubjects('Maths');
    await form.hobbiesSports.click();
    await form.uploadImage();
    await form.selectStateAndCity();
    await form.submit();
    await form.expectModalVisible();
  });

  test('user submits the form using only required fields', async () => {
    await form.fillRequiredFields();
    await form.submit();
    await form.expectModalVisible();
  });

  test('form submission is blocked when mandatory fields are missing', async () => {
    await form.submit();
    await expect(form.modalTitle).not.toBeVisible();
  });

  test('form submission is blocked for invalid email format', async () => {
    const invalidEmails = ['sreenath@', 'sreenath.com', 'sreenath@com'];
    for (const email of invalidEmails) {
      await form.fillRequiredFields();
      await form.email.fill(email);
      await form.submit();
      await expect(form.modalTitle).not.toBeVisible();
      await form.page.reload();
    }
  });

  test('mobile field limits input to 10 characters', async () => {
    await form.fillRequiredFields();
    await form.mobile.fill('123456789012345');
    await expect(form.mobile).toHaveValue('1234567890');
  });

  test('user selects date of birth using date picker', async () => {
    await form.selectDateOfBirth('1998', '5', '20');
  });

  test('user selects subjects using autocomplete input', async () => {
    await form.selectSubjects('Computer Science');
  });

  test('user selects multiple hobbies and submits the form', async () => {
    await form.fillRequiredFields();
    await form.hobbiesSports.click();
    await form.submit();
    await form.expectModalVisible();
  });

  test('user uploads an image and submits the form', async () => {
    await form.fillRequiredFields();
    await form.uploadImage();
    await form.submit();
    await form.expectModalVisible();
  });

  test('user selects state and city using dropdowns', async () => {
    await form.fillRequiredFields();
    await form.selectStateAndCity();
    await form.submit();
    await form.expectModalVisible();
  });

  test('form data should be cleared after page refresh', async () => {
    await form.fillAllFields();
    await form.page.reload();
    await expect(form.firstName).toHaveValue('');
  });

  test('user closes confirmation modal after successful submission', async () => {
    await form.fillRequiredFields();
    await form.submit();
    await form.expectModalVisible();
    await form.closeModalAndExpectClosed();
  });
});

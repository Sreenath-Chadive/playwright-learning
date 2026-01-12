import { Page, Locator, expect } from '@playwright/test';

export class FormPage {
  readonly page: Page;

  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly genderMale: Locator;
  readonly mobile: Locator;
  readonly dateOfBirthInput: Locator;
  readonly subjectsInput: Locator;
  readonly hobbiesSports: Locator;
  readonly uploadPicture: Locator;
  readonly address: Locator;
  readonly stateDropdown: Locator;
  readonly cityDropdown: Locator;
  readonly submitButton: Locator;
  readonly modalTitle: Locator;
  readonly modalCloseButton: Locator;
  readonly modalContainer: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstName = page.locator('#firstName');
    this.lastName = page.locator('#lastName');
    this.email = page.locator('#userEmail');
    this.genderMale = page.locator("label[for='gender-radio-1']");
    this.mobile = page.locator('#userNumber');
    this.dateOfBirthInput = page.locator('#dateOfBirthInput');
    this.subjectsInput = page.locator('#subjectsInput');
    this.hobbiesSports = page.locator("label[for='hobbies-checkbox-1']");
    this.uploadPicture = page.locator('#uploadPicture');
    this.address = page.locator('#currentAddress');
    this.stateDropdown = page.locator('#state');
    this.cityDropdown = page.locator('#city');
    this.submitButton = page.locator('#submit');
    this.modalTitle = page.locator('#example-modal-sizes-title-lg');
    this.modalCloseButton = page.locator('#closeLargeModal');
    this.modalContainer = page.locator('.modal-content');
  }

  async navigateToFormPage() {
    await this.page.goto('https://demoqa.com/automation-practice-form', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
  }

  async fillRequiredFields() {
    await this.firstName.fill('sreenath');
    await this.lastName.fill('chadive');
    await this.genderMale.click();
    await this.mobile.fill('9876543210');
  }

  async fillAllFields() {
    await this.fillRequiredFields();
    await this.email.fill('sreenath@testmail.com');
    await this.address.fill('Bangalore, Karnataka');
  }

  async selectDateOfBirth(year: string, monthIndex: string, day: string) {
    await this.dateOfBirthInput.click();

    await this.page
      .locator('.react-datepicker__year-select')
      .selectOption(year);

    await this.page
      .locator('.react-datepicker__month-select')
      .selectOption(monthIndex);

    await this.page
      .locator(
        `.react-datepicker__day--0${day}:not(.react-datepicker__day--outside-month)`
      )
      .click();
  }

  async selectSubjects(...subjects: string[]) {
    for (const subject of subjects) {
      await this.subjectsInput.fill(subject);
      await this.subjectsInput.press('Enter');
    }
  }

  async selectStateAndCity() {
    await this.stateDropdown.click();
    await this.page.locator('#react-select-3-option-0').click();

    await this.cityDropdown.click();
    await this.page.locator('#react-select-4-option-0').click();
  }

  async uploadImage() {
    await this.uploadPicture.setInputFiles({
      name: 'profile.png',
      mimeType: 'image/png',
      buffer: Buffer.from('dummy-image-content'),
    });
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectModalVisible() {
    await expect(this.modalTitle).toBeVisible();
  }

  async closeModalAndExpectClosed() {
    await this.modalCloseButton.scrollIntoViewIfNeeded();
    await this.modalCloseButton.click({ force: true });
    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toBeEnabled();
  }
}

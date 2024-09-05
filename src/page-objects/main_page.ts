import { Locator, Page } from "@playwright/test";

export class MainPage {
  readonly page: Page;
  readonly url = "https://michalcapoun.github.io/portfolio/";
  readonly linkedinLink: Locator;
  readonly gitHubLink: Locator;
  readonly navbarGitHubLink: Locator;
  readonly emailLink: Locator;
  readonly navbarEmailLink: Locator;
  readonly resumeLink: Locator;
  readonly navbarResumeLink: Locator;
  readonly themeSwitcher: Locator;
  readonly liveVersionLink: Locator;
  readonly sourceCodeLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.linkedinLink = page.locator("//i[@id='theme-button']");
    this.gitHubLink = page.locator("");
    this.navbarGitHubLink = page.locator("");
    this.emailLink = page.locator("");
    this.navbarEmailLink = page.locator("");
    this.resumeLink = page.locator("");
    this.navbarResumeLink = page.locator("");
    this.themeSwitcher = page.locator("");
    this.liveVersionLink = page.locator("");
    this.sourceCodeLink = page.locator("");
  }
}

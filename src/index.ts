import puppeteer, {
  type Browser,
  type PuppeteerLaunchOptions,
} from "puppeteer";
import { default as Semaphore } from "@chriscdn/promise-semaphore";

// https://github.com/GoogleChrome/puppeteer/issues/661
// for --font-render-hinting=none - seems to fix inconsistent letter spacing between linux and everything else
// pipe : // https://github.com/GoogleChrome/puppeteer/issues/2735
const defaultPuppeteerOptions: PuppeteerLaunchOptions = {
  pipe: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--use-gl=desktop",
    "--font-render-hinting=none",
  ],
  dumpio: true,
  ignoreHTTPSErrors: true,
};

class PuppeteerManager {
  puppeteerOptions: PuppeteerLaunchOptions;
  _browser: Browser | null;
  timeoutId: NodeJS.Timeout | undefined;
  timeout: number;
  newPageSemaphore: Semaphore;
  openCloseSemaphore: Semaphore;

  constructor({
    puppeteerOptions = defaultPuppeteerOptions,
    pageLimit = 4,
    timeout = 30000, // 30s
  }: {
    puppeteerOptions?: PuppeteerLaunchOptions;
    pageLimit?: number;
    timeout?: number;
  } = {}) {
    this.puppeteerOptions = puppeteerOptions;
    this._browser = null;
    this.timeoutId = undefined;
    this.timeout = timeout;

    // limit the number of open tabs
    this.newPageSemaphore = new Semaphore(pageLimit);

    // Handles the extremely rare case when a new browser or page is being requested at the exact
    // moment a cleanup call is being made.
    this.openCloseSemaphore = new Semaphore();
  }

  // Never call this externally.
  private async browser() {
    if (this._browser === null) {
      console.log("Puppeteer Started");
      this._browser = await puppeteer.launch(this.puppeteerOptions);
    }

    this.tap();

    return this._browser;
  }

  /**
   * A lightweight debounce to check if the browser can be shutdown.
   */
  tap() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(this.closeBrowser.bind(this), this.timeout);
  }

  async closeBrowser() {
    try {
      await this.openCloseSemaphore.acquire();

      // Puppeteer starts with 1 blank tab open.
      if (this.isBrowserOpen && (await this.pageCount()) <= 1) {
        const browser = this._browser;
        this._browser = null;
        await browser!.close();
        console.log("Puppeteer Closed");
      } else {
        // console.log('Not ready to close.')
        this.tap();
      }
    } finally {
      this.openCloseSemaphore.release();
    }
  }

  get isBrowserOpen() {
    return Boolean(this._browser);
  }

  async newPage() {
    try {
      // limit the number of open tabs
      await this.newPageSemaphore.acquire();

      // prevents a closeBrowser() call from destroying this while doing async stuff
      // like calling browser() or newPage()
      await this.openCloseSemaphore.acquire();
      const browser = await this.browser();
      const page = await browser.newPage();

      page.on("close", () => this.newPageSemaphore.release());

      return page;
    } finally {
      this.openCloseSemaphore.release();
      // this.newPageSemaphore.release()
    }
  }

  async pageCount() {
    if (this.isBrowserOpen) {
      const pages = await this._browser!.pages();
      return pages.length;
    } else {
      return 0;
    }
  }
}

export default PuppeteerManager;

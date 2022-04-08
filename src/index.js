const puppeteer = require('puppeteer')
const Semaphore = require('@chriscdn/promise-semaphore')

// Handles the extremely rare case when a new browser or page is being requested at the exact
// moment a cleanup call is being made.
const openCloseSemaphore = new Semaphore()

// https://github.com/GoogleChrome/puppeteer/issues/661
// for --font-render-hinting=none - seems to fix inconsistent letter spacing between linux and everything else
// pipe : // https://github.com/GoogleChrome/puppeteer/issues/2735
const defaultPuppeteerOptions = {
  pipe: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--use-gl=desktop',
    '--font-render-hinting=none',
  ],
  dumpio: true,
  ignoreHTTPSErrors: true,
}

class PuppeteerManager {
  constructor({
    puppeteerOptions = defaultPuppeteerOptions,
    pageLimit = 4,
  } = {}) {
    this.puppeteerOptions = puppeteerOptions
    this._browser = null
    this.timeoutId = null

    // limit the number of open tabs
    this.newPageSemaphore = new Semaphore(pageLimit)
  }

  // Never call this externally.
  async browser() {
    if (this._browser == null) {
      console.log('Puppeteer Started')
      this._browser = await puppeteer.launch(this.puppeteerOptions)
    }

    this.tap()

    return this._browser
  }

  /**
   * A lightweight debounce to check if the browser can be shutdown.
   */
  tap() {
    clearTimeout(this.timeoutId)
    this.timeoutId = setTimeout(this.closeBrowser.bind(this), 10000)
  }

  async closeBrowser() {
    try {
      await openCloseSemaphore.acquire()

      // Puppeteer starts with 1 blank tab open.
      if (this.isBrowserOpen && (await this.pageCount()) <= 1) {
        const browser = this._browser
        this._browser = null
        await browser.close()
        console.log('Puppeteer Closed')
      } else {
        // console.log('Not ready to close.')
        this.tap()
      }
    } finally {
      openCloseSemaphore.release()
    }
  }

  get isBrowserOpen() {
    return Boolean(this._browser)
  }

  async newPage() {
    try {
      // limit the number of open tabs
      await this.newPageSemaphore.acquire()

      // prevents a closeBrowser() call from destroying this while doing async stuff
      // like calling browser() or newPage()
      await openCloseSemaphore.acquire()
      const browser = await this.browser()
      const page = await browser.newPage()

      return page
    } finally {
      openCloseSemaphore.release()
      this.newPageSemaphore.release()
    }
  }

  async pageCount() {
    if (this.isBrowserOpen) {
      const pages = await this._browser.pages()
      return pages.length
    } else {
      return 0
    }
  }
}

const puppeteerManager = new PuppeteerManager()

;(async () => {
  const freeze = async (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const page = await puppeteerManager.newPage()
  const page2 = await puppeteerManager.newPage()

  freeze(1000).then(() => page.close())
  freeze(10000).then(() => page2.close())
  //   console.log(browser)
})()

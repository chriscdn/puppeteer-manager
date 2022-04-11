# @chriscdn/puppeteer-manager

This package manages the lifecycle of a Puppeteer instance, and automatically starts and stops it when necessary.

This lets a developer focus on creating, using, and destroying pages without having to manage the instance. Page creation can also be limited, which prevents opening too many tabs at once. Requests to open additional pages are queued.

## Usage

Construct an instance:

```js
const PuppeteerManager = require('@chriscdn/puppeteer-manager')

const puppeteerManager = new PuppeteerManager({
  puppeteerOptions: {
    /* These options are passed to the Puppeteer constructor */
  },
  pageLimit: 4,
})
```

Then use it, as follows. You must call `page.close()` when done with the page.

```js
// if `pageLimit` pages are already open, then wait until a new slot becomes available
const page = await puppeteerManager.newPage()

try {
  // use page here, create PDF, screenshot, etc.
} finally {
  // You are responsible for closing the page once you're done with it.
  await page.close()
}
```

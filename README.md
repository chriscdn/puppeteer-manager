# @chriscdn/puppeteer-manager

This package manages the lifecycle of a Puppeteer instance, and automatically starts and stops it when necessary.

This lets a developer focus on creating, using, and destroying pages without having to manage the instance. The number of open pages can be limited, which prevents having too many open tabs at once. Additional requests to open pages are queued.

## Note

The version of Puppeteer is pinned at 19.1 due to [this bug](https://github.com/puppeteer/puppeteer/issues/9408), which seemed to be introduced in 19.2, In short, pages with overflowing content would get rendered at the wrong size.

**27 March 2025** Tried Puppeteer 24 and it creates an extra blank page.

## Usage

Construct an instance:

```ts
import { PuppeteerManager } from "@chriscdn/puppeteer-manager";

const puppeteerManager = new PuppeteerManager({
  puppeteerOptions: {
    /* These options are passed to the Puppeteer constructor */
  },
  pageLimit: 4,
});
```

Then use it. You must call `page.close()` after being done with the page.

```ts
// if `pageLimit` pages are already open, then wait until a new slot becomes available
const page = await puppeteerManager.newPage();

try {
  // use page here, create PDF, screenshot, etc.
} finally {
  // You are responsible for closing the page once you're done with it.
  await page.close();
}
```

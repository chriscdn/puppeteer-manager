const PuppeteerManager = require('./src/index.js')

const puppeteerManager = new PuppeteerManager({
  puppeteerOptions: {
    /* These options are passed to the Puppeteer constructor */
  },
  pageLimit: 3,
})

;(async () => {
  const page1 = await puppeteerManager.newPage()
  console.log('p1')

  setTimeout(() => page1.close(), 5000)

  const page2 = await puppeteerManager.newPage()
  console.log('p2')
  const page3 = await puppeteerManager.newPage()
  console.log('p3')
  const page4 = await puppeteerManager.newPage()
  console.log('p4')

  console.log('ok')
})()

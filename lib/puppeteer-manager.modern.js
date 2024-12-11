import e from"puppeteer";import t from"@chriscdn/promise-semaphore";const s={pipe:!0,args:["--no-sandbox","--disable-setuid-sandbox","--use-gl=desktop","--font-render-hinting=none"],dumpio:!0,ignoreHTTPSErrors:!0};class o{constructor({puppeteerOptions:e=s,pageLimit:o=4,timeout:i=3e4}={}){this.puppeteerOptions=void 0,this._browser=void 0,this.timeoutId=void 0,this.timeout=void 0,this.newPageSemaphore=void 0,this.openCloseSemaphore=void 0,this.puppeteerOptions=e,this._browser=null,this.timeoutId=void 0,this.timeout=i,this.newPageSemaphore=new t(o),this.openCloseSemaphore=new t}async browser(){return null===this._browser&&(console.log("Puppeteer Started"),this._browser=await e.launch(this.puppeteerOptions)),this.tap(),this._browser}tap(){clearTimeout(this.timeoutId),this.timeoutId=setTimeout(this.closeBrowser.bind(this),this.timeout)}async closeBrowser(){try{if(await this.openCloseSemaphore.acquire(),this.isBrowserOpen&&await this.pageCount()<=1){const e=this._browser;this._browser=null,await e.close(),console.log("Puppeteer Closed")}else this.tap()}finally{this.openCloseSemaphore.release()}}get isBrowserOpen(){return Boolean(this._browser)}async newPage(){try{await this.newPageSemaphore.acquire(),await this.openCloseSemaphore.acquire();const e=await this.browser(),t=await e.newPage();return t.on("close",()=>this.newPageSemaphore.release()),t}finally{this.openCloseSemaphore.release()}}async pageCount(){return this.isBrowserOpen?(await this._browser.pages()).length:0}}export{o as default};
//# sourceMappingURL=puppeteer-manager.modern.js.map
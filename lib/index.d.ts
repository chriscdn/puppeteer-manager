/// <reference types="node" />
import puppeteer, { type Browser, type PuppeteerLaunchOptions } from "puppeteer";
import Semaphore from "@chriscdn/promise-semaphore";
declare class PuppeteerManager {
    puppeteerOptions: PuppeteerLaunchOptions;
    _browser: Browser | null;
    timeoutId: NodeJS.Timeout | undefined;
    timeout: number;
    newPageSemaphore: Semaphore;
    openCloseSemaphore: Semaphore;
    constructor({ puppeteerOptions, pageLimit, timeout, }?: {
        puppeteerOptions?: PuppeteerLaunchOptions;
        pageLimit?: number;
        timeout?: number;
    });
    private browser;
    /**
     * A lightweight debounce to check if the browser can be shutdown.
     */
    tap(): void;
    /**
     * May need to revisit this. Are there cases when the browser refused to close?
     *
     * https://www.codepasta.com/2024/04/19/optimizing-puppeteer-pdf-generation
     */
    closeBrowser(): Promise<void>;
    get isBrowserOpen(): boolean;
    newPage(): Promise<puppeteer.Page>;
    pageCount(): Promise<number>;
}
export { puppeteer, PuppeteerManager };
export * from "puppeteer";

/// <reference types="node" />
import { Browser, PuppeteerLaunchOptions } from 'puppeteer';
import Semaphore from '@chriscdn/promise-semaphore';
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
    closeBrowser(): Promise<void>;
    get isBrowserOpen(): boolean;
    newPage(): Promise<import("puppeteer").Page>;
    pageCount(): Promise<number>;
}
export default PuppeteerManager;

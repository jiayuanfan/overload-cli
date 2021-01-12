import puppeteer, { Browser, Page } from 'puppeteer';

import { OutputDirname, sleep } from '../../utils';
import { GetScreenshotResponse, MakeSkeletonResponse, SkeletonConfig, SkeletonConfigRoute } from '../../interface';

const { readFileSync } = require('fs');
const { resolve } = require('path');

declare let SkeletonScript: any;

const MobileRectAttrs = { width: 375, height: 667 };
const BrowserRectAttrs = { width: 1200, height: 1000 };

class Skeleton {
  private options: SkeletonConfig;
  private browser: Browser | undefined;

  constructor(options: SkeletonConfig) {
    this.options = options;
  }

  async initialize() {
    this.browser = await puppeteer.launch({ headless: true });
  }

  async newPage() {
    const page = await this.browser?.newPage();

    if (this.options.isMobile === false) {
      await page?.setViewport({ ...BrowserRectAttrs, deviceScaleFactor: 2, isMobile: false });  
    } else {
      await page?.setViewport({ ...MobileRectAttrs, deviceScaleFactor: 2, isMobile: true });    
    }

    return page;
  }

  async makeSkeleton(page?: Page, options?: SkeletonConfigRoute): Promise<MakeSkeletonResponse> {
    const defer = 5000;
    const scriptContent = await readFileSync(resolve(__dirname, 'skeletonScript.js'), 'utf-8');
    await page?.addScriptTag({ content: scriptContent });
    await sleep(defer);
    const returnData = await page?.evaluate(options => {
      return SkeletonScript.genSkeleton(options);
    }, { rootID: this.options.rootID, ...options } as any);
    return returnData;
  }

  async genScreenShot(url: string, routeConfig: SkeletonConfigRoute): Promise<GetScreenshotResponse> {
    const page = await this.newPage();

    // 设置当前页面的cookie
    if (Array.isArray(routeConfig.cookies)) {
      for (let i = 0; i < routeConfig.cookies.length; i++) {    
        await page?.setCookie(routeConfig.cookies[i]);    
      }
    }

    try {
      await page?.goto(url, { waitUntil: 'networkidle2' });
    } catch (error) {
      return { success: false, errorMessage: `以下路径无法访问，请先保证网络畅通 - ${url}` };
    }

    const makeReturnData = await this.makeSkeleton(page, routeConfig);
    if (makeReturnData.success === false) {
      return { success: false, errorMessage: makeReturnData.message };
    }

    let imageFileName = String(new Date().getTime());
    try {
      imageFileName = routeConfig.path.split('/').join('_');
    } catch (error) {
      console.error(error);
    }
    imageFileName += '.jpeg';

    let screenshotClip = this.options.isMobile === false ? { x: 0, y: 0, ...BrowserRectAttrs } : { x: 0, y: 0, ...MobileRectAttrs };
    if (routeConfig.clip) {
      screenshotClip = routeConfig.clip;
    }

    await page?.screenshot({ type: 'jpeg', path: resolve(OutputDirname, imageFileName), ...screenshotClip });
    let base64Image = await page?.screenshot({ type: 'jpeg', encoding: 'base64', ...screenshotClip });
    base64Image = `data:image/jpg;base64,${base64Image}`;
    return { success: true, data: base64Image };
  }

  async destroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }
}

export default Skeleton;
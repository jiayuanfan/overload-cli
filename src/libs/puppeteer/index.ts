import us from 'uus';

import { PuppeteerResponse, ScreenshotData, SkeletonConfig } from "../../interface";
import { concatOriginUrl, loggerEnd, loggerError, loggerStart } from "../../utils";
import Skeleton from './Skeleton';

const LOGGER_TITLE: string = '制作骨架屏';

const initialize = async (skeletonConfig: SkeletonConfig): Promise<PuppeteerResponse> => {
  if (Array.isArray(skeletonConfig.routes) && skeletonConfig.routes.length > 0) {
    const screenshotData: ScreenshotData = {};

    for (let i = 0; i < skeletonConfig.routes.length; i++) {
      const routeConfig = skeletonConfig.routes[i];

      const skeleton = new Skeleton(skeletonConfig);
      await skeleton.initialize();

      let originURL = concatOriginUrl(skeletonConfig.originUrl, routeConfig.path, skeletonConfig.routeMode);

      if (routeConfig.query) {
        originURL = us.concat(routeConfig.query, originURL);
      }

      loggerStart(`${LOGGER_TITLE} - ${originURL}`);

      const skeletonItemData = await skeleton.genScreenShot(originURL, routeConfig);
      if (!skeletonItemData) {
        loggerError(LOGGER_TITLE, `以下路径无法访问，请先保证网络畅通 - ${originURL}`);
        return { success: false };
      }

      if (skeletonConfig.isMobile === false) {
        screenshotData[routeConfig.path] = {
          content: encodeURIComponent(skeletonItemData),
        };
      } else {
        screenshotData[routeConfig.path] = {
          content: encodeURIComponent(skeletonItemData),
          width: 375,
        };
      }
      
      await skeleton.destroy();

      loggerEnd(`${LOGGER_TITLE} - ${originURL}`);
    }
    return { success: true, data: screenshotData };
  }
  return { success: false };
};

export default { initialize };
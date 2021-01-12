import us from 'uus';

import { PuppeteerResponse, ScreenshotData, SkeletonConfig } from "../../interface";
import { concatOriginUrl, loggerError, loggerSpinning } from "../../utils";
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

      // 制作骨架屏
      const { success, data = '', errorMessage = '未知错误' } = 
        await loggerSpinning(`${LOGGER_TITLE} - ${originURL}`, () => skeleton.genScreenShot(originURL, routeConfig));

      if (success === false) {
        loggerError(LOGGER_TITLE, errorMessage);
        await skeleton.destroy();
        return { success: false };
      }

      if (skeletonConfig.isMobile === false) {
        screenshotData[routeConfig.path] = {
          content: encodeURIComponent(data),
        };
      } else {
        screenshotData[routeConfig.path] = {
          content: encodeURIComponent(data),
          width: 375,
        };
      }
      
      await skeleton.destroy();
    }
    return { success: true, data: screenshotData };
  }
  return { success: false };
};

export default { initialize };
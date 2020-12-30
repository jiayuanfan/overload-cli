import Load from './libs/load';
import Puppeteer from './libs/puppeteer';
import Output from './libs/output';
import Preview from './libs/preview';
import { setCommonDirnames } from './utils';

const bootstrap = async (configPath: string) => {
  // 0. 共用参数设置
  const setSuccess = setCommonDirnames();
  if (setSuccess !== true) return;

  // 1. 读取 config
  const { success: loadSuccess, data: skeletonConfig } =  await Load.initialize(configPath);
  if (loadSuccess !== true || !skeletonConfig) return;

  // 2. 启动 puppeteer，置换元素，生成截图
  const { success: puppeteerSuccess, data: screenshotData } = await Puppeteer.initialize(skeletonConfig);
  if (puppeteerSuccess !== true || !screenshotData) return;

  // 3. 输出管理
  const runtimeContent = await Output.initialize(screenshotData, skeletonConfig);
  if (!runtimeContent) return;

  // 4. 启动预览
  await Preview.initialize(runtimeContent, skeletonConfig);
};

export default bootstrap;
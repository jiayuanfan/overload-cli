import { ScreenshotData, SkeletonConfig } from "../../interface";
import { loggerEnd, loggerStart, OutputDirname } from "../../utils";
import runtime from './runtime';

const { resolve } = require('path');
const { writeFileSync } = require('fs');

const LOGGER_TITLE: string = '输出生成内容';

const initialize = async (screenshotData: ScreenshotData, config: SkeletonConfig): Promise<string> => {
  loggerStart(LOGGER_TITLE);

  let screenshotDataJSON = '';
  try {
    screenshotDataJSON = JSON.stringify(screenshotData);
  } catch (error) {
    console.error(error);
  }

  let runtimeContent = runtime();
  runtimeContent = runtimeContent.replace('<!-- caches -->', screenshotDataJSON);
  runtimeContent = runtimeContent.replace('<!-- mode -->', config.routeMode || 'hash');
  runtimeContent = runtimeContent.replace('<!-- rootID -->', config.rootID);

  await writeFileSync(resolve(OutputDirname, 'runtime-script.html'), runtimeContent);

  loggerEnd(LOGGER_TITLE);

  return runtimeContent;
};

export default { initialize };
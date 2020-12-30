import { LoadResponse } from '../interface';
import { loggerStart, loggerEnd, loggerError, OriginDirname } from '../utils';

const path = require('path');
const fs = require('fs');

const LOGGER_TITLE: string = '读取配置文件';
const REQUIRED_ATTRIBUTES = ['rootID', 'originUrl', 'routes'];

const initialize = async (configPath: string): Promise<LoadResponse> => {
  loggerStart(LOGGER_TITLE);

  const SKELETON_CONFIG_PATH = path.resolve(OriginDirname, configPath);
  if (!fs.existsSync(SKELETON_CONFIG_PATH)) {
    loggerError(LOGGER_TITLE, `未找到目标路径的配置文件 - ${SKELETON_CONFIG_PATH}`);
    return { success: false };
  }

  const skeletonConfig = require(SKELETON_CONFIG_PATH);
  if (!skeletonConfig || typeof skeletonConfig !== 'object') {
    loggerError(LOGGER_TITLE, '配置文件内容格式异常');
    return { success: false };
  }

  let missingKey;
  const skeletonConfigKeys = Object.keys(skeletonConfig);
  REQUIRED_ATTRIBUTES.forEach((attr: string) => {
    if (!skeletonConfigKeys.includes(attr)) missingKey = attr;
  });
  if (missingKey) {
    loggerError(LOGGER_TITLE, `配置文件参数「${missingKey}」丢失`);
    return { success: false };
  }

  loggerEnd(LOGGER_TITLE);
  return { success: true, data: skeletonConfig };
};

export default { initialize };
import express from 'express';
import { SkeletonConfig, SkeletonConfigRoute } from '../../interface';
import { concatOriginUrl, loggerStart, PreviewTempDirname } from '../../utils';
import rawData from './rawData';

const { writeFileSync } = require('fs');
const { resolve } = require('path');

const LOGGER_TITLE: string = '启动本地预览';

const initialize = async (runtimeContent: string, skeletonConfig: SkeletonConfig): Promise<boolean> => {
  loggerStart(LOGGER_TITLE);

  let content = rawData();
  content = content.replace('<!-- rootID -->', skeletonConfig.rootID);
  content = content.replace('<!-- skeleton -->', runtimeContent);

  const previewTempFilePath = resolve(PreviewTempDirname, 'index.html');
  await writeFileSync(previewTempFilePath, content);

  const app = express();
  app.use(express.static(PreviewTempDirname));
  app.listen(3333);

  console.log('本地进程启动成功，请使用以下地址进行访问预览...');
  skeletonConfig.routes.forEach((routeConfig: SkeletonConfigRoute) => {
    console.log(concatOriginUrl('http://localhost:3333', routeConfig.path, skeletonConfig.routeMode));
  });
  return true;
};

export default { initialize };
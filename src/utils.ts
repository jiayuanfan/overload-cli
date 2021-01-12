const { resolve } = require('path');
const { existsSync, mkdirSync } = require('fs');
const ora = require('ora');

const logger = (logInfo: string, type: string, failureMsg?: string) => {
  let info = '';
  if (type === 'start') {
    info = `=> 开始任务：${logInfo}`;
  }
  if (type === 'end') {
    info = `✨ 结束任务：${logInfo}`;
  } 
  if (type === 'error') {
    info = `💣 任务失败：${logInfo}`;
  }

  const nowDate = new Date();
  console.log(
    `[${nowDate.toLocaleString()}.${nowDate
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}] ${info}
    `,
  );
  if (type === 'error' && failureMsg) {
    console.log(`✨ 失败原因：${failureMsg}`);
  }
};

const loggerStart = (logInfo: string) => logger(logInfo, 'start');

const loggerEnd = (logInfo: string) => logger(logInfo, 'end');

const loggerError = (logInfo: string, failureMsg: string) => logger(logInfo, 'error', failureMsg);

async function loggerSpinning<T> (title: string, runFn: () => Promise<T>): Promise<T> {
  const nowDate = new Date();
  const spinner = ora(`[${nowDate.toLocaleString()}.${nowDate.getMilliseconds().toString().padStart(3, '0')}] ${title}\n`);
  spinner.start();
  const response = await runFn();
  spinner.succeed();
  return response;
}

const sleep = (duration: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
};

const concatOriginUrl = (originURL: string, path: string, routeMode: string = 'hash'): string => {
  if (routeMode === 'hash') {
    if (originURL[originURL.length - 1] !== '/' && !originURL.endsWith('.html')) {
      originURL += '/';
    }
    originURL += `#${path}`; 
  } else {
    if (originURL[originURL.length - 1] === '/') {
      originURL = originURL.substr(0, originURL.length - 1);
    }
    originURL += path;
  }
  return originURL;
};

let OriginDirname: string = '';
let OutputDirname: string = '';
let PreviewTempDirname: string = '';

const setCommonDirnames = (): boolean => {
  const loggerTitle = '初始化';
  loggerStart(loggerTitle);

  OriginDirname = process.cwd();
  OutputDirname = resolve(OriginDirname, 'nb-skeleton-cli-output');
  if (!existsSync(OutputDirname)) {
    mkdirSync(OutputDirname);
  }

  PreviewTempDirname = resolve(__dirname, 'nb-skeleton-cli-temp');
  if (!existsSync(PreviewTempDirname)) {
    try {
      mkdirSync(PreviewTempDirname);
    } catch (error) {
      loggerError(loggerTitle, '权限不够！请使用 sudo 运行当前命令！');
      return false;
    }
  }

  loggerEnd(loggerTitle);
  return true;
};

export { 
  loggerStart, 
  loggerEnd, 
  loggerError, 
  loggerSpinning,
  sleep, 
  concatOriginUrl, 
  setCommonDirnames, 
  OriginDirname, 
  OutputDirname, 
  PreviewTempDirname, 
};
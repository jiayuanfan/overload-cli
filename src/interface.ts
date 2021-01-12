interface Response {
  success: boolean;
}

export interface SkeletonConfigCookie {
  name: string;
  value: string;
  domain: string;
  path?: string;
  expires?: number;
}

export interface SkeletonConfigRoute {
  path: string;
  query?: { [props: string]: string };
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  cookies?: SkeletonConfigCookie[];
  excludes?: string[];
  focusTag?: {
    singleBlock?: string[];
  };
}

export interface SkeletonConfig {
  rootID: string;
  originUrl: string;
  routes: SkeletonConfigRoute[];
  routeMode?: 'hash' | 'history';
  isMobile?: boolean;
}

export interface LoadResponse extends Response {
  data?: SkeletonConfig;
}

export interface MakeSkeletonResponse {
  success: boolean;
  message: string;
}

export interface GetScreenshotResponse {
  success: boolean;
  data?: string;
  errorMessage?: string;
}

export interface ScreenshotData {
  [props: string]: {
    content: string;
    width?: number;
  };
}

export interface PuppeteerResponse extends Response {
  data?: ScreenshotData;
}


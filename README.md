## skeleton-cli

> 一个生成骨架屏的 cli

## 快速开始

```sh
sudo npm install -g puppeteer --unsafe-perm=true
sudo npm install -g skeleton-cli
```

```sh
sudo skeleton-cli start skeleton.config.js
```

## About skeleton.config.js

```ts
interface SkeletonConfigRoute {
  path: string; // 页面路径
  query?: { [props: string]: string }; // 访问当前页面需要拼接的页面参数
  clip?: { // skeleton 生成时的截取视口
    x: number;
    y: number;
    width: number;
    height: number;
  };
  cookies?: SkeletonConfigCookie[]; // 访问当前页面需要带的 cookie
  excludes?: string[]; // 生成 skeleton 时，页面上需要过滤（不显示在 skeleton 中）的元素（填 className）
  focusTag?: { // 生成 skeleton 时，页面上部分需要强行使用其他元素的转化模式的元素（ex：<p> 标签实现了 <button> 的样式，正常情况下 cli 只会识别它为文本，并转化为文本的样式，这时就需要把当前 <p> 元素的 className 填入下述 singleBlock 的数组中，来生成正确的 <button> 样式的 skeleton）
    singleBlock?: string[];
  };
}

interface SkeletonConfig {
  isMobile?: boolean; // true 表示 h5 端，false 表示 pc 端（默认为 true）
  rootID: string; // 需要生成的根结点 id
  originUrl: string; // 应用根地址
  routes: SkeletonConfigRoute[]; // 应用的不同页面规则 
  routeMode?: 'hash' | 'history'; // 应用路由模式，默认 hash
}

const skeletonConfig: SkeletonConfig = {};
module.exports = skeletonConfig;
```
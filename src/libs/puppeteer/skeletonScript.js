window.SkeletonScript = (function() {
  const $ = document.querySelectorAll.bind(document);
  const REMOVE_TAGS = ['title', 'meta', 'style', 'link', 'script'];
  const CLASSNAME_PREFIX = 'sk-';
  const MOCK_TEXT_ID = 'sk-span-measure-text';
  const STYLES_CACHE = new Map();
  const SMALLEST_BASE64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const DEFAULT_COLOR = '#EFEFEF';
  
  let offScreenWrapElement = undefined;
  let offScreenElement = undefined;

  // 获取文本宽度
  const measureTextWidth = (width, text, fontSize, letterSpacing, fontFamily) => {
    offScreenElement = document.getElementById(MOCK_TEXT_ID);
    if (!offScreenElement) {
      offScreenWrapElement = document.createElement('p')
      offScreenElement = document.createElement('span')
      offScreenWrapElement.style.width = '1000000px';
      offScreenElement.id = MOCK_TEXT_ID
      offScreenWrapElement.appendChild(offScreenElement)
      document.body.appendChild(offScreenWrapElement)
    }
    offScreenElement.style.fontSize = fontSize;
    offScreenElement.style.letterSpacing = letterSpacing;
    offScreenElement.style.fontFamily = fontFamily;
    offScreenElement.textContent = text;  
    return offScreenElement.getBoundingClientRect().width;
  }

  /** 几种处理器 **/

  // 单个完整灰色块处理器
  function singleBlockHandler(element) {
    const computedStyles = window.getComputedStyle(element);
    if (computedStyles.display === 'inline') {
      element.style.display = 'inline-block';
    }

    const {
      display,
      float,
      flex,
      position,
      left,
      top,
      right,
      bottom,
      width,
      height,
      padding,
      margin,
      transform,
      borderRadius,
      overflow,
    } = window.getComputedStyle(element);
    
    const divElement = document.createElement('div');
    setStyle(divElement, {
      background: DEFAULT_COLOR,
      display,
      float,
      flex,
      position,
      left,
      top,
      right,
      bottom,
      width,
      height,
      padding,
      margin,
      transform,
      'border-radius': borderRadius,
      overflow,
      'vertical-align': 'text-bottom',
    });

    element.parentNode.replaceChild(divElement, element);
  }

  // 表格处理器
  function tableHandler(element) {
    const className = CLASSNAME_PREFIX + 'table';
    const rule = `{
      background: none !important;
    }`;
    addClassName(`.${className}`, rule);
    element.classList.add(className);

    const { width, height } = element.getBoundingClientRect();
    element.style.width = width + 'px';
    element.style.height = height + 'px';
    element.style.boxSizing = 'border-box';

    // 这里比较奇怪，如果不这样设置，会导致表格错乱（不清楚是不是element-ui的问题）
    if (['TH', 'TD'].includes(element.tagName) && element.parentNode.children[0] === element) {
      element.style.display = 'inline-block';      
    }
  }

  // 图片处理器
  function imgHandler(element) {
    const { width, height } = element.getBoundingClientRect();
    const attrs = { width, height, src: SMALLEST_BASE64 };
    setAttributes(element, attrs);

    const className = CLASSNAME_PREFIX + 'img';
    const rule = `{
      background: ${DEFAULT_COLOR} !important;
      border: none !important;
      box-shadow: none !important;
    }`;
    addClassName(`.${className}`, rule);
    element.classList.add(className);
  }

  // 文本处理器
  function textHandler(element) {
    // 1. 初始化各类变量
    let { fontSize, lineHeight, paddingTop, paddingBottom, textAlign, ...rest } = window.getComputedStyle(element);
    const { width, height } = element.getBoundingClientRect();

    const computedFontSize = parseFloat(fontSize);
    let computedLineHeight = parseFloat(lineHeight);
    if (isNaN(computedLineHeight)) {
      computedLineHeight = computedFontSize;
    }
    if (computedLineHeight > height) {
      computedLineHeight = height;
    }
    const computedPaddingTop = parseFloat(paddingTop);
    const computedPaddingBottom = parseFloat(paddingBottom);

    // 2. 判断当前文本是不是那种占了全行的块级文本
    // 这种文本会导致一个问题，如果它的内容过短
    // 生成的骨架屏和实际的长短就不一致了
    if (rest.display === 'block') {
      const textWidth = measureTextWidth(width, element.innerText, fontSize, rest.letterSpacing, rest.fontFamily);
      if ((width - textWidth > 8)) {
        const spanElement = document.createElement('span');
        spanElement.innerHTML = element.innerHTML;
        element.innerHTML = '';
        element.appendChild(spanElement);
        commonHandler(element);
        textHandler(spanElement);
        return;
      }
    }

    // 3. 计算文本的行数、绘制背景
    const lineCount = Math.ceil((height - paddingTop - paddingBottom) / lineHeight);

    const textHeightRatio = computedFontSize / computedLineHeight;
    const firstColorPoint = ((1 - textHeightRatio) / 2 * 100).toFixed(2);
    const secondColorPoint = (((1 - textHeightRatio) / 2 + textHeightRatio) * 100).toFixed(2);

    const className = CLASSNAME_PREFIX + 'text';
    // vertical-align没做important标签，只是一个保底设置
    const rule = `{
      background-origin: content-box !important;
      background-clip: content-box !important;
      background-color: transparent !important;
      color: transparent !important;
      background-repeat: repeat-y !important;
      vertical-align: middle;
    }`;
    addClassName(`.${className}`, rule);
    element.classList.add(className);
    setAttributes(element, { style: `
      background-image: linear-gradient(
        transparent ${firstColorPoint}%, ${DEFAULT_COLOR} 0%,
        ${DEFAULT_COLOR} ${secondColorPoint}%, transparent 0%);
      background-size: 100% ${computedLineHeight}px;
    ` });
  }

  // 通用处理器
  function commonHandler(element) {
    const { border } = getComputedStyle(element);

    if (element.tagName === 'INPUT') {
      if (border.indexOf('none') > -1) {
        singleBlockHandler(element);
        return;
      }
      element.disabled = 'disabled';
      element.placeholder = '';
    } else {
      element.style.border = 'none';
    }

    element.style.color = 'transparent';
    element.style.background = '#fff';
    element.style.outline = 'none';
    element.style.borderCollapse = 'collapse';
  }

  // 直接移除处理器
  function removeHandler(element) {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  function addClassName(selector, rule) {
    if (!STYLES_CACHE.has(selector)) {
      STYLES_CACHE.set(selector, rule);
    }
  }

  function setStyle(element, styleObject) {
    element.setAttribute('style', Object.keys(styleObject).reduce((preValue, styleK) => preValue + `${styleK}: ${styleObject[styleK]};`, ''));
  }

  function setAttributes(element, attrs) {
    Object.keys(attrs).forEach(key => element.setAttribute(key, attrs[key]));
  }

  // 主入口
  function genSkeleton(options = {}) {
    // 1. 处理全局各种伪元素选择器
    const beforeFakeSelectorClassName = CLASSNAME_PREFIX + 'before-fake-selector';
    const afterFakeSelectorClassName = CLASSNAME_PREFIX + 'after-fake-selector';
    const fakeSelectorRule = `{
      content: '' !important;
      background: none !important;
      border: none !important;
    }`;
    addClassName(`.${beforeFakeSelectorClassName}::before`, fakeSelectorRule);
    addClassName(`.${afterFakeSelectorClassName}::after`, fakeSelectorRule);

    // 2. 处理全局的样式
    document.documentElement.style.background = 'none';
    document.body.style.background = 'none';

    // 3. 开启根结点遍历
    const rootElement = document.getElementById(options.rootID);
    (function traverse(options) {
      // 3.1 参数配置
      const { excludes = [], focusTag } = options;

      (function preTraverse(element) {
        if (!element) return;

        const computedStyles = getComputedStyle(element);

        // 3.2 删除不需要的元素
        if (REMOVE_TAGS.includes(element.tagName) || 
          excludes.includes(element.className) || 
          computedStyles.display === 'none' || 
          computedStyles.visibility === 'hidden'
        ) {
          removeHandler(element);
          return;
        }

        // 3.3 设置伪元素选择器样式
        if (getComputedStyle(element, '::before').content !== 'none') {
          element.classList.add(beforeFakeSelectorClassName);
        }
        if (getComputedStyle(element, '::after').content !== 'none') {
          element.classList.add(afterFakeSelectorClassName);
        }

        // 3.4 如果存在强制转化参数配置，执行
        if (focusTag) {
          const { singleBlock: singleBlockTags = [] } = focusTag;
          if (singleBlockTags.some(item => element.className.indexOf(item) > -1)) {
            singleBlockHandler(element);
            return;
          }
        }
        
        // 3.5 如果元素上存在role=button属性，执行单块元素处理器
        if (element.getAttribute('role') === 'button') {
          singleBlockHandler(element);
          return;
        }
        
        // 3.6 缺省处理
        const continueChildrenFn = element => {
          Array.from(element.children || []).forEach(child => {
            preTraverse(child);
          });
        };
        switch (element.tagName) {
          case 'IMG':
            imgHandler(element);
            break;

          case 'BUTTON':
          case 'VIDEO':
          case 'AUDIO':
          case 'CANVAS':
          case 'SVG':
          case 'I':
          case 'S':
          case 'IFRAME':
            singleBlockHandler(element);
            break;

          case 'TABLE':
          case 'THEAD':
          case 'TBODY':
          case 'TR':
          case 'TH':
          case 'TD':
            continueChildrenFn(element);
            tableHandler(element);
            break;

          case 'COLGROUP':
            break;
        
          default:
            if ((element.children && element.children.length > 0) || element.innerText.length < 1) {
              if (element.getAttribute('class') || element.getAttribute('style')) {
                if (computedStyles.display === 'inline') {
                  singleBlockHandler(element);
                  return;
                }
              }
              continueChildrenFn(element);
              commonHandler(element);
            } else {
              textHandler(element);
            }
            break;
        }
      })(rootElement);
    })(options);

    // 4. 追加 style 内容
    let rules = '';
    for (const [selector, rule] of STYLES_CACHE) {
      rules += `${selector} ${rule}\n`;
    }
    const styleElement = document.createElement('style');
    styleElement.innerHTML = rules;
    document.head.appendChild(styleElement);

    // 5. 删除测量 text 的 dom
    if (offScreenWrapElement) document.body.removeChild(offScreenWrapElement);
  }

  return { genSkeleton };
})();
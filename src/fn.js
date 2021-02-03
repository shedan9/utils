const isType = function (type) {
  return function (arg) {
    return Object.prototype.toString.call(arg) === `[object ${type}]`;
  };
};

export const isFunction = isType('Function');

export const isObject = isType('Object');

export const isString = isType('String');

export const isArray = isType('Array');

export const isDate = isType('Date');

//深拷贝
export function deepCopy(data) {
  if (!Array.isArray(data) && !isObject(data)) {
    return data;
  } else if (Array.isArray(data)) {
    return data.map(item => deepCopy(item));
  } else if (isObject(data)) {
    let ret = {};
    Object.keys(data).forEach(key => {
      ret[key] = deepCopy(data[key]);
    });
    return ret;
  }
}

/**
 * 保留小数位方法
 * @params value [Number, String]: 原数据
 * @params n [Number]: 保留的位数，默认保留整数
 * @params addZero [Boolean]: 是否补0，默认补0
 * @return [String]: 处理后的字符串
 */
export function round(value, n = 0, addZero = true) {
  if (isNaN(Number(value))) {
    return value;
  }
  value = Number(value);
  let ret = Math.round(value * Math.pow(10, n)) / Math.pow(10, n) + "";
  let decimalStr = ret.split(".")[1] || "";
  if (addZero) {
    let len = n - decimalStr.length;
    if (!decimalStr && len) {
      ret += ".";
    }
    for (let i = 0; i < len; i++) {
      ret += "0";
    }
  }
  return ret;
}

/**
 * 为10以内的数字补0
 */
export function addZero(n) {
  if (n >= 10) {
    return n + '';
  } else if (n < 10 && n >= 0) {
    return '0' + n;
  } else {
    return n;
  }
}

export function stringToDate(str) {
  // 字符串必需符合以下规则：
  // 按照年月日时分秒顺序；
  // 至少需指定到日，日与时之间需要加空格；
  // 连接符只能是一个字符，只有日的或者最后一个的连接符可以省略。
  // 例如如：2018-01-2 00:0:3，2018年2月20日 12时30，2018-2-1。
  const reg = /^(\d{1,4})\D(0[^0]|1[012]|[^0])\D(0[^0]|[12]\d|3[01]|[^0])(?:[^\d\s])?(?:\s|$)(?:([01]\d|2[0-3]|[^0])|$)(?:\D|$)(?:([0-5]\d|[^0])|$)(?:\D|$)(?:([0-5]\d|[^0])|$)(?:\D|$)(?:(\d{1,3})|$)\D?$/;
  if (!reg.test(str)) {
    throw new Error('字符串格式错误');
  }
  let year = 0, month = 0, day = 0, hours = 0, minutes = 0, seconds = 0, milliseconds = 0;
  str.replace(reg, (...arg) => {
    year = Number(arg[1]);
    month = Number(arg[2]) - 1;
    day = Number(arg[3]);
    if (arg[4]) {
      hours = Number(arg[4]);
    }
    if (arg[5]) {
      minutes = Number(arg[5]);
    }
    if (arg[6]) {
      seconds = Number(arg[6]);
    }
    if (arg[7]) {
      milliseconds = Number(arg[7]);
    }
  });
  return new Date(year, month, day, hours, minutes, seconds, milliseconds);
}

/**
 * 将时间转换成字符串
 *
 * format可选格式：
 * yyyy替换年，MM替换月，dd替换天，HH替换时，mm替换分，ss替换秒，都可缺省
 * 中间的间隔单位只能使用一个字符，单位都可缺省
 * 例如：yyyy年MM月dd日 HH时mm分ss秒，yyyy-MM-dd HH:mm:ss，MM dd HH, yyyyMMdd
 */
export function dateToString(date, format = 'yyyy-MM-dd HH:mm:ss') {
  if (!isDate(date)) {
    throw new Error("第一个参数请传入Date类型");
  }
  const reg = /^(y{4})?[^yMdHms]?(M{2})?[^yMdHms]?(d{2})?[^yMdHms]?\s?(H{2})?[^yMdHms]?(m{2})?[^yMdHms]?(s{2})?[^yMdHms]?$/;
  if (!reg.test(format)) {
    throw new Error("第二个参数请传入yyyy-MM-dd HH:mm:ss格式的字符串");
  }
  format = format.replace(reg, (...arg) => {
    let match = arg[0];
    if (arg[1]) {
      let year = date.getFullYear();
      match = match.replace(arg[1] + "", year + "");
    }
    if (arg[2]) {
      let month = addZero(date.getMonth() + 1);
      match = match.replace(arg[2] + "", month);
    }
    if (arg[3]) {
      let day = addZero(date.getDate());
      match = match.replace(arg[3] + "", day);
    }
    if (arg[4]) {
      let hour = addZero(date.getHours());
      match = match.replace(arg[4] + "", hour);
    }
    if (arg[5]) {
      let min = addZero(date.getMinutes());
      match = match.replace(arg[5] + "", min);
    }
    if (arg[6]) {
      let second = addZero(date.getSeconds());
      match = match.replace(arg[6] + "", second);
    }
    return match;
  });
  return format;
}

/**
 * 格式化时间格式字符串
 * 字符串规则以及format规则同stringToDate，dateToString函数
 */
export function formatDateString(str, format) {
  return dateToString(stringToDate(str), format);
}

/**
 * 生成 n - m 之间的随机数
 */
export function getRandom(n, m) {
  return Math.floor(Math.random() * (m - n + 1) + n);
}

/**
 * 生成一个唯一的字符串ID，每次执行结果必定不一样
 */
export function getUid() {
  const random = "0123456789abcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < 4; i++) {
    str += random[getRandom(0, 35)];
  }
  return new Date().valueOf() + str;
}

/**
 * 为指定dom增加类名
 */
export function addClass(el, className) {
  let elClassName = el.getAttribute("class");
  elClassName && (elClassName += " ");
  elClassName += className;
  el.setAttribute("class", elClassName);
}

/**
 * 为指定dom删除类名
 */
export function removeClass(el, className) {
  let elClassName = el.getAttribute("class");
  let arr = elClassName.split(" ");
  className.split(" ").forEach(item => {
    arr = arr.filter(c => c !== item);
  });
  elClassName = arr.join(" ");
  el.setAttribute("class", elClassName);
}

// 获取HREF中所有参数
export function getLocationParams() {
  const search = location.search.slice(1);
  let arr = search.split('&');
  return arr.map(item => {
    let ary = item.split('=');
    return {
      name: ary[0],
      value: ary[1],
    };
  });
}

// 获取HREF中的指定参数
export function getLocationParam(name) {
  return (getLocationParams().find(item => item.name === name) || {}).value;
}

// 阿拉伯数字中文数字转换
export function numberTranslate(val) {
  const numArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const chineseArr = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (isNaN(val)) {
    const index = chineseArr.findIndex(item => item === val);
    return numArr[index];
  } else {
    const index = numArr.findIndex(item => item === val);
    return chineseArr[index];
  }
}

// 为数字添加千分符
export function addThousandSplit(num) {
  num = num + '';
  let integer = num.split('.')[0];
  let surplus = num.split('.')[1];
  const arr = integer.split('');
  const val = arr.reduceRight((acc, cur, index) => {
    if ((arr.length - 1 - index) % 3 === 2 && index !== 0) {
      cur = ',' + cur;
    }
    return cur + acc;
  }, '');
  return surplus ? val + '.' + surplus : val;
}

/**
 * 复制
 */
export function copy(value) {
  const input = document.createElement('input');
  document.body.appendChild(input);
  input.setAttribute('readonly', 'readonly');
  input.setAttribute('value', value);
  input.select();
  if (document.execCommand('copy')) {
    document.execCommand('copy');
  }
  document.body.removeChild(input);
}

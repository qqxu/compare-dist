const fs = require('fs');
const path = require('path');

function compareDirectories(baseDir, compareDir, outputFileName) {
  const baseFiles = getFilesMap(baseDir);
  const compareFiles = getFilesMap(compareDir);

  let diff = [];

  for (const [key, value] of Object.entries(baseFiles)) {
    if (compareFiles[key]) { // 如果原文件存在于当前目录下
      const sizeDiff = compareFiles[key] - value;
      const curSize = compareFiles[key]
      const baseSize = value
      const diffSize = sizeDiff
      const compareFile = key.replace(baseDir, compareDir);

      diff.push([curSize, baseSize, diffSize, compareFile]);

      delete compareFiles[key];
    } else { // 如果原文件已经被删除
      const curSize = '0';
      const baseSize = value;
      const diffSize = `-${value}`
      const compareFile = key;

      diff.push([curSize, baseSize, diffSize, compareFile]);
    }
  }

  for (const [key, value] of Object.entries(compareFiles)) { // 当前新增的文件
    const curSize = value;
    const baseSize =  '0';
    const diffSize = value;
    const compareFile = key;
  
    diff.push([curSize, baseSize, diffSize, compareFile]);
  }

  const newArr = sortArr(diff, 2); // 按照 文件差值(diffSize) 倒序

  const unitArr = addUnit(newArr); // 给每个元素增加单位

  const columnName = ['CurSize','BaseSize', 'Diff(按此列倒序)', 'FileName'];
  
  unitArr.unshift(columnName); // 增加列名
  const res = formatArr(unitArr); // 填充空格
  const output = res.map(row => row.join('\t')).join('\n');
  fs.writeFileSync(outputFileName, output);
}

function addUnit(arr) {
  return arr.map(itm => itm.map(ele => getSizeUnit(ele)))
}

const sortArr = (arr, sortIdx) => {
  return arr.sort((a, b) => Number(b[sortIdx]) - Number(a[sortIdx]));
}


/**
 * @description: 读取目录下所有文件，生成文件名及其大小的map文件 { filePath: fileSize }
 * @param {*} dir
 * @return {*}
 */
function getFilesMap(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const filesMap = {};

  for (const file of files) {
    if (file.name.startsWith('.')) {
      continue;
    }

    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      Object.assign(filesMap, getFilesMap(filePath));
    } else {
      const fileSize = fs.statSync(filePath).size;
      const fileKey = filePath.replace(dir, '');

      filesMap[fileKey] = fileSize;
    }
  }

  return filesMap;
}

/**
 * @description: 字节换算成合适的单位
 * @param {number} originBytes
 * @return {string}
 */
function getSizeUnit(originBytes) {
  const bytes = Number(originBytes);
  if (isNaN(bytes)) {
    return originBytes;
  }
  const units = ['B', 'KiB', 'MiB', 'GiB'];
  let count = 0;
  let size = Math.abs(bytes);
  for (; size >= 1024 && count < units.length - 1; count++) {
    size /= 1024;
  }
  const res = `${bytes < 0 ? '-' : ''}${size.toFixed(1)}${units[count]}`;
  return res;
}

/**
 * @description: 用空格填充值使得值的长度达到要求
 * @param {string} originVal
 * @param {number} totalLen
 * @return {string}
 */
function fillVal(originVal, totalLen = 15) {
  const val = String(originVal);
  const len = val.length;
  if (len >= totalLen) return val;
  const spaces = ' '.repeat(totalLen - len);
  return `${val}${spaces}`;
}

/**
 * @description: 格式化数组
 * @param {Array<string>} arr
 * @return {Array<string>}
 */
const formatArr = (arr) => {
  return arr.map(itm => itm.map(ele => fillVal(ele)));
}

module.exports = {
  compareDirectories,
}
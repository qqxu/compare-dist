const { compareDirectories } = require('./compare');

function main() {
  const baseDir = './input/cmscommonweb/cmscommonweb-prod-10255';
  const compareDir = './input/cmscommonweb/cmscommonweb-release-10266';
  // by文件比较两次构建产物大小，并输出对比结果文件
  compareDirectories(baseDir, compareDir,'./input/cmscommonweb/cmscommonweb_result.txt');
  
}
main();
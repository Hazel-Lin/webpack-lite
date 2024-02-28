// 编写一个loader 调整 json 文件的格式
module.exports = function myLoader(source) {
  var value = 
  `
  /**
   * @param {string} test
   * @returns {string}
  */

  ${source};
  `
  console.log("🚀 ~ myLoader ~ value:", value)


  return value;
}
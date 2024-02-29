module.exports = function myLoader(source) {
  var value =
    `
  /**
   * just for test
  */

  ${source};
  `
  console.log("🚀 ~ myLoader ~ value:", value)
  return value;
}
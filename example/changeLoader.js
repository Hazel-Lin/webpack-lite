module.exports = function changeLoader(source) {
  // 判断是否是字符串
  if (typeof source !== "string") {
    return source;
  }
  // 校验是否存在 let
  if (!/let/g.test(source)) {
    return source;
  }
  // 将 let 改成 const
  const value = source.replace(/let/g, 'const');
  return value
}
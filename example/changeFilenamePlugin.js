// 将打包后的文件名改为指定的文件名 hazelnut.js
const pluginName = 'ChangeFilenamePlugin';
class ChangeFilenamePlugin{
  apply(compiler){
    compiler.hooks.emit.tap(pluginName, (compilation) => {
      compiler.output.filename = 'hazelnut.js';
    })
  }
}

module.exports = ChangeFilenamePlugin
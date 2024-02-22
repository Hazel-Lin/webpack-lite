// 读取入口文件、读取输出文件、读取模块等功能都是在 compiler 中实现的。
// 读取 文件需要用到 fs path 模块
const fs = require('fs');
const path = require('path');
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require('@babel/core');

module.exports = class Compiler {
  constructor(config) {
    const { entry, output } = config;
    // 入口文件
    this.entry = entry;
    this.output = output;
    this.config = config;
  }
  // 解析后返回对应的代码和依赖
  parse(entry) {
    // 读取入口文件 获取模块代码
    const sourceCode = fs.readFileSync(entry, 'utf-8');
    // 解析模块代码 根据 babel/parser 解析代码 生成抽象语法树
    const ast = parser.parse(sourceCode, { sourceType: "module" });
    // 抽象语法树 traverse 为字符串
    const deps = {}
    traverse(ast, {
      ImportDeclaration({ node }) {
        const dirname = path.dirname(filename);
        const absPath = "./" + path.join(dirname, node.source.value);
        deps[node.source.value] = absPath;
      },
    });
    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"],
    });
    return {
      code,
      deps
    }
  }
  // 处理依赖图
  buildDepsGraph(entry) {
    // 递归调用 parse 函数
    const entryModule = this.parse(entry);
    const graphArray = [entryModule];

    for (let i = 0; i < graphArray.length; i++) {
      const item = graphArray[i];
      const { deps } = item;
      if (deps) {
        for (let key in deps) {
          graphArray.push(this.parse(deps[key]));
        }
      }
    }
    // 定义图
    const graph = {};
    graphArray.forEach(item => {
      graph[entry] = {
        code: item.code,
        deps: item.deps
      }
    });
    return graph;
  }
  // 生成最后的代码
  generateCode(graph, entry) {
    return `(function(graph){
        function require(file) {
            var exports = {};
            function absRequire(relPath){
                return require(graph[file].deps[relPath])
            }
            (function(require, exports, code){
                eval(code)
            })(absRequire, exports, graph[file].code)
            return exports
        }
        require('${entry}')
    })(${graph})`;

  }
  // 输出文件
  emitFile(code) {
    const outputPath = path.join(this.output.path, this.output.filename);
    if (!fs.existsSync(this.output.path)) {
      fs.mkdirSync(this.output.path)
    }
    fs.writeFileSync(outputPath, code)
  }
  // 串联所有方法
  run() {
    console.log('开始编译');
    const graph = JSON.stringify(this.buildDepsGraph(this.entry));
    const code = this.generateCode(graph, this.entry);
    this.emitFile(code);
  }
}

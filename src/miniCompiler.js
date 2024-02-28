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
  parse(filename) {
    // 读取入口文件 获取模块代码
    const sourceCode = fs.readFileSync(filename, 'utf-8');
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
    return { filename, deps, code };
  }
  // 处理依赖图
  buildDepsGraph(entry) {
    // 递归调用 parse 函数 解析所有文件 从入口开始找到所有文件之间的依赖关系
    const entryModule = this.parse(entry);
    // 定义一个队列 目前只有与入口文件相关的模块  
    const graphArray = [entryModule];
    // for of 遍历 graphArray 这个队列
    for (const item of graphArray) {
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
      graph[item.filename] = {
        deps: item.deps,
        code: item.code,
      };
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
    console.log('开始打包');
    const graph = JSON.stringify(this.buildDepsGraph(this.entry));
    const code = this.generateCode(graph, this.entry);
    this.emitFile(code);
    console.log('打包完成');
  }
}

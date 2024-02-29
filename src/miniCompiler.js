// 读取入口文件、读取输出文件、读取模块等功能都是在 compiler 中实现的。
// 读取 文件需要用到 fs path 模块
const fs = require('fs');
const path = require('path');
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require('@babel/core');

module.exports = class Compiler {
  constructor(config) {
    const { entry, output, module } = config;
    // 入口文件
    this.entry = entry;
    this.output = output;
    this.config = config;
    this.rules = module.rules;
    // 初始化模块缓存 避免重复解析已经解析过的模块
    this.modules = {};
  }
  // 解析后返回对应的代码和依赖
  parse(filename) {
    // 读取入口文件 获取模块代码
    let sourceCode = fs.readFileSync(filename, 'utf-8');
    // 处理所有的 loader
    // 从配置文件中获取 module.rules 遍历所有的rules
    // 如果匹配到了文件类型 就使用对应的loader处理文件
    // loader 的执行顺序是从后往前执行的
    // 如何实现多个 loader 的处理呢？
    // 从后往前遍历所有的 loader
    for (let rule of this.rules) {
      const { use, test: _test } = rule
      if (_test.test(filename)) {
        for (let loaderPath of use.reverse()) {
          const loader = require(loaderPath);
          sourceCode = loader(sourceCode);
        }
      }
    }

    // 解析模块代码 根据 babel/parser 解析代码 生成抽象语法树
    const ast = parser.parse(sourceCode, { sourceType: "module" });
    // 抽象语法树 traverse 为字符串
    const deps = {}
    traverse(ast, {
      ImportDeclaration({ node }) {
        const dirname = path.dirname(filename);
        const absPath = path.join(dirname, node.source.value);
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
    for (const module of graphArray) {
      const { deps } = module;
      if (deps) {
        for (let key in deps) {
          if (!this.modules[deps[key]]) {
            const depModule = this.parse(deps[key]);
            // 缓存已处理模块
            this.modules[deps[key]] = depModule;
            graphArray.push(depModule);
          }
        }
      }
    }
    // 转换图结构
    const graph = {};
    graphArray.forEach(({ filename, deps, code }) => {
      graph[filename] = { deps, code };
    });
    return graph;
  }
  // 生成最后的代码
  generateCode(graph) {
    const graphStr = JSON.stringify(graph);
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
        require('${this.entry}')
    })(${graphStr})`;
  }
  // 输出文件
  emitFile(code) {
    const outputPath = path.join(this.output.path, this.output.filename);
    // 生成文件 判断是否存在文件夹 不存在则创建文件夹 使用 { recursive: true } 避免目录不存在的错误
    fs.mkdirSync(this.output.path, { recursive: true });
    fs.writeFileSync(outputPath, code)
  }
  // 串联所有方法
  run() {
    console.log('开始打包...');
    const graph = this.buildDepsGraph(this.entry);
    const code = this.generateCode(graph);
    this.emitFile(code);
    console.log('打包完成。');
  }
}

通过实现 mini webpack 来学习其原理

## 概念

webpack 是一个静态模块打包工具（module bundler），它将所有的资源文件（js、css、图片等）视为模块，通过 loader 转换这些文件，通过 plugin 注入钩子，最后打包成一个或多个 bundle 文件。

主要目的是为了让浏览器能够识别和加载 js、css、图片等文件，以及解决模块之间的依赖关系。

## 工作原理

1. 读取配置文件
   webpack 会根据项目中的配置文件，通常是 webpack.config.js 配置初始化所需的打包参数，包括入口文件、输出路径、加载器（loaders）和插件（plugins）等。

2. 编译
   webpack 会从入口文件开始，解析文件中的导入语句，递归地构建一个依赖关系图。在这个过程中，webpack 会根据配置文件中的 loader 对文件进行转换，以及根据插件对打包过程进行干预。

3. loader 处理
   对于每个依赖文件，Webpack 会查看是否有匹配的 loader 来处理这个文件。加载器可以将文件从不同的语言（如 TypeScript、SCSS）转换为 JavaScript，或者将图片和 CSS 转换为 JS 模块。

4. plugin 处理
   在编译过程中，Webpack 会在特定的时机广播出许多事件，插件可以监听这些事件，以执行自定义的逻辑。比如在打包结束后，Webpack 会广播出 `emit` 事件，插件可以监听这个事件，在打包结束后执行一些额外的操作。

5. 输出
   经过 loader 和 plugin 的处理后，Webpack 将所有的模块打包成一个或多个 bundle（依据配置），并输出到指定的文件夹。

6. 优化
   在打包过程中，Webpack 会执行诸如代码分割、模块合并、压缩优化等操作以减小输出文件的体积和提高运行效率。

## 主要概念

入口配置
loader
plugin
输出
模式

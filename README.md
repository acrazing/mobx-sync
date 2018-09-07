# 开发指南

## 开发工具

1. 建议使用 webstorm, 符合 lint 规范的 codeStyle 已经由模板自动生成,
建议安装以下插件:
    - toml - 高亮显示编辑 .env 文件, 需要在 File Types 里面绑定
    - save actions - 保存文件时自动格式化代码
2. vscode 的配置后面再补上吧

## 一些约定

### 目录结构

- `src/`: 源代码
- `esm/`: library ts/babel 编译后的 es module output
- `cjs/`: library ts/babel 编译后的 commonjs ouput
- `build/`: project/service webpack 编译后的 assets output
- `.cache/`: 编译缓存 output
- `temp/`: 临时文件夹

以上:

- 除了`src/`会进入 vcs, 其它目录均不可以进入
- `src/`, `esm/`, `cjs/` 会进入 npm 仓库, 其它不会

### npm 命令

- `npm run start`: project 启动本地服务器, 并清除缓存
- `npm run start:fast`: project 启动本地服务器, 不清除缓存
- `npm run build`: project/library 统一的编译命令
- `npm run build:cjs`: library 编译 commonjs
- `npm run build:esm`: library 编译 es module
- `npm run build:lizard-view-local`: service 编译 lizard 本地 view
- `npm run clean`: 清除 output 及缓存目录
- `npm run tsnode`: 用 ts-node 直接执行 ts 脚本

### lock 文件与 npm 包版本控制

1. lock 文件不应该放入 vcs, 原因是 library 更新会导致 dependents 更新, 这会导致所有包都
需要提交代码, 目前影响不大, 但是后续依赖多了就麻烦了.
2. library 需要有合理的版本设计, 要明确 major, minor, patch 的作用:
    - 依赖统一为 `^x.x.x` 形式
    - 版本发布时, 有且只有存在 `breaking changes` 时, 需要发布 `major` 更新, 这个时候
    dependents 需要手动更新依赖.

### import 模式

禁止通过 `import xxx from <PKG>/<PATH>` 的形式引入某个文件, 除非引入的这个包可以明确
其目录及文件结构不会发生变更.

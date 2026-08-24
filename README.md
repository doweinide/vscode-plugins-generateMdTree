# MD Tree Generator

根据 Markdown 文件中的目录树结构，自动生成对应的文件和目录。

## 功能

在 VS Code 文件资源管理器中：

1. 右键点击 `.md` 文件
2. 选择：`根据目录树生成文件结构`
3. 插件解析 Markdown 内的目录树标记：`├──`、`└──`、`│`
4. 自动创建对应文件夹和空文件。

## 示例

输入 md 内容：
```md
├── src
│   ├── main.ts
│   └── utils.ts
└── package.json
```
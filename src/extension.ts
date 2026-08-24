import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface Item {
    level: number;
    name: string;
}

/**
 * 清理节点名称
 * - 删除 # 后面的注释
 * - 删除转义符 \
 * - 删除多余空格
 */
function cleanName(name: string): string {
    return name
        .replace(/\s+#.*$/, "")
        .replace(/\\/g, "")
        .trim()
        .replace(/ /g, "");
}

/**
 * 解析 markdown 树结构
 */
function parseTree(lines: string[]): Item[] {
    const result: Item[] = [];

    for (const line of lines) {
        if (!line.trim()) {
            continue;
        }

        const match = line.match(
            /(├──|└──)\s+(.+?)(?:\s+#.*)?$/
        );

        if (!match) {
            continue;
        }

        const name = cleanName(match[2]);

        const prefix = line.substring(
            0,
            match.index
        );

        const level =
            (prefix.match(/│/g) || []).length +
            (prefix.match(/    /g) || []).length;

        result.push({
            level,
            name
        });
    }

    return result;
}


/**
 * 根据解析结果创建文件结构
 */
function createStructure(
    items: Item[],
    root: string
) {
    const stack: Record<number, string> = {};

    for (const item of items) {

        let parent = root;

        if (item.level > 0) {
            const parentPath =
                stack[item.level - 1];

            if (parentPath) {
                parent = parentPath;
            }
        }

        const target =
            path.join(
                parent,
                item.name
            );


        // 目录
        if (
            item.name.endsWith("/")
        ) {
            const dir =
                target.replace(/\/$/, "");

            fs.mkdirSync(
                dir,
                {
                    recursive: true
                }
            );

            stack[item.level] = dir;
        }


        // 没有扩展名默认目录
        else if (
            !path.extname(item.name)
        ) {
            fs.mkdirSync(
                target,
                {
                    recursive: true
                }
            );

            stack[item.level] = target;
        }


        // 文件
        else {

            fs.mkdirSync(
                path.dirname(target),
                {
                    recursive: true
                }
            );

            if (!fs.existsSync(target)) {
                fs.writeFileSync(
                    target,
                    ""
                );
            }
        }
    }
}


/**
 * VSCode 插件入口
 */
export function activate(
    context: vscode.ExtensionContext
) {

    const disposable =
        vscode.commands.registerCommand(
            "mdTreeGenerator.create",
            async (
                uri: vscode.Uri
            ) => {

                const mdFile =
                    uri.fsPath;


                const content =
                    fs.readFileSync(
                        mdFile,
                        "utf8"
                    );


                const lines =
                    content.split(/\r?\n/);


                const items =
                    parseTree(lines);


                createStructure(
                    items,
                    path.dirname(mdFile)
                );


                vscode.window.showInformationMessage(
                    `完成，生成 ${items.length} 个节点`
                );
            }
        );


    context.subscriptions.push(
        disposable
    );
}


export function deactivate() {}
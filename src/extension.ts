import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";


interface Item {
    level:number;
    name:string;
}


function cleanName(name:string){

    return name
        .trim()
        .replace(/ /g,"")
        .trim();

}



function parseTree(lines:string[]):Item[]{

    let result:Item[]=[];


    for(const line of lines){

        if(!line.trim())
            continue;


        const match=line.match(
            /(├──|└──)\s*(.+)/
        );


        if(!match)
            continue;


        const name=cleanName(
            match[2]
        );


        const prefix=line.substring(
            0,
            match.index
        );


        const level =
            (prefix.match(/│/g)||[]).length
            +
            (prefix.match(/    /g)||[]).length;


        result.push({
            level,
            name
        });

    }


    return result;

}



function createStructure(
    items:Item[],
    root:string
){


    const stack:any={};


    for(const item of items){

        let parent=root;


        if(item.level>0){

            const p =
                stack[item.level-1];


            if(p)
                parent=p;

        }


        let target=
            path.join(
                parent,
                item.name
            );



        //目录

        if(
            item.name.endsWith("/")
        ){

            target=
                target.replace(/\/$/,"");


            fs.mkdirSync(
                target,
                {
                    recursive:true
                }
            );


            stack[item.level]=target;

        }


        //没有扩展名默认目录

        else if(
            !item.name.includes(".")
        ){

            fs.mkdirSync(
                target,
                {
                    recursive:true
                }
            );


            stack[item.level]=target;

        }


        //文件

        else{


            fs.mkdirSync(
                path.dirname(target),
                {
                    recursive:true
                }
            );


            if(!fs.existsSync(target)){

                fs.writeFileSync(
                    target,
                    ""
                );

            }

        }

    }


}



export function activate(
    context:vscode.ExtensionContext
){


    const disposable =
        vscode.commands.registerCommand(
            "mdTreeGenerator.create",
            async(
                uri:vscode.Uri
            )=>{


                const mdFile=
                    uri.fsPath;


                const content=
                    fs.readFileSync(
                        mdFile,
                        "utf8"
                    );


                const lines=
                    content.split(/\r?\n/);



                const items=
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



export function deactivate(){}
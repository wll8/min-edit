# midEdit
更新编辑的文件内容到服务器, 类似一个远程编辑器雏形.

## 应用场景
假设 client 是一个项目, 要运行这个项目需要安装复杂的开发环境. 有一个开发成员 A, 他只需要对这个项目的某个文件进行开发即可.

对于这种情况, 我们希望让 A 修改这个文件就好, 不需要他安装开发环境.

这时候就启动一个服务, 他修改的文件自动上传的服务器即可.

## 开发
项目分为 client 和 server.
- client 给开发人员用的客户端
- server 接收开发人员编辑的文件

``` sh
cd client && cnpm i
cd server && cnpm i
npm start
```

## 尝试
安装并运行启动后, 尝试创建并编辑文件 `client/test/some.txt` 你会发现这个文件会自动同步到 `server/share_work/test/some.txt` , 其他文件不会同步进来.

如果需要允许合同所有文件, 请修改 config.js 中的 server/allowRe 为 `.*` 即可.

## 发布
``` sh
npm run build
```

运行这条命令即可, 它会根据参数读取 config.js 中的配置, 然后生成一个 npm 包到 dist 目录中, 分别是 edit-c 和 edit-s .

你只需要把 edit-c 发送给开发人员, 他安装后编辑的相应文件会实时同步到 edit-s 启动的服务上.

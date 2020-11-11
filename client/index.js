#!/usr/bin/env node

// 用于监听改变并推送到服务器

const config = require(`./package.json`).config
const workDir = toAbsPath(config.workDir) // 工作目录, 默认为当前运行命令所在目录

console.log(`config`, {
  ...config,
  workDir,
})

const watchList = [
  workDir,
  `!**/node_modules`,
]

const chokidar = require('chokidar');
// chokidar.watch(watchList).on(`change`, (filePath) => {
//   sendFile({filePath, action: `change`})
// });

[
  `add`,
  // `addDir`,
  `change`,
  // `unlink`,
  // `unlinkDir`,
].forEach(action => {
  chokidar.watch(watchList, {
  ignored: /(^|[\/\\])\../, // 忽略带点文件
  persistent: true
}).on(action, (filePath) => {
    console.log(action, filePath)
    sendFile({filePath, action})
  });
})

/**
 * 上传文件
 * @param {object} param0 参数
 * @param {string} param0.filePath 文件绝对路径
 * @param {string} param0.action 操作
 */
async function sendFile({filePath, action}) {
  const fs = require('fs');
  const axios = require('axios');
  const FormData = require('form-data');
  const localFile = fs.createReadStream(filePath);
  const formData = new FormData();
  const path = require('path');
  let relativePath = path.relative(workDir, filePath)
  formData.append('filePath', relativePath );
  formData.append('action', action );
  formData.append('token', `auth token` );
  formData.append('file', localFile);
  const headers = formData.getHeaders(); // 获取headers
  // 获取 form-data 长度
  formData.getLength(async (err, length) => {
    if (Boolean(err) === false) {
      headers['content-length'] = length; // 设置内容长度
      axios.post(config.sendApi, formData, {headers}).then(res=>{
        // console.log(res.data)
      }).catch(err=>{
        console.log(err.message);
        // err.response.data
      })
    }
  })
}

/**
 * 转换为绝对路径
 * @param {string} path 路径
 */
function toAbsPath(path) {
  if(require(`path`).isAbsolute(path)) {
    return path
  } else {
    return `${process.cwd()}/${path}`
  }
}


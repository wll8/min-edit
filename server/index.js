#!/usr/bin/env node

// 用于接收变更并应用

const config = require(`./package.json`).config
const dirPath = toLinuxSepPath(toAbsPath(config.dirPath)) // 存储目录

console.log(`config`, {
  ...config,
  dirPath,
})

const express = require('express')
const bodyParser = require('body-parser')
const server = express()
server.use(bodyParser.json())

// 处理上传文件
const multer  = require('multer')

// 上传接口的配置
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, dirPath), // 自定义存储目录
    filename: (req, file, cb) => {
      const filePath = toLinuxSepPath(req.body.filePath)
      cb(createDir({dirPath, filePath}), filePath)
    }
  }),
  limits: { fileSize: 1024 * 1024 * 5 },
}).any()

// 上传接口
server.post('/upload', (req, res, next) => {
  upload(req, res, (err) => {
    res.status(err ? 403 : 200).send({
      msg: err || `ok`
    })
  })
})

// 监听端口
server.listen(config.port, () => console.log(`服务已启动: ${config.port}`))

/**
 * 如果文件所在的路径不存在, 则校验是所在路径后创建目录
 * @param {object} param0 配置
 * @param {string} param0.dirPath 父目录
 * @param {string} param0.filePath 相对路径
 */
function createDir({dirPath, filePath}) {
  const fs = require(`fs`)
  const path = require(`path`)
  const fileFullPath = toLinuxSepPath(path.resolve(dirPath, filePath)) // 获取绝对路径
  const re = new RegExp(`^${dirPath}`)
  if((allow(filePath) === null) || (fileFullPath.match(re) === null)) {
    // 如果解析后的路径不存在于指定的目录下, 避免相对路径操作其他目录
    return `不允许操作 ${filePath}`
  }
  const fileDir = path.parse(`${dirPath}/${filePath}`).dir // 获取文件目录
  if(fs.existsSync(fileDir) === false) { // 如果文件要保存的目录不存在则先创建
    fs.mkdirSync(fileDir, { recursive: true })
  }
}

/**
 * 转分隔符路径为 / 格式
 * @param {string} pathStr 路径字符串
 */
function toLinuxSepPath(pathStr) {
  const path = require('path')
  const res = path.normalize(pathStr).replace(/\\/g, '/')
  return res
}

/**
 * 允许的文件
 * @param {string} path 相对路径
 */
function allow(path) {
  return path.match(new RegExp(config.allowRe))
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

// 这是配置文件, 生成命令行工具时从这里读取配置

module.exports = (type) => {
  return {
    test: {
      client: {
        workDir: `.`,
        sendApi: `http://192.168.1.15:8899/upload`,
      },
      server: {
        dirPath: "share_work",
        allowRe: "^test/some.txt",
        port: 8899,
      },
    },
    dev: {
      client: {
        workDir: `.`,
        sendApi: `http://127.0.0.1:8899/upload`,
      },
      server: {
        dirPath: "share_work",
        allowRe: "^test/some.txt",
        port: 8899,
      },
    },
  }[type]
}

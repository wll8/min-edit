const gulp = require(`gulp`)
// const rename = require(`gulp-rename`)
const del = require(`del`)
const uglify = require(`gulp-uglify-es`).default

gulp.task(`clear`, () => { // 复制 server 中的文件, 例如 package.json
  return del([`./dist/**`, `!./dist`], { force: true }) // 清除目录
})

gulp.task(`copy`, (cb) => { // 复制 server 中的文件, 例如 package.json
  const shell = require(`shelljs`)
  const cmdList = `
    npx shx mkdir -p ./dist/server/package/
    rem npx shx cp ./server/index.js ./dist/server/package/
    npx shx cp ./server/package.json ./dist/server/package/
    npx shx cp ./server/package-lock.json ./dist/server/package/

    npx shx mkdir -p ./dist/client/package/
    rem npx shx cp ./client/index.js ./dist/client/package/
    npx shx cp ./client/package.json ./dist/client/package/
    npx shx cp ./client/package-lock.json ./dist/client/package/
  `.split(`\n`).map(item => item.trim()).filter(item => item)
  cmdList.forEach(cmd => {
    console.log(`run: ${cmd}`)
    if(shell.exec(cmd).code !== 0) {
      new Error(`运行错误: ${cmd}`)
    }
  })
  cb()
})

gulp.task(`config`, (cb) => { // 复制 server 中的文件, 例如 package.json
  function update(type) {
    const packagePath = `./dist/${type}/package/package.json`
    const config = require(`./config`)(`test`)[type]
    const package = require(packagePath)
    package.config = config
    const fs = require(`fs`)
    fs.writeFileSync(packagePath, JSON.stringify(package, null, 2))
  }
  update(`client`)
  update(`server`)
  cb()
})

gulp.task(`uglify-server`, () => {
  // uglify-es - https://github.com/mishoo/UglifyJS/tree/harmony
  return gulp.src([
    `./server/**/*.js`,
    '!./server/node_modules/**',
  ])
    .pipe(uglify())
    .pipe(gulp.dest(`./dist/server/package`))
})

gulp.task(`uglify-client`, () => {
  return gulp.src([
    `./client/**/*.js`,
    '!./client/node_modules/**',
  ])
    .pipe(uglify())
    .pipe(gulp.dest(`./dist/client/package`))
})

gulp.task(`tar-server`, () => {
  const tar = require(`tar`)
  const package = require(`./dist/server/package/package.json`)
  const filePath = `./dist/${package.name}-${package.version}.tgz`
  return tar.c( // or tar.create
    {
      gzip: true,
      cwd: `${__dirname}/dist/server/`,
      file: filePath,
    },
    [`package/`]
  )
})

gulp.task(`tar-client`, () => {
  const tar = require(`tar`)
  const package = require(`./dist/client/package/package.json`)
  const filePath = `./dist/${package.name}-${package.version}.tgz`
  return tar.c( // or tar.create
    {
      gzip: true,
      cwd: `${__dirname}/dist/client/`,
      file: filePath,
    },
    [`package/`]
  )
})

// see: https://github.com/gulpjs/gulp/issues/1091#issuecomment-163151632
gulp.task(
  `default`,
  gulp.series(
    `clear`,
    `copy`,
    `config`,
    `uglify-server`,
    `uglify-client`,
    `tar-server`,
    `tar-client`,
    done => done()
  ),
)

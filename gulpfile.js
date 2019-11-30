const { src, dest , series} = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

exports.default = function (){

 src('src/**/*.js')
     .pipe(uglify({
        mangle:true,
        compress:true
     }))
    // 因此使用 gulp-rename 插件修改文件的扩展名
    .pipe(rename({ extname: '.js' }))
    .pipe( src("src/manifest.json"))
    .pipe(dest('spider'));


}

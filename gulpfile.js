let project_folder = 'dist',
    source_folder = 'src',
    path = {
        build: {
            html: project_folder + '/',
            css: project_folder + '/css/',
            js: project_folder + '/js/',
            img: project_folder + '/img/',
            fonts: project_folder + '/fonts/',
            cdn: project_folder + '/cdn/',
        },
        src: {
            html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
            css: source_folder + '/sass/*.sass',
            js: source_folder + '/js/*.js',
            img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp,mp4,webm}',
            imgWebp: source_folder + '/img/**/*.{jpg,png}',
            fonts: source_folder + '/fonts/**/*',
            cdn: source_folder + '/cdn/**/*',
        },
        watch: {
            html: source_folder + '/**/*.html',
            css: source_folder + '/sass/**/*.sass',
            js: source_folder + '/js/**/*.js',
            img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
            imgWebp: source_folder + '/img/**/*.{jpg,png}',
        },
        clean: project_folder + '/'
    };

let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersynk = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    sass = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),//проставить префиксы для поддержки браузеров
    group_media = require('gulp-group-css-media-queries'),//сгрупировать медиа запросы и поставить их в конец
    clean_css = require('gulp-clean-css'),//убрать лишний css
    rename = require('gulp-rename'),//сделать для файла CSS минифицированый и обычный
    uglify = require('gulp-uglify-es').default, //Минифицировать js
    babel = require('gulp-babel'),
    webp = require('gulp-webp');

function browserSynk(params) {
    browsersynk.init({
        server: {
            baseDir: "./" + project_folder + '/',
            index: "index.html"
        },
        port: 3000,
        notify: false,
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersynk.stream())
}

function images() {
    return src(path.src.img)
        .pipe(dest(path.build.img))
        .pipe(browsersynk.stream())
}
function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browsersynk.stream())
}

function css() {
    return src(path.src.css)
        .pipe(
            sass({
                outputStyle: "expanded"
            })
        )
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            })
        )
        .pipe(clean_css())
        .pipe(dest(path.build.css))
        .pipe(browsersynk.stream())
}

function js() {
    return src(path.src.js)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(
            rename({
                    extname: ".min.js"
                }
            )
        )
        .pipe(dest(path.build.js))
        .pipe(browsersynk.stream())
}

function cdns() {
    return src(path.src.cdn)
        .pipe(dest(path.build.cdn))
        .pipe(browsersynk.stream())
}

function clean() {
    return del(path.clean);
}

function webpConvert(){
    return src(path.src.imgWebp)
        .pipe(webp({
            quality: 90
        }))
        .pipe(dest(path.build.img))
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.img], webpConvert);
}

let build = gulp.series(clean, gulp.parallel(css, js, html, images, webpConvert, fonts, cdns));
let watch = gulp.parallel(build, watchFiles, browserSynk);


exports.images = images;
exports.webpConvert = webpConvert;
exports.cdns = cdns;
exports.fonts = fonts;
exports.css = css;
exports.js = js;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;




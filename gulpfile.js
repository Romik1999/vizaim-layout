const projectFolder = "dist";
const pathF = require("path");
const srcFolder = "src";
const path = {
    build: {
        html: projectFolder + "/",
        html2: projectFolder + "/views/",
        css: projectFolder + "/resources/css/",
        defaultscss: projectFolder + "/resources/scss/",
        js: projectFolder + "/resources/js/",
        images: projectFolder + "/resources/img/",
        fonts: projectFolder + "/resources/fonts/",
        lib: projectFolder + "/resources/lib/",
    },
    src: {
        html: [srcFolder + "/views/*.html", "!" + srcFolder + "blocks/*.html"],
        css: srcFolder + "/resources/scss/*.scss",
        defaultscss: srcFolder + "/resources/scss/*.scss",
        js: srcFolder + "/resources/js/*.js",
        images: srcFolder + "/resources/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: srcFolder + "/resources/fonts/**/*.ttf",
        lib: srcFolder + "/resources/lib/**/*",
    },
    watch: {
        html: srcFolder + "/**/*.html",
        css: srcFolder + "/**/*.scss",
        defaultscss: srcFolder + "/**/*.scss",
        js: srcFolder + "/**/*.js",
        images: srcFolder + "/resources/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + projectFolder + "/",
};

const gulp = require("gulp");
const {src, dest} = require("gulp");
const browserSync = require("browser-sync");
const fileInclude = require("gulp-file-include");
const del = require("del");

const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require("gulp-autoprefixer");
const groupMedia = require("gulp-group-css-media-queries");
const cleanCss = require("gulp-clean-css");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const imagemin = require("gulp-imagemin");

const plumber = require('gulp-plumber');

function sync() {
    browserSync.init({
        server: {
            baseDir: "./" + projectFolder + "/",
        },
        port: 3000,
        notify: false,
    });
}

function html() {
    return (
        src(path.src.html)
            .pipe(fileInclude())
            .pipe(dest(path.build.html))
            .pipe(dest(path.build.html2))
            .pipe(browserSync.stream())
    );
}

function fonts() {
    return (
        src(path.src.fonts)
            .pipe(dest(path.build.fonts))
            .pipe(browserSync.stream())
    );
}

function lib() {
    return (
        src(path.src.lib)
            .pipe(dest(path.build.lib))
            .pipe(browserSync.stream())
    );
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: "expanded",
            })
        )
        .on("error", scss.logError)
        .pipe(groupMedia())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 8 versions"],
                cascade: true,
                grid: "autoplace",
            })
        )
        .pipe(dest(path.build.css))
        .pipe(cleanCss())
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream());
}

function defaultscss() {
    return (
        src(path.src.defaultscss)
            .pipe(dest(path.build.defaultscss))
            .pipe(browserSync.stream())
    );
}

function js() {
    return src(path.src.js)
        .pipe(fileInclude())
        .pipe(dest(path.build.js))
        .pipe(
            rename({
                extname: ".min.js",
            })
        )
        .pipe(uglify())
        .pipe(dest(path.build.js))
        .pipe(browserSync.stream());
}

function images() {
    return (
        src(path.src.images)
            .pipe(
                imagemin({
                    progressive: true,
                    svgoPlugins: [{removeViewBox: true}],
                    interlaced: true,
                    optimizationLevel: 3,
                })
            )
            .pipe(dest(path.build.images))
            .pipe(browserSync.stream())
    );
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.defaultscss], defaultscss);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
}

function clean() {
    return del(path.clean);
}

const build = gulp.series(clean, gulp.parallel(defaultscss, js, css, html, fonts, images, lib));
const watch = gulp.parallel(build, watchFiles, sync);

exports.images = images;
exports.js = js;
exports.css = css;
exports.defaultscss = defaultscss;
exports.lib = lib;
exports.fonts = fonts;
exports.build = build;
exports.html = html;
exports.watch = watch;
exports.default = watch;

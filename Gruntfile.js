/**
 * Created with JetBrains WebStorm.
 * Date: 13-4-25
 * Time: 下午10:06
 * @overview 编译输出
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1.7
 */
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
}
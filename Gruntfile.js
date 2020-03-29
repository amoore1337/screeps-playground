module.exports = function(grunt) {
  const config = require('./screeps.json');
  const branch = grunt.option('branch') || config.branch;
  const email = grunt.option('email') || config.email;
  const password = grunt.option('password') || config.password;
  const ptr = grunt.option('ptr') ? true : config.ptr;

  const currentdate = new Date();

  // Output the current date and branch.
  grunt.log.subhead('Task Start: ' + currentdate.toLocaleString());
  grunt.log.writeln('Branch: ' + branch);

  grunt.loadNpmTasks('grunt-screeps');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-file-append');
  grunt.loadNpmTasks('grunt-eslint');

  grunt.initConfig({
    screeps: {
      options: {
        email: email,
        password: password,
        branch: branch,
        ptr: ptr,
      },
      dist: {
        src: ['dist/*.js'],
      },
    },

    // Remove all files from the dist folder.
    clean: {
      'dist': ['dist'],
    },

    // Copy all source files into the dist folder, flattening the folder structure by converting path delimiters to underscores
    copy: {
      // Pushes the game code to the dist folder so it can be modified before being send to the screeps server.
      screeps: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: '**',
          dest: 'dist/',
          filter: 'isFile',
          rename: function(dest, src) {
            // Change the path name utilize underscores for folders
            return dest + src.replace(/\//g, '_');
          },
        }],
      },
    },

    // Add version variable using current timestamp.
    file_append: {
      versioning: {
        files: [
          {
            append: '\nglobal.SCRIPT_VERSION = '+ currentdate.getTime() + ';\n',
            input: 'dist/version.js',
          },
        ],
      },
    },

    eslint: {
      options: {
        configFile: '.eslintrc.json',
      },
      target: ['src/**'],
    },
  });

  grunt.registerTask('compile', ['eslint', 'clean', 'copy:screeps', 'file_append:versioning']);
  grunt.registerTask('default', ['eslint', 'clean', 'copy:screeps', 'file_append:versioning', 'screeps']);
}
;

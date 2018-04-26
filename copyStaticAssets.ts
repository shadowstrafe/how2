import * as shell from 'shelljs';

shell.mkdir('-p', 'dist/public/js/lib');
shell.cp('-R', 'src/public/js/lib', 'dist/public/js/');

shell.mkdir('-p', 'dist/public/css/lib');
shell.cp('-R', 'src/public/css/lib', 'dist/public/css/');

shell.mkdir('-p', 'dist/public/fonts');
shell.cp('-R', 'src/public/fonts', 'dist/public/');

shell.cp('src/public/favicon.ico', 'dist/public/favicon.ico');

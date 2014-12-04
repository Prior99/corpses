#!/bin/bash
echo -n "Installing npm components ... "
npm install | iconv -tascii -c > npm.log
echo "Done."
echo -n "Installing bower components ... "
echo "n" | bower install | iconv -tascii -c > bower.log
echo "Done."
cp server/config.json.example server/config.json
echo "Now building/testing ... "
grunt | iconv -tascii -c | tee grunt.log
grep --quiet "failing" grunt.log
exit $?

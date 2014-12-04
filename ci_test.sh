#!/bin/bash
echo -n "Installing npm components ... "
npm install --silent | iconv -tascii -c &> npm.log
echo "Done."
echo -n "Installing bower components ... "
echo "n" | bower install --silent | iconv -tascii -c &> bower.log
echo "Done."
cp server/config.json.example server/config.json
echo "Now building/testing ... "
grunt | iconv -tascii | tee grunt.log
grep --quiet "failing" grunt.log
RESULT=$?
if [ "$RESULT" = "1" ]; then
	echo "The build was successfull."
	exit 0
else
	echo "Some tests were detected to have failed."
	exit 1
fi

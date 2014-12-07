#!/bin/bash
echo -n "Installing npm components ... "
npm install --silent | iconv -ctascii -c &> npm.log
echo "Done."
echo -n "Installing bower components ... "
echo "n" | bower install --silent | iconv -ctascii -c &> bower.log
echo "Done."
cp server/config.json.example server/config.json
echo "Now building/testing ... "
grunt | iconv -ctascii | tee grunt.log
grep --quiet "Done, without errors." grunt.log
RESULT=$?
if [ "$RESULT" = "0" ]; then
	echo "The build was successfull."
	echo "Sharing codecoverage overview"
	share coverage/server*.html
	exit 0
else
	echo "Some tests were detected to have failed."
	exit 1
fi

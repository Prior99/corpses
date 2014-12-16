#!/bin/bash
mkdir htdocs
mkdir maptest
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
echo "The log is as follows:"
cat server_test.log
HTML=$(grep -P "server_\\d+.html" grunt.log)
if [ "$RESULT" = "0" ]; then
	echo "The build was successfull."
	echo "Deploying current doc."
	cp -Rf doc/server /var/websites/ci_drops/corpses_server_doc
	echo "Sharing codecoverage overview $HTML"
	share "coverage/$HTML"
	exit 0
else
	echo "Some tests were detected to have failed."
	exit 1
fi

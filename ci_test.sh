#!/bin/bash
npm install | iconv -tascii -c
echo "n" | bower install | iconv -tascii -c
cp server/config.json.example server/config.json
grunt | iconv -tascii -c

#!/bin/sh

[ ! -z `which md5` ] && MD5=md5
[ ! -z `which md5sum` ] && MD5=md5sum

if [ -z $MD5 ]; then
  echo 'Error: md5 tool not found'
  exit;
fi

# Download Remote files to include them into hash calculation
mkdir -p .tmp
#wget -q -O .tmp/webfont 'http://fonts.googleapis.com/css?family=Gloria+Hallelujah|Merriweather:700'
#wget -q -O .tmp/gravatar 'http://gravatar.com/avatar/2becaf1073957bdad2f06e183731131d?s=200'

# Update hash value in cache.manifest by generate md5 hash of all local files

HASH=`find . -type f | grep -v \.git | grep -v "site\.appcache" | xargs cat - | $MD5`
eval "sed -i '' -e 's/^# hash.*$/# hash "$HASH"/' site.appcache"

rm -R .tmp

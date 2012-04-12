#!/bin/sh

#
# This script is design to run before every commit to update the hash
# within site.appcache
#
# You would still need to manually maintain the list of files.
# This script only update the hash of all files
#

# FreeBSD & Darwin comes with md5, but on Linux we need to use md5sum
[ ! -z `which md5` ] && MD5=md5
[ ! -z `which md5sum` ] && MD5=md5sum

if [ -z $MD5 ]; then
  echo 'Error: md5 tool not found'
  exit;
fi

# Linux use different version of sed than others
# which has problem interpreting the empty extension of -i parameter.
if [ `uname -s` = Linux ]; then
  SED='sed -i'
else
  SED="sed -i ''"
fi

# Download Remote files to include them into hash calculation
mkdir -p .tmp
#wget -q -O .tmp/webfont 'http://fonts.googleapis.com/css?family=Gloria+Hallelujah|Merriweather:700'
#wget -q -O .tmp/gravatar 'http://gravatar.com/avatar/2becaf1073957bdad2f06e183731131d?s=200'

# Update hash value in cache.manifest by generate md5 hash of all local files

HASH=`find . -type f | grep -v \.git | grep -v "site\.appcache" | xargs cat - | $MD5`
eval $SED" -e 's/^# hash.*$/# hash "$HASH"/' site.appcache"

rm -R .tmp

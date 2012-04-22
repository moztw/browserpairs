#!/bin/sh

#
# This script is design to run after every pull to update the hash
# within site.appcache
#
# You would still need to manually maintain the list of files.
# This script only update the hash of all files
#

# Linux use different version of sed than others
# which has problem interpreting the empty extension of -i parameter.
if [ `uname -s` = Linux ]; then
  SED='sed -i'
else
  SED="sed -i ''"
fi

HASH=`git rev-parse HEAD`
eval $SED" -e 's/^# hash.*$/# hash "$HASH"/' site.appcache"

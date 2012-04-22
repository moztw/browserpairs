#!/bin/sh

#
# This script is design to run after every pull to update the hash
# within site.appcache
#
# You would still need to manually maintain the list of files.
# This script only update the hash of all files
#

HASH=`git rev-parse HEAD`
echo git rev $HASH
eval "sed -e 's/^# hash.*$/# hash "$HASH"/' site.appcache.files > site.appcache"

GEEEN="\e[0;32m"
RED="\e[0;31m"
RESET="\e[0m"
VERSION=$1

# Check version format
if [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] ; then
  printf "${GEEEN}Deploy version v$VERSION\n${RESET}"
else
  printf "${RED}VERSION format is 'x.x.x'. ($VERSION)\n${RESET}"
  exit 1
fi

# Check existing tag
git tag | grep v$VERSION > /dev/null
if [ $? -eq 0 ]; then
  printf "${RED}git tag 'v$VERSION' is existing\n${RESET}"
  exit 1
fi

# Check existing README.md
if [ ! -f README.md ]; then
  printf "${RED}'README.md' is not existing\n${RESET}"
  exit 1
fi

printf "${GEEEN}Rewite lib/index.js\n${RESET}"
gsed -r -i "s/const version = '[0-9]+\.[0-9]+\.[0-9]+'/const version = '$VERSION'/g" lib/index.js
git add lib/index.js

printf "${GEEEN}Rewite test/index.test.js\n${RESET}"
gsed -r -i "s/const version = '[0-9]+\.[0-9]+\.[0-9]+'/const version = '$VERSION'/g" test/index.test.js
git add test/index.test.js

printf "${GEEEN}Rewite package.json\n${RESET}"
gsed -r -i "s/\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"$VERSION\"/g" package.json
git add package.json

printf "${GEEEN}git commit\n${RESET}"
git commit -m "tada: upgrade to v$VERSION"
git tag v$VERSION

printf "${GEEEN}Please command 'git push origin master && git push origin v$VERSION && yarn publish'\n${RESET}"

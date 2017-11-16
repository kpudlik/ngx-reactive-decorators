#!/usr/bin/env bash

set -e

CURRENT_VERSION=$(grep '"version":' ./package.json | cut -d\" -f4)
SEMVER_REGEX=^[0-9]+\.[0-9]+\.[0-9]+

echo "Current version is set to $CURRENT_VERSION"
echo ""
echo "Please enter new version number by using semantic versioning: MAJOR.MINOR.PATCH, where:"
echo " * MAJOR version when you make incompatible API changes"
echo " * MINOR version when you add functionality in a backwards-compatible manner"
echo " * PATCH version when you make backwards-compatible bug fixes"
echo ""
read -p "New version: " NEW_VERSION

if ! [[ ${NEW_VERSION} =~ ${SEMVER_REGEX} ]]; then
  echo "Provided version doesn't match MAJOR.MINOR.PATCH format!"
  exit 1
fi

RELEASE_BRANCH=release/${NEW_VERSION}

git checkout develop
git pull

git checkout -b ${RELEASE_BRANCH}
npm version ${NEW_VERSION} --no-git-tag-version
git add .
git commit -m v${NEW_VERSION}
git tag v${NEW_VERSION}
git push --tags --set-upstream origin ${RELEASE_BRANCH}

echo "Branch ${RELEASE_BRANCH} has been created and pushed. Remember to merge it back to develop and master."

exit
# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.1.0"></a>
# [2.1.0](https://github.com/bschlenk/node-roku-client/compare/v2.0.1...v2.1.0) (2018-10-16)


### Bug Fixes

* **jest:** ignore index & keys ([dabd8ab](https://github.com/bschlenk/node-roku-client/commit/dabd8ab))


### Features

* add launchDtv method ([7ea4923](https://github.com/bschlenk/node-roku-client/commit/7ea4923))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/bschlenk/node-roku-client/compare/v2.0.0...v2.0.1) (2018-08-14)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/bschlenk/node-roku-client/compare/v1.2.3...v2.0.0) (2018-08-14)


### Features

* Make commander typesafe ([bccf13c](https://github.com/bschlenk/node-roku-client/commit/bccf13c))
* Split discover into discoverAll ([bd33c68](https://github.com/bschlenk/node-roku-client/commit/bd33c68))
* Update to typescript ([dea9a61](https://github.com/bschlenk/node-roku-client/commit/dea9a61))


### BREAKING CHANGES

* Removed the wait flag from discover and instead added a
separate method discoverAll which will wait for the given amount of time
for all devices on the network.

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [6.0.0](https://github.com/bschlenk/node-roku-client/compare/v5.2.0...v6.0.0) (2026-02-12)


### ⚠ BREAKING CHANGES

* the package is now entirely `type: module`, with no commonjs
* ip is now a URL
* requires node >= 18

### Features

* new discoverEach method, allowing discovery of devices in realtime

### Other

* replaced fetch-ponyfill with native fetch
* tests rewritten to use vite


## [5.2.0](https://github.com/bschlenk/node-roku-client/compare/v5.1.0...v5.2.0) (2020-12-19)


### Features

* add mediaPlayer api ([32e0295](https://github.com/bschlenk/node-roku-client/commit/32e0295da8628542dbda8b390aba37b9e7e0b06a))

## [5.1.0](https://github.com/bschlenk/node-roku-client/compare/v5.0.1...v5.1.0) (2020-12-13)


### Features

* add POWER_OFF/ON keys ([702b0cf](https://github.com/bschlenk/node-roku-client/commit/702b0cf11bb7ad1ddc52cf7aea6579af2f29e4be))

### [5.0.1](https://github.com/bschlenk/node-roku-client/compare/v5.0.0...v5.0.1) (2020-12-13)


### Bug Fixes

* export RokuDeviceInfo interface ([10c88b9](https://github.com/bschlenk/node-roku-client/commit/10c88b9adb8a91c650f4685008c2ce6bbca0f577))

## [5.0.0](https://github.com/bschlenk/node-roku-client/compare/v4.2.0...v5.0.0) (2020-12-13)

### ⚠ BREAKING CHANGES

* add package.json exports field ([0d76459](https://github.com/bschlenk/node-roku-client/commit/0d7645926cdd1685e99a078dede54852c8ca11da))
  * [exports](https://nodejs.org/api/packages.html#packages_exports) field
    should make node-client usable from node 14 as an es module. However,
    it also prevents importing other files from the package.
* remove deprecated exports ([9564e81](https://github.com/bschlenk/node-roku-client/commit/9564e81b89389160a6ac597fe5b2edd2336c678e))
  * Removed these deprecated exports from the package, use alternatives shown:
    * keys -> Keys
    * Client -> RokuClient
* info return value is more strongly typed ([15c2f03](https://github.com/bschlenk/node-roku-client/commit/15c2f03a9714aa2938919f8e1cd444177895fefd))
  * The RokuClient#info() return value can now contain booleans as well as
    strings. The TypeScript definition of the object has been updated to
    include [all possible values](https://github.com/bschlenk/homebridge-roku/issues/9)
    instead of a generic string/string object.
* enable esModuleInterop ([9655ccb](https://github.com/bschlenk/node-roku-client/commit/9655ccb4fecfbac94780946f47ee34ef0fd61092))
  * This allows importing dependencies more easily, but I _think_ it
    means that consumers also need this setting enabled.

### Features

* add search api ([e390e3d](https://github.com/bschlenk/node-roku-client/commit/e390e3d7678022377776c87d301ab9ab6819c578))

### Bug Fixes

* **types:** commander exec callback is now a void function ([1e56327](https://github.com/bschlenk/node-roku-client/commit/1e563274db8df2e0ee97aad92e0ca54ae4f015ef))

## [4.2.0](https://github.com/bschlenk/node-roku-client/compare/v4.0.0...v4.2.0) (2020-08-15)


### Features

* add keys STAR and OPTIONS as aliases to INFO ([4c30973](https://github.com/bschlenk/node-roku-client/commit/4c3097362d4e5475c3b7d8cc77bcdc2f98088dc7))
  * The * button on the remote is technically called "info", even though
    it is never used to show information. Aliasing it to "STAR" and
    "OPTIONS" helps improve clarity.
  * `star` and `options` can be used from the `command()` interface

## [4.1.0](https://github.com/bschlenk/node-roku-client/compare/v4.0.0...v4.1.0) (2020-06-03)


### Features

* export RokuClient and Keys ([5a3e809](https://github.com/bschlenk/node-roku-client/commit/5a3e809fa634cc5b9ad37291b7c655abf0a01318))
* export all ts interfaces from `lib/client.ts` ([5a3e809](https://github.com/bschlenk/node-roku-client/commit/5a3e809fa634cc5b9ad37291b7c655abf0a01318))

### Deprecations

* named export `Client` has been deprecated and will be removed in a
  future version - use `RokuClient` instead
* named export `keys` has been deprecated and will be removed in a
  future version - use `Keys` instead

## [4.0.0](https://github.com/bschlenk/node-roku-client/compare/v3.2.0...v4.0.0) (2020-05-22)


### ⚠ BREAKING CHANGES

* Minimum NodeJS version has been bumped to 10.

### Features

* allow reusing commander commands ([abd9543](https://github.com/bschlenk/node-roku-client/commit/abd95431f6c5f497231100b25e7c2a909e1e6bc7))


### build

* bump engines.node to >=10 ([1cf5e9c](https://github.com/bschlenk/node-roku-client/commit/1cf5e9c48d26abb78bd13a1ac5df9f96454febc8))
* bump travis node versions to 10 and 12 ([e691a8b](https://github.com/bschlenk/node-roku-client/commit/e691a8be9af01899d7adc0a426b369e754875594))

## [3.2.0](https://github.com/bschlenk/node-roku-client/compare/v3.1.7...v3.2.0) (2020-01-11)


### Features

* add default port to ip if not given ([e27cd8c](https://github.com/bschlenk/node-roku-client/commit/e27cd8c6b8510db88e63307e1e1d38f1d6a814cf))

### [3.1.6](https://github.com/bschlenk/node-roku-client/compare/v3.1.5...v3.1.6) (2019-08-07)

<a name="3.1.5"></a>
## [3.1.5](https://github.com/bschlenk/node-roku-client/compare/v3.1.4...v3.1.5) (2019-02-05)



<a name="3.1.4"></a>
## [3.1.4](https://github.com/bschlenk/node-roku-client/compare/v3.1.3...v3.1.4) (2019-02-04)



<a name="3.1.3"></a>
## [3.1.3](https://github.com/bschlenk/node-roku-client/compare/v3.1.2...v3.1.3) (2018-11-23)


### Bug Fixes

* **types:** allow KeyCommand types in keypress commands ([c2785f5](https://github.com/bschlenk/node-roku-client/commit/c2785f5))



<a name="3.1.1"></a>
## [3.1.1](https://github.com/bschlenk/node-roku-client/compare/v3.1.0...v3.1.1) (2018-11-23)



<a name="3.1.0"></a>
# [3.1.0](https://github.com/bschlenk/node-roku-client/compare/v3.0.0...v3.1.0) (2018-10-20)


### Features

* add exec method to commander ([3ed3342](https://github.com/bschlenk/node-roku-client/commit/3ed3342))
* add wait method to commander ([c790780](https://github.com/bschlenk/node-roku-client/commit/c790780))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/bschlenk/node-roku-client/compare/v2.1.0...v3.0.0) (2018-10-16)


### Bug Fixes

* **tests:** add types in test ([1c591ae](https://github.com/bschlenk/node-roku-client/commit/1c591ae))


### Features

* remove tmp dependency & modify icon ([cbb5de1](https://github.com/bschlenk/node-roku-client/commit/cbb5de1))
* switch to fetch-ponyfill ([dd9d03a](https://github.com/bschlenk/node-roku-client/commit/dd9d03a))


### BREAKING CHANGES

* Icon method no longer downloads the icon to the tmp
directory, and instead returns an object with the image type, extension,
and fetch response. This will allow this package to be used in node and
the browser.



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

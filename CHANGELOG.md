## 0.1.4 (2024-10-30)

- Added `repo.currentBranch()` method
- Added `repo.describeRef(ref)` method, which returns an information object about the reference
- Added `repo.isOid(value)` method to check if a value is an object ID
- Added `isGitDir()` and `resolveGitDir()` helper functions
- Enhanced `createGitReader()` to automatically attempt adding the `.git` folder to the provided `gitdir` path, making explicit inclusion of `.git` optional

## 0.1.3 (2023-10-13)

- Fixed size computation of on-disk reverse index (`.rev` files)

## 0.1.2 (2023-10-12)

- Added `getPathEntry()` method
- Added `getPathsEntries()` method
- Fixed reading on-disk reverse index (`.rev` files)

## 0.1.1 (2023-01-25)

- Fixed methods for reading loose objects (`readObjectHeaderByOid`, `readObjectHeaderByHash`, `readObjectByOid`
  and `readObjectByHash`) that were not working in some cases due to incorrect formation of the fanout table when `fs.readdir()` returns an unsorted list of entries
- Fixed `listRemotes()` method to always return a sorted list of remotes
- Fixed `stat()` method to return stable results disregarding of `fs.readdir()`'s result list order

## 0.1.0 (2022-09-12)

- Initial release

# ed2k.js

Enables generation of [eD2k][ed2k] URI and hash on the browser.

## Install

`npm install ed2k.js`

## Usage

Here's an example for hashing a single file.

```
const ED2K = require('ed2k.js')
const hasher = new ED2K()
const fileReader = new FileReader()

// html file object (e.g. from file input)
const file = document.querySelector('input[type=file]').files[0]

// filename will be blank in the URI generated unless we set this
hasher.ed2k.name = file.name

let ed2kURI

fileReader.onload = function (e) {
  // you might want to break large file into chunks and do
  // multiple updates to keep browser memory usage in check
  hasher.update(new Buffer(e.target.result))
  ed2kURI = hasher.digest()
}

fileReader.readAsArrayBuffer(file)
```

when hashing is done:

```
$ ed2kURI
> Object {
    name: "example.txt",
    size: 1,
    hash: "ea5698173fc6fdbe30a9af462b9fc847"
  }

$ ed2kURI + ''
> "ed2k://|file|example.txt|1|ea5698173fc6fdbe30a9af462b9fc847"
```

## Additional Note

This project's implementation detail is based on [ed2k-link][ed2k-link]
and rewritten to support execution in the browser environment.
If you don't need it to run on the browser, go check that project out
as it may have better performance on node.

*This implementation will add an additional 0-byte chunk at the end
of the hash set for file that is a multiple of 9500KiB.*

## License

ed2k.js is licensed under the Apache License, Version 2.0.
[View the license file](LICENSE)

[ed2k]: https://en.wikipedia.org/wiki/Ed2k_URI_scheme
[ed2k-link]: https://github.com/lightrabbit/ed2k-link

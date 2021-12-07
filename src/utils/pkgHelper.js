const jetpack = require("fs-jetpack");
const _ = require("lodash");
const path = require("path");
class PkgHelper {
  constructor({ pkgPath, root }) {
    this.pkgPath = pkgPath
      ? pkgPath
      : root
      ? path.join(root, "package.json")
      : path.join(process.cwd(), "package.json");
  }

  get json() {
    return require(this.pkgPath);
  }

  update(value = {}) {
    const data = _.merge(this.json, value);
    jetpack.write(this.pkgPath, JSON.stringify(data, null, 2));
  }

  static of(data) {
    return new PkgHelper(data);
  }
}

module.exports = PkgHelper;

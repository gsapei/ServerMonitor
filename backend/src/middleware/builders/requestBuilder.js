var fs = require("fs");

class RequestBuilder {
  constructor() {}

  getHeaderOptions(host, port, path, method, token) {
    return {
      hostname: host,
      port: port,
      path: path,
      ca: fs.readFileSync("cert/ca.pem", { encoding: "utf-8" }),
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };
  }
}

module.exports = RequestBuilder;

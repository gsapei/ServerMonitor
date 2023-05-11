var jwt = require("jsonwebtoken");
const errors = require("throw.js");
let Keystore = require("../helpers/keystore");
const RequestBuilder = require("../builders/requestBuilder");
const http = require("http");
const moment = require("moment");
const AccessControl = require("accesscontrol");

module.exports = {
  aclContainer: undefined,

  verifyToken: (req, res, next) => {
    let token = req.headers["authorization"];
    //console.log("TOKEN VERIFICATION: ", token);
    try {
      if (token) {
        var decoded = jwt.decode(token);
        //console.log('TOKEN DECODED: ', decoded);
        let key = decoded.username + "@" + decoded.app;
        if (this.aclContainer === undefined) {
          this.aclContainer = new Keystore();
        }

        //comprobar que el token no ha expirado
        if (!moment().isBefore(decoded.expiredTime)) {
          //this.aclContainer.deleteGrantListHashMap(key);
          let err = new errors.Unauthorized(
            "Tiempo de sesión expirado. Se requiere autenticación."
          );
          res.status(err.statusCode || 500).json(err);
          return;
        }
        //console.log('TOKEN DECODED: ', decoded);
        req.body.app = decoded.app;
        req.body.domain = decoded.domain;
        req.body.username = decoded.username;
        req.body.role = decoded.role;
        if (decoded.userId !== undefined) {
          req.body.userId = decoded.userId;
        }

        //comprobar que existe grant para un usuario determinado
        //let acl = this.aclContainer.getGrantListHashMap(key); //myAc.getGrantListHasMap(key);
        if (this.aclContainer.hasKey(key)) {
          req.body.grants = new AccessControl(
            this.aclContainer.retrieveValue(key)
          );
          next();
        } else {
          const reqBuilder = new RequestBuilder();
          const options = reqBuilder.getHeaderOptions(
            global.gConfig.authServer,
            global.gConfig.authPort,
            global.gConfig.authACL,
            "GET",
            token
          );
          const request = http.request(options, (response) => {
            response.on("data", (d) => {
              this.aclContainer.storeKey(key, JSON.parse(d));
              //console.log(JSON.parse(d));
              req.body.grants = new AccessControl(JSON.parse(d)); //this.aclContainer.retrieveValue(key));
              next();
            });

            response.on("error", (e) => {
              console.error(e);
              next(e);
            });
          });
          request.end();
/*
          let grant = getAccessControlGrants(token);
          acl = new AccessControl(grant.resultset);                    
          let roles = (decoded.extend !== "")? decoded.extend.split(','):[];
          if (roles.length > 0) {
              for (let index = 0; index < roles.length; index++) {
                  const roleExtend = roles[index];
                  acl.grant(decoded.role).extend(roleExtend);
              }
          }
          this.aclContainer.setGrantListHashMap(key,acl);
*/
        }
      } else {
        res.send({
          success: false,
          message: "No token provided.",
        });
        return;
      }
    } catch (err) {
      let errObj = new errors.Unauthorized(
        "Error en el proceso de validación."
      );
      res.status(500).json(errObj);
      return;
    }
  },
};

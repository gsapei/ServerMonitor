const app = 'serverMonitor';
const domain = 'GIS@PRO';
const tokenKey = 'user_token';
import { api } from 'boot/axios'

class AuthService {
  login(username, password) {
    const headers = {
      'Content-Type': 'application/json',  
    };
    
    return api
      .post("/csm/backend/site/serverMonitor/login", {
        username,
        password,
        domain,
        app,
      },
      headers
      )
      .then(
        (response) => {
          if (response.data.token) {
            sessionStorage.setItem(tokenKey, JSON.stringify(response.data.token), );
          }
          return response.data;
        },
        (error) => {
          //TODO: Agregar una libreria para logging
           console.log(error);
          return Promise.reject(error);
        }
      );
  }

  logout() {
    sessionStorage.removeItem(tokenKey);
    sessionStorage.removeItem('vuex');
  }

  parseJwt(token) {
    if (token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );

      return JSON.parse(jsonPayload);
    } else return {};
  }

  getCurrentUser() {
    try {
      const jwt = sessionStorage.getItem(tokenKey);
      //decodificar el payload
      const tokenDecoded = this.parseJwt(jwt);
      // console.log(tokenDecoded);
      return tokenDecoded;
    } catch (ex) {
      return null;
    }
  }
}

export default new AuthService();

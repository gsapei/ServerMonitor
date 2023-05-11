import AuthService from '../../services/auth.service';
import axios from "axios";
import { getUserRol } from './getters';

export function login({ commit }, usuario) {
  return AuthService.login(usuario.username, usuario.password).then(
    (user) => {
      commit('loginSuccess', user);
      return Promise.resolve(user);
    },
    (error) => {
      commit('loginFailure');
      return Promise.reject(error);
    }
  );
}

export function check_credentials({ commit }, usuario) {
  return AuthService.login(usuario.username, usuario.password).then(
    (user) => {
      return Promise.resolve(user);
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

export function logout({ commit }) {
  commit('logout');
  return AuthService.logout();
}

export function setRol({commit}){
  let token=sessionStorage.getItem('user_token').replace(/['"]+/g, '');
  axios.get(URL+'/csm/backend/site/serverMonitor/canExecute', {
    headers: {
    'Authorization': token
    }
  })
  .then(res => {
    res.data == true ? commit('setRol',res.data) : commit('setRol',false);  
  })
};

export function checkTokenStorage({ commit }) {
  const user = JSON.parse(sessionStorage.getItem('user_token'));
  if (!user) {
    commit('logout');
  }
}

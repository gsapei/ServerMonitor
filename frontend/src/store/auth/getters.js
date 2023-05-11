import AuthService from '../../services/auth.service';

export function isLoggedIn(state) {
  return state.userState.loggedIn;
}
export function getActiveUser(state) {
  return state.userState.user ? AuthService.parseJwt(state.userState.user.token).username : '';
}

export function getUserRol(state) {
  return state.rolUsuario;
}

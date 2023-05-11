export function loginSuccess(state, user) {
  state.userState = {
    user: { ...user },
    loggedIn: true,
  };
}
export function loginFailure(state) {
  state.userState = {
    user: null,
    loggedIn: false,
  };
}
export function logout(state) {
  state.userState = {
    user: null,
    loggedIn: false,
  };
}
export function setRol(state, payload){
  state.rolUsuario = payload;
}
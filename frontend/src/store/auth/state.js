const user = JSON.parse(sessionStorage.getItem('user_token'));
const initialState = user ? { loggedIn: true, user }: { loggedIn: false, user: null };

export default function() {
    return {
    userState: initialState,
    rolUsuario: null
  };
}

// /* 此组件保存user信息 
// store.dispatch('saveUserInfo', user); */

// import { createStore } from 'vuex'
// import { getLocalUser } from '@/utils/auth'
// export default createStore({
//   state() {
//     return {
//         user: getLocalUser('userId', -1)
//     }
//   },
//   mutations: {
//     UPDATE_USER(state, id) {
//       state.user = id;
//       localStorage.setItem('userId', JSON.stringify(state.user));
//     }
//   },
//   actions: {
//     async saveUserInfo({ commit }, userData) {
//       // 
//       commit('UPDATE_USER', userData)
//       return true
//     }
//   },
//   getters: {
//     getUser: state => state.user,
//   }
// })
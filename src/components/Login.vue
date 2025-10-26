<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="input-field">
          <input type="email" v-model="email" placeholder="Email" required />
        </div>
        <div class="input-field">
          <input
            type="password"
            v-model="password"
            placeholder="Password"
            required
          />
        </div>
        <button type="submit" class="btn">Login</button>
        <p class="register-text" @click="goToRegister">
          Don't have an account? <span>Sign up</span>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { loginApi } from "@/api/api";
import { setToken } from "@/utils/auth";

const router = useRouter();
const route = useRoute();
const email = ref("");
const password = ref("");

// Handle login logic
const handleLogin = () => {
  AxiosLogin();
};

// Navigate to register page
const goToRegister = () => {
  router.push("/register");
};

async function AxiosLogin() {
  try {
    const res = await loginApi(email.value, password.value);
    console.log(res);
    if (res.session_token) {
      setToken(res.session_token);
      const userId = res.user_id;
      localStorage.setItem("userId", userId);
      router.push("/home");
    } else {
      alert("Login failed: " + (res.error_message || "Unknown error"));
    }
  } catch (error) {
    console.error("Login failed: ", error);
    alert("Login failed: " + (error.response?.data?.error_message || "Network error"));
  }
}
</script>

<style scoped>
/* Login page styles */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 300px;
}

h1 {
  margin-bottom: 1.5rem;
  color: #333;
}

.input-field {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  margin: 1rem 0;
  position: relative;
}

.input-field input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
}

.btn {
  width: 100%;
  padding: 0.6rem;
  border: none;
  border-radius: 25px;
  background-color: rgb(150, 107, 193);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
  margin-top: 1rem;
}

.btn:hover {
  background-color: rgb(130, 97, 173);
}

.register-text {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
}

.register-text span {
  color: rgb(150, 107, 193);
}

.register-text span:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-box {
    width: 60%;
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .input-field {
    padding: 0.4rem 0.8rem;
  }

  .input-field input {
    font-size: 0.85rem;
  }

  .btn {
    font-size: 0.85rem;
    padding: 0.5rem;
  }

  .register-text {
    font-size: 0.75rem;
  }
}
</style>

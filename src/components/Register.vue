<template>
  <div class="register-container">
    <div class="register-box">
      <h1>Sign Up</h1>
      <form @submit.prevent="handleRegister">
        <div class="input-field">
          <input type="text" v-model="firstName" placeholder="First Name" required />
        </div>
        <div class="input-field">
          <input type="text" v-model="lastName" placeholder="Last Name" required />
        </div>
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
        <div class="input-field">
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="Confirm Password"
            required
          />
        </div>
        <button type="submit" class="btn">Sign Up</button>
        <p class="login-text" @click="goToLogin">
          Already have an account? <span>Login</span>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { registerApi } from "@/api/api";

const router = useRouter();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

// Handle registration logic
const handleRegister = () => {
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match");
    return;
  }
  AxiosRegister();
};

// Navigate to login page
const goToLogin = () => {
  router.push("/login");
};

async function AxiosRegister() {
  try {
    const userData = {
      first_name: firstName.value.trim(),
      last_name: lastName.value.trim(),
      email: email.value.trim(),
      password: password.value
    };
    const res = await registerApi(userData);
    console.log(res);
    if (res.user_id) {
      alert("Registration successful! Please login");
      router.push("/login");
    } else {
      alert("Registration failed: " + (res.error_message || "Unknown error"));
    }
  } catch (error) {
    console.error("Registration failed:", error);
    alert("Registration failed: " + (error.response?.data?.error_message || "Network error"));
  }
}
</script>

<style scoped>
/* Registration page styles */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 注册框 */
.register-box {
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

/* 输入框样式 */
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

/* 按钮样式 */
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

/* 登录链接 */
.login-text {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
}

.login-text span {
  color: rgb(150, 107, 193);
}

.login-text span:hover {
  text-decoration: underline;
}

/* 手机设备样式（宽度小于 480px） */
@media (max-width: 480px) {
  .register-box {
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

  .login-text {
    font-size: 0.75rem;
  }
}
</style>

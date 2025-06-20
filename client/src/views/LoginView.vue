/*
 * =================================================================
 * 登录页面 (`client/src/views/LoginView.vue`)
 * 说明:  在组件内部添加了专门处理登录失败的catch逻辑。
 * =================================================================
 */
<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>信息全景分析数据系统</span>
        </div>
      </template>
      <el-form @submit.prevent="handleLogin" :disabled="loading">
        <el-form-item>
          <el-input
            v-model="username"
            placeholder="用户名 (admin)"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            placeholder="密码 (adminadmin)"
            size="large"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" style="width: 100%;" size="large" :loading="loading">登 录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import { User, Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'; // 引入 ElMessage

const username = ref('admin');
const password = ref('adminadmin');
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  if (!username.value || !password.value) return;
  loading.value = true;
  try {
    await authStore.login({ username: username.value, password: password.value });
    router.push('/');
  } catch (error) {
     // (已修正) 在这里专门处理登录失败的错误
     ElMessage.error('用户名或密码错误。');
     console.error('Login failed in component:', error)
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.login-card {
  width: 400px;
}
.card-header {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}
</style>

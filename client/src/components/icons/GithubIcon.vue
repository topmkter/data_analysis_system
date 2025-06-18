// --- 文件: client/src/components/icons/GithubIcon.vue (已修正) ---
<template>
  <!--
    这里使用 <img> 标签来显示您的PNG图片。
    我们使用 `@` 别名，它指向 `src` 目录，这是Vite推荐的做法。
    请确保您的 `github.png` 文件确实放在 `client/src/components/icons/` 目录下。
  -->
  <img src="@/components/icons/github.png" alt="GitHub Icon" class="custom-icon" />
</template>

<script setup lang="ts">
// 这个组件现在显示一个PNG图片。
</script>

<style scoped>
.custom-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle; /* 确保图标和文字对齐 */
}
</style>

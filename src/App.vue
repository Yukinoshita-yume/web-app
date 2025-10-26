<template>
  <div id="app">
    <ConfirmDialog ref="dialogRef" />
    <router-view />
  </div>
</template>

<script setup>
import { provide, ref } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

// 对话框逻辑
const dialogRef = ref(null);

const confirm = async (params) => {
  if (!dialogRef.value) return false
  return await dialogRef.value.show(params);
}

provide('confirmDialog', confirm)
</script>

<style>
html{
  height: 100%;
}
body {
  /* background: linear-gradient(
    to top,
    #b1d6f7,
    #e9f3fc
  );  */
  /*由淡蓝色到更浅的蓝色*/
  background: linear-gradient(
    to top,
    rgba(228,213,243,1),
    rgba(255,240,221,1)
  ); 
  /*紫色，淡黄版本 */
  height: 100%;
  width: 100vw;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  list-style: none;
  text-decoration: none;
  overflow-x: hidden;
}
/* body ::before{
  background: rgba(255, 235, 150, 0.2);
  pointer-events: none; 
} */
#app{
  height: 100%;
  width: 100vw;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}
</style>

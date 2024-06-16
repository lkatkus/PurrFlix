<template>
  <router-view></router-view>
</template>

<style>
* {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body > #app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

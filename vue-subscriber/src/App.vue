<template>
  <router-view></router-view>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap");

* {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-style: normal;
  font-optical-sizing: auto;
  font-family: "Open Sans", sans-serif;
}

body > #app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

<script lang="ts">
import LoginForm from "../containers/LoginForm.vue";

export default {
  components: {
    LoginForm,
  },
};
</script>

<template>
  <base-page-container>
    <div class="contentContainer">
      <h1>PurrFlix</h1>
      <login-form></login-form>
    </div>
  </base-page-container>
</template>

<style scoped>
.contentContainer {
  width: 100%;
  max-width: 50%;
}

h1 {
  text-align: center;
}
</style>

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
      <div class="formWrapper">
        <login-form></login-form>
      </div>
    </div>
  </base-page-container>
</template>

<style scoped>
.contentContainer {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.formWrapper {
  width: 90%;
}

@media (min-width: 600px) {
  .formWrapper {
    width: 50%;
  }
}
</style>

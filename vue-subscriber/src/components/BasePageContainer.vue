<template>
  <div class="pageContainer">
    <div class="pageHeaderContainer">
      <div class="pageHeaderContentContainer">
        <h1>PurrFlix</h1>
      </div>
    </div>

    <div class="pageContentContainer">
      <slot></slot>
    </div>

    <div class="pageFooterContainer">
      <div class="pageFooterContentContainer">
        <h4>Footer</h4>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1,
h4 {
  margin: 8px 0;
}

.pageContainer {
  background-color: cyan;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.pageHeaderContainer {
  background-color: red;
  width: 100%;
  display: flex;
  justify-content: center;
}

.pageHeaderContentContainer {
  background-color: salmon;
  width: 100%;
  max-width: 1440px;
}

.pageFooterContainer {
  background-color: slategray;
  width: 100%;
  display: flex;
  justify-content: center;
}

.pageFooterContentContainer {
  width: 100%;
  max-width: 1440px;
}

.pageContentContainer {
  background-color: skyblue;
  overflow-y: auto;
  width: 100%;
  height: 100%;
  max-width: 1440px;
}
</style>

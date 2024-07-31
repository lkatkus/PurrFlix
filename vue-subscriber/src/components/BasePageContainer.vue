<template>
  <div class="pageContainer">
    <div id="pageHeaderContainer" class="pageHeaderContainer">
      <div id="pageHeaderStickyContainer" class="pageHeaderStickyContainer">
        <div class="pageHeaderContentContainer">
          <div class="homePageLink">
            <router-link to="/PurrFlix/">
              <h1 class="visibleDesktop">purrflix</h1>
              <h1 class="visibleMobile">pf</h1>
            </router-link>
          </div>

          <p>purrfect place for paw-some moments</p>
        </div>
      </div>
    </div>

    <div class="pageContentContainer">
      <slot></slot>
    </div>

    <div class="pageFooterContainer">
      <div class="pageFooterContentContainer">
        <div>
          <h4>About</h4>
          <div>
            PurrFlix is a hobby project created to learn and experiment with new
            technologies. You can only make some many to-do applications...
          </div>
        </div>

        <div>
          <h4>Credits</h4>
          <div>
            All videos used on PurrFlix are sourced from
            <a target="_blank" href="https://www.pexels.com/">Pexels.com</a>
            and are licensed under Pexels.com
            <a target="_blank" href="https://www.pexels.com/license/"
              >free-to-use license</a
            >.
          </div>
        </div>

        <div>
          <h4>Links</h4>
          <div>
            <nav>
              <a target="_blank" href="https://github.com/lkatkus/PurrFlix"
                >Github</a
              >
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pageContainer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.pageHeaderContainer {
  width: 100%;
  min-height: 60px;
  color: rgb(255, 227, 227);
}

.pageHeaderContainer a {
  text-decoration: none;
  color: inherit;
}

.pageHeaderStickyContainer {
  position: fixed;
  z-index: 1;
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  background-color: #f55;
}

.pageHeaderContentContainer {
  width: 100%;
  max-width: var(--page-content-width);
  padding: 0 16px;
  display: flex;
  align-items: center;
}

.homePageLink {
  margin-right: 16px;
  font-family: "Grand Hotel", cursive;
}

.pageContentContainer {
  background-color: white;
  width: 100%;
  flex: 1;
}

.pageFooterContainer {
  background-color: #264653;
  width: 100%;
  display: flex;
  justify-content: center;
  color: white;
}

.pageFooterContentContainer {
  width: 100%;
  max-width: var(--page-content-width);
  color: white;
  padding: 16px;
  display: grid;
  row-gap: 16px;
  column-gap: 16px;
  grid-template-columns: 1fr;
}

.pageFooterContentContainer * {
  color: inherit;
}

.visibleMobile {
  display: block;
}

.visibleDesktop {
  display: none;
}

@media (min-width: 768px) {
  .visibleMobile {
    display: none;
  }

  .visibleDesktop {
    display: block;
  }

  .pageFooterContentContainer {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>

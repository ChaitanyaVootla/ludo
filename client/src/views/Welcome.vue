<script lang="ts">
export default {
  name: 'WelcomeView',
  mounted() {
  },
  methods: {
    startNewGame() {
      this.$router.push({name: 'newgame'})
    }
  }
}
</script>

<template>
  <div class="main-container">
    <div class="enter-game">
        <input type="text" placeholder="Enter game code" />
        <button>
            Enter game
        </button>
    </div>
    <div class="new-game">
        <button @click="startNewGame()">
            Start new game
        </button>
    </div>
  </div>
</template>

<style scoped lang="less">
.main-container {
    margin: 10rem;
}
.enter-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.new-game {
    margin: 10rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>
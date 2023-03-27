<script lang="ts">
import { getName, changeName, setGameId, getUserId } from '@/localStorageManager'
import { sendMessageSync } from '@/socket'

export default {
  name: 'NewGame',
  data() {
    return {
        name: ''
    }
  },
  mounted() {
    this.name = getName();
  },
  methods: {
    async createGame() {
        changeName(this.name);
        const game = await sendMessageSync('createGame',
            { userData:
                {
                    name: this.name,
                    id: getUserId()
                }
            });
        setGameId(game.id);
        this.$router.push({name: 'game'})
    }
  }
}
</script>

<template>
  <div class="main-container">
    <div class="name-input">
        <input v-model="name" type="text" placeholder="Enter your name" />
        <button v-bind:disabled="name.length === 0" @click="createGame()" type="button">
            Create game
        </button>
    </div>
  </div>
</template>

<style scoped lang="less">
.name-input {
    margin: 10rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>
<template>
  <header class="d-flex justify-content-between">
    <div class="d-flex">
      <span id="main-link" class="menu-link" @click="page = 'home'">
        <img src="@/assets/img/craft.svg" id="logo" alt=""/>
        <span id="name">BC Crafts Manager</span>
      </span>
      <span class="menu-link" @click="page = 'settings'"><img src="@/assets/img/cog.svg" class="mr-1" alt=""/> Settings</span>
      <span class="menu-link" @click="page = 'about'"><img src="@/assets/img/about.svg" class="mr-1" alt=""/> Help</span>
    </div>
    <input type="text" v-if="page == 'home'" v-model="queryField" id="query" class="mx-3" @input="updateQuery()" placeholder="Filter items..."/>
    <span>
      <button class="btn btn-success" @click="loadFromClipboard()" style="height: 28px; margin-top: 3px;">
        <img src="@/assets/img/clip-read.svg" alt=""/> Load from clipboard
      </button>
      <a href="https://github.com/capyfied/bccm" title="GitHub" target="_blank">
        <img src="@/assets/img/github.svg" id="github" class="mx-2" alt=""/>
      </a>
    </span>
  </header>
  <main class="container-fluid">
    <Alert/>
    <Explorer v-if="page == 'home'"/>
    <About v-if="page == 'about'"/>
    <Settings v-if="page == 'settings'" @go-to="goTo"/>
  </main>
</template>

<script>
import { readClipboard, debounce, pluralize } from "@/util/util.js";
import stores from "@/stores/stores.js";
import Explorer from './components/Explorer.vue';
import About from './components/About.vue';
import Settings from './components/Settings.vue';
import Alert from './components/Alert.vue';
import "@/assets/css/application.scss";

export default {
  name: 'App',
  components: { Alert, Explorer, Settings, About },
  data: () => { return {
    page: "home", // [String] The page the user is currently viewing (because installing Vue Router for three little pages seems overkill).
    queryField: "" // [String] The contents of the query field, which is debounced and lowercased into explorerStore.query.
  }},
  computed: {
    ...stores
  },
  methods: {
    // Navigate to a different page.
    goTo(page) {
      this.page = page;
    },
    // Load data from user's cliboard.
    loadFromClipboard() {
      readClipboard().then(text => {
        if (text) {
          try {
            const stats = this.database.importCrafts(text);
            console.log(`Imported ${stats.new + stats.edited}/${stats.total} crafts (${stats.new} new, ${stats.edited} edited, ${stats.failed} failed)`);
            if (stats.failed > 0) {
              if (stats.total == 1) {
                this.alertStore.alert(`Could not load the craft, see console for details.`);
              } else {
                this.alertStore.alert(`Could not load ${stats.failed} out of ${stats.total} ${pluralize('craft', stats.total)}, see console for details.`);
              }
            } else {
              if (stats.edited == 0) {
                this.alertStore.alert(`Added ${stats.new} new ${pluralize('craft', stats.new)}.`, "success");
              } else {
                this.alertStore.alert((stats.new == 0 ?
                  `Updated ${stats.edited} ${pluralize('craft', stats.edited)}.` :
                  `Added ${stats.new} new ${pluralize('craft', stats.new)}, and updated ${stats.edited}.`),
                  "success"
                )
              }
            }
          } catch(e) {
            this.alertStore.alert("Couldn't parse clipboard data, see console for details.");
            console.error(e);
          }
        } else {
          this.alertStore.alert("Clipboard is empty.");
        }
      });
    },
    // Whenever the query changes, update the store.
    updateQuery() {
      this.explorerStore.query = this.queryField.toLowerCase();
    }
  },
  created() {
    this.updateQuery = debounce(this.updateQuery, 200);
  }
}
</script>

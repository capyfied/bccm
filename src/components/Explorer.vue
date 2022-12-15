<template>
  <div class="row">
    <div id="craft-list" :class="'scrollable ' + (selectedEntity ? 'col-8 col-xl-9' : 'col-12')" @keydown.delete="deleteSelectedEntity">
      <div v-if="multiselectionCrafts.length > 0" id="multiselection-notice" :class="{ 'explorer-notice': true, invalid: tooManyMultiselected }">
        <p class="my-1">{{ multiselectionCrafts.length }} {{ pluralize('craft', multiselectionCrafts.length) }} selected.</p>
        <button class="btn-transparent text-bold pl-0" @click="this.explorerStore.multiselectionEntities = []">Cancel</button>
        <button class="btn-transparent float-right text-bold pr-0" @click="copyMultiselection()">Export</button>
      </div>
      <div v-if="repeatedCraftName" id="repeated-notice" class="explorer-notice">
        <p class="my-1"><img src="@/assets/img/warn.svg" class="icon"/> Repeated craft name:</p>
        <p class="my-1 text-bold">{{ repeatedCraftName }}</p>
      </div>
      <template v-if="database.rootFolder.crafts.length > 0 || database.rootFolder.subfolders.length > 0">
        <Folder :folder="database.rootFolder" :depth="0"/>
      </template>
      <div v-else class="p-5 mt-5 text-center">
        Import some crafts to display them here. <img src="@/assets/img/arrow-ne.svg" class="ml-2" style="width: 20px"/>
      </div>
    </div>
    <template v-if="selectedEntity">
      <FolderDetails v-if="selectedEntity.isFolder" class="col-4 col-xl-3"/>
      <CraftDetails v-else class="col-4 col-xl-3"/>
    </template>
  </div>
</template>
<style>
</style>
<script>
import stores from "@/stores/stores.js";
import CraftDetails from "./CraftDetails.vue";
import FolderDetails from "./FolderDetails.vue";
import Folder from "./Folder.vue";
import BCEncoder from "@/util/bcEncoder.js";
import { pluralize } from "@/util/util.js";

export default {
  name: 'Home',
  components: { Folder, CraftDetails, FolderDetails },
  computed: {
    ...stores,
    tooManyMultiselected() {
      return this.multiselectionCrafts.length > BCEncoder.maxCraftsExportable;
    }
  },
  methods: {
    handleCraftClick(craft) {
      this.selectedEntity = craft;
    },
    copyMultiselection() {
      try {
        window.navigator.clipboard.writeText(BCEncoder.convertCraftsToBCImportCommand(this.multiselectionCrafts));
      } catch(e) {
        if (e.name == "ExportLimitError") this.alertStore.alert(e.message);
        else throw e;
      }
    },
    pluralize
  },
  created() {
    this.explorerStore.findRepeatedCraftName();
  }
}
</script>

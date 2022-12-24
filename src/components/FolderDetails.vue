<!-- This component is the sidebar that appears on the right whenever you click on a folder to edit it -->
<template>
  <div id="sidepanel" class="scrollable">
    <div class="d-flex justify-content-between">
      <h1><img src="@/assets/img/folder.svg" class="icon-lg" alt=""/> Edit folder</h1>
      <button class="btn-transparent p-2 mt-4" @click="explorerStore.selectedEntity = null">
        <img src="@/assets/img/cross.svg" class="icon"/>
      </button>
    </div>
    <label>
      Name
      <input type="text" v-model="folder.name" ref="txtName" @change="database.saveToLocalStorage()" maxlength="30"/>
    </label>
    <div v-if="totalCrafts > 0" class="mt-2 text-sm">{{ totalCrafts }} total {{ pluralize('craft', totalCrafts) }}</div>
    <div v-else class="mt-2 text-sm">No crafts</div>
    <div class="row mt-2 mx-n1">
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-success w-100 ellipsis" @click="copyImportCommand"><img src="@/assets/img/clip-write.svg"/> Copy as command</button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-primary w-100 ellipsis" @click="copyAsCompressedBCJsons"><img src="@/assets/img/clip-write.svg"/> Copy as export</button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-success w-100" @click="addFolder"><img src="@/assets/img/plus.svg"/> New subfolder</button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-primary w-100" @click="explorerStore.toggleMultiselectionOf(folder)">
          <img src="@/assets/img/checkbox.svg"/> Select
        </button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-primary w-100" @click="moveFolder('up')" :disabled="!folder.parent || folder.parent.subfolders[0] == folder">
          <img src="@/assets/img/arrow-up.svg"/> Move up
        </button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-primary w-100 ellipsis" :disabled="totalCrafts == 0" @click="toggleVisibilityOfAllCrafts">
          <img src="@/assets/img/visibility.svg"/> Toggle visibility
        </button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-primary w-100" @click="moveFolder('down')" :disabled="!folder.parent || folder.parent.subfolders[folder.parent.subfolders.length - 1] == folder">
          <img src="@/assets/img/arrow-down.svg"/> Move down
        </button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-danger w-100" @click="deleteFolder" :disabled="!folder.parent">
          <img src="@/assets/img/trash.svg"/> Delete
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import stores from "@/stores/stores.js";
import { pluralize } from "@/util/util.js";
import BCJsonFormat from "@/util/formats/bcJsonFormat.js";

export default {
  name: 'FolderDetails',
  computed: {
    // The folder whose details we are currently displaying.
    folder() {
      return this.selectedEntity;
    },
    totalCrafts() {
      return this.folder.findAllCrafts().length;
    },
    ...stores
  },
  methods: {
    // Create a new folder as a child of the currently selected one.
    addFolder() {
      const newFolder = this.database.addFolder(this.folder, 'New folder');
      this.folder.collapsed = false;
      this.explorerStore.selectedEntity = newFolder;
      this.$refs.txtName.focus();
    },
    // Delete the currently selected folder.
    deleteFolder() {
      const craftCount = this.folder.findAllCrafts().length;
      if (craftCount == 0 || confirm(`Delete ${this.folder.name || 'this folder'} and the ${craftCount} craft(s) inside?`)) {
        this.database.removeFolder(this.folder);
        this.explorerStore.selectedEntity = this.folder.parent;
      }
    },
    // Copy all of the folder's crafts to the clipboard as a console command to run on BC to import them.
    copyImportCommand() {
      try {
        window.navigator.clipboard.writeText(this.folder.toBCImportCommand());
      } catch(e) {
        if (e.name == "ExportLimitError") this.alertStore.alert(e.message);
        else throw e;
      }
    },
    // Copy all of the folder's crafts to the clipboard as a compressed array of BC JSONs.
    copyAsCompressedBCJsons() {
      window.navigator.clipboard.writeText(BCJsonFormat.convertCraftsToCompressedBCJsons(this.folder.findAllCrafts()));
    },
    // Move the folder up or down among its siblings.
    moveFolder(direction) {
      this.folder.move(direction);
      this.database.saveToLocalStorageWithDebounce();
    },
    // Make all the crafts within this folder public or private at once.
    toggleVisibilityOfAllCrafts() {
      const crafts = this.folder.findAllCrafts();
      const firstCraftIsPrivate = crafts[0].private;
      crafts.forEach(c => {
        c.private = !firstCraftIsPrivate;
      });
      this.database.saveToLocalStorage();
    },
    pluralize
  }
}
</script>

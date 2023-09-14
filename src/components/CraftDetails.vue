<!-- This component is the sidebar that appears on the right whenever you click on a craft to edit it. -->
<template>
  <div id="sidepanel" class="scrollable">
    <div class="d-flex justify-content-between">
      <h1><img src="@/assets/img/craft.svg" class="icon-lg" alt=""/> Edit craft</h1>
      <button class="btn-transparent p-2 mt-4" @click="explorerStore.selectedEntity = null">
        <img src="@/assets/img/cross.svg" class="icon"/>
      </button>
    </div>
    <label>
      Name
      <small class="float-right">{{ craft.name.length }}/{{ nameMaxLength }}</small>
      <input type="text" v-model="craft.name" @input="handleNameInput()" :maxlength="nameMaxLength"/>
    </label>
    <label>
      Description
      <small class="float-right">{{ craft.description.length }}/{{ descrMaxLength }}</small>
      <input type="text" v-model="craft.description" @change="database.saveToLocalStorage()" :maxlength="descrMaxLength"/>
    </label>
    <label>
      Colors
      <span v-if="craft.color" style="float: right">
        <template v-for="color in craft.color.split(',')">
          <span v-if="color != 'Default'" :style="{ color: color }">▮</span>
        </template>
      </span>
      <input type="text" v-model="craft.color" disabled=""/>
    </label>
    <label>
      Item codename
      <input type="text" v-model="craft.item" disabled=""/>
    </label>
    <label>
      <img src="@/assets/img/star.svg" class="icon" alt=""/> Property
      <input type="text" v-model="craft.property" disabled=""/>
    </label>
    <label>
      Default position
      <input type="text" v-model="craft.type" disabled=""/>
    </label>
    <label>
      <img src="@/assets/img/lock.svg" class="icon" alt=""/> Lock
      <input type="text" v-model="craft.lock" disabled=""/>
    </label>
    <label>
      Override priority <span v-if="craft.priority && typeof(craft.priority) == 'string'" style="color: #ff2d2d">should be a number</span>
      <input type="text" v-model.number="craft.priority" @change="database.saveToLocalStorage()"/>
    </label>
    <label>
      <input type="checkbox" v-model="craft.private" @change="database.saveToLocalStorage()"/> Private
    </label>
    <div class="row mt-3 mx-n1">
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-success w-100 ellipsis" @click="copyCompressedBCJson"><img src="@/assets/img/clip-write.svg"/> Copy as export</button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-primary w-100 ellipsis" @click="copyBCJson"><img src="@/assets/img/clip-write.svg"/> Copy as JSON</button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-primary w-100" @click="moveCraft('up')" :disabled="!craft.parent || craft.parent.crafts[0] == craft">
          <img src="@/assets/img/arrow-up.svg"/> Move up
        </button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-primary w-100" @click="explorerStore.toggleMultiselectionOf(craft)">
          <img src="@/assets/img/check.svg"/> Select
        </button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-primary w-100" @click="moveCraft('down')" :disabled="!craft.parent || craft.parent.crafts[craft.parent.crafts.length - 1] == craft">
          <img src="@/assets/img/arrow-down.svg"/> Move down
        </button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-warning w-100" @click="overwriteCraftWithClipboard" title="Overwrite this craft with the data currently in the clipboard">
          <img src="@/assets/img/clip-read.svg"/> Overwrite
        </button>
      </div>
      <div class="col-12 col-md-6 p-1">
        <button class="btn btn-danger w-100" @click="deleteCraft">
          <img src="@/assets/img/trash.svg"/> Delete
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import stores from "@/stores/stores.js";
import { readClipboard, debounce } from "@/util/util.js";
import Craft from "@/models/craft.js";

export default {
  name: 'CraftDetails',
  computed: {
    craft() {
      return this.selectedEntity;
    },
    nameMaxLength() { return Craft.NAME_MAX_LENGTH; },
    descrMaxLength() { return Craft.DESCR_MAX_LENGTH; },
    ...stores
  },
  methods: {
    handleNameInput() {
      // Warn the user if there is another craft with the same name in the database, warn the user instead of saving.
      this.explorerStore.findRepeatedCraftName();
      if (!this.repeatedCraftName) {
        this.database.saveToLocalStorage();
      }
    },
    deleteCraft() {
      if (!this.database.settings.confirmCraftDeletion || confirm("Are you sure you want to delete this craft?")) {
        const parent = this.craft.parent;
        const indexOfCraft = parent.crafts.indexOf(this.craft);
        const indexToSelectNext = indexOfCraft < 1 ? 0 : indexOfCraft - 1;
        this.database.removeCraft(this.craft);
        this.explorerStore.selectedEntity = parent.crafts[indexToSelectNext] || null;
      }
    },
    copyCompressedBCJson() {
      window.navigator.clipboard.writeText(this.craft.toCompressedBCJson());
    },
    copyBCJson() {
      window.navigator.clipboard.writeText(JSON.stringify(this.craft.toBCJson()));
    },
    // Update the currently selected Craft by overwriting its data with the BC JSON that the user currently has in their clipboard
    overwriteCraftWithClipboard() {
      readClipboard().then(text => {
        if (text && text.length > 100) {
          try {
            const sourceCraft = Craft.fromCompressedBCJson(text);
            const targetCraft = this.craft;
            for (let key of ["item", "property", "lock", "name", "description", "color", "private", "type", "priority"]) {
              targetCraft[key] = sourceCraft[key];
            }
            this.database.saveToLocalStorage();
          } catch(e) {
            console.error(e);
            this.alertStore.alert("Could not parse the provided craft.");
          }
        } else {
          this.alertStore.alert("You need to have an exported craft in your clipboard.");
        }
      })
    },
    moveCraft(direction) {
      this.craft.move(direction);
      this.database.saveToLocalStorageWithDebounce();
    },
  },
  created() {
    this.handleNameInput = debounce(this.handleNameInput, 500);
  }
}
</script>

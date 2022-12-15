import { defineStore } from 'pinia';
import Database from "@/models/database.js";

// The Explorer view has shared state between many components so it's centralized here for easier access.
export const useExplorerStore = defineStore('explorer', {
  state: () => ({
    database:  new Database(), // [Database] The currently open database
    query: "", // [String] The user's search query to filter items, lowercased and debounced.
    selectedEntity: null, // [Folder or Craft] The folder or craft that the user has clicked to display details.
    multiselectionEntities: [], // [Array of Folder or Craft] A list of folders/crafts the user can select to export together. The name "multiselection" is to differentiate it from the regular, unique selection that happens when the user clicks on a folder/craft to display its details on the sidebar.
    repeatedCraftName: null // [String] If two or more crafts are found with the same name, that name is set here. This check is done after the user edits a name field.
  }),
  getters: {
    // Get a list of all the Crafts encompassed by the multiselection.
    multiselectionCrafts(state) {
      const uniqueCrafts = new Set();
      for (let entity of state.multiselectionEntities) {
        if (entity.isFolder) {
          entity.findAllCrafts().forEach(c => uniqueCrafts.add(c));
        } else {
          uniqueCrafts.add(entity);
        }
      }
      return [...uniqueCrafts];
    }
  },
  actions: {
    // Toggle whether an entity is being multiselected.
    toggleMultiselectionOf(entity) {
      if (this.multiselectionEntities.includes(entity)) {
        this.multiselectionEntities = this.multiselectionEntities.filter(e => e != entity);
      } else {
        this.multiselectionEntities.push(entity);
      }
    },
    // Check if there are multiple crafts with the same name, and if so, store the name in a variable to warn the user.
    findRepeatedCraftName() {
      this.repeatedCraftName = this.database.findRepeatedCraftName();
    }
  }
});

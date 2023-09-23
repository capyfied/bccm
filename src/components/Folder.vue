<template>
  <div @drop="drop($event)" @dragover.prevent @dragenter.prevent>
    <div :class="{'folder clickable': true, active: selectedEntity == folder}" @click="explorerStore.selectedEntity = folder">
      <span v-if="depth > 0" class="c-tree" :style="{ marginLeft: `${depth * 13}px` }">├</span>
      <img v-if="multiselectionEntities.length == 0" src="@/assets/img/folder.svg" class="icon mx-1" alt="" draggable @dragstart="startDrag($event, folder)"/>
      <input v-else type="checkbox" class="my-0 mr-1" :checked="multiselectionEntities.includes(folder)" @change="explorerStore.toggleMultiselectionOf(folder)"/>
      <span>
        {{ folder.name || "Unnamed" }} <span class="total-crafts">({{ totalCrafts }})</span>
      </span>
      <span v-if="folder.parent && !folder.isEmpty() && !query" class="px-2" @click="toggleCollapse()" alt="Toggle collapse">
        <img :src="require(`@/assets/img/${effectiveCollapsed ? 'plus' : 'minus'}.svg`)" class="icon-sm" alt=""/>
      </span>
    </div>
    <template v-if="!effectiveCollapsed">
      <div v-for="subfolder in folder.subfolders" :key="subfolder.uuid">
        <Folder v-show="!query || subfolder.matchesQuery(query)" :folder="subfolder" :depth="depth + 1" :query="query"/>
      </div>
      <table v-if="folder.crafts" class="crafts-table w-100">
        <tbody>
          <tr v-for="(craft, idx) in folder.crafts" :key="craft.uuid" v-show="!query || craft.matchesQuery(query)" :class="{ active: selectedEntity == craft }" @click="explorerStore.selectedEntity = craft">
            <td class="c-name">
              <span class="c-tree" :style="{ marginLeft: `${(depth + 1) * 13}px` }">{{ idx == folder.crafts.length - 1 ? "└" : "├" }}</span>
              <img v-if="multiselectionEntities.length == 0" src="@/assets/img/drag.svg" class="clickable-icon" draggable @dragstart="startDrag($event, craft)" title="Drag to move craft to a different folder" alt=""/>
              <input v-else type="checkbox" class="my-0 mr-1" :checked="multiselectionEntities.includes(craft)" @change="explorerStore.toggleMultiselectionOf(craft)"/>
              <span>{{ craft.name }}</span>
            </td>
            <td class="c-priv text-center">
              <img src="@/assets/img/private.svg" class="icon" v-if="craft.private" title="Private" alt="Private"/>
              <img src="@/assets/img/public.svg" class="icon" v-else title="Public" alt="Public"/>
            </td>
            <td class="c-craft">
              <span class="mr-2">{{ craft.item }}</span>
              <template v-if="craft.color">
                <template v-for="color in craft.color.split(',')">
                  <span v-if="color != 'Default'" :style="{ color: color }">▮</span>
                </template>
              </template>
            </td>
            <td class="c-prop">
              <template v-if="craft.property">
                <img src="@/assets/img/star.svg" class="icon" alt=""/> {{ craft.property }}
              </template>
              <span v-else class="muted">No property</span>
            </td>
            <td class="c-lock">
              <template v-if="craft.lock">
                <img src="@/assets/img/lock.svg" class="icon" alt=""/> {{ craft.lock.replace("Padlock", "") }}
              </template>
              <span v-else class="muted">No lock</span>
            </td>
            <td class="c-type">
              {{ craft.type }}
              <span v-if="!craft.type" class="muted">No position</span>
            </td>
            <td class="c-priority">
              <template v-if="craft.priority != null">{{ typeof(craft.priority) == 'number' ? craft.priority : '{...}' }}</template>
              <span v-else class="muted">-</span>
            </td>
            <td class="c-descr">
              {{ craft.description }}
              <span v-if="!craft.description" class="muted">No description</span>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>
<style>
</style>
<script>
import stores from "@/stores/stores.js";

export default {
  name: 'Folder',
  props: {
    folder: Object,
    depth: Number
  },
  computed: {
    totalCrafts() {
      return this.folder.findAllCrafts().length;
    },
    // If there's a query, we temporarily un-collapse all folders regardless of their previous state.
    effectiveCollapsed() {
      return this.folder.collapsed && !this.query;
    },
    ...stores
  },
  methods: {
    // Trigger when the user starts dragging a craft or folder.
    startDrag(evt, entity) {
      evt.stopPropagation();
      evt.dataTransfer.dropEffect = 'move';
      evt.dataTransfer.effectAllowed = 'move';
      if (entity.isFolder) {
        evt.dataTransfer.setData('folderUuid', entity.uuid);
      } else {
        evt.dataTransfer.setData('craftUuid', entity.uuid);
      }
    },
    // Trigger when the user drops a craft or folder somewhere else.
    drop(evt) {
      evt.stopPropagation();
      try {
        if (evt.dataTransfer.getData('craftUuid')) {
          const craft = this.database.rootFolder.findCraft(evt.dataTransfer.getData('craftUuid'));
          if (craft) {
            this.database.moveCraft(craft, this.folder);
          } else {
            throw "Couldn't find craft: " + evt.dataTransfer.getData('craftUuid');
          }
        } else {
          const folder = this.database.rootFolder.findFolder(evt.dataTransfer.getData('folderUuid'));
          if (folder) {
            this.database.moveFolder(folder, this.folder);
            this.folder.collapsed = false; // eslint-disable-line vue/no-mutating-props
          } else {
            throw "Couldn't find folder: " + evt.dataTransfer.getData('folderUuid');
          }
        }
      } catch(e) {
        if (e.name == "MoveError") {
          console.warn(e.message);
        } else throw e;
      }
    },
    // Toggle whether the current folder is collapsed or not.
    toggleCollapse() {
      this.folder.collapsed = !this.folder.collapsed && this.folder.parent != null; // eslint-disable-line vue/no-mutating-props
    }
  }
}
</script>

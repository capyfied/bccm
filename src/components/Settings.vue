<template>
  <div class="p-4">
    <h1 class="mt-0">Settings</h1>
    <label>
      <label class="d-block my-3">
        <input type="checkbox" v-model="database.settings.confirmCraftDeletion" @change="database.saveToLocalStorage()"/>
        Confirm before deleting crafts
        <img src="@/assets/img/about.svg" class="icon help ml-1" title="If checked, you will be prompted for confirmation every time you delete a craft."/><br/>
      </label>
      <label class="d-block my-3">
        Override export limit: <img src="@/assets/img/about.svg" class="icon help ml-1" title="BC limits how many crafts you can have, so BCCM will prevent you from exporting more than that at once. You can override this limit here if you want. Leave as zero to use the default."/><br/>
        <input type="number" v-model="database.settings.overrideMaxCraftsExportableAsCommand" class="mt-1" min="0" max="999" @change="database.saveToLocalStorageWithDebounce()"/>
      </label>
    </label>

    <h1>Backup</h1>
    <p>Export your BCCM data as JSON. This will allow you to restore your data even if you clear your browser's storage.</p>
    <button class="btn btn-primary" @click="downloadBackup"><img src="@/assets/img/save.svg"/> Save to file</button>
    <button class="btn btn-primary" @click="backupToClipboard"><img src="@/assets/img/clip-write.svg"/> Copy to clipboard</button>

    <h1>Restore</h1>
    <p>Restore a BCCM JSON backup. This will replace all current data.</p>
    <button class="btn btn-primary" @click=$refs.uploader.click()><img src="@/assets/img/load.svg"/>Load from file</button>
    <input ref="uploader" type="file" @change="handleFileSelect" accept=".json" style="display:none"/>
    <button class="btn btn-primary" @click="restoreFromClipboard"><img src="@/assets/img/clip-read.svg"/> Load from clipboard</button>

    <h1>Export</h1>
    <p>Generate a CSV export you can open as a human-friendly spreadsheet.</p>
    <button class="btn btn-primary" @click="downloadCsvExport"><img src="@/assets/img/save.svg"/> Save to file</button>
    <button class="btn btn-primary" @click="copyCsvExportToClipboard"><img src="@/assets/img/clip-write.svg"/> Copy to clipboard</button>

    <h1>Reset</h1>
    <p>Delete all crafts and user data.</p>
    <button class="btn btn-danger" @click="resetDatabase"><img src="@/assets/img/trash.svg"/>Delete database</button>
  </div>
</template>
<script>
import stores from "@/stores/stores.js";
import { readClipboard, downloadAsTextFile, readFile, matrixToCsv } from "@/util/util.js";

export default {
  name: 'Settings',
  computed: {
    ...stores
  },
  methods: {
    // Copy a BCCM JSON backup to the clipboard.
    backupToClipboard() {
      navigator.clipboard.writeText(this.database.serialize());
      this.alertStore.alert("Copied to clipboard.", "success");
    },
    // Download a BCCM JSON backup as a file.
    downloadBackup() {
      downloadAsTextFile(this.database.serialize(), `BCCMBackup-${new Date().toISOString().split("T")[0]}.json`);
    },
    // Restore a BCCM JSON backup from the clipboard.
    restoreFromClipboard() {
      readClipboard().then(this.importDatabase);
    },
    // Restore a BCCM JSON backup from a file.
    handleFileSelect(evt) {
      readFile(evt.target.files[0]).then(lines => this.importDatabase(lines.join('')));
    },
    // Restore a BCCM JSON backup from a serialized string.
    importDatabase(string) {
      try {
        this.database.deserialize(string);
        this.database.saveToLocalStorage();
        this.$emit("goTo", "home");
        this.alertStore.alert(`Loaded database with ${this.database.findCraftCount()} crafts.`, "success");
      } catch(e) {
        this.alertStore.alert(e.message);
      }
    },
    // Export the database as CSV and copy it to the clipboard.
    copyCsvExportToClipboard() {
      navigator.clipboard.writeText(this.getDatabaseCsv());
    },
    // Export the database as CSV and download it as a file.
    downloadCsvExport() {
      downloadAsTextFile(this.getDatabaseCsv(), `crafts-${new Date().toISOString().split("T")[0]}.csv`);
    },
    // Convert the database to CSV.
    getDatabaseCsv() {
      return matrixToCsv([
        ["Name", "Item", "Private", "Property", "Lock", "Type", "Color", "Description", "Folder", "Export"]
      ].concat(this.database.rootFolder.findAllCrafts().map(it => [
        it.name,
        it.item,
        it.private,
        it.property,
        it.lock,
        it.type || "",
        it.color,
        it.description,
        it.parent.getAncestry().slice(1).map(f => f.name).join("."),
        it.toCompressedBCJson()
      ])));
    },
    // Reset the database to the default state, losing all user data and settings.
    resetDatabase() {
      if (confirm("Are you sure you want to delete all your data?")) {
        this.database.reset();
        this.explorerStore.selectedEntity = null;
        this.$emit("goTo", "home");
      }
    }
  }
}
</script>

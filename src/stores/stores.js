import { mapState, mapStores } from 'pinia';
import { useAlertStore } from "@/stores/alert.js";
import { useExplorerStore } from "@/stores/explorer.js";

// Since most components use the same stores, they are extracted here to avoid repeated code.
export default {
  ...mapState(useExplorerStore, ['database', 'query', 'selectedEntity', 'multiselectionEntities', 'multiselectionCrafts', 'repeatedCraftName']),
  ...mapStores(useAlertStore, useExplorerStore)
}

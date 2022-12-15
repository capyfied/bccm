import { defineStore } from 'pinia';

// This store can be used by any component that needs to display an alert to the user.
export const useAlertStore = defineStore('alert', {
  state: () => ({
    message: null, // [String] The message to display to the user.
    type: null, // [String] The type of alert (success|error).
    dismissalTimeout: null // [Number] The setTimeout() ID that will clear the message after a while.
  }),
  actions: {
    // Display an alert message, which can be of type "success" or "error" (default), and will be visible for [duration] ms.
    // If the message is null, hide the alert. The store just sets the variables. The <Alert> Vue component will react to
    // them to actually display the message to the user.
    alert(message, type = "error") {
      if (!message) {
        this.message = null;
        this.type = null;
      } else {
        let duration;
        if (type == 'error') {
          duration = 10000;
          console.error(message); // To aid debugging, in case the message disappears too fast.
        } else {
          duration = 5000;
        }
        clearTimeout(this.dismissalTimeout); // Cancel the clearing of a previous message, if present.
        this.message = message;
        this.type = type;
        this.dismissalTimeout = setTimeout(() => { this.alert(null) }, duration);
      }
    }
  }
});

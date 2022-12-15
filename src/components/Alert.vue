<!-- This component displays alerts to the user. -->
<template>
  <div :class="`footer-alert ${type}`">
    {{ message }}
  </div>
</template>
<style>
  .footer-alert {
    position: fixed;
    width: 100%;
    bottom: -24px;
    left: 0;
    min-height: 24px;
    padding: 5px;
    z-index: 100;
    text-align: center;
    background-color: rgba(93, 93, 93, 0.77);
    border-top: 2px solid rgba(142, 142, 142, 0.67);
    transition: bottom 0.65s;
    transition-property: bottom, background-color, border-color;
  }
  .footer-alert.success {
    bottom: 0;
    background-color: rgba(56, 86, 25, 0.77);
    border-color: rgba(111, 152, 50, 0.67);
  }
  .footer-alert.error {
    bottom: 0;
    background-color: rgba(115, 38, 38, 0.77);
    border-color: rgba(179, 66, 66, 0.67);
  }
</style>
<script>
import { mapStores } from 'pinia';
import { useAlertStore } from "@/stores/alert.js";

export default {
  name: 'Alert',
  computed: {
    message() {
      return this.alertStore.message;
    },
    type() {
      return this.alertStore.type;
    },
    ...mapStores(useAlertStore)
  }
}
</script>

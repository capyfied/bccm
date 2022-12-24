<!-- This component displays alerts to the user. -->
<template>
  <div :class="`floating-alert ${type}`" @click="clearAlert">
    <img v-if="type == 'error'" src="@/assets/img/error.svg" class="alert-icon"/>
    <img v-if="type == 'success'" src="@/assets/img/check.svg" class="alert-icon"/>
    {{ message }}
  </div>
</template>
<style>
  .floating-alert {
    position: fixed;
    max-width: 250px;
    min-height: 24px;
    top: 40px;
    right: -200px;
    font-size: 0.8rem;
    padding: 5px 10px;
    border-radius: 3px;
    z-index: 100;
    text-align: center;
    background-color: rgba(93, 93, 93, 0.77);
    border: 1px solid rgba(142, 142, 142, 0.67);
    transition-duration: 0.3s;
    transition-property: right, opacity, background-color, border-color;
    cursor: pointer;
    opacity: 0;
  }
  .floating-alert:hover {
    opacity: 0.6 !important;
  }
  .floating-alert.success {
    right: 5px;
    opacity: 1;
    background-color: rgba(56, 86, 25, 0.77);
    border-color: rgba(111, 152, 50, 0.67);
  }
  .floating-alert.error {
    right: 5px;
    opacity: 1;
    background-color: rgba(115, 38, 38, 0.77);
    border-color: rgba(179, 66, 66, 0.67);
  }
  .alert-icon {
    width: 12px;
    margin-right: 3px;
    user-select: none;
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
  },
  methods: {
    clearAlert() {
      this.alertStore.alert(null);
    }
  }
}
</script>

<!-- This is mostly used for debugging. -->
<template>
  <div class="p-4">
    <h1 class="mt-0">
      <img src="@/assets/img/cog.svg" class="mr-1" alt="" style="height: 18px; vertical-align: bottom;"/>
      LZString decoder <img src="@/assets/img/about.svg" class="icon help ml-1" title="Decode a compressed Base64 string into a JSON. This is just an extra tool for testing purposes."/>
    </h1>
    <p>Input:</p>
    <textarea v-model="input" rows="4" class="w-100"></textarea>
    <p>Output:</p>
    <textarea v-model="output" rows="20" class="w-100" readonly></textarea>
  </div>
</template>

<script>
import LZString from 'lz-string';

export default {
  name: 'LZStringTester',
  data: () => ({ 
    input: ""
  }),
  computed: {
    output() {
      const json = LZString.decompressFromBase64(this.input);
      return json ? JSON.stringify(JSON.parse(json), null, 2) : "No valid input detected.";
    }
  }
}
</script>

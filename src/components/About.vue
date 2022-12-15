<template>
  <div class="p-4">
    <h1 class="mt-0"> What's this?</h1>
    <p>A GUI to back up, organize, and edit items crafted in BC in a convenient way.</p>
    <h1>Where's my data stored?</h1>
    <p>In your browser's local storage. This means you should make regular backups (see Settings page).</p>
    <h1>How do I import crafts from BC?</h1>
    <p>There are currently two ways:</p>
    <h2><img src="@/assets/img/load.svg" class="icon"/> Importing a single craft (via FBC):</h2>
    <ol>
      <li>Open your crafted item in BC</li>
      <li>Click the FBC "Export" button</li>
      <li>Return here and click "Load from clipboard"</li>
    </ol>
    <h2><img src="@/assets/img/load.svg" class="icon"/> Importing all your crafts at once (via console):</h2>
    <ol>
      <li>Open the browser console on BC</li>
      <li>Copy the output of <code>JSON.stringify(Player.Crafting)</code></li>
      <li>Return here and click "Load from clipboard"</li>
    </ol>
    <h1>How do I export crafts back to BC?</h1>
    <p>There are currently two ways:</p>
    <h2><img src="@/assets/img/save.svg" class="icon"/> Exporting a single craft (via FBC)</h2>
    <ol>
      <li>Select the craft and click "Export to clipboard" </li>
      <li>Go to BC and open a new craft</li>
      <li>Click the FBC "Import" button</li>
    </ol>
    <h2><img src="@/assets/img/save.svg" class="icon"/> Exporting many crafts at once (via console)</h2>
    <img src="@/assets/img/warn.svg" class="icon ml-4 mr-1"/>
    <span style="color: #d1b758; font-size: 90%;">This replaces <u>all</u> your BC crafts.</span>
    <ol>
      <li>Select a folder to export and click "Export to clipboard", or select multiple crafts/folders together and click "Export"</li>
      <li>Open the browser console on BC</li>
      <li>Paste the clipboard contents</li>
    </ol>
  </div>
</template>
<script>
export default {
  name: 'About'
}
</script>

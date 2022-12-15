// File for miscellaneous helper methods that don't belong anywhere else.

// Generate a random UUID
export function generateUuid(){
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
// Read the user's clipboard as text, or fall back to a text prompt if this is unsupported (Firefox).
export function readClipboard() {
  return new Promise((resolve) => {
    if (navigator.clipboard.readText) {
      navigator.clipboard.readText().then(text => resolve(text));
    } else {
      resolve(prompt("Paste your text below:"));
    }
  });
}
// Prompt the user to download the provided text as a text file.
export function downloadAsTextFile(text, filename = 'download') {
  const blob = new Blob([text], {type: 'text/plain'});
  const elem = window.document.createElement('a');
  elem.href = window.URL.createObjectURL(blob);
  elem.download = filename;
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
}
// Get the contents of a text file as a string.
export function readFile(file) {
  return new Promise(function(resolve) {
    const fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result.split("\n"));
    }
    fr.readAsText(file);
  });
}
// Convert a two-dimensional array of values into a CSV string.
export function matrixToCsv(matrix){
  return matrix.map(row => row
    .map(String) // Convert every value to string
    .map(v => v.replaceAll('"', '""')) // Escape double quotes
    .map(v => `"${v}"`)  // Surround each value with quotes
    .join(',') // Separate values with commas
  ).join('\r\n'); // Add a newline between rows
}
// Swap two elements in an array, given their index.
export function swap(array, idx1, idx2) {
  if (idx1 == idx2) return;
  const tmp = array[idx1];
  array[idx1] = array[idx2];
  array[idx2] = tmp;
}
// Limit how often a function is triggered.
export function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
// Return the singular or plural version of a word based on the given count.
export function pluralize(word, count, pluralWord = null) {
  return count == 1 ? word : (pluralWord || word + "s");
}
// Given an array of objects that have a string field called {attribute}, make it so that it is unique for
// all objects, appending increasing numbers at the end of it to discriminate between repeats.
export function renameObjectsToMakeThemUnique(array, attribute = "name") {
  for (let i in array) {
    const item = array[i];
    let newName = item[attribute];
    while(![-1, parseInt(i)].includes(array.findIndex(e => e[attribute] == newName))) {
      const parts = newName.match(/^(.*) \((\d+)\)$/);
      if (!parts) {
        newName = `${newName} (2)`; // If two items are named "Foo", rename the second to "Foo (2)"
      } else {
        newName = `${parts[1]} (${parseInt(parts[2]) + 1})`; // If there's already a "Foo ({x})", rename it to "Foo ({x+1})"
      }
    }
    item[attribute] = newName;
  }
}

const fs = require('fs');

let stuff = JSON.parse(fs.readFileSync('after.json', 'utf-8'));
console.log(stuff["inputHidden"]);
console.log(stuff["hiddenOutput"]);

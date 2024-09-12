const ghpages = require('gh-pages');
const path = require('path');

ghpages.publish('build', {
  dest: '.',
  add: true
}, (err) => {
  if (err) console.error('Deploy error!', err);
  else console.log('Deploy Complete!');
});
import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.mjs') || file.endsWith('.md') || file.endsWith('.json')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = false;
  if (content.includes('BRLm')) {
    content = content.replace(/BRLm/g, 'BRLm');
    updated = true;
  }
  if (content.includes('EURm')) {
    content = content.replace(/EURm/g, 'EURm');
    updated = true;
  }
  if (updated) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});

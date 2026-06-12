const fs = require('fs');

function fixFile(filepath) {
  let c = fs.readFileSync(filepath, 'utf8');
  
  // Replace the start of the map
  c = c.replace(/\{\(photos\[activeCategory\] \|\| \[\]\)\.map\(\(url, index\) => \(/g, 
`{(photos[activeCategory] || []).map((url, index) => {
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace('/api', '');
  const imageUrl = url.startsWith('/') ? \`\${API_BASE}\${url}\` : url;
  return (`);

  // Replace the img tag src attribute
  c = c.replace(/<Image[\s\S]*?src=\{url\}/g, `<Image \n src={imageUrl}`);

  // Replace the end of the map
  c = c.replace(/<\/div>\s*\)\)}\s*<\/div>/g, `</div>\n  );\n  })}\n </div>`);

  fs.writeFileSync(filepath, c);
}

fixFile('src/app/(owner)/owner/photos/page.tsx');
fixFile('src/app/(hotel-manager)/hotel-manager/photos/page.tsx');
console.log('Done');

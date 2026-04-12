const fs = require('fs'); let c = fs.readFileSync('src/app/globals.css', 'utf8'); c = c.split('100% 2px, 3px 100%').join('100% 2px,3px 100%'); fs.writeFileSync('src/app/globals.css', c, 'utf8');

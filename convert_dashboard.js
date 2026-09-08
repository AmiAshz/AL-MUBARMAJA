const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Replace status colors definition
content = content.replace(
  /'AWAITING_DIAGNOSIS': 'text-muted border-muted\/50 bg-muted\/10',/g,
  `'AWAITING_DIAGNOSIS': 'text-[#B8941F] border-[#D4AF37]/30 bg-[#D4AF37]/10',`
);
content = content.replace(
  /'IN_PROGRESS':        'text-primary border-primary bg-primary\/10',/g,
  `'IN_PROGRESS':        'text-accent-steel border-accent-steel/30 bg-accent-steel/10',`
);
content = content.replace(
  /'AWAITING_PARTS':     'text-accent-warning border-accent-warning\/50 bg-accent-warning\/10',/g,
  `'AWAITING_PARTS':     'text-accent-warning border-accent-warning/30 bg-accent-warning/10',`
);
content = content.replace(
  /'READY_FOR_PICKUP':   'text-accent-green border-accent-green bg-accent-green\/10',/g,
  `'READY_FOR_PICKUP':   'text-accent-green border-accent-green/30 bg-accent-green/10',`
);
content = content.replace(
  /'COMPLETED':          'text-brand-deep border-brand-deep bg-brand-deep\/10',/g,
  `'COMPLETED':          'text-[#2E7D32] border-[#2E7D32]/30 bg-[#2E7D32]/10',`
);

// Replace border status mappings
content = content.replace(/'border-l-primary'/g, "'border-l-primary'");
content = content.replace(/'border-l-accent-warning'/g, "'border-l-accent-warning'");
content = content.replace(/'border-l-accent-green'/g, "'border-l-accent-green'");
content = content.replace(/'border-l-brand-deep'/g, "'border-l-[#2E7D32]'");

// Replace modal background bg-[#050505]/95 to bg-[#000000]/60 for standard light backdrop
content = content.replace(/bg-\[#050505\]\/95/g, 'bg-[#000000]/60');
content = content.replace(/bg-black\/80/g, 'bg-[#000000]/60');

// Replace general text-white to text-foreground
content = content.replace(/text-white\/90/g, 'text-foreground');
content = content.replace(/text-white\/80/g, 'text-foreground');
content = content.replace(/text-white\/60/g, 'text-secondary');
content = content.replace(/text-white\/40/g, 'text-muted');
content = content.replace(/text-white\/20/g, 'text-muted');
content = content.replace(/text-white/g, 'text-foreground');

// Replace hover states
content = content.replace(/hover:text-white/g, 'hover:text-foreground');
content = content.replace(/hover:bg-white\/5/g, 'hover:bg-surface-200');

// Replace legacy border white
content = content.replace(/border-white\/10/g, 'border-border');
content = content.replace(/border-white\/5/g, 'border-border');

// Fix buttons text colors that are bg-primary (which should have text-foreground to render nicely on gold)
content = content.replace(/text-\[#080808\]/g, 'text-foreground');
content = content.replace(/bg-primary text-white/g, 'bg-primary text-foreground font-bold');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully completed dashboard content conversion.');
fs.unlinkSync(__filename);

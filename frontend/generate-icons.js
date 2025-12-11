// Script para generar iconos PWA
const fs = require('fs');

const sizes = [192, 512];

sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${Math.round(size/6)}"/>
  <g transform="translate(${size/2}, ${size/2}) scale(${size/192})">
    <rect x="-40" y="-50" width="80" height="100" rx="8" fill="white" opacity="0.2"/>
    <rect x="-35" y="-45" width="70" height="90" rx="6" fill="white"/>
    <rect x="-25" y="-30" width="50" height="6" rx="3" fill="#667eea"/>
    <rect x="-25" y="-15" width="40" height="6" rx="3" fill="#667eea" opacity="0.6"/>
    <rect x="-25" y="0" width="45" height="6" rx="3" fill="#667eea" opacity="0.6"/>
    <path d="M -10 20 L -5 25 L 15 5" stroke="#4CAF50" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
  
  fs.writeFileSync(`./public/logo${size}.svg`, svg);
});

console.log('✅ Iconos PWA generados: logo192.svg, logo512.svg');
console.log('💡 Los navegadores modernos soportan SVG como iconos PWA');

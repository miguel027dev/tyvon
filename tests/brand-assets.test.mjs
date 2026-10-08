import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('official TYVON wordmark uses its transparent SVG asset without CSS blending',()=>{
 const logo=read('src/brand/Logo.jsx');
 const css=read('src/brand.css');
 const svg=read('public/brand/tyvon-logo-transparent.svg');
 assert.match(logo,/src="\/brand\/tyvon-logo-transparent\.svg"/);
 assert.match(svg,/<svg[^>]*viewBox="125 632 1288 216"/);
 assert.match(svg,/<feColorMatrix[^>]*type="matrix"/);
 assert.match(svg,/href="data:image\/jpeg;base64,\/9j\//);
 assert.doesNotMatch(css,/mix-blend-mode:screen/);
 assert.match(css,/mix-blend-mode:normal/);
});

test('brand guide references the official transparent SVG',()=>{
 const guide=read('public/brand/guide.html');
 assert.equal((guide.match(/src="\/brand\/tyvon-logo-transparent\.svg"/g)||[]).length,2);
 assert.match(guide,/object-fit:contain/);
});

import assert from 'node:assert/strict';
import {columnBlocks,jsonLd,articleSchema} from '../lib/column-content.ts';
const b=columnBlocks('## 질문\n첫 답변\n\n- A\n- B\n\n### 근거\n1. 하나\n2. 둘\n\n## 질문\n끝');
assert.deepEqual(b.map(v=>v.type),['h2','paragraph','ul','h3','ol','h2','paragraph']);
assert.deepEqual(b.filter(v=>v.id).map(v=>v.id),['section-1','section-2','section-3']);
assert.deepEqual(b[2].items,['A','B']);
const row={id:'id',title:'</script><script>alert(1)</script>',summary:'Answer',category:'병원 마케팅',image_url:'',published_at:'2026-10-02T00:00:00Z',updated_at:'2026-10-06T00:00:00Z'};
const encoded=jsonLd(articleSchema(row));assert.ok(!encoded.includes('<'));const parsed=JSON.parse(encoded);assert.equal(parsed['@graph'][0].headline,row.title);assert.equal(parsed['@graph'][0].dateModified,row.updated_at);assert.ok(!('image' in parsed['@graph'][0]));assert.equal(parsed['@graph'][1].itemListElement.length,3);
console.log('PASS: headings without blank lines, lists, unique anchors, JSON-LD escaping and truthful article metadata');

import { test } from 'vitest';
import assert from 'node:assert/strict';
import { isEmail, toRfqRow } from './rfq.js';
test('RFQ maps volume and port, defaulting blanks to To be discussed',()=>{const r=toRfqRow({company:' Co ',email:'B@X.com',product:'Bananas',volume:'',port:'Rotterdam',message:'m'},'vi');assert.equal(r.quantity,'To be discussed');assert.equal(r.destination,'Rotterdam');assert.equal(r.email,'b@x.com');assert.equal(r.locale,'vi');});
test('RFQ rejects an invalid work email',()=>{assert.throws(()=>toRfqRow({company:'Co',email:'nope',product:'Bananas'},'en'));});
test('RFQ keeps a chosen Incoterm, otherwise To be agreed',()=>{assert.equal(toRfqRow({company:'Co',email:'b@x.com',product:'Bananas',incoterm:'FOB'},'en').incoterm,'FOB');assert.equal(toRfqRow({company:'Co',email:'b@x.com',product:'Bananas'},'en').incoterm,'To be agreed');});
test('isEmail accepts exactly what the former email pattern accepted', () => {
  const former = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  const cases = ['b@x.com', 'a.b@c.d', 'a@b.c.d', 'a@.b.c', 'a@b..c', 'a@bc.', 'a@.bc', 'a@b.c.', '@b.c', 'a@', 'a@b',
    'a@b.c@d.e', 'a b@c.d', 'a@b c.d', 'a@b.c\n', '\ta@b.c', 'a@b.c ', '', '.', 'a@..', 'a@...', 'ä@ö.ü', 'a@b.c d'];
  for (const s of cases) assert.equal(isEmail(s), former(s), JSON.stringify(s));
});

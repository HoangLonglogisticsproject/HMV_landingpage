import { test } from 'vitest';
import assert from 'node:assert/strict';
import { toRfqRow } from './rfq.js';
test('RFQ maps volume and port, defaulting blanks to To be discussed',()=>{const r=toRfqRow({company:' Co ',email:'B@X.com',product:'Bananas',volume:'',port:'Rotterdam',message:'m'},'vi');assert.equal(r.quantity,'To be discussed');assert.equal(r.destination,'Rotterdam');assert.equal(r.email,'b@x.com');assert.equal(r.locale,'vi');});
test('RFQ rejects an invalid work email',()=>{assert.throws(()=>toRfqRow({company:'Co',email:'nope',product:'Bananas'},'en'));});
test('RFQ keeps a chosen Incoterm, otherwise To be agreed',()=>{assert.equal(toRfqRow({company:'Co',email:'b@x.com',product:'Bananas',incoterm:'FOB'},'en').incoterm,'FOB');assert.equal(toRfqRow({company:'Co',email:'b@x.com',product:'Bananas'},'en').incoterm,'To be agreed');});

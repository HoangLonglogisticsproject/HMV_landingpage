import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toRfqRow } from './rfq.js';
test('RFQ maps volume and port, defaulting blanks to To be discussed',()=>{const r=toRfqRow({company:' Co ',email:'B@X.com',product:'Bananas',volume:'',port:'Rotterdam',message:'m'},'vi');assert.equal(r.quantity,'To be discussed');assert.equal(r.destination,'Rotterdam');assert.equal(r.email,'b@x.com');assert.equal(r.locale,'vi');});
test('RFQ rejects an invalid work email',()=>{assert.throws(()=>toRfqRow({company:'Co',email:'nope',product:'Bananas'},'en'));});

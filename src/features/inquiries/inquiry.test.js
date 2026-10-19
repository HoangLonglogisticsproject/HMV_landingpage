import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInquiryMailto } from './inquiry.js';
test('inquiry addresses the supplied HMV general manager without pretending delivery',()=>{const url=createInquiryMailto({name:'Buyer',company:'Company',email:'buyer@example.com',product:'Passion fruit',destination:'Germany',message:'Fresh fruit & documents'});assert.equal(url.split('?')[0],'mailto:vannguyen@hmvglobal.com');const params=new URLSearchParams(url.split('?')[1]);assert.equal(params.get('subject'),'Trade inquiry — Passion fruit');assert.ok(params.get('body').includes('Fresh fruit & documents'));});

test('RFQ includes estimated volume and destination port',()=>{const body=new URLSearchParams(createInquiryMailto({company:'Co',email:'b@x.com',product:'Bananas',volume:'2 x 40ft / month',port:'Rotterdam',message:'m'}).split('?')[1]).get('body');assert.ok(body.includes('Estimated volume: 2 x 40ft / month'));assert.ok(body.includes('Destination port: Rotterdam'));});

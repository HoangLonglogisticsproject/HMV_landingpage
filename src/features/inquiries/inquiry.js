// `requirements`: optional [label, value] pairs from a product page's RFQ; blank values are left out.
export function createInquiryMailto(data) {
 const subject=`Trade inquiry — ${data.product || 'Agricultural supply chain'}`;
 const requirements=(data.requirements??[]).filter(([,v])=>String(v??'').trim()).map(([k,v])=>`${k}: ${String(v).trim()}`);
 const body=[...(data.name?[`Name: ${data.name}`]:[]),`Company: ${data.company}`,`Business email: ${data.email}`,`Product: ${data.product}`,...(data.destination?[`Destination: ${data.destination}`]:[]),...(data.volume?[`Estimated volume: ${data.volume}`]:[]),...(data.port?[`Destination port: ${data.port}`]:[]),...requirements,...(data.incoterm?[`Incoterm: ${data.incoterm}`]:[]),'',data.message].join('\n');
 return `mailto:vannguyen@hmvglobal.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

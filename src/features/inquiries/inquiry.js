export function createInquiryMailto(data) {
 const subject=`Trade inquiry — ${data.product || 'Agricultural supply chain'}`;
 const body=[...(data.name?[`Name: ${data.name}`]:[]),`Company: ${data.company}`,`Business email: ${data.email}`,`Product: ${data.product}`,...(data.destination?[`Destination: ${data.destination}`]:[]),...(data.volume?[`Estimated volume: ${data.volume}`]:[]),...(data.port?[`Destination port: ${data.port}`]:[]),'',data.message].join('\n');
 return `mailto:vannguyen@hmvglobal.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

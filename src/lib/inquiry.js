export function createInquiryMailto(data) {
 const subject=`Trade inquiry — ${data.product || 'Agricultural supply chain'}`;
 const body=[`Name: ${data.name}`,`Company: ${data.company}`,`Business email: ${data.email}`,`Product: ${data.product}`,`Destination: ${data.destination}`,'',data.message].join('\n');
 return `mailto:vannguyen@hmvglobal.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

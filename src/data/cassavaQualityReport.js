// The pages of the Intertek Vietnam analysis report AGRIVIETNAM2026-1700, shown by the quality evidence of the Chinese
// cassava page ("查看检测报告", views/products/CassavaProcurement Quality). Empty until HMV supplies a sanitized copy:
// the page then shows the report's details without the button.
//
// Only a copy with the shipper, the consignee and every other commercial detail covered may be committed, and only as
// page images: a redacted PDF can keep the covered text in its text layer and the parties in its metadata. The
// unredacted report is never committed. One WebP per page, in page order, with its real size:
//
//   import page1 from '@/assets/quality/intertek-agrivietnam2026-1700-p1.webp';
//   export const qualityReportPages = [{ src: assetSrc(page1), width: 1654, height: 2339 }];
//
// (assetSrc from '@/lib/utils'.) Then the "no report button" check in tests/next/cassava-china.spec.js fails on
// purpose: replace it with one that opens the report (the dialog is already covered in views/products/CassavaScoped.test.js).
export const qualityReportPages = [];

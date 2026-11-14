# Image asset debt

| | |
|---|---|
| Status | 2026-11-09, branch `feat/nextjs-foundation` (architecture §11). For the content owner: photographs to replace with larger originals. |
| Related | [Architecture §11](NEXTJS_TARGET_ARCHITECTURE.md#11-images-fonts-and-css) · `tests/next/images.spec.js` (`ORIGINAL_LIMITED`) · `scripts/image-fidelity.mjs` |

These 24 sources are the photographs HMV supplied, at their full resolution: the export kept every pixel. They are smaller than the size the site paints them at on a sharp screen, so they look softer there than the layout allows. The fix is a larger original of the same photograph; the code never enlarges an image.

How the numbers were measured (Chromium, `next start`, every page and every lightbox, `object-fit` included: a cover crop paints the whole image wider than its box):

- **Max rendered, desktop:** the largest painted size in CSS px at 1280 × 800, 1440 × 900 and 1920 × 1080, with where it occurs.
- **Ideal at DPR 2:** max rendered desktop × 2, the pixels a 2× desktop or laptop screen needs.
- **Max rendered, phone / ideal at DPR 3:** the same at 390 × 844, × 3.
- **Status:** insufficient where the source is more than 5% narrower than the ideal (the tolerance of the test).

| Asset | Source (px) | Max rendered, desktop (CSS px) | Ideal at DPR 2 | Max rendered, phone (CSS px) | Ideal at DPR 3 | Status |
|---|---|---|---|---|---|---|
| `car` | 960×1280 | 371×494 (/activities, 1280 px wide) | 742×989 | 350×467 (/activities) | 1050×1400 | Original source insufficient: phone DPR 3 |
| `container1` | 960×1280 | 554×739 (/packaging-logistics, 1280 px wide) | 1109×1478 | 312×416 (/packaging-logistics) | 936×1248 | Original source insufficient: desktop DPR 2 |
| `crossborder1` | 960×1280 | 608×810 (/logistics lightbox, 1920 px wide) | 1215×1620 | 351×468 (/logistics) | 1053×1404 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `crossborder2` | 1280×1280 | 810×810 (/logistics lightbox, 1920 px wide) | 1620×1620 | 351×351 (/logistics) | 1053×1053 | Original source insufficient: desktop DPR 2 |
| `crossborder3` | 960×1280 | 608×810 (/logistics lightbox, 1920 px wide) | 1215×1620 | 351×468 (/logistics) | 1053×1404 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `crossborder4` | 960×1280 | 608×810 (/logistics lightbox, 1920 px wide) | 1215×1620 | 351×468 (/logistics) | 1053×1404 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `crossborder5` | 960×1280 | 608×810 (/logistics lightbox, 1920 px wide) | 1215×1620 | 351×468 (/logistics) | 1053×1404 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `crossborder6` | 960×1280 | 608×810 (/logistics lightbox, 1920 px wide) | 1215×1620 | 351×468 (/logistics) | 1053×1404 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `dried-cassava-chips` (products/) | 960×1280 | 568×757 (/products/dried-cassava-chips, 1280 px wide) | 1136×1515 | 350×467 (/products/dried-cassava-chips) | 1050×1400 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `factory-visit` | 960×1280 | 1080×1440 (/blog/optimizing-tropical-logistics, 1280 px wide) | 2160×2880 | 350×467 (/) | 1050×1400 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `farm-team` | 1308×1600 | 1080×1321 (/blog/circular-agriculture, 1280 px wide) | 2160×2643 | 350×428 (/) | 1050×1285 | Original source insufficient: desktop DPR 2 |
| `forest-team` | 1218×912 | 910×682 (/activities lightbox, 1920 px wide) | 1821×1364 | 494×370 (/activities) | 1483×1110 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `fruitFarm` | 1280×960 | 1123×842 (/, 1920 px wide) | 2247×1685 | 675×506 (/) | 2026×1520 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `fruitWeighing` | 960×1280 | 632×842 (/, 1920 px wide) | 1264×1685 | 380×506 (/) | 1140×1520 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `grower-visit` | 960×1280 | 539×719 (/activities lightbox, 1920 px wide) | 1079×1438 | 350×467 (/activities) | 1050×1400 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `material-discussion` | 900×1600 | 394×700 (/activities lightbox, 1920 px wide) | 788×1401 | 350×622 (/activities) | 1050×1867 | Original source insufficient: phone DPR 3 |
| `mijack` | 1280×960 | 960×720 (/logistics lightbox, 1920 px wide) | 1920×1440 | 342×257 (/logistics lightbox) | 1026×770 | Original source insufficient: desktop DPR 2 |
| `mijack2` | 1280×960 | 960×720 (/logistics lightbox, 1920 px wide) | 1920×1440 | 342×257 (/logistics lightbox) | 1026×770 | Original source insufficient: desktop DPR 2 |
| `mijack3` | 1280×960 | 960×720 (/logistics lightbox, 1920 px wide) | 1920×1440 | 342×257 (/logistics lightbox) | 1026×770 | Original source insufficient: desktop DPR 2 |
| `passion-fruit-cut` | 960×1280 | 530×707 (/products/passion-fruit, 1280 px wide) | 1060×1414 | 350×467 (/) | 1050×1400 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `tapioca-starch-reference` | 830×558 | 591×398 (/products/tapioca-starch, 1280 px wide) | 1183×795 | 416×280 (/) | 1250×840 | Original source insufficient: desktop DPR 2 and phone DPR 3 |
| `team-gathering` | 1600×1200 | 887×665 (/activities lightbox, 1920 px wide) | 1774×1331 | 493×370 (/activities) | 1480×1110 | Original source insufficient: desktop DPR 2 |
| `vietnam-bananas` | 1400×1050 | 767×575 (/, 1280 px wide) | 1534×1151 | 373×280 (/) | 1120×840 | Original source insufficient: desktop DPR 2 |
| `visitfactory` | 838×739 | 955×842 (/, 1920 px wide) | 1911×1685 | 574×506 (/) | 1723×1520 | Original source insufficient: desktop DPR 2 and phone DPR 3 |

When an asset is replaced: export it like the others (WebP, quality 80, never enlarged), review it with `node scripts/image-fidelity.mjs <commit with the new original>`, remove it from `ORIGINAL_LIMITED` in `tests/next/images.spec.js` (the test then requires the ideal size), and remove its row here.

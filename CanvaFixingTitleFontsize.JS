const fs = require('fs');
const { createCanvas } = require('canvas');

const title = fs.readFileSync("current_title.txt", "utf8").trim();

const boxes = [
    { name: "Inkspiller_4", boxWidth: 927, boxHeight: 235, maxFont: 37, minFont: 18 },
    { name: "Inkspiller_5", boxWidth: 927, boxHeight: 300, maxFont: 37, minFont: 18 },
    { name: "Inkspiller_6", boxWidth: 927, boxHeight: 350, maxFont: 37, minFont: 18 }
];

const fontFamily = 'Arial';
const pxPerPt = 1.50;             // micro-tune this up/down by .001 for *exact* Canva wrap
const lineHeightRatio = 1.50;      // optionally tweak by .001 if vertical fit is off
const margin = -150;                 // Smaller margin = longer lines, for extreme control

function measureTextWidth(text, fontSizePt, fontFamily, pxPerPt) {
    const canvas = createCanvas(950, 550);
    const context = canvas.getContext('2d');
    context.font = `bold ${fontSizePt * pxPerPt}px ${fontFamily}`;
    return context.measureText(text).width;
}

function breakLines(title, fontSize, fontFamily, pxPerPt, boxWidth) {
    const words = title.split(' ');
    let lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        if (measureTextWidth(testLine, fontSize, fontFamily, pxPerPt) <= (boxWidth - margin)) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);

    // Optional: group last line if short for Canva effect
    while (lines.length > 1 && lines[lines.length-1].split(' ').length <= 2) {
        lines[lines.length-2] += ' ' + lines[lines.length-1];
        lines.pop();
    }
    return lines;
}

function fitTitleIntoBox({ title, boxWidth, boxHeight, maxFont, minFont, fontFamily, pxPerPt, lineHeightRatio }) {
    let best = { fontSizePt: minFont-1, blockHeight: 0, gapHeight: boxHeight, lines: [] };

    for (let fontSize = maxFont; fontSize >= minFont; fontSize--) {
        const lines = breakLines(title, fontSize, fontFamily, pxPerPt, boxWidth);
        const blockHeight = lines.length * fontSize * lineHeightRatio;
        const gapHeight = boxHeight - blockHeight;
        if (blockHeight <= boxHeight) {
            if (
                gapHeight < best.gapHeight ||
                (gapHeight === best.gapHeight && fontSize > best.fontSizePt)
            ) {
                best = { fontSizePt: fontSize, blockHeight, gapHeight, lines: [...lines] };
            }
        }
    }

    return {
        font_size: best.fontSizePt > 0 ? `${best.fontSizePt}pt` : "Too large",
        block_height: best.blockHeight,
        gap_height: best.gapHeight,
        title_display: best.lines.join('\n')
    };
}

let boxResults = boxes.map(box => ({
    box_name: box.name,
    ...fitTitleIntoBox({
        title,
        boxWidth: box.boxWidth,
        boxHeight: box.boxHeight,
        maxFont: box.maxFont,
        minFont: box.minFont,
        fontFamily,
        pxPerPt,
        lineHeightRatio
    })
}));

boxResults.sort((a, b) => {
    if (a.gap_height !== b.gap_height) return a.gap_height - b.gap_height;
    return parseInt(b.font_size) - parseInt(a.font_size);
});

const bestOverall = boxResults[0];

fs.writeFileSync("boxfit_best_output.json", JSON.stringify(bestOverall, null, 2));
console.log(JSON.stringify(bestOverall, null, 2));

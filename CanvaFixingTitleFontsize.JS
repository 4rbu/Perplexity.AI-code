const fs = require('fs');
const { createCanvas } = require('canvas');

const title = fs.readFileSync("current_title.txt", "utf8").trim();

const boxes = [
    { name: "Inkspiller_4", boxWidth: 925, boxHeight: 245, maxFont: 37, minFont: 18 },
    { name: "Inkspiller_5", boxWidth: 925, boxHeight: 295, maxFont: 37, minFont: 18 },
    { name: "Inkspiller_6", boxWidth: 925, boxHeight: 350, maxFont: 37, minFont: 18 }
];

function fitTitleIntoBox({ title, boxWidth, boxHeight, maxFont, minFont, fontFamily = 'Arial', pxPerPt = 1.333 }) {
    const lineHeightRatio = 1.34;
    function measureTextWidth(text, fontSizePt) {
        const canvas = createCanvas(1000, 200);
        const context = canvas.getContext('2d');
        context.font = `bold ${fontSizePt * pxPerPt}px ${fontFamily}`;
        return context.measureText(text).width;
    }

    // Try font sizes (maxFont -> minFont) and pick largest that fits
    let best = { fontSizePt: minFont - 1, blockHeight: 0, gapHeight: boxHeight, lines: [] };

    for (let fontSize = maxFont; fontSize >= minFont; fontSize--) {
        const words = title.split(' ');
        let lines = [];
        let currentLine = words[0];
        words.slice(1).forEach(word => {
            const testLine = currentLine + ' ' + word;
            if (measureTextWidth(testLine, fontSize) <= (boxWidth - 60)) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        });
        lines.push(currentLine);

        const blockHeight = lines.length * fontSize * lineHeightRatio;
        const gapHeight = boxHeight - blockHeight;

        if (blockHeight <= boxHeight) {
            // Best means: minimal leftover gap and largest font if tied
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

// Pick best box (fills space best, least leftover gap)
let boxResults = [];
boxes.forEach(box => {
    const result = fitTitleIntoBox({
        title,
        boxWidth: box.boxWidth,
        boxHeight: box.boxHeight,
        maxFont: box.maxFont,
        minFont: box.minFont
    });
    boxResults.push({ box_name: box.name, ...result });
});

// Sort boxes: prefer smallest gap, then largest font
boxResults.sort((a, b) => {
    if (a.gap_height !== b.gap_height) return a.gap_height - b.gap_height;
    return parseInt(b.font_size) - parseInt(a.font_size);
});

const bestOverall = boxResults[0];

// Save just the best box
fs.writeFileSync("boxfit_best_output.json", JSON.stringify(bestOverall, null, 2));
console.log(JSON.stringify(bestOverall, null, 2));

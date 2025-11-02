const fs = require('fs');
const { createCanvas } = require('canvas');

// Read title dynamically from text file
const title = fs.readFileSync("current_title.txt", "utf8").trim();

// Your actual Canva title boxes for automation:
const boxes = [
    { name: "Inkspiller_4", boxWidth: 925, boxHeight: 245, maxFont: 37, minFont: 18 },
    { name: "Inkspiller_5", boxWidth: 925, boxHeight: 295, maxFont: 37, minFont: 18 },
    { name: "Inkspiller_6", boxWidth: 925, boxHeight: 350, maxFont: 37, minFont: 18 }
];

// (rest of your script stays the same!)

function fitTitleIntoBox({ title, boxWidth, boxHeight, maxFont, minFont, fontFamily = 'Arial', pxPerPt = 1.333 }) {
    const lineHeightRatio = 1.34;
    function measureTextWidth(text, fontSizePt) {
        const canvas = createCanvas(1000, 200);
        const context = canvas.getContext('2d');
        context.font = `bold ${fontSizePt * pxPerPt}px ${fontFamily}`;
        return context.measureText(text).width;
    }
    let fitAt37pt = false;

    for (let fontSize = maxFont; fontSize >= minFont; fontSize--) {
        const words = title.split(' ');
        let lines = [];
        let currentLine = words[0];
        words.slice(1).forEach(word => {
            const testLine = currentLine + ' ' + word;
            // Adjust for Canva actual fit—subtract 60 for safety margin:
            if (measureTextWidth(testLine, fontSize) <= (boxWidth - 60)) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        });
        lines.push(currentLine);

        const blockHeight = lines.length * fontSize * lineHeightRatio;
        if (blockHeight <= boxHeight) {
            if (fontSize === 37) fitAt37pt = true;
            return {
                optimal_font_size: `${fontSize}pt`,
                number_of_lines: lines.length,
                final_status: fitAt37pt ? "37pt fits" : "Font shrunk to fit",
                title_display: lines.join('\n')
            };
        }
    }
    return {
        optimal_font_size: `${minFont - 1}pt`,
        number_of_lines: "Too many",
        final_status: "Too large to fit",
        title_display: "(Title too long for box)"
    };
}

let results = {};
boxes.forEach(box => {
    results[box.name] = fitTitleIntoBox({
        title,
        boxWidth: box.boxWidth,
        boxHeight: box.boxHeight,
        maxFont: box.maxFont,
        minFont: box.minFont
    });
});
console.log(JSON.stringify(results, null, 2));

// <-- BEGINNER FILE OUTPUT FOR POWER AUTOMATE
fs.writeFileSync("boxfit_output.json", JSON.stringify(results));
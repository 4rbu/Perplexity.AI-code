Few things before running this code. Copy code inside the bracket, used to for exmaple. 

1: Make sure you installed. these in vs code extensions. 
  1. Node.js Extension Pack.
  2. npm
     
2. also installed Node.JS from chrome.
  1. checked directory. example (cd "E:\Perplexity.AI code") use this in windows CMD or PowerShell. change accordingly 
          example of changing path. cd "C:\Users\Shehzu\Documents\Perplexity.AI-code-main"
  2. copy and paste this (npm install canvas) in CMD or PowerShell.
   
3. (node CanvaFixingTitleFontsize.JS) copy and paste this run code. if you faceing Error module. not font. it's mean you change file name or dictory.

my Config
const fontFamily = "Arial";      // or "Helvetica" if installed
const pxPerPt = 1.333;           // 1 pt ≈ 1.333 px [web:3][web:33]
const lineHeightRatio = 1.61;    // Canva-like spacing for 31pt → ~49.9px per line [web:30]
const margin = 0;                // measureText gives full width; let boxWidth be the true max [web:23][web:25]

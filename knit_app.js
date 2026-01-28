const http = require('http');
const GaugeCalculator = require('./src/calculators/GaugeCalculator');
const PatternTextGenerator = require('./src/generators/PatternTextGenerator');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/calc') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const params = Object.fromEntries(new URLSearchParams(body));
            
            const gauge = new GaugeCalculator(parseFloat(params.gaugeSts), parseFloat(params.gaugeRows));
            const eps = gauge.epsCalculations(parseFloat(params.chest));
            const generator = new PatternTextGenerator(eps, gauge.getGaugeInfo());
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ patternHtml: generator.generatePattern() }));
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Knit Architects Engine</title>
    <style>
        /* 基本設定 (PC向け) */
        body { font-family: "Georgia", serif; background: #f2f2f7; margin: 0; display: flex; height: 100vh; }
        .sidebar { width: 300px; background: #e5e5ea; padding: 20px; overflow-y: auto; box-shadow: 2px 0 5px rgba(0,0,0,0.1); box-sizing: border-box; }
        .content { flex: 1; padding: 40px; overflow-y: auto; box-sizing: border-box; }
        
        /* パターン用紙のデザイン */
        .pattern-paper { background: #fff; max-width: 800px; margin: 0 auto; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); line-height: 1.6; color: #333; }
        
        /* 入力フォームのデザイン */
        h2 { font-size: 16px; background: #333; color: #fff; padding: 5px 10px; text-transform: uppercase; margin-top: 0; }
        label { font-weight: bold; font-size: 14px; color: #555; display: block; margin-top: 15px; }
        input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; box-sizing: border-box; }
        button { width: 100%; background: #007AFF; color: white; border: none; padding: 15px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-top: 25px; }
        
        /* スマホ向けレスポンシブ対応 (画面幅が800px以下の場合) */
        @media (max-width: 800px) {
            body { flex-direction: column; height: auto; } /* 縦並びにする */
            .sidebar { width: 100%; height: auto; padding: 20px; border-bottom: 2px solid #ccc; }
            .content { width: 100%; padding: 15px; }
            .pattern-paper { padding: 20px; box-shadow: none; width: 100%; }
        }

        /* 生成されたテキストの装飾 */
        h1 { font-size: 22px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .row-inst { margin-bottom: 10px; font-size: 15px; border-bottom: 1px dotted #eee; padding-bottom: 5px; }
        .sts-count { color: #007AFF; font-weight: bold; font-size: 14px; display: block; margin-top: 2px; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2>Parameters</h2>
        <div>
            <label>Chest (cm)</label>
            <input type="number" id="chest" value="99">
        </div>
        <div>
            <label>Gauge (Sts / 10cm)</label>
            <input type="number" id="gaugeSts" value="19">
        </div>
        <div>
            <label>Gauge (Rows / 10cm)</label>
            <input type="number" id="gaugeRows" value="26">
        </div>
        <button onclick="generate()">GENERATE PATTERN</button>
    </div>
    
    <div class="content" id="output">
        <div style="text-align:center; color:#888; margin-top:50px;">
            <p><strong>Ready to draft.</strong></p>
            <p>Adjust parameters above and click GENERATE.</p>
        </div>
    </div>

    <script>
        async function generate() {
            const btn = document.querySelector('button');
            btn.innerText = "CALCULATING...";
            
            const d = { 
                gaugeSts: document.getElementById('gaugeSts').value, 
                gaugeRows: document.getElementById('gaugeRows').value, 
                chest: document.getElementById('chest').value 
            };
            
            try {
                const res = await fetch('/calc', { method:'POST', body:new URLSearchParams(d) }).then(r=>r.json());
                document.getElementById('output').innerHTML = res.patternHtml;
                // スマホで見やすいように、生成後に下へスクロールする
                if(window.innerWidth < 800) {
                    document.getElementById('output').scrollIntoView({behavior: "smooth"});
                }
            } catch(e) {
                alert("Error generating pattern");
            }
            btn.innerText = "GENERATE PATTERN";
        }
    </script>
</body>
</html>
        `);
    }
});
server.listen(8080);



const http = require('http');
const fs = require('fs');
const path = require('path');
const GaugeCalculator = require('./src/calculators/GaugeCalculator');
const RaglanCalculator = require('./src/calculators/RaglanCalculator'); // 新しいエンジン
const PatternTextGenerator = require('./src/generators/PatternTextGenerator');

const template = fs.readFileSync(path.join(__dirname, 'views', 'index.html'), 'utf-8');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/calc') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const params = Object.fromEntries(new URLSearchParams(body));
            
            // 1. ゲージ計算機
            const gauge = new GaugeCalculator(parseFloat(params.gaugeSts), parseFloat(params.gaugeRows));
            
            // 2. ラグラン計算機（新しいオプション付きで起動！）
            const raglan = new RaglanCalculator(gauge, parseFloat(params.chest), {
                neckType: 'crew',      // 今は固定
                fitType: 'standard'    // 今は固定
            });

            const resultData = raglan.calculate();

            // 3. テキスト生成
            const generator = new PatternTextGenerator(resultData, gauge.getGaugeInfo());
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ patternHtml: generator.generatePattern() }));
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(template);
    }
});

server.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});

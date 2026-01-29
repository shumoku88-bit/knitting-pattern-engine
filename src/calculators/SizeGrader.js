/**
 * Size Grader
 * * サイズ展開（XS〜XL）を自動計算
 * * 設計思想:
 * - CYC標準寸法データを内蔵
 * - RaglanCalculator を回してサイズごとのデータ生成
 * - 将来: カスタムサイズ、国際規格対応
 * * @author shumoku88-bit, Claude
 * @version 1.0.0
 */

class SizeGrader {
    constructor(gauge, options = {}) {
        this.gauge = gauge;
        this.options = options;
        
        // === CYC Standard Sizes (Bust Circumference) ===
        // Craft Yarn Council 標準寸法
        this.STANDARD_SIZES = {
            XS: { bust: 99, name: 'Extra Small' },
            S:  { bust: 106, name: 'Small' },
            M:  { bust: 114, name: 'Medium' },
            L:  { bust: 120, name: 'Large' },
            XL: { bust: 128, name: 'Extra Large' },
            
            // 将来追加
            // XXL: { bust: 137, name: '2X-Large' },
            // XXXL: { bust: 145, name: '3X-Large' }
        };
    }

    /**
     * 全サイズのパターンデータを生成
     * @param {Array<string>} sizeNames - サイズ名配列 (e.g., ['XS', 'S', 'M'])
     * @returns {Array<Object>} サイズごとの計算結果
     */
    gradeAllSizes(sizeNames = ['XS', 'S', 'M', 'L', 'XL']) {
        const RaglanCalculator = require('./RaglanCalculator');
        
        return sizeNames.map(sizeName => {
            const sizeData = this.STANDARD_SIZES[sizeName];
            
            if (!sizeData) {
                throw new Error(`Unknown size: ${sizeName}`);
            }
            
            // サイズごとに RaglanCalculator を実行
            const calculator = new RaglanCalculator(
                this.gauge,
                sizeData.bust,
                this.options // 同じオプションを全サイズに適用
            );
            
            const result = calculator.calculate();
            
            return {
                size: sizeName,
                bustCm: sizeData.bust,
                bustInch: Math.round(sizeData.bust / 2.54),
                fullName: sizeData.fullName,
                data: result
            };
        });
    }

    /**
     * カスタムサイズでパターン生成
     * @param {number} bustCm - カスタムバスト周囲
     * @returns {Object} 計算結果
     */
    gradeCustomSize(bustCm) {
        const RaglanCalculator = require('./RaglanCalculator');
        
        const calculator = new RaglanCalculator(
            this.gauge,
            bustCm,
            this.options
        );
        
        const result = calculator.calculate();
        
        return {
            size: 'CUSTOM',
            bustCm: bustCm,
            bustInch: Math.round(bustCm / 2.54),
            fullName: 'Custom Size',
            data: result
        };
    }

    /**
     * サイズ表を生成（デバッグ用）
     */
    printSizeChart() {
        const sizes = this.gradeAllSizes();
        
        console.log('=== Size Chart ===');
        console.log('Size\tBust(cm)\tNeck(sts)\tStart CO\tYoke Depth');
        console.log('─'.repeat(60));
        
        sizes.forEach(s => {
            console.log(
                `${s.size}\t${s.bustCm}cm\t\t${s.data.neckTotal}\t\t${s.data.startCO}\t\t${s.data.yokeDepth.rows} rows`
            );
        });
    }
}

module.exports = SizeGrader;

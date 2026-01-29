/**
 * Raglan Calculator (with Short Rows support)
 * * ラグラン構造の計算エンジン
 * Version 1.1.0 - Short Rows (Shoulder Slope) 対応
 * * 設計思想:
 * - 今日: Raglan Pullover Crew Neck + Short Rows
 * - 明日: Options で多様なデザインに対応
 * - 将来: 模様編み・カーディガン・高度なフィット理論に拡張
 * * @author shumoku88-bit, Claude
 * @version 1.1.0
 */

class RaglanCalculator {
    /**
     * @param {GaugeCalculator} gauge - ゲージ計算機インスタンス
     * @param {number} bustCm - バスト周囲（cm）
     * @param {Object} options - デザインオプション
     */
    constructor(gauge, bustCm, options = {}) {
        this.gauge = gauge;
        this.bust = bustCm;
        
        // === Options (Defaults) ===
        this.options = {
            // Phase 1: 基本（今日実装）
            neckType: options.neckType || 'crew',
            fitType: options.fitType || 'standard',
            type: options.type || 'pullover',
            
            // Phase 2: フィット向上（Short Rows追加）
            yokeDepth: options.yokeDepth || 'standard',
            shoulderSlope: options.shoulderSlope !== undefined 
                ? options.shoulderSlope 
                : true, // デフォルトで有効
            shoulderSlopeHeight: options.shoulderSlopeHeight || 'auto',
            shoulderSlopeMethod: options.shoulderSlopeMethod || 'german',
            armholeDepthRatio: options.armholeDepthRatio || 1.0,
            
            // Phase 3: 模様編み対応
            stitchPattern: options.stitchPattern || {
                name: 'stockinette',
                scalingFactor: 1.0,
                repeatWidth: null,
                repeatHeight: null
            },
            
            // Phase 4: 高度な理論（将来）
            designTheory: options.designTheory || 'EPS',
            bustDart: options.bustDart || false,
            waistShaping: options.waistShaping || false
        };
        
        // === Constants (EPS Based) ===
        this.NECK_RATIO = 0.33;
        this.SLEEVE_RATIO = 0.225;
        this.FRONT_START_STS = 2;
        
        // Fit Type による調整係数
        this.FIT_ADJUSTMENTS = {
            tight: { ease: -0.05, yokeDepth: 0.9 },
            standard: { ease: 0.0, yokeDepth: 1.0 },
            oversized: { ease: 0.10, yokeDepth: 1.1 }
        };
    }

    /**
     * メイン計算メソッド
     * @returns {Object} 計算結果（全ての目数・段数データ）
     */
    calculate() {
        const eps = this.gauge.epsCalculations(this.bust);
        
        switch (this.options.neckType) {
            case 'crew':
                return this._calculateCrewNeck(eps);
            case 'v-neck':
                throw new Error('V-neck not yet implemented');
            default:
                throw new Error(`Unknown neck type: ${this.options.neckType}`);
        }
    }

    /**
     * Crew Neck（丸首）の計算
     * @private
     */
    _calculateCrewNeck(eps) {
        // === ネック周りの目数配分 ===
        const rawNeckTotal = eps.keyNumber * this.NECK_RATIO;
        const sleeveSts = this._adjustEven(rawNeckTotal * this.SLEEVE_RATIO);
        const frontStart = this.FRONT_START_STS;
        const rawBack = rawNeckTotal - (sleeveSts * 2) - (frontStart * 2);
        const backSts = this._adjustEven(rawBack);
        const startCO = backSts + (sleeveSts * 2) + (frontStart * 2);
        
        // === U-ネック形成 ===
        const targetFrontTotal = backSts;
        const gapRatio = this._getGapRatio();
        const rawGap = targetFrontTotal * gapRatio;
        const centerCastOnSts = this._adjustEven(rawGap);
        const stopIncreaseAt = targetFrontTotal - centerCastOnSts;
        
        // === ヨーク深さ ===
        const yokeDepth = this._calculateYokeDepth(eps);
        
        // === Short Rows 計算（NEW!） ===
        const shortRows = this._calculateShortRows(backSts, frontStart);
        
        // === 結果オブジェクト ===
        return {
            // 基本情報
            eps: eps,
            bustCm: this.bust,
            options: this.options,
            
            // ネック周り
            neckTotal: Math.round(rawNeckTotal),
            startCO: startCO,
            backSts: backSts,
            sleeveSts: sleeveSts,
            frontStart: frontStart,
            
            // U-ネック形成
            targetFront: targetFrontTotal,
            centerCastOn: centerCastOnSts,
            stopIncreaseAt: stopIncreaseAt,
            gapRatio: gapRatio,
            
            // ヨーク
            yokeDepth: yokeDepth,
            
            // 増し目スケジュール
            increaseSchedule: this._generateIncreaseSchedule(
                frontStart,
                stopIncreaseAt,
                centerCastOnSts
            ),
            
            // Short Rows（NEW!）
            shortRows: shortRows,
            
            // メタデータ
            metadata: {
                theory: 'EPS',
                construction: 'raglan-topdown',
                neckType: this.options.neckType,
                seamless: this.options.type === 'pullover',
                hasShortRows: shortRows !== null
            }
        };
    }

    /**
     * Short Rows（引き返し編み）の計算
     * 後ろ身頃を高くしてフィット感向上
     * @private
     */
    _calculateShortRows(backSts, frontStart) {
        if (!this.options.shoulderSlope) {
            return null;
        }
        
        // === 高さの決定 ===
        let heightCm;
        
        if (this.options.shoulderSlopeHeight === 'auto') {
            // 自動計算: バストの2%前後（標準1.5-3.5cm）
            heightCm = Math.max(1.5, Math.min(3.5, this.bust * 0.02));
        } else if (typeof this.options.shoulderSlopeHeight === 'number') {
            heightCm = this.options.shoulderSlopeHeight;
        } else {
            heightCm = 2.0;
        }
        
        // cm → 段数に変換
        const heightRows = Math.max(3, this.gauge.lengthToRows(heightCm));
        
        // === Short Rows の配置計算 ===
        // 背中の中央部分で実施（両端は避ける）
        const workingWidth = backSts - 4;
        
        // 1回の Short Row で減らす目数
        const segmentWidth = Math.max(3, Math.floor(workingWidth / heightRows));
        
        // === 詳細スケジュール ===
        const schedule = [];
        let remainingSts = backSts;
        
        for (let i = 0; i < heightRows; i++) {
            remainingSts = Math.max(
                4, // 最小値（中央に最低限残す）
                remainingSts - segmentWidth
            );
            
            schedule.push({
                row: i + 1,
                workTo: remainingSts,
                method: this.options.shoulderSlopeMethod || 'german',
                instruction: `Work to ${remainingSts} sts from beginning, turn`
            });
        }
        
        return {
            enabled: true,
            heightCm: parseFloat(heightCm.toFixed(1)),
            heightRows: heightRows,
            totalShortRows: heightRows * 2, // RS + WS のペア
            backSts: backSts,
            workingWidth: workingWidth,
            segmentWidth: segmentWidth,
            schedule: schedule,
            
            // パターン生成用のメタデータ
            metadata: {
                method: this.options.shoulderSlopeMethod || 'german',
                methodName: this._getShortRowMethodName(this.options.shoulderSlopeMethod || 'german'),
                description: `Back neck raised by ${heightCm.toFixed(1)}cm using ${heightRows * 2} short rows (${heightRows} pairs)`,
                technique: this._getShortRowTechnique(this.options.shoulderSlopeMethod || 'german')
            }
        };
    }

    /**
     * Short Row メソッド名を取得
     * @private
     */
    _getShortRowMethodName(method) {
        const names = {
            german: 'German Short Rows',
            'wrap-turn': 'Wrap & Turn',
            japanese: 'Japanese Short Rows'
        };
        return names[method] || 'German Short Rows';
    }

    /**
     * Short Row テクニックの説明を取得
     * @private
     */
    _getShortRowTechnique(method) {
        const techniques = {
            german: 'Turn work, slip 1 wyif, pull yarn to create double stitch',
            'wrap-turn': 'Wrap working yarn around next stitch, turn work',
            japanese: 'Turn work, slip 1 wyif, place yarn over needle'
        };
        return techniques[method] || techniques.german;
    }

    /**
     * Gap Ratio を取得
     * @private
     */
    _getGapRatio() {
        const ratios = {
            crew: 0.40,
            'v-neck': 0.0,
            scoop: 0.50
        };
        return ratios[this.options.neckType] || 0.40;
    }

    /**
     * ヨーク深さを計算
     * @private
     */
    _calculateYokeDepth(eps) {
        const baseDepth = eps.keyNumber / 4;
        const fitAdjust = this.FIT_ADJUSTMENTS[this.options.fitType];
        const adjustedDepth = baseDepth * fitAdjust.yokeDepth;
        const depthRows = this.gauge.lengthToRows(
            this.gauge.stitchesToWidth(adjustedDepth)
        );
        
        return {
            stitches: Math.round(adjustedDepth),
            rows: depthRows,
            cm: this.gauge.stitchesToWidth(adjustedDepth)
        };
    }

    /**
     * 増し目スケジュールを生成
     * @private
     */
    _generateIncreaseSchedule(frontStart, stopAt, castOnSts) {
        const totalIncrease = (stopAt - frontStart);
        const estimatedRows = totalIncrease;
        
        return {
            startSts: frontStart,
            endSts: stopAt,
            totalIncrease: totalIncrease,
            estimatedRows: estimatedRows,
            pattern: 'every-other-row-with-raglan'
        };
    }

    /**
     * 偶数調整ヘルパー
     * @private
     */
    _adjustEven(count) {
        const rounded = Math.round(count);
        
        if (this.options.type === 'pullover') {
            return rounded % 2 === 0 ? rounded : rounded + 1;
        }
        
        return rounded % 2 === 0 ? rounded : rounded + 1;
    }

    /**
     * デバッグ用: 計算結果をコンソール出力
     */
    debug() {
        const result = this.calculate();
        console.log('=== Raglan Calculator Debug ===');
        console.log('Bust:', this.bust, 'cm');
        console.log('Key Number:', result.eps.keyNumber, 'sts');
        console.log('Neck Total:', result.neckTotal, 'sts');
        console.log('  - Back:', result.backSts, 'sts');
        console.log('  - Sleeves:', result.sleeveSts, 'sts each');
        console.log('  - Front Start:', result.frontStart, 'sts');
        console.log('Start CO:', result.startCO, 'sts');
        
        if (result.shortRows) {
            console.log('\n=== Short Rows ===');
            console.log('Height:', result.shortRows.heightCm, 'cm');
            console.log('Rows:', result.shortRows.heightRows, 'pairs');
            console.log('Method:', result.shortRows.metadata.methodName);
        }
        
        console.log('\nOptions:', result.options);
        return result;
    }
}

module.exports = RaglanCalculator;


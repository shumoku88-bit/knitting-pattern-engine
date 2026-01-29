# Short Rows (Shoulder Slope) Guide

## 概要
Short Rows（引き返し編み）は、後ろ身頃を前身頃よりも高くすることで、より人体に沿ったフィット感を実現する技法です。

**Version:** 1.1.0
**実装日:** 2026-01-29

---

## 使い方

### 基本的な使用（デフォルト）
```javascript
const raglan = new RaglanCalculator(gauge, 99, {
    neckType: 'crew'
    // shoulderSlope はデフォルトで true
});

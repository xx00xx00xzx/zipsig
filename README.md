# ZipSig - デジタルファイル署名システム

無料で誰でも使える、次世代のファイル署名・検証ツール

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-green.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-purple.svg)](https://vitejs.dev/)

## 概要

ZipSigは、ファイルにデジタル署名を付与し、改ざん検知・防止機能を提供するWebベースの無料ツールです。軍事レベルのセキュリティ技術を、誰でも簡単に利用できます。

### 主な特徴

- ✅ **完全無料** - 隠れた課金なし、永続利用可能
- ✅ **軍事レベルセキュリティ** - RSA-PSS 2048bit + AES-256暗号化
- ✅ **3ステップ完了** - ドラッグ&ドロップで簡単操作
- ✅ **完全プライベート** - ファイルは外部送信されない
- ✅ **改ざん検知** - 1文字の変更も即座に検知
- ✅ **タイムスタンプ** - 世界標準時計による正確な時刻記録

## 技術仕様

### フロントエンド
- **React 19** - 最新のReactによるモダンなUI
- **TypeScript** - 型安全性による堅牢な開発
- **Vite** - 高速ビルド・開発環境
- **Tailwind CSS** - ユーティリティファーストなスタイリング
- **Framer Motion** - 滑らかなアニメーション効果

### セキュリティ
- **RSA-PSS 2048bit** - 軍事レベルのデジタル署名
- **SHA-256** - ファイル改ざん検知用ハッシュ
- **AES-256-CBC** - オプション暗号化
- **PBKDF2** - パスワード強化（10万回反復）
- **Web Crypto API** - ブラウザ標準の暗号化機能

### ライブラリ
- **fflate** - 高速ZIP操作（JSZipより3倍高速）
- **react-dropzone** - ドラッグ&ドロップ機能
- **lucide-react** - アイコンライブラリ

## 開発環境のセットアップ

### 前提条件
- Node.js 18.0.0以上
- npm または yarn

### インストール手順

```bash
# リポジトリのクローン
git clone https://github.com/your-username/zipsig.git
cd zipsig

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番用ビルド
npm run build

# ビルドのプレビュー
npm run preview

# ESLintによるコード検証
npm run lint

# TypeScriptの型チェック
npm run type-check
```

## プロジェクト構造

```
zipsig/
├── src/
│   ├── components/        # Reactコンポーネント
│   │   ├── sections/     # メインセクション
│   │   ├── ui/           # UIコンポーネント
│   │   └── common/       # 共通コンポーネント
│   ├── utils/            # ユーティリティ関数
│   │   ├── crypto.ts     # 暗号化機能
│   │   └── file.ts       # ファイル操作
│   ├── types/            # TypeScript型定義
│   ├── translations.ts   # 多言語対応
│   └── App.tsx          # メインアプリケーション
├── public/               # 静的ファイル
├── api/                  # API関連
└── docs/                # ドキュメント
```

## 使用方法

### 基本的な署名手順

1. **ファイル選択** - ブラウザにファイルをドラッグ&ドロップ
2. **名前入力** - 署名者の名前を入力
3. **オプション設定** - 暗号化の有無を選択
4. **署名生成** - ボタンクリックで完了

### 検証手順

1. **検証タブ** - 検証モードに切り替え
2. **ファイル選択** - 署名付きZIPファイルを選択
3. **自動検証** - 結果が即座に表示

## セキュリティポリシー

### データ保護
- すべての処理はクライアントサイドで完結
- ファイルデータは外部サーバーに送信されない
- 秘密鍵はユーザーのローカルに保存

### 暗号化仕様
- **デジタル署名**: RSA-PSS 2048bit with SHA-256
- **ファイル暗号化**: AES-256-CBC
- **鍵導出**: PBKDF2 (100,000 iterations)
- **タイムスタンプ**: RFC 3161準拠

## 貢献

プロジェクトへの貢献を歓迎します！

### 貢献方法

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

### 開発ガイドライン

- TypeScriptの型安全性を維持
- ESLintルールに準拠
- セキュリティに関わる変更は慎重にレビュー
- ユーザビリティを優先

## ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## サポート

- 📧 **Email**: support@zipsig.com
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-username/zipsig/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/your-username/zipsig/discussions)

## 謝辞

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - ブラウザ標準の暗号化機能
- [fflate](https://github.com/101arrowz/fflate) - 高性能ZIP操作ライブラリ
- [React](https://reactjs.org/) - モダンなUIライブラリ
- [Vite](https://vitejs.dev/) - 次世代フロントエンドツール

---

**ZipSig** - あなたのデジタル資産を守る、信頼できるパートナー

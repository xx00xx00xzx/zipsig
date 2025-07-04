import React from 'react';
import type { Mode } from '../types';

/**
 * SEO関連のメタタグを管理するカスタムフック
 * ページタイトル、メタディスクリプション、OGタグ、Twitterカードを動的に更新
 */
export const useSEO = (mode: Mode) => {
  React.useEffect(() => {
    const titles = {
      sign: 'ZipSig - ファイル署名 | デジタル署名システム',
      verify: 'ZipSig - 署名検証 | デジタル署名システム',
      extract: 'ZipSig - ファイル解凍 | デジタル署名システム',
      faq: 'ZipSig - よくある質問 | デジタル署名システム'
    };

    const descriptions = {
      sign: 'ファイルをデジタル署名してZIPに作成。改ざん検知機能付きで作品の著作権保護を実現します。',
      verify: 'デジタル署名されたZIPファイルの検証。改ざんの有無を確認し、ファイルの信頼性を検証します。',
      extract: '暗号化されたZipSigファイルを復号・解凍してオリジナルファイルを取得します。',
      faq: 'ZipSigの使い方、技術仕様、セキュリティに関するよくある質問と回答。'
    };

    // Update page title
    document.title = titles[mode];
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', descriptions[mode]);
    }

    // Update Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute('content', titles[mode]);
    if (ogDescription) ogDescription.setAttribute('content', descriptions[mode]);

    // Update Twitter meta tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterTitle) twitterTitle.setAttribute('content', titles[mode]);
    if (twitterDescription) twitterDescription.setAttribute('content', descriptions[mode]);
  }, [mode]);
};
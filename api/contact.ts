import { Resend } from 'resend';

// Resend APIキーの設定
const resend = new Resend(process.env.RESEND_API_KEY);

// CORS設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Vercel Runtime Config
export const config = {
  runtime: 'edge',
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type?: 'bug' | 'feature' | 'question' | 'other';
}

// バリデーション関数
function validateContactData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('お名前は2文字以上で入力してください');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('メールアドレスを入力してください');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('有効なメールアドレスを入力してください');
    }
  }

  if (!data.subject || typeof data.subject !== 'string' || data.subject.trim().length < 5) {
    errors.push('件名は5文字以上で入力してください');
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.push('メッセージは10文字以上で入力してください');
  }

  // 文字数制限
  if (data.name && data.name.length > 100) {
    errors.push('お名前は100文字以内で入力してください');
  }

  if (data.subject && data.subject.length > 200) {
    errors.push('件名は200文字以内で入力してください');
  }

  if (data.message && data.message.length > 2000) {
    errors.push('メッセージは2000文字以内で入力してください');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// HTMLメールテンプレート
function createEmailTemplate(data: ContactFormData): string {
  const typeLabels = {
    bug: '🐛 バグ報告',
    feature: '✨ 機能要望',
    question: '❓ 質問',
    other: '📝 その他'
  };

  const typeLabel = data.type ? typeLabels[data.type] : '📝 お問い合わせ';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #007AFF, #34C759); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #007AFF; }
        .value { background: white; padding: 10px; border-radius: 4px; border-left: 3px solid #007AFF; }
        .message { background: white; padding: 15px; border-radius: 4px; border-left: 3px solid #34C759; white-space: pre-wrap; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🛡️ ZipSig お問い合わせ</h2>
          <p>${typeLabel}</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">お名前</div>
            <div class="value">${data.name}</div>
          </div>
          <div class="field">
            <div class="label">メールアドレス</div>
            <div class="value">${data.email}</div>
          </div>
          <div class="field">
            <div class="label">件名</div>
            <div class="value">${data.subject}</div>
          </div>
          <div class="field">
            <div class="label">メッセージ</div>
            <div class="message">${data.message}</div>
          </div>
          <div class="field">
            <div class="label">送信日時</div>
            <div class="value">${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} (JST)</div>
          </div>
        </div>
        <div class="footer">
          <p>ZipSig - デジタルファイル署名システム</p>
          <p>このメールは自動送信されています</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// 自動返信メールテンプレート
function createAutoReplyTemplate(data: ContactFormData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #007AFF, #34C759); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .thank-you { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #34C759; margin-bottom: 20px; }
        .next-steps { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #007AFF; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🛡️ ZipSig</h2>
          <p>お問い合わせありがとうございます</p>
        </div>
        <div class="content">
          <div class="thank-you">
            <h3>✅ 受付完了</h3>
            <p>${data.name}様</p>
            <p>この度は、ZipSigにお問い合わせいただき、誠にありがとうございます。</p>
            <p>以下の内容で受け付けいたしました：</p>
            <ul>
              <li><strong>件名：</strong>${data.subject}</li>
              <li><strong>受付日時：</strong>${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} (JST)</li>
            </ul>
          </div>
          <div class="next-steps">
            <h3>📮 今後の流れ</h3>
            <p>お問い合わせの内容を確認し、通常1-3営業日以内にご返信いたします。</p>
            <p>緊急性の高いお問い合わせの場合は、可能な限り迅速に対応いたします。</p>
            <p>なお、このメールは自動送信のため、直接ご返信いただいても受信できません。</p>
          </div>
        </div>
        <div class="footer">
          <p>ZipSig - デジタルファイル署名システム</p>
          <p>https://www.zipsig.site</p>
        </div>
      </div>
    </body>
    </body>
    </html>
  `;
}

export default async function handler(req: Request): Promise<Response> {
  // プリフライトリクエスト（CORS）
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // POST以外は許可しない
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // APIキーの確認
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'サーバー設定エラーです。しばらく経ってから再度お試しください。' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // リクエストボディの解析
    const body = await req.json();
    const validation = validateContactData(body);

    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: '入力内容に問題があります', details: validation.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contactData: ContactFormData = {
      name: body.name.trim(),
      email: body.email.trim(),
      subject: body.subject.trim(),
      message: body.message.trim(),
      type: body.type || 'other'
    };

    // 管理者向けメール送信
    const adminEmailResult = await resend.emails.send({
      from: process.env.FROM_DOMAIN || 'ZipSig Contact <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL || 'admin@example.com'],
      subject: `[ZipSig] ${contactData.subject}`,
      html: createEmailTemplate(contactData),
      replyTo: contactData.email,
    });

    // 自動返信メール送信
    const autoReplyResult = await resend.emails.send({
      from: process.env.FROM_DOMAIN || 'ZipSig <onboarding@resend.dev>',
      to: [contactData.email],
      subject: '[ZipSig] お問い合わせを受け付けました',
      html: createAutoReplyTemplate(contactData),
    });

    console.log('Email sent successfully:', {
      adminEmail: adminEmailResult.data?.id,
      autoReply: autoReplyResult.data?.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'お問い合わせを受け付けました。確認メールをお送りしましたのでご確認ください。',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'メール送信中にエラーが発生しました。しばらく経ってから再度お試しください。',
        debug: process.env.NODE_ENV === 'development' ? error : undefined,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
} 
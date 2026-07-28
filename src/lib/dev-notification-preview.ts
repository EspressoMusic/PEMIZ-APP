function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderNotificationPreviewPage(input: {
  pageTitle: string;
  emailSubject: string;
  emailHtml: string;
  pushTitle: string;
  pushBody: string;
}): string {
  return `<!doctype html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.pageTitle)}</title>
  <style>
    body { font-family: sans-serif; background: #f5efe6; margin: 0; padding: 24px 16px; color: #3a2f26; }
    .card { max-width: 480px; margin: 0 auto 24px; background: #fff; border-radius: 16px; border: 1px solid #e4d9c8; overflow: hidden; }
    .card h2 { margin: 0; padding: 12px 16px; background: #efe4d2; font-size: 14px; }
    .card .inner { padding: 16px; }
    .subject { font-weight: bold; margin-bottom: 12px; font-size: 15px; }
    .push { display: flex; gap: 10px; align-items: flex-start; }
    .push .icon { width: 40px; height: 40px; border-radius: 10px; background: #6d4c41; flex-shrink: 0; }
    .push .title { font-weight: bold; font-size: 14px; }
    .push .body { font-size: 13px; color: #6b5c52; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>אימייל</h2>
    <div class="inner">
      <div class="subject">נושא: ${escapeHtml(input.emailSubject)}</div>
      ${input.emailHtml}
    </div>
  </div>
  <div class="card">
    <h2>התראת Push</h2>
    <div class="inner push">
      <div class="icon"></div>
      <div>
        <div class="title">${escapeHtml(input.pushTitle)}</div>
        <div class="body">${escapeHtml(input.pushBody)}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

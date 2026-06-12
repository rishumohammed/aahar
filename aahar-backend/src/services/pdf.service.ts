import puppeteer from "puppeteer";

interface CertData {
  certNumber:    string;
  type:          "fnb" | "accommodation";
  entityName:    string;
  entityAddress: string;
  entityCity:    string;
  issuedAt:      Date;
  expiresAt:     Date;
  hygieneScore?: number;
  starRating?:   number;
  qrCodeDataUrl: string;
  auditorName:   string;
}

export const generateCertPDF = async (data: CertData): Promise<Buffer> => {
  const typeLabel  = data.type === "fnb" ? "F&B Establishment" : "Accommodation Property";
  const badgeLabel = data.type === "fnb" ? "AAHAR CERTIFIED"   : "AAHAR ACCOMMODATION";
  const scoreLine  = data.type === "fnb" && data.hygieneScore
    ? `<p class="score">Hygiene Score: <strong>${data.hygieneScore}/5</strong></p>`
    : data.type === "accommodation" && data.starRating
    ? `<p class="score">Star Rating: <strong>${"★".repeat(data.starRating)}</strong></p>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Helvetica Neue", "Arial", sans-serif;
    background: #F4F7F7;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; padding: 40px;
  }
  .cert {
    background: white;
    width: 794px;
    min-height: 560px;
    border: 3px solid #0A7B7B;
    border-radius: 16px;
    padding: 48px;
    position: relative;
    overflow: hidden;
  }
  .cert::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 6px;
    background: linear-gradient(90deg, #0A7B7B, #B5766A);
  }
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 36px;
  }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand-icon {
    width: 52px; height: 52px;
    background: #0A7B7B;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 22px; font-weight: 700; letter-spacing: 2px;
  }
  .brand-text h1 {
    font-size: 28px; font-weight: 700;
    color: #0A7B7B; letter-spacing: 3px;
  }
  .brand-text p {
    font-size: 11px; color: #4A6464; letter-spacing: 1px; margin-top: 2px;
  }
  .badge-pill {
    background: #E6F4F4;
    border: 1.5px solid #0A7B7B;
    border-radius: 8px;
    padding: 8px 16px;
    text-align: center;
  }
  .badge-pill span {
    display: block; font-size: 11px;
    font-weight: 700; color: #0A7B7B;
    letter-spacing: 2px;
  }
  .badge-pill small { font-size: 10px; color: #4A6464; }
  .divider {
    border: none; border-top: 1px solid #DDE8E8;
    margin: 24px 0;
  }
  .certifies {
    font-size: 13px; color: #4A6464;
    text-align: center; margin-bottom: 8px;
    letter-spacing: 0.5px;
  }
  .entity-name {
    font-size: 30px; font-weight: 700;
    color: #1A2E2E; text-align: center;
    margin-bottom: 4px;
  }
  .entity-sub {
    font-size: 13px; color: #4A6464;
    text-align: center; margin-bottom: 24px;
  }
  .body-text {
    font-size: 13px; color: #4A6464;
    text-align: center; line-height: 1.7;
    max-width: 500px; margin: 0 auto 24px;
  }
  .score {
    text-align: center; font-size: 14px;
    color: #0A7B7B; margin-bottom: 24px;
  }
  .score strong { font-weight: 700; }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 32px;
  }
  .dates { font-size: 12px; color: #4A6464; }
  .dates p { margin-bottom: 4px; }
  .dates strong { color: #1A2E2E; }
  .cert-id {
    text-align: center;
    font-size: 11px; color: #4A6464;
  }
  .cert-id strong {
    display: block; font-size: 13px;
    font-weight: 700; color: #B5766A;
    font-family: monospace; letter-spacing: 1px;
  }
  .qr-wrap { text-align: right; }
  .qr-wrap img { width: 90px; height: 90px; border: 1px solid #DDE8E8; border-radius: 6px; }
  .qr-wrap p { font-size: 9px; color: #4A6464; margin-top: 4px; text-align: center; }
  .seal {
    position: absolute;
    bottom: 48px; left: 48px;
    width: 80px; height: 80px;
    border: 2px solid #0A7B7B;
    border-radius: 50%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }
  .seal span { font-size: 8px; font-weight: 700; color: #0A7B7B; letter-spacing: 1px; text-align: center; }
  .auditor-line {
    margin-top: 16px; font-size: 11px; color: #4A6464;
  }
  .auditor-line strong { color: #1A2E2E; }
  .watermark {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-size: 80px; font-weight: 900;
    color: rgba(10,123,123,0.04);
    letter-spacing: 8px;
    pointer-events: none;
    user-select: none;
  }
</style>
</head>
<body>
<div class="cert">
  <div class="watermark">AAHAR</div>

  <div class="header">
    <div class="brand">
      <div class="brand-icon">A</div>
      <div class="brand-text">
        <h1>AAHAR</h1>
        <p>HOSPITALITY TRUST PLATFORM</p>
      </div>
    </div>
    <div class="badge-pill">
      <span>${badgeLabel}</span>
      <small>${typeLabel}</small>
    </div>
  </div>

  <hr class="divider">

  <p class="certifies">This certifies that</p>
  <h2 class="entity-name">${data.entityName}</h2>
  <p class="entity-sub">${data.entityAddress}, ${data.entityCity}</p>

  <p class="body-text">
    has successfully met the AAHAR accreditation standards for hygiene,
    food safety, staff training, and operational compliance following an
    independent on-site audit by a certified AAHAR inspector.
  </p>

  ${scoreLine}

  <hr class="divider">

  <div class="footer">
    <div>
      <div class="seal">
        <span>AAHAR</span>
        <span>OFFICIAL</span>
        <span>SEAL</span>
      </div>
      <p class="auditor-line">
        Verified by <strong>${data.auditorName}</strong><br>
        AAHAR Certified Inspector
      </p>
    </div>

    <div class="cert-id">
      <strong>${data.certNumber}</strong>
      Certificate Number
    </div>

    <div>
      <div class="dates">
        <p>Issue date: <strong>${data.issuedAt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</strong></p>
        <p>Valid until: <strong>${data.expiresAt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</strong></p>
      </div>
      <div class="qr-wrap">
        <img src="${data.qrCodeDataUrl}" alt="QR Code">
        <p>Scan to verify</p>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.setViewport({ width: 900, height: 700 });

    const pdf = await page.pdf({
      format:          "A4",
      landscape:       true,
      printBackground: true,
      margin:          { top:"20px", right:"20px", bottom:"20px", left:"20px" },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
};

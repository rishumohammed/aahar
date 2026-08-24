import puppeteer from "puppeteer";
import prisma from "../lib/prisma.js";

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
  // Fetch branding config for certificate logo
  const brandingSetting = await prisma.siteSetting.findUnique({
    where: { key: "branding_config" }
  });
  
  let certificateLogo = "";
  if (brandingSetting && brandingSetting.value) {
    const config = brandingSetting.value as any;
    if (config.certificateLogo) {
      certificateLogo = `${process.env.API_URL || "http://localhost:5000"}${config.certificateLogo}`;
    }
  }

  const typeLabel  = data.type === "fnb" ? "Food & Beverage Establishment" : "Accommodation Property";
  const badgeLabel = data.type === "fnb" ? "AAHAR CERTIFIED DINING" : "AAHAR CERTIFIED STAY";

  const ratingLine = data.type === "fnb" && data.hygieneScore
    ? `<div class="rating-row"><span class="rating-label">Hygiene Score</span><span class="rating-stars">${data.hygieneScore}/5</span></div>`
    : data.type === "accommodation" && data.starRating
    ? `<div class="rating-row"><span class="rating-label">Star Rating</span><span class="rating-stars">${"★".repeat(data.starRating)}${"☆".repeat(5 - data.starRating)}</span></div>`
    : "";

  const logoHtml = certificateLogo
    ? `<img src="${certificateLogo}" alt="Logo" class="logo-img">`
    : `<div class="logo-fallback">A</div>`;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    min-height: 100vh; padding: 40px;
  }
  .cert {
    background: #0A7B7B;
    width: 820px;
    min-height: 580px;
    border-radius: 24px;
    padding: 56px;
    position: relative;
    overflow: hidden;
    color: white;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }
  .header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 48px;
    position: relative;
    z-index: 10;
  }
  .brand-icon {
    width: 80px; height: 80px;
    background: rgba(255,255,255,0.1);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
  }
  .brand-icon img {
    max-width: 50px; max-height: 50px; object-fit: contain;
  }
  .brand-icon .fallback {
    font-size: 32px; font-weight: bold; color: white;
  }
  .brand-text h1 {
    font-size: 32px; font-weight: 800;
    color: white; letter-spacing: -0.5px;
    margin-bottom: 4px;
  }
  .brand-text p {
    font-size: 14px; color: rgba(255,255,255,0.8); font-weight: 500;
  }
  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px 24px;
    background: rgba(255,255,255,0.1);
    padding: 40px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1);
    position: relative;
    z-index: 10;
  }
  .detail-item {
    display: flex; flex-direction: column; gap: 8px;
  }
  .detail-label {
    font-size: 11px; font-weight: 800;
    color: rgba(255,255,255,0.6); text-transform: uppercase;
    letter-spacing: 2px;
  }
  .detail-value {
    font-size: 18px; font-weight: 700; color: white;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 48px;
    position: relative;
    z-index: 10;
  }
  .entity-info {
    flex: 1;
  }
  .entity-name {
    font-size: 24px; font-weight: 800; color: white; margin-bottom: 8px;
  }
  .entity-address {
    font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.5;
  }
  .qr-wrap {
    text-align: right;
    background: white;
    padding: 12px;
    border-radius: 12px;
  }
  .qr-wrap img { width: 80px; height: 80px; }
  .qr-wrap p { font-size: 9px; color: #0A7B7B; margin-top: 8px; text-align: center; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;}
  .watermark {
    position: absolute;
    bottom: -50px; right: -50px;
    font-size: 300px; font-weight: 900;
    color: rgba(255,255,255,0.03);
    pointer-events: none;
    user-select: none;
    z-index: 1;
    line-height: 1;
  }
  ${scoreLine ? `
  .score-box {
    display: inline-flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.15); padding: 8px 16px; border-radius: 100px;
    margin-top: 24px;
  }
  .score-label { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px; }
  .score-value { font-size: 16px; font-weight: 800; color: white; }
  ` : ''}
</style>
</head>
<body>
<div class="cert">
  <div class="watermark">A</div>

  <div class="header">
    <div class="brand-icon">
      ${certificateLogo ? `<img src="${certificateLogo}" alt="Logo">` : `<span class="fallback">A</span>`}
    </div>
    <div class="brand-text">
      <h1>Official Certification Issued</h1>
      <p>AAHAR Trust Standard Verified &mdash; ${badgeLabel}</p>
    </div>
  </div>

  <div class="details-grid">
    <div class="detail-item">
      <span class="detail-label">License No.</span>
      <span class="detail-value">${data.certNumber}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Issue Date</span>
      <span class="detail-value">${data.issuedAt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Expiry Date</span>
      <span class="detail-value">${data.expiresAt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Global Status</span>
      <span class="detail-value" style="text-transform: capitalize;">active</span>
    </div>
  </div>

  <div class="footer">
    <div class="entity-info">
      <div class="entity-name">${data.entityName}</div>
      <div class="entity-address">
        ${data.entityAddress}<br/>
        ${data.entityCity}<br/>
        <br/>
        <span style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px;">Audited By: ${data.auditorName}</span>
      </div>
      ${scoreLine}
    </div>

    <div class="qr-wrap">
      <img src="${data.qrCodeDataUrl}" alt="QR Code">
      <p>Scan to verify</p>
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

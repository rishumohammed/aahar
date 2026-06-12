import QRCode from "qrcode";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export const generateQRCode = async (certNumber: string): Promise<string> => {
  const verifyUrl = `${APP_URL}/verify/${certNumber}`;
  const dataUrl   = await QRCode.toDataURL(verifyUrl, {
    width:           300,
    margin:          2,
    color:           { dark:"#0A7B7B", light:"#FFFFFF" },
    errorCorrectionLevel: "H",
  });
  return dataUrl; // base64 data URL — store in DB, embed in PDF
};

export const getVerifyUrl = (certNumber: string): string =>
  `${APP_URL}/verify/${certNumber}`;

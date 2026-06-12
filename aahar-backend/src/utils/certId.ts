export const generateCertNumber = (type: "fnb" | "accommodation"): string => {
  const prefix = type === "fnb" ? "AHR-FB" : "AHR-ACC";
  const year   = new Date().getFullYear();
  const rand   = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${year}-${rand}`;
};

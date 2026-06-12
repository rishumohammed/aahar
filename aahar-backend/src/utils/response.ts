export const ok = (res: any, data: any, message = "Success") =>
  res.status(200).json({ success: true, data, message });

export const created = (res: any, data: any, message = "Created") =>
  res.status(201).json({ success: true, data, message });

export const badRequest = (res: any, message: string, errors?: any) =>
  res.status(400).json({ success: false, data: null, message, errors });

export const unauthorized = (res: any, message = "Unauthorized") =>
  res.status(401).json({ success: false, data: null, message });

export const forbidden = (res: any, message = "Forbidden") =>
  res.status(403).json({ success: false, data: null, message });

export const notFound = (res: any, message = "Not found") =>
  res.status(404).json({ success: false, data: null, message });

export const serverError = (res: any, error: any) => {
  console.error(error);
  return res.status(500).json({ success: false, data: null, message: error.message || "Internal server error" });
};

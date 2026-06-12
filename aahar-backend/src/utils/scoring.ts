export interface ChecklistItem {
  id: string;
  section: string;
  criterion: string;
  weight: number;
  score?: number;
}

export const calculateScore = (checklist: ChecklistItem[]): number => {
  const scoredItems = checklist.filter(i => i.score !== undefined);
  if (scoredItems.length === 0) return 0;
  const weightedSum = scoredItems.reduce((acc, i) => acc + (i.score! * i.weight), 0);
  const totalWeight = scoredItems.reduce((acc, i) => acc + i.weight, 0);
  return Math.round((weightedSum / totalWeight) * 10) / 10;
};

export const FNB_CHECKLIST: Omit<ChecklistItem, "score">[] = [
  { id:"f1",  section:"Kitchen Hygiene",   criterion:"Surfaces clean and sanitised",         weight:5 },
  { id:"f2",  section:"Kitchen Hygiene",   criterion:"Cooking equipment clean and maintained", weight:4 },
  { id:"f3",  section:"Kitchen Hygiene",   criterion:"Handwashing facilities available",      weight:5 },
  { id:"f4",  section:"Food Storage",      criterion:"Raw and cooked food stored separately",  weight:5 },
  { id:"f5",  section:"Food Storage",      criterion:"Refrigeration temperatures correct",     weight:5 },
  { id:"f6",  section:"Food Storage",      criterion:"FIFO labelling in place",               weight:3 },
  { id:"f7",  section:"Food Storage",      criterion:"Pest control measures active",           weight:4 },
  { id:"f8",  section:"Staff Standards",   criterion:"Staff wear clean uniforms and hairnets", weight:3 },
  { id:"f9",  section:"Staff Standards",   criterion:"Food handler certificates valid",        weight:5 },
  { id:"f10", section:"Staff Standards",   criterion:"No illness policy displayed",            weight:3 },
  { id:"f11", section:"Documentation",     criterion:"FSSAI licence displayed and valid",      weight:5 },
  { id:"f12", section:"Documentation",     criterion:"Pest control log up to date",            weight:4 },
  { id:"f13", section:"Documentation",     criterion:"Temperature logs maintained",            weight:4 },
  { id:"f14", section:"Washroom",          criterion:"Customer washroom clean and stocked",    weight:4 },
  { id:"f15", section:"Washroom",          criterion:"Staff washroom separate and clean",      weight:3 },
];

export const ACCOMMODATION_CHECKLIST: Omit<ChecklistItem, "score">[] = [
  { id:"a1",  section:"Housekeeping",      criterion:"Linen changed between every guest",      weight:5 },
  { id:"a2",  section:"Housekeeping",      criterion:"Room sanitisation protocol documented",  weight:4 },
  { id:"a3",  section:"Housekeeping",      criterion:"Deep-clean schedule maintained",         weight:4 },
  { id:"a4",  section:"Room Safety",       criterion:"Fire exits clearly marked and unblocked",weight:5 },
  { id:"a5",  section:"Room Safety",       criterion:"Electrical safety certification valid",  weight:5 },
  { id:"a6",  section:"Room Safety",       criterion:"Water quality test passed",              weight:4 },
  { id:"a7",  section:"Room Safety",       criterion:"Emergency procedures posted in rooms",   weight:3 },
  { id:"a8",  section:"Guest Facilities",  criterion:"Pool and spa hygiene standards met",     weight:4 },
  { id:"a9",  section:"Guest Facilities",  criterion:"Gym equipment sanitised regularly",      weight:3 },
  { id:"a10", section:"Guest Facilities",  criterion:"Public washrooms clean and stocked",     weight:4 },
  { id:"a11", section:"Staff Standards",   criterion:"Food handler certificates valid",        weight:4 },
  { id:"a12", section:"Staff Standards",   criterion:"Housekeeping training records current",  weight:4 },
  { id:"a13", section:"Accessibility",     criterion:"Ramps and lifts available and working",  weight:3 },
  { id:"a14", section:"Accessibility",     criterion:"Accessible rooms available",             weight:3 },
  { id:"a15", section:"Guest Experience",  criterion:"Complaint resolution process documented",weight:3 },
];

import prisma from "./src/lib/prisma.js";

const docs = [
  { key: "fssai", label: "FSSAI Licence", icon: "true", type: "DOCUMENT_RESTAURANT" },
  { key: "gst", label: "GST Certificate", icon: "false", type: "DOCUMENT_RESTAURANT" },
  { key: "lease", label: "Lease Agreement", icon: "true", type: "DOCUMENT_RESTAURANT" },
  { key: "kitchen_photos", label: "Kitchen Photos (min 5)", icon: "false", type: "DOCUMENT_RESTAURANT" },
  { key: "owner_id", label: "Owner ID Proof", icon: "true", type: "DOCUMENT_RESTAURANT" }
];

async function seed() {
  console.log("Seeding documents into master data...");
  for (const doc of docs) {
    await prisma.masterData.upsert({
      where: { key: doc.key },
      create: doc,
      update: doc
    });
    console.log(`Seeded: ${doc.label}`);
  }
  console.log("Seeding complete.");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

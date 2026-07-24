const fs = require("fs");
let content = fs.readFileSync("prisma/schema.prisma", "utf8");

content = content.replace(/owner\s+User\s+@relation\("RestaurantOwner", fields: \[ownerId\], references: \[id\]\)/g, "owner User @relation(\"RestaurantOwner\", fields: [ownerId], references: [id], onDelete: Cascade)");
content = content.replace(/manager\s+User\?\s+@relation\("RestaurantManager", fields: \[managerId\], references: \[id\]\)/g, "manager User? @relation(\"RestaurantManager\", fields: [managerId], references: [id], onDelete: SetNull)");

content = content.replace(/owner\s+User\?\s+@relation\("HotelOwner", fields: \[ownerId\], references: \[id\]\)/g, "owner User? @relation(\"HotelOwner\", fields: [ownerId], references: [id], onDelete: Cascade)");
content = content.replace(/manager\s+User\?\s+@relation\("HotelManager", fields: \[managerId\], references: \[id\]\)/g, "manager User? @relation(\"HotelManager\", fields: [managerId], references: [id], onDelete: SetNull)");

content = content.replace(/applicant\s+User\s+@relation\(fields: \[applicantId\], references: \[id\]\)/g, "applicant User @relation(fields: [applicantId], references: [id], onDelete: Cascade)");

content = content.replace(/application\s+Application\s+@relation\(fields: \[applicationId\], references: \[id\]\)/g, "application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)");
content = content.replace(/auditor\s+User\s+@relation\("AuditorAudits", fields: \[auditorId\], references: \[id\]\)/g, "auditor User @relation(\"AuditorAudits\", fields: [auditorId], references: [id], onDelete: Cascade)");

content = content.replace(/application\s+Application\s+@relation\("ApplicationCert", fields: \[applicationId\], references: \[id\]\)/g, "application Application @relation(\"ApplicationCert\", fields: [applicationId], references: [id], onDelete: Cascade)");
content = content.replace(/restaurant\s+Restaurant\?\s+@relation\("RestaurantCert", fields: \[restaurantId\], references: \[id\]\)/g, "restaurant Restaurant? @relation(\"RestaurantCert\", fields: [restaurantId], references: [id], onDelete: Cascade)");
content = content.replace(/hotel\s+Hotel\?\s+@relation\("HotelCert", fields: \[hotelId\], references: \[id\]\)/g, "hotel Hotel? @relation(\"HotelCert\", fields: [hotelId], references: [id], onDelete: Cascade)");

content = content.replace(/hotel\s+Hotel\s+@relation\(fields: \[hotelId\], references: \[id\]\)/g, "hotel Hotel @relation(fields: [hotelId], references: [id], onDelete: Cascade)");
content = content.replace(/guest\s+User\s+@relation\("GuestEnquiries", fields: \[guestId\], references: \[id\]\)/g, "guest User @relation(\"GuestEnquiries\", fields: [guestId], references: [id], onDelete: Cascade)");
content = content.replace(/roomType\s+RoomType\?\s+@relation\(fields: \[roomTypeId\], references: \[id\]\)/g, "roomType RoomType? @relation(fields: [roomTypeId], references: [id], onDelete: Cascade)");

content = content.replace(/sender\s+User\s+@relation\(fields: \[senderId\], references: \[id\]\)/g, "sender User @relation(fields: [senderId], references: [id], onDelete: Cascade)");

content = content.replace(/user\s+User\s+@relation\(fields: \[userId\], references: \[id\]\)/g, "user User @relation(fields: [userId], references: [id], onDelete: Cascade)");
content = content.replace(/application\s+Application\?\s+@relation\(fields: \[applicationId\], references: \[id\]\)/g, "application Application? @relation(fields: [applicationId], references: [id], onDelete: Cascade)");
content = content.replace(/enquiry\s+Enquiry\?\s+@relation\(fields: \[enquiryId\], references: \[id\]\)/g, "enquiry Enquiry? @relation(fields: [enquiryId], references: [id], onDelete: Cascade)");

content = content.replace(/author\s+User\s+@relation\(fields: \[authorId\], references: \[id\]\)/g, "author User @relation(fields: [authorId], references: [id], onDelete: Cascade)");
content = content.replace(/restaurant\s+Restaurant\?\s+@relation\(fields: \[restaurantId\], references: \[id\]\)/g, "restaurant Restaurant? @relation(fields: [restaurantId], references: [id], onDelete: Cascade)");
content = content.replace(/hotel\s+Hotel\?\s+@relation\(fields: \[hotelId\], references: \[id\]\)/g, "hotel Hotel? @relation(fields: [hotelId], references: [id], onDelete: Cascade)");

fs.writeFileSync("prisma/schema.prisma", content);
console.log("Updated schema.prisma with Cascade onDelete.");

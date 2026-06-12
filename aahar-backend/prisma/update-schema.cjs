const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// 1. Remove enums
content = content.replace(/enum RestaurantCategory \{[\s\S]*?\}/, '');
content = content.replace(/enum DietaryType \{[\s\S]*?\}/, '');
content = content.replace(/enum PropertyType \{[\s\S]*?\}/, '');

// 2. Change fields in models
content = content.replace(/category\s+RestaurantCategory\s+@default\(casual_dining\)/g, 'category     String             @default("casual_dining")');
content = content.replace(/dietary\s+DietaryType\s+@default\(mixed\)/g, 'dietary      String             @default("mixed")');
content = content.replace(/dietary\s+DietaryType\s+@default\(veg\)/g, 'dietary     String      @default("veg")');
content = content.replace(/propertyType\s+PropertyType\s+@default\(boutique_hotel\)/g, 'propertyType        String @default("boutique_hotel")');

// 3. Add MasterData model at the end
const masterDataModel = `
model MasterData {
  id        String   @id @default(cuid())
  type      String   // 'AMENITY_RESTAURANT', 'AMENITY_HOTEL', 'CATEGORY_RESTAURANT', 'CATEGORY_HOTEL', 'DIETARY'
  key       String   @unique
  label     String
  icon      String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;

content += masterDataModel;

fs.writeFileSync(schemaPath, content);
console.log('schema.prisma updated.');

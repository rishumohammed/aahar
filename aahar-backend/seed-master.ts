import prisma from './src/lib/prisma.js';

const masterData = [
  // Restaurant Categories
  { type: 'CATEGORY_RESTAURANT', key: 'fine_dining', label: 'Fine Dining' },
  { type: 'CATEGORY_RESTAURANT', key: 'casual_dining', label: 'Casual Dining' },
  { type: 'CATEGORY_RESTAURANT', key: 'qsr', label: 'Quick Service (QSR)' },
  { type: 'CATEGORY_RESTAURANT', key: 'cafe', label: 'Cafe / Coffee Shop' },
  { type: 'CATEGORY_RESTAURANT', key: 'cloud_kitchen', label: 'Cloud Kitchen' },
  { type: 'CATEGORY_RESTAURANT', key: 'dhaba', label: 'Dhaba' },
  { type: 'CATEGORY_RESTAURANT', key: 'food_court', label: 'Food Court' },
  { type: 'CATEGORY_RESTAURANT', key: 'bakery', label: 'Bakery / Desserts' },

  // Hotel Categories
  { type: 'CATEGORY_HOTEL', key: 'boutique_hotel', label: 'Boutique Hotel' },
  { type: 'CATEGORY_HOTEL', key: 'resort', label: 'Resort' },
  { type: 'CATEGORY_HOTEL', key: 'business_hotel', label: 'Business Hotel' },
  { type: 'CATEGORY_HOTEL', key: 'serviced_apartment', label: 'Serviced Apartment' },
  { type: 'CATEGORY_HOTEL', key: 'heritage', label: 'Heritage Property' },
  { type: 'CATEGORY_HOTEL', key: 'homestay', label: 'Homestay / BnB' },

  // Dietary Types
  { type: 'DIETARY', key: 'veg', label: 'Vegetarian' },
  { type: 'DIETARY', key: 'non_veg', label: 'Non-Vegetarian' },
  { type: 'DIETARY', key: 'vegan', label: 'Vegan' },
  { type: 'DIETARY', key: 'jain', label: 'Jain Food' },
  { type: 'DIETARY', key: 'mixed', label: 'Mixed / Universal' },

  // Amenities - Restaurant
  { type: 'AMENITY_RESTAURANT', key: 'ac', label: 'Air Conditioning' },
  { type: 'AMENITY_RESTAURANT', key: 'wifi', label: 'Free WiFi' },
  { type: 'AMENITY_RESTAURANT', key: 'parking', label: 'Parking Available' },
  { type: 'AMENITY_RESTAURANT', key: 'liveMusic', label: 'Live Music' },
  { type: 'AMENITY_RESTAURANT', key: 'outdoorSeating', label: 'Outdoor Seating' },
  { type: 'AMENITY_RESTAURANT', key: 'delivery', label: 'Home Delivery' },
  { type: 'AMENITY_RESTAURANT', key: 'takeaway', label: 'Takeaway' },
  { type: 'AMENITY_RESTAURANT', key: 'dineIn', label: 'Dine-In' },
  { type: 'AMENITY_RESTAURANT', key: 'familyFriendly', label: 'Family Friendly' },
  { type: 'AMENITY_RESTAURANT', key: 'accessible', label: 'Wheelchair Accessible' },
  { type: 'AMENITY_RESTAURANT', key: 'washroom', label: 'Washroom Facilities' },

  // Amenities - Hotel
  { type: 'AMENITY_HOTEL', key: 'pool', label: 'Swimming Pool' },
  { type: 'AMENITY_HOTEL', key: 'spa', label: 'Spa & Wellness' },
  { type: 'AMENITY_HOTEL', key: 'gym', label: 'Fitness Center' },
  { type: 'AMENITY_HOTEL', key: 'beach', label: 'Beach Access' },
  { type: 'AMENITY_HOTEL', key: 'kidsClub', label: 'Kids Club' },
  { type: 'AMENITY_HOTEL', key: 'conference', label: 'Conference Room' },
  { type: 'AMENITY_HOTEL', key: 'restaurant', label: 'In-house Restaurant' },
  { type: 'AMENITY_HOTEL', key: 'airportTransfer', label: 'Airport Transfer' },
  { type: 'AMENITY_HOTEL', key: 'evCharging', label: 'EV Charging Station' },
  { type: 'AMENITY_HOTEL', key: 'petFriendly', label: 'Pet Friendly' },
  { type: 'AMENITY_HOTEL', key: 'smokingArea', label: 'Designated Smoking Area' },
];

async function seed() {
  console.log('Seeding Master Data...');
  for (const item of masterData) {
    await prisma.masterData.upsert({
      where: { key: item.key },
      update: { label: item.label, type: item.type },
      create: item
    });
  }
  console.log('Master Data seeding complete!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

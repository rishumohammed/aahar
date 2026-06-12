import bcrypt from "bcryptjs";
import prisma from "../../src/lib/prisma.js";

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 10);

  // Users
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@aahar.in" },
    update: {},
    create: { email:"admin@aahar.in", passwordHash: await hash("Admin@123"), name:"AAHAR Admin", role:"super_admin", phone:"9876543210" }
  });

  const auditor = await prisma.user.upsert({
    where: { email: "auditor@aahar.in" },
    update: {},
    create: { email:"auditor@aahar.in", passwordHash: await hash("Audit@123"), name:"Rajan Pillai", role:"auditor", phone:"9876543211" }
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@spicegarden.in" },
    update: {},
    create: { email:"owner@spicegarden.in", passwordHash: await hash("Owner@123"), name:"Suresh Nair", role:"owner", phone:"9876543212" }
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@malabarretreat.in" },
    update: {},
    create: { email:"manager@malabarretreat.in", passwordHash: await hash("Manager@123"), name:"Priya Menon", role:"hotel_manager", phone:"9876543213" }
  });

  const consumer = await prisma.user.upsert({
    where: { email: "guest@gmail.com" },
    update: {},
    create: { email:"guest@gmail.com", passwordHash: await hash("Guest@123"), name:"Arjun Menon", role:"consumer", phone:"9876543214" }
  });

  // Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "spice-garden-kozhikode" },
    update: {},
    create: {
      name: "Spice Garden",
      slug: "spice-garden-kozhikode",
      ownerId: owner.id,
      description: "Authentic Kerala cuisine in the heart of Kozhikode",
      category: "fine_dining",
      cuisineType: ["South Indian", "Kerala"],
      dietary: "mixed",
      priceRange: "₹₹",
      address: "SM Street, Kozhikode",
      city: "Kozhikode",
      area: "SM Street",
      lat: 11.2588,
      lng: 75.7804,
      phone: "9876540001",
      openingHours: { monday:"11:00-23:00", tuesday:"11:00-23:00", wednesday:"11:00-23:00", thursday:"11:00-23:00", friday:"11:00-23:00", saturday:"11:00-23:00", sunday:"11:00-22:00" },
      amenities: { ac:true, wifi:true, parking:true, liveMusic:false, outdoorSeating:false, delivery:true, takeaway:true, dineIn:true, familyFriendly:true, accessible:false, washroom:true },
      isVerified: true,
      isFeatured: true,
    }
  });

  // Menu sections
  const section1 = await prisma.menuSection.create({
    data: { restaurantId: restaurant.id, name:"Starters", order:0,
      items: { create: [
        { name:"Prawn Koliwada", price:320, dietary:"non_veg", description:"Crispy fried prawns with coastal spices", isAvailable:true },
        { name:"Veg Cutlet", price:180, dietary:"veg", description:"Mixed vegetable cutlet pan fried", isAvailable:true },
        { name:"Chicken 65", price:280, dietary:"non_veg", description:"Spicy deep fried chicken", isAvailable:true },
      ]}
    }
  });

  const section2 = await prisma.menuSection.create({
    data: { restaurantId: restaurant.id, name:"Main Course", order:1,
      items: { create: [
        { name:"Kerala Fish Curry", price:420, dietary:"non_veg", description:"Traditional red fish curry with coconut", isAvailable:true },
        { name:"Chicken Biryani", price:380, dietary:"non_veg", description:"Aromatic Malabar biryani", isAvailable:true },
        { name:"Palak Paneer", price:290, dietary:"veg", description:"Spinach and cottage cheese gravy", isAvailable:true },
        { name:"Dal Tadka", price:220, dietary:"veg", description:"Yellow lentils with tempering", isAvailable:true },
      ]}
    }
  });

  // Hotel
  const hotel = await prisma.hotel.upsert({
    where: { slug: "malabar-retreat-kozhikode" },
    update: {},
    create: {
      name: "The Malabar Retreat",
      slug: "malabar-retreat-kozhikode",
      managerId: manager.id,
      description: "Luxury boutique resort with beach access in Kozhikode",
      propertyType: "resort",
      starRating: 4,
      address: "Beach Road, Kozhikode",
      city: "Kozhikode",
      area: "Beach Road",
      lat: 11.2484,
      lng: 75.7718,
      phone: "9876540002",
      checkInTime: "14:00",
      checkOutTime: "11:00",
      mealPlans: ["ep","cp","map"],
      amenities: { pool:true, spa:true, gym:true, beach:true, kidsClub:false, conference:true, restaurant:true, airportTransfer:true, parking:true, evCharging:false, wifi:true, petFriendly:false, accessible:true, smokingArea:false },
      isVerified: true,
      isFeatured: true,
    }
  });

  // Room types
  await prisma.roomType.createMany({ data: [
    { hotelId:hotel.id, name:"Deluxe Room", bedConfig:"1 King bed", maxOccupancy:2, priceFrom:4500, priceNote:"per night", view:"Pool view", isPopular:false, order:0 },
    { hotelId:hotel.id, name:"Sea-View Suite", bedConfig:"1 King bed", maxOccupancy:2, priceFrom:7800, priceNote:"per night including breakfast", view:"Sea view", isPopular:true, order:1 },
    { hotelId:hotel.id, name:"Family Villa", bedConfig:"2 Queen beds", maxOccupancy:4, priceFrom:11000, priceNote:"per night", view:"Garden view", isPopular:false, order:2 },
  ]});

  // --- Nilambur Additions ---
  const nilamburOwner = await prisma.user.upsert({
    where: { email: "owner@nilambur.in" },
    update: {},
    create: { email:"owner@nilambur.in", passwordHash: await hash("Owner@123"), name:"Karim Nilambur", role:"owner", phone:"9876543215" }
  });

  const nilamburRestaurant = await prisma.restaurant.upsert({
    where: { slug: "river-side-nilambur" },
    update: {},
    create: {
      name: "River Side Restaurant",
      slug: "river-side-nilambur",
      ownerId: nilamburOwner.id,
      description: "Scenic dining by the Chaliyar river in Nilambur",
      category: "casual_dining",
      cuisineType: ["Kerala", "Malabar"],
      dietary: "mixed",
      priceRange: "₹₹",
      address: "Main Road, Nilambur",
      city: "Nilambur",
      area: "River Side",
      lat: 11.2750,
      lng: 76.2250,
      phone: "9876540003",
      isVerified: false,
      isFeatured: false,
    }
  });

  const nilamburHotel = await prisma.hotel.upsert({
    where: { slug: "teak-town-resort-nilambur" },
    update: {},
    create: {
      name: "Teak Town Resort",
      slug: "teak-town-resort-nilambur",
      managerId: nilamburOwner.id,
      description: "Comfortable stay in the teak town of Nilambur",
      propertyType: "resort",
      starRating: 3,
      address: "Canoli Plot Road, Nilambur",
      city: "Nilambur",
      area: "Canoli Plot",
      lat: 11.2800,
      lng: 76.2300,
      phone: "9876540004",
      isVerified: false,
      isFeatured: false,
    }
  });

  await prisma.roomType.createMany({ data: [
    { hotelId:nilamburHotel.id, name:"Standard Room", bedConfig:"1 Queen bed", maxOccupancy:2, priceFrom:2500, priceNote:"per night", view:"Forest view", isPopular:true, order:0 },
  ]});

  // --- More Mock Additions ---
  const paragon = await prisma.restaurant.upsert({
    where: { slug: "paragon-kozhikode" },
    update: {},
    create: {
      name: "Paragon Restaurant",
      slug: "paragon-kozhikode",
      ownerId: owner.id,
      description: "Legendary Malabar cuisine, renowned for its authentic biryani and seafood.",
      category: "fine_dining",
      cuisineType: ["Malabar", "Seafood", "Indian"],
      dietary: "mixed",
      priceRange: "₹₹₹",
      address: "Kannur Road, Kozhikode",
      city: "Kozhikode",
      area: "CH Flyover",
      lat: 11.2588,
      lng: 75.7804,
      phone: "9876540005",
      isVerified: true,
      isFeatured: true,
      photos: { cover: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1000" }
    }
  });

  const paris = await prisma.restaurant.upsert({
    where: { slug: "paris-restaurant-thalassery" },
    update: {},
    create: {
      name: "Paris Restaurant",
      slug: "paris-restaurant-thalassery",
      ownerId: owner.id,
      description: "Home of the famous Thalassery Biryani. A culinary landmark.",
      category: "casual_dining",
      cuisineType: ["Kerala", "Biryani"],
      dietary: "mixed",
      priceRange: "₹₹",
      address: "Logan's Road, Thalassery",
      city: "Thalassery",
      area: "Town Center",
      phone: "9876540006",
      isVerified: true,
      isFeatured: true,
      photos: { cover: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1000" }
    }
  });

  const tajBekal = await prisma.hotel.upsert({
    where: { slug: "taj-bekal-resort-spa" },
    update: {},
    create: {
      name: "Taj Bekal Resort & Spa",
      slug: "taj-bekal-resort-spa",
      managerId: manager.id,
      description: "Luxurious resort inspired by Kettuvallam houseboats, nestled in the backwaters.",
      propertyType: "resort",
      starRating: 5,
      address: "Kappil Beach, Kasaragod",
      city: "Kasaragod",
      area: "Kappil Beach",
      phone: "9876540007",
      isVerified: true,
      isFeatured: true,
      photos: { cover: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000" }
    }
  });

  const vythiri = await prisma.hotel.upsert({
    where: { slug: "vythiri-village-wayanad" },
    update: {},
    create: {
      name: "Vythiri Village Resort",
      slug: "vythiri-village-wayanad",
      managerId: manager.id,
      description: "Nature resort set in the misty hills of Wayanad, offering a true wilderness experience.",
      propertyType: "resort",
      starRating: 5,
      address: "Vythiri, Wayanad",
      city: "Wayanad",
      area: "Vythiri",
      phone: "9876540008",
      isVerified: true,
      isFeatured: true,
      photos: { cover: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1000" }
    }
  });

  console.log("✅ Seed complete");
}

main().catch(console.error).finally(() => prisma.$disconnect());

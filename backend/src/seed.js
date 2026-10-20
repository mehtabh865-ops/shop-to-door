const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const config = require('./config/config');
const { User, Shop, Product } = require('./models');

async function seed() {
  console.log('Connecting to MongoDB Atlas for initial database seeding...');
  await mongoose.connect(config.mongoose.url, config.mongoose.options);

  // 1. Create or Find Dukandar User
  let dukandar = await User.findOne({ email: 'dukandar@shoptodoor.com' });
  if (!dukandar) {
    dukandar = await User.create({
      email: 'dukandar@shoptodoor.com',
      password: 'password123',
      name: 'Ramesh Gupta',
      role: 'dukandar',
      phoneNumber: '9820012345',
      shopName: 'Gupta Kirana & Daily Needs',
    });
    console.log('Created Demo Dukandar: dukandar@shoptodoor.com / password123');
  }

  // 2. Create or Find Customer User
  let customer = await User.findOne({ email: 'customer@shoptodoor.com' });
  if (!customer) {
    customer = await User.create({
      email: 'customer@shoptodoor.com',
      password: 'password123',
      name: 'Rahul Sharma',
      role: 'customer',
      phoneNumber: '9820054321',
    });
    console.log('Created Demo Customer: customer@shoptodoor.com / password123');
  }

  // 3. Create Dukandar Shop
  let shop1 = await Shop.findOne({ owner: dukandar._id });
  if (!shop1) {
    shop1 = await Shop.create({
      owner: dukandar._id,
      name: 'Gupta Kirana & Daily Needs',
      category: 'grocery',
      description: 'Fresh wheat, pulses, dairy, oils & all daily essentials at best prices',
      phone: '9820012345',
      address: {
        street: 'Shop 4, Market Complex',
        landmark: 'Near Central Park',
        city: 'Mumbai',
        pincode: '400001',
      },
      isOpen: true,
      deliveryRadiusKm: 5,
      minimumOrder: 50,
      rating: 4.9,
    });
    console.log('Created Shop 1: Gupta Kirana & Daily Needs');

    // Add Products for Shop 1
    await Product.create([
      {
        shop: shop1._id,
        owner: dukandar._id,
        name: 'Aashirvaad Shudh Chakki Atta',
        category: 'Flour & Grains',
        price: 245,
        mrp: 275,
        stock: 50,
        unit: 'kg',
        unitValue: '5',
        attributes: { brand: 'Aashirvaad', quality: '100% Whole Wheat' },
      },
      {
        shop: shop1._id,
        owner: dukandar._id,
        name: 'Amul Taaza Homogenised Toned Milk',
        category: 'Dairy',
        price: 66,
        mrp: 72,
        stock: 100,
        unit: 'liter',
        unitValue: '1',
        attributes: { brand: 'Amul' },
      },
      {
        shop: shop1._id,
        owner: dukandar._id,
        name: 'Amul Salted Pasteurized Butter',
        category: 'Dairy',
        price: 275,
        mrp: 290,
        stock: 40,
        unit: 'gm',
        unitValue: '500',
        attributes: { brand: 'Amul' },
      },
      {
        shop: shop1._id,
        owner: dukandar._id,
        name: 'Nescafe Classic Instant Coffee',
        category: 'Beverages',
        price: 330,
        mrp: 360,
        stock: 30,
        unit: 'gm',
        unitValue: '200',
        attributes: { brand: 'Nescafe' },
      },
    ]);
    console.log('Added 4 Products for Shop 1');
  }

  // 4. Create Shop 2 (Fresh Veggies)
  let dukandar2 = await User.findOne({ email: 'veggies@shoptodoor.com' });
  if (!dukandar2) {
    dukandar2 = await User.create({
      email: 'veggies@shoptodoor.com',
      password: 'password123',
      name: 'Kishan Lal',
      role: 'dukandar',
      phoneNumber: '9820098765',
      shopName: 'Kisan Fresh Sabzi Mandi',
    });
  }

  let shop2 = await Shop.findOne({ owner: dukandar2._id });
  if (!shop2) {
    shop2 = await Shop.create({
      owner: dukandar2._id,
      name: 'Kisan Fresh Sabzi & Fruit Mandi',
      category: 'fruits_vegetables',
      description: 'Daily fresh organic fruits and farm-picked green vegetables',
      phone: '9820098765',
      address: {
        street: 'Gate 2, Subzi Market',
        city: 'Mumbai',
        pincode: '400001',
      },
      isOpen: true,
      deliveryRadiusKm: 3,
      rating: 4.8,
    });

    await Product.create([
      {
        shop: shop2._id,
        owner: dukandar2._id,
        name: 'Fresh Farm Apples (Kinnaur)',
        category: 'Fruits',
        price: 160,
        mrp: 180,
        stock: 80,
        unit: 'kg',
        unitValue: '1',
      },
      {
        shop: shop2._id,
        owner: dukandar2._id,
        name: 'Hybrid Desi Tomatoes',
        category: 'Vegetables',
        price: 40,
        mrp: 50,
        stock: 120,
        unit: 'kg',
        unitValue: '1',
      },
      {
        shop: shop2._id,
        owner: dukandar2._id,
        name: 'Fresh Green Palak (Spinach)',
        category: 'Vegetables',
        price: 30,
        mrp: 35,
        stock: 50,
        unit: 'gm',
        unitValue: '250',
      },
    ]);
    console.log('Created Shop 2: Kisan Fresh Sabzi Mandi with 3 products');
  }

  // 5. Create Shop 3 (Pharmacy)
  let dukandar3 = await User.findOne({ email: 'pharmacy@shoptodoor.com' });
  if (!dukandar3) {
    dukandar3 = await User.create({
      email: 'pharmacy@shoptodoor.com',
      password: 'password123',
      name: 'Dr. Alok Verma',
      role: 'dukandar',
      phoneNumber: '9820067890',
      shopName: 'Sanjeevani Medicos & Healthcare',
    });
  }

  let shop3 = await Shop.findOne({ owner: dukandar3._id });
  if (!shop3) {
    shop3 = await Shop.create({
      owner: dukandar3._id,
      name: 'Sanjeevani Medicos & Healthcare',
      category: 'pharmacy',
      description: 'Prescription medicines, baby care, sanitizers & first aid essentials',
      phone: '9820067890',
      address: {
        street: 'Opposite City Hospital',
        city: 'Mumbai',
        pincode: '400001',
      },
      isOpen: true,
      deliveryRadiusKm: 6,
      rating: 5.0,
    });

    await Product.create([
      {
        shop: shop3._id,
        owner: dukandar3._id,
        name: 'Comprehensive Emergency First Aid Kit',
        category: 'First Aid',
        price: 450,
        mrp: 500,
        stock: 30,
        unit: 'box',
        unitValue: '1',
      },
      {
        shop: shop3._id,
        owner: dukandar3._id,
        name: 'Limcee Vitamin C Chewable 500mg',
        category: 'Supplements',
        price: 180,
        mrp: 205,
        stock: 90,
        unit: 'strip',
        unitValue: '15',
      },
    ]);
    console.log('Created Shop 3: Sanjeevani Medicos with 2 products');
  }

  await mongoose.disconnect();
  console.log('>>> DATABASE SEEDING COMPLETED SUCCESSFULLY! <<<');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

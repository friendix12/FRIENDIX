const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = 'amarbiswas8872@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Ensure existing user has admin flag and correct password if needed
      let updated = false;
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        updated = true;
      }
      if (updated) {
        await existingAdmin.save();
        console.log('✅ Admin user roles updated successfully.');
      } else {
        console.log('✅ Admin user already exists and configured.');
      }
      return;
    }

    // Create the admin user
    const hashedPassword = await bcrypt.hash('Sumi@1998', 12);
    await User.create({
      firstName: 'Amar',
      lastName: 'Biswas',
      fullName: 'Amar Biswas',
      email: adminEmail,
      password: hashedPassword,
      avatar: 'https://i.pravatar.cc/150?img=33',
      isAdmin: true,
      bio: 'Super Administrator of FRIENDIX',
      gender: 'Male'
    });

    console.log('🚀 Super Admin seeded successfully: amarbiswas8872@gmail.com');
  } catch (err) {
    console.error('❌ Error seeding admin user:', err.message);
  }
};

module.exports = seedAdmin;

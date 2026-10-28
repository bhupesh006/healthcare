const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');
const Shift = require('../models/Shift');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthplus').then(async () => {
  console.log('Seeding initial attendance data...');
  const staff = await Staff.find().populate('department');
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  // Clear existing attendance
  await Attendance.deleteMany({});

  const sampleStaff = staff.slice(0, 6);

  // 1. Arun - On Duty (Clocked in 07:55 AM, currently active)
  if (sampleStaff[0]) {
    const clockInToday = new Date(today);
    clockInToday.setHours(7, 55, 0, 0);
    await Attendance.create({
      staff: sampleStaff[0]._id,
      date: today,
      clockIn: clockInToday,
      status: 'ON_DUTY',
      location: 'ER Triage Terminal A',
      notes: 'Morning shift check-in on time'
    });
  }

  // 2. Priya - Completed shift yesterday, and clocked in Late today
  if (sampleStaff[1]) {
    const clockInToday = new Date(today);
    clockInToday.setHours(8, 25, 0, 0); // 25 mins late
    await Attendance.create({
      staff: sampleStaff[1]._id,
      date: today,
      clockIn: clockInToday,
      status: 'LATE',
      location: 'ER West Terminal',
      notes: 'Delayed due to traffic on highway'
    });
  }

  // 3. Kumar - Completed full day yesterday (8 hours) and today on duty
  if (sampleStaff[2]) {
    const clockInToday = new Date(today);
    clockInToday.setHours(8, 0, 0, 0);
    await Attendance.create({
      staff: sampleStaff[2]._id,
      date: today,
      clockIn: clockInToday,
      status: 'ON_DUTY',
      location: 'ER Station 2',
      notes: 'Scheduled 08:00 AM - 04:00 PM'
    });
  }

  // 4. Divya - Completed shift earlier today (Night shift ended 06:00 AM)
  if (sampleStaff[3]) {
    const clockInToday = new Date(today);
    clockInToday.setHours(0, 0, 0, 0);
    const clockOutToday = new Date(today);
    clockOutToday.setHours(6, 0, 0, 0);
    await Attendance.create({
      staff: sampleStaff[3]._id,
      date: today,
      clockIn: clockInToday,
      clockOut: clockOutToday,
      totalHours: 6.0,
      status: 'PRESENT',
      location: 'Main ICU Gate B',
      notes: 'Emergency Night relief coverage completed'
    });
  }

  // 5. Meena - Scheduled but marked Absent today
  if (sampleStaff[4]) {
    await Attendance.create({
      staff: sampleStaff[4]._id,
      date: today,
      status: 'ABSENT',
      location: 'Automated Attendance Rule',
      notes: 'Unexcused no-show for Morning Ward shift'
    });
  }

  // 6. Dr. Sarah - On Leave today
  if (sampleStaff[5]) {
    await Attendance.create({
      staff: sampleStaff[5]._id,
      date: today,
      status: 'LEAVE',
      notes: 'Approved Medical Conference Leave'
    });
  }

  console.log('Seeded 6 staff attendance records for today!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

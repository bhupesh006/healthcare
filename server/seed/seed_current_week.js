const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/healthplus').then(async () => {
  const staff = await mongoose.connection.collection('staffs').find().toArray();
  const depts = await mongoose.connection.collection('departments').find().toArray();

  const arun = staff.find(s => s.fullName === 'Arun') || staff[0];
  const priya = staff.find(s => s.fullName === 'Priya') || staff[1];
  const kumar = staff.find(s => s.fullName === 'Kumar') || staff[2];
  const divya = staff.find(s => s.fullName === 'Divya') || staff[3];
  const meena = staff.find(s => s.fullName === 'Meena') || staff[4];

  const erDept = depts.find(d => d.code === 'ER') || depts[0];
  const icuDept = depts.find(d => d.code === 'ICU') || depts[1];
  const gwDept = depts.find(d => d.code === 'GW') || depts[2];

  // Current Week: Oct 18 - Oct 24, 2026
  const weekShifts = [
    {
      date: new Date('2026-10-18T00:00:00.000Z'),
      startTime: '08:00 AM',
      endTime: '04:00 PM',
      department: erDept._id,
      shiftType: 'MORNING',
      requiredStaff: 2,
      assignedStaff: [arun._id, divya._id],
      status: 'PUBLISHED',
      requiredRoles: ['Nurse']
    },
    {
      date: new Date('2026-10-19T00:00:00.000Z'),
      startTime: '02:00 PM',
      endTime: '10:00 PM',
      department: icuDept._id,
      shiftType: 'AFTERNOON',
      requiredStaff: 2,
      assignedStaff: [arun._id, meena._id],
      status: 'PUBLISHED',
      requiredRoles: ['Nurse']
    },
    {
      date: new Date('2026-10-20T00:00:00.000Z'),
      startTime: '08:00 AM',
      endTime: '04:00 PM',
      department: gwDept._id,
      shiftType: 'MORNING',
      requiredStaff: 2,
      assignedStaff: [kumar._id, priya._id],
      status: 'PUBLISHED',
      requiredRoles: ['Nurse']
    },
    {
      date: new Date('2026-10-21T00:00:00.000Z'),
      startTime: '10:00 PM',
      endTime: '06:00 AM',
      department: erDept._id,
      shiftType: 'NIGHT',
      requiredStaff: 2,
      assignedStaff: [arun._id, kumar._id],
      status: 'PUBLISHED',
      requiredRoles: ['Nurse']
    },
    {
      date: new Date('2026-10-22T00:00:00.000Z'),
      startTime: '08:00 AM',
      endTime: '04:00 PM',
      department: icuDept._id,
      shiftType: 'MORNING',
      requiredStaff: 2,
      assignedStaff: [arun._id, priya._id],
      status: 'PUBLISHED',
      requiredRoles: ['Nurse']
    },
    {
      date: new Date('2026-10-23T00:00:00.000Z'),
      startTime: '02:00 PM',
      endTime: '10:00 PM',
      department: erDept._id,
      shiftType: 'AFTERNOON',
      requiredStaff: 2,
      assignedStaff: [arun._id, divya._id],
      status: 'PUBLISHED',
      requiredRoles: ['Nurse']
    },
    {
      date: new Date('2026-10-24T00:00:00.000Z'),
      startTime: '08:00 AM',
      endTime: '04:00 PM',
      department: erDept._id,
      shiftType: 'MORNING',
      requiredStaff: 2,
      assignedStaff: [meena._id, kumar._id],
      status: 'PUBLISHED',
      requiredRoles: ['Nurse']
    }
  ];

  for (const s of weekShifts) {
    // Check if shift already exists for this date and department
    const existing = await mongoose.connection.collection('shifts').findOne({
      date: s.date,
      shiftType: s.shiftType,
      department: s.department
    });

    if (!existing) {
      await mongoose.connection.collection('shifts').insertOne({
        ...s,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Inserted shift for:', s.date.toISOString(), s.shiftType);
    } else {
      await mongoose.connection.collection('shifts').updateOne(
        { _id: existing._id },
        { $set: { assignedStaff: s.assignedStaff, status: s.status, startTime: s.startTime, endTime: s.endTime } }
      );
      console.log('Updated existing shift for:', s.date.toISOString(), s.shiftType);
    }
  }

  console.log('Weekly shifts successfully populated!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

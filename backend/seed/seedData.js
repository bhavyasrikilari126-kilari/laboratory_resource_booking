const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');

dotenv.config();

const getFutureDate = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const seedData = async () => {
  try {
    await connectDB();

    const shouldReset = process.argv.includes('--reset');
    const existingUsers = await User.countDocuments();
    const existingResources = await Resource.countDocuments();

    if (!shouldReset && (existingUsers > 0 || existingResources > 0)) {
      console.log('Database already contains data. Run "npm run seed -- --reset" to reset and re-seed.');
      await mongoose.connection.close();
      process.exit(0);
    }

    if (shouldReset) {
      await Promise.all([
        Booking.deleteMany({}),
        Resource.deleteMany({}),
        User.deleteMany({})
      ]);
      console.log('Cleared existing collections.');
    }

    // Create sample users (admin, faculty, students)
    const users = await User.create([
      {
        name: 'Dr. Vikram Mehta',
        email: 'admin@labbook.edu',
        password: 'password123',
        role: 'admin',
        department: 'Central Laboratory Administration'
      },
      {
        name: 'Prof. Elena Rostova',
        email: 'faculty@labbook.edu',
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science & Engineering'
      },
      {
        name: 'Aarav Sharma',
        email: 'student@labbook.edu',
        password: 'password123',
        role: 'student',
        department: 'Electronics & Communication'
      },
      {
        name: 'Ananya Nair',
        email: 'ananya@labbook.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science & Engineering'
      }
    ]);

    const resources = await Resource.insertMany([
      {
        resourceName: 'NVIDIA DGX AI Workstation Cluster',
        category: 'Computer Systems',
        description: 'High-performance workstation equipped with dual RTX 4090 GPUs, 128GB ECC RAM, and CUDA toolkit for deep learning and computer vision experiments.',
        quantity: 4,
        location: 'Computing Block - Lab CS-204',
        availability: true
      },
      {
        resourceName: 'Dell OptiPlex CAD/Simulation Suite',
        category: 'Computer Systems',
        description: '32GB RAM i9 workstations pre-configured for finite element analysis, 3D modeling, and parallel computation labs.',
        quantity: 12,
        location: 'Engineering Wing - Lab IT-102',
        availability: true
      },
      {
        resourceName: 'Epson EB-PU1007B 4K Laser Projector',
        category: 'Projectors',
        description: '7000-lumen 4K laser WUXGA projector with HDMI/DisplayPort inputs and motorized lens shift for seminar presentations and lab demos.',
        quantity: 2,
        location: 'Main Auditorium & Seminar Lab B-01',
        availability: true
      },
      {
        resourceName: 'BenQ Short-Throw Interactive Lab Projector',
        category: 'Projectors',
        description: 'Ultra-short-throw classroom projector mounted with interactive digital whiteboard calibration for collaborative design reviews.',
        quantity: 1,
        location: 'Design Studio - Room D-105',
        availability: true
      },
      {
        resourceName: 'Keysight InfiniiVision 4-Channel Oscilloscope',
        category: 'Electronic Equipment',
        description: '200 MHz mixed-signal digital storage oscilloscope with 5 GSa/s sampling rate, protocol decoding, and integrated function generator.',
        quantity: 6,
        location: 'Electronics Block - Lab EC-301',
        availability: true
      },
      {
        resourceName: 'Rigol Programmable DC Power Supply & Soldering Station',
        category: 'Electronic Equipment',
        description: 'Triple-output precision DC power supply paired with Hakko ESD-safe temperature-controlled hot air & soldering workbench.',
        quantity: 8,
        location: 'Embedded Systems Lab - EC-304',
        availability: true
      },
      {
        resourceName: 'Cisco Catalyst Enterprise Routing Rack',
        category: 'Networking Devices',
        description: 'Full CCNA/CCNP networking training rack with 4 Cisco Catalyst Layer-3 switches, 3 ISR routers, and hardware firewall.',
        quantity: 2,
        location: 'Network Security Lab - NS-210',
        availability: true
      },
      {
        resourceName: 'Ubiquiti UniFi Wi-Fi 6E & Packet Capture Bench',
        category: 'Networking Devices',
        description: 'Wireless RF spectrum analyzer and enterprise Wi-Fi 6E access point cluster for wireless protocol and throughput testing.',
        quantity: 3,
        location: 'Network Security Lab - NS-212',
        availability: true
      },
      {
        resourceName: 'Olympus CX43 Trinocular Digital Microscope',
        category: 'Laboratory Instruments',
        description: 'Research-grade optical microscope with 4K CMOS imaging sensor and LED illumination for microbiology and material inspection.',
        quantity: 3,
        location: 'Bio-Materials Lab - SCI-118',
        availability: true
      },
      {
        resourceName: 'Shimadzu UV-1900i Spectrophotometer',
        category: 'Laboratory Instruments',
        description: 'Double-beam UV-Vis spectrophotometer with thermal cell holder for chemical kinetics and optical absorption characterization.',
        quantity: 1,
        location: 'Analytical Chemistry Lab - SCI-122',
        availability: false
      },
      {
        resourceName: 'MATLAB & Simulink Campus Floating License',
        category: 'Software Resources',
        description: 'Dedicated high-compute floating license node including Signal Processing, Control System, and Deep Learning Toolboxes.',
        quantity: 25,
        location: 'Virtual License Server / CS-201',
        availability: true
      },
      {
        resourceName: 'ANSYS Multiphysics & SolidWorks Lab Seat',
        category: 'Software Resources',
        description: 'Licensed CFD, thermal, and structural simulation software seats accessible from engineering workstation terminals.',
        quantity: 15,
        location: 'CAD/CAM Center - ME-108',
        availability: true
      },
      {
        resourceName: 'Prusa MK4 3D Printer & Filament Enclosure',
        category: 'Other Equipment',
        description: 'Precision FDM 3D printer supporting PLA, PETG, and ABS prototyping with automated bed leveling and air filtration.',
        quantity: 2,
        location: 'Maker & Robotics Lab - ME-015',
        availability: true
      },
      {
        resourceName: 'DJI Matrice Sensor Calibration Rig',
        category: 'Other Equipment',
        description: 'Indoor autonomous drone calibration frame and optical motion-capture safety cage (currently undergoing maintenance).',
        quantity: 1,
        location: 'Autonomous Systems Bay - AS-004',
        availability: false
      }
    ]);

    const [, faculty, student1, student2] = users;

    await Booking.insertMany([
      {
        userId: student1._id,
        resourceId: resources[4]._id,
        bookingDate: getFutureDate(1),
        startTime: '10:00',
        endTime: '12:00',
        purpose: 'UART and SPI bus signal debugging for IoT sensor node project',
        status: 'Approved'
      },
      {
        userId: student1._id,
        resourceId: resources[0]._id,
        bookingDate: getFutureDate(2),
        startTime: '14:00',
        endTime: '16:30',
        purpose: 'Training YOLOv8 object detection model on laboratory PCB defect dataset',
        status: 'Pending'
      },
      {
        userId: faculty._id,
        resourceId: resources[2]._id,
        bookingDate: getFutureDate(3),
        startTime: '09:30',
        endTime: '11:30',
        purpose: 'Departmental capstone demonstration and faculty evaluation panel',
        status: 'Approved'
      },
      {
        userId: student2._id,
        resourceId: resources[6]._id,
        bookingDate: getFutureDate(1),
        startTime: '13:00',
        endTime: '15:00',
        purpose: 'OSPF multi-area routing and VLAN trunking lab assignment',
        status: 'Pending'
      },
      {
        userId: student2._id,
        resourceId: resources[10]._id,
        bookingDate: getFutureDate(0),
        startTime: '16:00',
        endTime: '18:00',
        purpose: 'Control system PID tuning simulation in Simulink',
        status: 'Completed'
      },
      {
        userId: student1._id,
        resourceId: resources[12]._id,
        bookingDate: getFutureDate(-2),
        startTime: '11:00',
        endTime: '13:00',
        purpose: '3D printed enclosure prototype for microcontroller unit',
        status: 'Completed'
      },
      {
        userId: student1._id,
        resourceId: resources[9]._id,
        bookingDate: getFutureDate(4),
        startTime: '10:00',
        endTime: '11:00',
        purpose: 'Optical transmittance testing (cancelled for maintenance)',
        status: 'Rejected'
      },
      {
        userId: faculty._id,
        resourceId: resources[8]._id,
        bookingDate: getFutureDate(5),
        startTime: '15:00',
        endTime: '17:00',
        purpose: 'Surface solder joint micro-inspection for research paper',
        status: 'Cancelled'
      }
    ]);

    console.log('Seed completed successfully!');
    console.log('Demo Accounts (Password for all: password123):');
    console.log('  Admin:   admin@labbook.edu');
    console.log('  Faculty: faculty@labbook.edu');
    console.log('  Student: student@labbook.edu');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper types for course data
type TeeData = {
  name: string;
  color: string;
  rating: number;
  slope: number;
  holes: { yards: number; handicapRank: number }[];
};

type CourseData = {
  name: string;
  location: string;
  tees: TeeData[];
  holes: { number: number; par: number }[];
};

async function createCourse(courseData: CourseData, createdBy: string) {
  // Create course with holes (without yardage/handicap)
  const course = await prisma.course.create({
    data: {
      name: courseData.name,
      location: courseData.location,
      createdBy,
      holes: {
        create: courseData.holes,
      },
    },
    include: {
      holes: { orderBy: { number: 'asc' } },
    },
  });

  // Create tees with their hole-specific data
  for (const teeData of courseData.tees) {
    const tee = await prisma.tee.create({
      data: {
        courseId: course.id,
        name: teeData.name,
        color: teeData.color,
        rating: teeData.rating,
        slope: teeData.slope,
      },
    });

    // Create TeeHole records for each hole from this tee
    await prisma.teeHole.createMany({
      data: teeData.holes.map((holeData, index) => ({
        teeId: tee.id,
        holeId: course.holes[index].id,
        yards: holeData.yards,
        handicapRank: holeData.handicapRank,
      })),
    });
  }

  return course;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@golf.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@golf.com',
      isAdmin: true,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create additional users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'tiger@golf.com' },
      update: {},
      create: { name: 'Tiger Woods', email: 'tiger@golf.com', isAdmin: false },
    }),
    prisma.user.upsert({
      where: { email: 'phil@golf.com' },
      update: {},
      create: { name: 'Phil Mickelson', email: 'phil@golf.com', isAdmin: false },
    }),
    prisma.user.upsert({
      where: { email: 'rory@golf.com' },
      update: {},
      create: { name: 'Rory McIlroy', email: 'rory@golf.com', isAdmin: false },
    }),
  ]);

  console.log('✅ Created', users.length, 'additional users');

  // Define hole pars (same for all courses)
  const standardHoles = [
    { number: 1, par: 4 },
    { number: 2, par: 5 },
    { number: 3, par: 4 },
    { number: 4, par: 3 },
    { number: 5, par: 4 },
    { number: 6, par: 3 },
    { number: 7, par: 4 },
    { number: 8, par: 5 },
    { number: 9, par: 4 },
    { number: 10, par: 4 },
    { number: 11, par: 4 },
    { number: 12, par: 3 },
    { number: 13, par: 5 },
    { number: 14, par: 4 },
    { number: 15, par: 5 },
    { number: 16, par: 3 },
    { number: 17, par: 4 },
    { number: 18, par: 4 },
  ];

  // 1. Augusta National Golf Club
  const augusta = await createCourse(
    {
      name: 'Augusta National Golf Club',
      location: 'Augusta, Georgia',
      holes: standardHoles,
      tees: [
        {
          name: 'Masters',
          color: 'Green',
          rating: 76.5,
          slope: 155,
          holes: [
            { yards: 445, handicapRank: 7 },
            { yards: 575, handicapRank: 15 },
            { yards: 350, handicapRank: 11 },
            { yards: 240, handicapRank: 9 },
            { yards: 495, handicapRank: 1 },
            { yards: 180, handicapRank: 17 },
            { yards: 450, handicapRank: 3 },
            { yards: 570, handicapRank: 13 },
            { yards: 460, handicapRank: 5 },
            { yards: 495, handicapRank: 10 },
            { yards: 520, handicapRank: 8 },
            { yards: 155, handicapRank: 16 },
            { yards: 510, handicapRank: 2 },
            { yards: 440, handicapRank: 12 },
            { yards: 550, handicapRank: 14 },
            { yards: 170, handicapRank: 18 },
            { yards: 440, handicapRank: 4 },
            { yards: 465, handicapRank: 6 },
          ],
        },
        {
          name: 'Championship',
          color: 'Blue',
          rating: 74.7,
          slope: 148,
          holes: [
            { yards: 420, handicapRank: 7 },
            { yards: 550, handicapRank: 15 },
            { yards: 330, handicapRank: 11 },
            { yards: 220, handicapRank: 9 },
            { yards: 470, handicapRank: 1 },
            { yards: 165, handicapRank: 17 },
            { yards: 425, handicapRank: 3 },
            { yards: 545, handicapRank: 13 },
            { yards: 440, handicapRank: 5 },
            { yards: 475, handicapRank: 10 },
            { yards: 500, handicapRank: 8 },
            { yards: 145, handicapRank: 16 },
            { yards: 485, handicapRank: 2 },
            { yards: 420, handicapRank: 12 },
            { yards: 525, handicapRank: 14 },
            { yards: 155, handicapRank: 18 },
            { yards: 420, handicapRank: 4 },
            { yards: 445, handicapRank: 6 },
          ],
        },
        {
          name: 'Members',
          color: 'White',
          rating: 72.3,
          slope: 137,
          holes: [
            { yards: 370, handicapRank: 7 },
            { yards: 520, handicapRank: 15 },
            { yards: 310, handicapRank: 11 },
            { yards: 195, handicapRank: 9 },
            { yards: 435, handicapRank: 1 },
            { yards: 150, handicapRank: 17 },
            { yards: 390, handicapRank: 3 },
            { yards: 520, handicapRank: 13 },
            { yards: 410, handicapRank: 5 },
            { yards: 445, handicapRank: 10 },
            { yards: 470, handicapRank: 8 },
            { yards: 135, handicapRank: 16 },
            { yards: 460, handicapRank: 2 },
            { yards: 390, handicapRank: 12 },
            { yards: 495, handicapRank: 14 },
            { yards: 145, handicapRank: 18 },
            { yards: 390, handicapRank: 4 },
            { yards: 420, handicapRank: 6 },
          ],
        },
      ],
    },
    admin.id
  );

  // 2. Pebble Beach Golf Links
  const pebbleBeach = await createCourse(
    {
      name: 'Pebble Beach Golf Links',
      location: 'Pebble Beach, California',
      holes: standardHoles,
      tees: [
        {
          name: 'Tournament',
          color: 'Black',
          rating: 75.5,
          slope: 145,
          holes: [
            { yards: 380, handicapRank: 13 },
            { yards: 505, handicapRank: 9 },
            { yards: 390, handicapRank: 15 },
            { yards: 190, handicapRank: 17 },
            { yards: 188, handicapRank: 11 },
            { yards: 525, handicapRank: 3 },
            { yards: 110, handicapRank: 18 },
            { yards: 432, handicapRank: 5 },
            { yards: 466, handicapRank: 1 },
            { yards: 447, handicapRank: 7 },
            { yards: 209, handicapRank: 16 },
            { yards: 202, handicapRank: 14 },
            { yards: 445, handicapRank: 4 },
            { yards: 580, handicapRank: 2 },
            { yards: 397, handicapRank: 10 },
            { yards: 402, handicapRank: 6 },
            { yards: 178, handicapRank: 12 },
            { yards: 543, handicapRank: 8 },
          ],
        },
        {
          name: 'Championship',
          color: 'Blue',
          rating: 73.4,
          slope: 142,
          holes: [
            { yards: 360, handicapRank: 13 },
            { yards: 485, handicapRank: 9 },
            { yards: 370, handicapRank: 15 },
            { yards: 175, handicapRank: 17 },
            { yards: 173, handicapRank: 11 },
            { yards: 505, handicapRank: 3 },
            { yards: 100, handicapRank: 18 },
            { yards: 412, handicapRank: 5 },
            { yards: 446, handicapRank: 1 },
            { yards: 427, handicapRank: 7 },
            { yards: 194, handicapRank: 16 },
            { yards: 187, handicapRank: 14 },
            { yards: 425, handicapRank: 4 },
            { yards: 560, handicapRank: 2 },
            { yards: 377, handicapRank: 10 },
            { yards: 382, handicapRank: 6 },
            { yards: 163, handicapRank: 12 },
            { yards: 523, handicapRank: 8 },
          ],
        },
      ],
    },
    admin.id
  );

  // 3. Pine Valley Golf Club
  const pineValley = await createCourse(
    {
      name: 'Pine Valley Golf Club',
      location: 'Clementon, New Jersey',
      holes: standardHoles,
      tees: [
        {
          name: 'Championship',
          color: 'Black',
          rating: 76.3,
          slope: 155,
          holes: [
            { yards: 427, handicapRank: 9 },
            { yards: 599, handicapRank: 1 },
            { yards: 185, handicapRank: 15 },
            { yards: 461, handicapRank: 3 },
            { yards: 232, handicapRank: 13 },
            { yards: 391, handicapRank: 11 },
            { yards: 585, handicapRank: 7 },
            { yards: 327, handicapRank: 17 },
            { yards: 459, handicapRank: 5 },
            { yards: 145, handicapRank: 18 },
            { yards: 399, handicapRank: 10 },
            { yards: 382, handicapRank: 12 },
            { yards: 449, handicapRank: 4 },
            { yards: 185, handicapRank: 16 },
            { yards: 603, handicapRank: 2 },
            { yards: 228, handicapRank: 14 },
            { yards: 344, handicapRank: 8 },
            { yards: 428, handicapRank: 6 },
          ],
        },
        {
          name: 'Members',
          color: 'White',
          rating: 73.9,
          slope: 145,
          holes: [
            { yards: 397, handicapRank: 9 },
            { yards: 559, handicapRank: 1 },
            { yards: 165, handicapRank: 15 },
            { yards: 431, handicapRank: 3 },
            { yards: 212, handicapRank: 13 },
            { yards: 361, handicapRank: 11 },
            { yards: 555, handicapRank: 7 },
            { yards: 307, handicapRank: 17 },
            { yards: 429, handicapRank: 5 },
            { yards: 135, handicapRank: 18 },
            { yards: 369, handicapRank: 10 },
            { yards: 352, handicapRank: 12 },
            { yards: 419, handicapRank: 4 },
            { yards: 165, handicapRank: 16 },
            { yards: 573, handicapRank: 2 },
            { yards: 208, handicapRank: 14 },
            { yards: 324, handicapRank: 8 },
            { yards: 398, handicapRank: 6 },
          ],
        },
      ],
    },
    admin.id
  );

  console.log('✅ Created 3 famous golf courses');

  // Create communities
  await prisma.community.create({
    data: {
      name: 'LRB Golf Club',
      description: 'Long Range Bomber annual golf trip community',
      isActive: true,
      createdBy: admin.id,
      members: {
        connect: [{ id: admin.id }, { id: users[0].id }, { id: users[1].id }, { id: users[2].id }],
      },
    },
  });

  await prisma.community.create({
    data: {
      name: 'East Coast Golf Society',
      description: 'Elite golfers playing the best courses on the East Coast',
      isActive: true,
      createdBy: admin.id,
      members: {
        connect: [{ id: admin.id }, { id: users[0].id }],
      },
    },
  });

  console.log('✅ Created communities');

  // Trip 1: Masters Weekend 2026
  const mastersTrip = await prisma.trip.create({
    data: {
      name: 'Masters Weekend 2026',
      code: 'MSTR26',
      startDate: new Date('2026-04-09'),
      endDate: new Date('2026-04-12'),
      buyInAmount: 500,
      numberOfRounds: 4,
      purseTotal: 2000,
      isActive: true,
      createdBy: admin.id,
      courses: {
        connect: [{ id: augusta.id }],
      },
      players: {
        create: [
          { name: 'Tiger Woods', handicap: 0.5, buyIn: 500 },
          { name: 'Phil Mickelson', handicap: 2.1, buyIn: 500 },
          { name: 'Rory McIlroy', handicap: 1.3, buyIn: 500 },
          { name: 'Jordan Spieth', handicap: 1.8, buyIn: 500 },
        ],
      },
      prizes: {
        create: [
          { name: 'Low Net Round 1', type: 'BEST_NET_ROUND', roundNumber: 1, amount: 200 },
          { name: 'Low Net Round 2', type: 'BEST_NET_ROUND', roundNumber: 2, amount: 200 },
          { name: 'CTP Hole 16', type: 'CLOSEST_TO_PIN', ctpHole: 16, amount: 100 },
          { name: 'Overall Low Net', type: 'BEST_CUMULATIVE_NET', amount: 1500 },
        ],
      },
    },
  });

  const mastersPlayers = await prisma.tripPlayer.findMany({ where: { tripId: mastersTrip.id } });

  // Trip 2: Pebble Beach Pro-Am Experience
  const pebbleTrip = await prisma.trip.create({
    data: {
      name: 'Pebble Beach Pro-Am Experience',
      code: 'PEBB26',
      startDate: new Date('2026-06-15'),
      endDate: new Date('2026-06-18'),
      buyInAmount: 750,
      numberOfRounds: 3,
      purseTotal: 3000,
      isActive: true,
      createdBy: admin.id,
      courses: {
        connect: [{ id: pebbleBeach.id }],
      },
      players: {
        create: [
          { name: 'Brooks Koepka', handicap: 0.8, buyIn: 750 },
          { name: 'Dustin Johnson', handicap: 1.2, buyIn: 750 },
          { name: 'Justin Thomas', handicap: 1.5, buyIn: 750 },
          { name: 'Collin Morikawa', handicap: 0.9, buyIn: 750 },
        ],
      },
      prizes: {
        create: [
          { name: 'CTP Hole 7', type: 'CLOSEST_TO_PIN', ctpHole: 7, amount: 300 },
          { name: 'Best Round', type: 'BEST_NET_ROUND', roundNumber: 1, amount: 700 },
          { name: 'Overall Champion', type: 'BEST_CUMULATIVE_NET', amount: 2000 },
        ],
      },
    },
  });

  const pebblePlayers = await prisma.tripPlayer.findMany({ where: { tripId: pebbleTrip.id } });

  // Trip 3: Pine Valley Challenge
  const pineValleyTrip = await prisma.trip.create({
    data: {
      name: 'Pine Valley Challenge',
      code: 'PINE26',
      startDate: new Date('2026-08-20'),
      endDate: new Date('2026-08-22'),
      buyInAmount: 400,
      numberOfRounds: 2,
      purseTotal: 1600,
      isActive: true,
      createdBy: admin.id,
      courses: {
        connect: [{ id: pineValley.id }],
      },
      players: {
        create: [
          { name: 'Scottie Scheffler', handicap: 1.1, buyIn: 400 },
          { name: 'Viktor Hovland', handicap: 1.4, buyIn: 400 },
          { name: 'Xander Schauffele', handicap: 1.0, buyIn: 400 },
          { name: 'Patrick Cantlay', handicap: 1.6, buyIn: 400 },
        ],
      },
      prizes: {
        create: [
          { name: 'Low Net Day 1', type: 'BEST_NET_ROUND', roundNumber: 1, amount: 400 },
          { name: 'Low Net Day 2', type: 'BEST_NET_ROUND', roundNumber: 2, amount: 400 },
          { name: 'Champion', type: 'BEST_CUMULATIVE_NET', amount: 800 },
        ],
      },
    },
  });

  const pineValleyPlayers = await prisma.tripPlayer.findMany({ where: { tripId: pineValleyTrip.id } });

  console.log('✅ Created 3 trips with players');

  // Create games for Masters Trip
  const mastersBestBall = await prisma.game.create({
    data: {
      tripId: mastersTrip.id,
      name: 'Masters Best Ball',
      format: 'BEST_BALL',
      playType: 'STROKE_PLAY',
      scoringType: 'NET',
      buyInAmount: 50,
      purseTotal: 200,
      teams: {
        create: [
          { name: 'Team Tiger & Phil', playerIds: [mastersPlayers[0].id, mastersPlayers[1].id] },
          { name: 'Team Rory & Jordan', playerIds: [mastersPlayers[2].id, mastersPlayers[3].id] },
        ],
      },
    },
    include: { teams: true },
  });

  await prisma.match.create({
    data: {
      gameId: mastersBestBall.id,
      roundNumber: 1,
      isTeamMatch: true,
      team1Id: mastersBestBall.teams[0].id,
      team2Id: mastersBestBall.teams[1].id,
      status: 'PENDING',
    },
  });

  const mastersMatchPlay = await prisma.game.create({
    data: {
      tripId: mastersTrip.id,
      name: 'Head-to-Head Match Play',
      format: 'COMBINED_SCORE',
      playType: 'MATCH_PLAY',
      scoringType: 'BOTH',
      buyInAmount: 25,
      purseTotal: 100,
    },
  });

  await prisma.match.createMany({
    data: [
      {
        gameId: mastersMatchPlay.id,
        roundNumber: 1,
        isTeamMatch: false,
        player1Id: mastersPlayers[0].id,
        player2Id: mastersPlayers[1].id,
        status: 'PENDING',
      },
      {
        gameId: mastersMatchPlay.id,
        roundNumber: 1,
        isTeamMatch: false,
        player1Id: mastersPlayers[2].id,
        player2Id: mastersPlayers[3].id,
        status: 'PENDING',
      },
    ],
  });

  await prisma.game.create({
    data: {
      tripId: mastersTrip.id,
      name: 'Daily Skins',
      format: 'SKINS',
      playType: 'STROKE_PLAY',
      scoringType: 'NET',
      roundNumber: 1,
      buyInAmount: 20,
      purseTotal: 80,
    },
  });

  // Create games for Pebble Beach Trip
  const pebbleScramble = await prisma.game.create({
    data: {
      tripId: pebbleTrip.id,
      name: 'Pebble Scramble',
      format: 'SCRAMBLE',
      playType: 'STROKE_PLAY',
      scoringType: 'GROSS',
      buyInAmount: 75,
      purseTotal: 300,
      teams: {
        create: [
          { name: 'Team Brooks & Dustin', playerIds: [pebblePlayers[0].id, pebblePlayers[1].id] },
          { name: 'Team Justin & Collin', playerIds: [pebblePlayers[2].id, pebblePlayers[3].id] },
        ],
      },
    },
    include: { teams: true },
  });

  await prisma.match.create({
    data: {
      gameId: pebbleScramble.id,
      roundNumber: 1,
      isTeamMatch: true,
      team1Id: pebbleScramble.teams[0].id,
      team2Id: pebbleScramble.teams[1].id,
      status: 'PENDING',
    },
  });

  await prisma.game.create({
    data: {
      tripId: pebbleTrip.id,
      name: 'Pebble Nassau',
      format: 'NASSAU',
      playType: 'MATCH_PLAY',
      scoringType: 'NET',
      buyInAmount: 50,
      purseTotal: 200,
    },
  });

  // Create games for Pine Valley Trip
  const pineValleyHighLow = await prisma.game.create({
    data: {
      tripId: pineValleyTrip.id,
      name: 'High-Low Challenge',
      format: 'HIGH_LOW',
      playType: 'STROKE_PLAY',
      scoringType: 'NET',
      buyInAmount: 40,
      purseTotal: 160,
      teams: {
        create: [
          { name: 'Team Scottie & Viktor', playerIds: [pineValleyPlayers[0].id, pineValleyPlayers[1].id] },
          { name: 'Team Xander & Patrick', playerIds: [pineValleyPlayers[2].id, pineValleyPlayers[3].id] },
        ],
      },
    },
    include: { teams: true },
  });

  await prisma.match.create({
    data: {
      gameId: pineValleyHighLow.id,
      roundNumber: 1,
      isTeamMatch: true,
      team1Id: pineValleyHighLow.teams[0].id,
      team2Id: pineValleyHighLow.teams[1].id,
      status: 'PENDING',
    },
  });

  await prisma.game.create({
    data: {
      tripId: pineValleyTrip.id,
      name: 'Moneyball',
      format: 'MONEYBALL',
      playType: 'STROKE_PLAY',
      scoringType: 'BOTH',
      buyInAmount: 30,
      purseTotal: 120,
    },
  });

  console.log('✅ Created games and matches for all trips');

  console.log('🎉 Seeding completed!');
  console.log('\n📊 Summary:');
  console.log('  - 3 famous golf courses (Augusta, Pebble Beach, Pine Valley)');
  console.log('  - Multiple tee boxes per course with hole-specific yardages and handicap ranks');
  console.log('  - 4 users (1 admin + 3 members)');
  console.log('  - 2 communities');
  console.log('  - 3 trips with 4 players each');
  console.log('  - 8 different games with various formats');
  console.log('  - Multiple matches and teams');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

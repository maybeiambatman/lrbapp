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
      ],
    },
    admin.id
  );

  console.log('✅ Created 2 famous golf courses');

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

  console.log('✅ Created communities');

  // Trip 1: Masters Weekend 2026
  const mastersTrip = await prisma.trip.create({
    data: {
      name: 'Masters Weekend 2026',
      code: 'MSTR26',
      startDate: new Date('2026-04-09'),
      endDate: new Date('2026-04-12'),
      buyInAmount: 500,
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
    },
  });

  const mastersPlayers = await prisma.tripPlayer.findMany({ where: { tripId: mastersTrip.id } });

  // Create Tee Time 1 for Day 1 with 4 rounds (one per player)
  const teeTime1 = await prisma.teeTime.create({
    data: {
      tripId: mastersTrip.id,
      time: new Date('2026-04-09T08:00:00'),
      rounds: {
        create: [
          {
            tripId: mastersTrip.id,
            courseId: augusta.id,
            playerId: mastersPlayers[0].id,
            date: new Date('2026-04-09'),
            roundNumber: 1,
            createdBy: admin.id,
          },
          {
            tripId: mastersTrip.id,
            courseId: augusta.id,
            playerId: mastersPlayers[1].id,
            date: new Date('2026-04-09'),
            roundNumber: 1,
            createdBy: admin.id,
          },
          {
            tripId: mastersTrip.id,
            courseId: augusta.id,
            playerId: mastersPlayers[2].id,
            date: new Date('2026-04-09'),
            roundNumber: 1,
            createdBy: admin.id,
          },
          {
            tripId: mastersTrip.id,
            courseId: augusta.id,
            playerId: mastersPlayers[3].id,
            date: new Date('2026-04-09'),
            roundNumber: 1,
            createdBy: admin.id,
          },
        ],
      },
    },
    include: {
      rounds: true,
    },
  });

  // Create prizes for Day 1
  await prisma.prize.createMany({
    data: [
      { roundId: teeTime1.rounds[0].id, name: 'Low Net Round 1', type: 'BEST_NET_ROUND', amount: 200 },
      { roundId: teeTime1.rounds[0].id, name: 'CTP Hole 12', type: 'CLOSEST_TO_PIN', ctpHole: 12, amount: 100 },
    ],
  });

  // Create Tee Time 2 for Day 2
  const teeTime2 = await prisma.teeTime.create({
    data: {
      tripId: mastersTrip.id,
      time: new Date('2026-04-10T08:30:00'),
      rounds: {
        create: [
          {
            tripId: mastersTrip.id,
            courseId: augusta.id,
            playerId: mastersPlayers[0].id,
            date: new Date('2026-04-10'),
            roundNumber: 2,
            createdBy: admin.id,
          },
          {
            tripId: mastersTrip.id,
            courseId: augusta.id,
            playerId: mastersPlayers[1].id,
            date: new Date('2026-04-10'),
            roundNumber: 2,
            createdBy: admin.id,
          },
          {
            tripId: mastersTrip.id,
            courseId: augusta.id,
            playerId: mastersPlayers[2].id,
            date: new Date('2026-04-10'),
            roundNumber: 2,
            createdBy: admin.id,
          },
          {
            tripId: mastersTrip.id,
            courseId: augusta.id,
            playerId: mastersPlayers[3].id,
            date: new Date('2026-04-10'),
            roundNumber: 2,
            createdBy: admin.id,
          },
        ],
      },
    },
    include: {
      rounds: true,
    },
  });

  console.log('✅ Created trip with 2 tee times (8 total rounds - 4 players x 2 days)');

  // Scenario 1: Team game (Best Ball) within a single tee time - 2v2 across 4 rounds
  const day1BestBall = await prisma.game.create({
    data: {
      name: 'Best Ball Day 1',
      format: 'BEST_BALL',
      playType: 'STROKE_PLAY',
      scoringType: 'NET',
      buyInAmount: 50,
      isTeamGame: true,
      status: 'PENDING',
      teams: {
        create: [
          { name: 'Team Tiger & Phil', playerIds: [mastersPlayers[0].id, mastersPlayers[1].id] },
          { name: 'Team Rory & Jordan', playerIds: [mastersPlayers[2].id, mastersPlayers[3].id] },
        ],
      },
      rounds: {
        create: teeTime1.rounds.map(round => ({ roundId: round.id })),
      },
    },
    include: { teams: true },
  });

  // Set team1Id and team2Id for the game
  await prisma.game.update({
    where: { id: day1BestBall.id },
    data: {
      team1Id: day1BestBall.teams[0].id,
      team2Id: day1BestBall.teams[1].id,
    },
  });

  // Scenario 2: Multiple individual games within one tee time - two 1v1 games
  // Game 1: Tiger vs Phil (using their rounds from teeTime1)
  const game1TigerVsPhil = await prisma.game.create({
    data: {
      name: '1v1: Tiger vs Phil',
      format: 'COMBINED_SCORE',
      playType: 'MATCH_PLAY',
      scoringType: 'NET',
      buyInAmount: 20,
      isTeamGame: true, // Use single-player teams for consistency
      status: 'PENDING',
      teams: {
        create: [
          { name: 'Tiger', playerIds: [mastersPlayers[0].id] },
          { name: 'Phil', playerIds: [mastersPlayers[1].id] },
        ],
      },
      rounds: {
        create: [
          { roundId: teeTime1.rounds[0].id }, // Tiger's round
          { roundId: teeTime1.rounds[1].id }, // Phil's round
        ],
      },
    },
    include: { teams: true },
  });

  await prisma.game.update({
    where: { id: game1TigerVsPhil.id },
    data: {
      team1Id: game1TigerVsPhil.teams[0].id,
      team2Id: game1TigerVsPhil.teams[1].id,
    },
  });

  // Game 2: Rory vs Jordan (using their rounds from teeTime1)
  const game2RoryVsJordan = await prisma.game.create({
    data: {
      name: '1v1: Rory vs Jordan',
      format: 'COMBINED_SCORE',
      playType: 'MATCH_PLAY',
      scoringType: 'NET',
      buyInAmount: 20,
      isTeamGame: true,
      status: 'PENDING',
      teams: {
        create: [
          { name: 'Rory', playerIds: [mastersPlayers[2].id] },
          { name: 'Jordan', playerIds: [mastersPlayers[3].id] },
        ],
      },
      rounds: {
        create: [
          { roundId: teeTime1.rounds[2].id }, // Rory's round
          { roundId: teeTime1.rounds[3].id }, // Jordan's round
        ],
      },
    },
    include: { teams: true },
  });

  await prisma.game.update({
    where: { id: game2RoryVsJordan.id },
    data: {
      team1Id: game2RoryVsJordan.teams[0].id,
      team2Id: game2RoryVsJordan.teams[1].id,
    },
  });

  // Scenario 3: Skins game across all 4 players in Day 1
  await prisma.game.create({
    data: {
      name: 'Skins Day 1',
      format: 'SKINS',
      playType: 'STROKE_PLAY',
      scoringType: 'NET',
      buyInAmount: 10,
      isTeamGame: false,
      status: 'PENDING',
      rounds: {
        create: teeTime1.rounds.map(round => ({ roundId: round.id })),
      },
    },
  });

  // Scenario 4: Multi-tee time game - combine Day 1 and Day 2 rounds for a cumulative competition
  await prisma.game.create({
    data: {
      name: '2-Day Cumulative Best Ball',
      format: 'BEST_BALL',
      playType: 'STROKE_PLAY',
      scoringType: 'NET',
      buyInAmount: 100,
      isTeamGame: true,
      status: 'PENDING',
      teams: {
        create: [
          { name: 'Team Tiger & Phil (2-Day)', playerIds: [mastersPlayers[0].id, mastersPlayers[1].id] },
          { name: 'Team Rory & Jordan (2-Day)', playerIds: [mastersPlayers[2].id, mastersPlayers[3].id] },
        ],
      },
      rounds: {
        create: [
          ...teeTime1.rounds.map(round => ({ roundId: round.id })),
          ...teeTime2.rounds.map(round => ({ roundId: round.id })),
        ],
      },
    },
  });

  // Create ad-hoc tee time (not part of any trip)
  await prisma.teeTime.create({
    data: {
      time: new Date('2026-05-15T09:00:00'),
      rounds: {
        create: [
          {
            courseId: pebbleBeach.id,
            playerId: mastersPlayers[0].id,
            date: new Date('2026-05-15'),
            createdBy: admin.id,
          },
          {
            courseId: pebbleBeach.id,
            playerId: mastersPlayers[1].id,
            date: new Date('2026-05-15'),
            createdBy: admin.id,
          },
        ],
      },
    },
  });

  console.log('✅ Created 1 ad-hoc tee time with 2 rounds at Pebble Beach');
  console.log('✅ Created 5 games demonstrating all scenarios');

  console.log('🎉 Seeding completed!');
  console.log('\n📊 Summary:');
  console.log('  - 2 famous golf courses');
  console.log('  - Multiple tee boxes per course with hole-specific yardages and handicap ranks');
  console.log('  - 4 users (1 admin + 3 members)');
  console.log('  - 1 community');
  console.log('  - 1 trip with 2 tee times (8 individual rounds)');
  console.log('  - 1 ad-hoc tee time with 2 rounds (not part of trip)');
  console.log('  - 5 games demonstrating:');
  console.log('    • Scenario 1: Team game within single tee time (2v2 Best Ball)');
  console.log('    • Scenario 2: Multiple 1v1 games within one tee time');
  console.log('    • Scenario 3: Skins game across all players in tee time');
  console.log('    • Scenario 4: Multi-tee time game spanning 2 days');
  console.log('\n✨ Game and Match unified - Game can span any combination of rounds');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

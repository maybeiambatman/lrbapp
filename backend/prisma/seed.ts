import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

  // Create sample course
  const course = await prisma.course.create({
    data: {
      name: 'Augusta National Golf Club',
      createdBy: admin.id,
      tees: {
        create: [
          {
            name: 'Masters',
            color: '#006747',
            rating: 76.5,
            slope: 155,
            yardage: 7545,
          },
          {
            name: 'Championship',
            color: '#4169E1',
            rating: 74.7,
            slope: 148,
            yardage: 7200,
          },
        ],
      },
      holes: {
        create: [
          { number: 1, par: 4, handicapRank: 7, yards: 445 },
          { number: 2, par: 5, handicapRank: 15, yards: 575 },
          { number: 3, par: 4, handicapRank: 11, yards: 350 },
          { number: 4, par: 3, handicapRank: 9, yards: 240 },
          { number: 5, par: 4, handicapRank: 1, yards: 495 },
          { number: 6, par: 3, handicapRank: 17, yards: 180 },
          { number: 7, par: 4, handicapRank: 3, yards: 450 },
          { number: 8, par: 5, handicapRank: 13, yards: 570 },
          { number: 9, par: 4, handicapRank: 5, yards: 460 },
          { number: 10, par: 4, handicapRank: 10, yards: 495 },
          { number: 11, par: 4, handicapRank: 8, yards: 520 },
          { number: 12, par: 3, handicapRank: 16, yards: 155 },
          { number: 13, par: 5, handicapRank: 2, yards: 510 },
          { number: 14, par: 4, handicapRank: 12, yards: 440 },
          { number: 15, par: 5, handicapRank: 14, yards: 550 },
          { number: 16, par: 3, handicapRank: 18, yards: 170 },
          { number: 17, par: 4, handicapRank: 4, yards: 440 },
          { number: 18, par: 4, handicapRank: 6, yards: 465 },
        ],
      },
    },
  });

  console.log('✅ Created course:', course.name);

  // Create sample trip
  const trip = await prisma.trip.create({
    data: {
      name: 'Masters Weekend 2026',
      code: 'MSTR26',
      startDate: new Date('2026-04-09'),
      endDate: new Date('2026-04-12'),
      buyInAmount: 100,
      numberOfRounds: 4,
      purseTotal: 0,
      isActive: true,
      createdBy: admin.id,
      courses: {
        connect: [{ id: course.id }],
      },
      players: {
        create: [
          { name: 'Tiger Woods', handicap: 0.5, buyIn: 100 },
          { name: 'Phil Mickelson', handicap: 2.1, buyIn: 100 },
          { name: 'Rory McIlroy', handicap: 1.3, buyIn: 100 },
          { name: 'Jordan Spieth', handicap: 1.8, buyIn: 100 },
        ],
      },
      prizes: {
        create: [
          {
            name: 'Low Net Round 1',
            type: 'BEST_NET_ROUND',
            roundNumber: 1,
            amount: 50,
          },
          {
            name: 'Low Net Round 2',
            type: 'BEST_NET_ROUND',
            roundNumber: 2,
            amount: 50,
          },
          {
            name: 'CTP Hole 16',
            type: 'CLOSEST_TO_PIN',
            ctpHole: 16,
            amount: 25,
          },
          {
            name: 'Overall Low Net',
            type: 'BEST_CUMULATIVE_NET',
            amount: 275,
          },
        ],
      },
    },
  });

  // Update purse total
  await prisma.trip.update({
    where: { id: trip.id },
    data: { purseTotal: 400 },
  });

  console.log('✅ Created trip:', trip.name, 'with code:', trip.code);

  // Get players for game setup
  const players = await prisma.tripPlayer.findMany({
    where: { tripId: trip.id },
  });

  // Create a community
  const community = await prisma.community.create({
    data: {
      name: 'LRB Golf Club',
      description: 'Long Range Bomber annual golf trip community',
      isActive: true,
      createdBy: admin.id,
      members: {
        connect: [{ id: admin.id }],
      },
    },
  });

  console.log('✅ Created community:', community.name);

  // Create a Best Ball game (stroke play, net scoring)
  const bestBallGame = await prisma.game.create({
    data: {
      tripId: trip.id,
      name: 'Best Ball Round 1',
      format: 'BEST_BALL',
      playType: 'STROKE_PLAY',
      scoringType: 'NET',
      roundNumber: 1,
      buyInAmount: 20,
      purseTotal: 80,
      isActive: true,
      teams: {
        create: [
          {
            name: 'Team Tiger & Rory',
            playerIds: [players[0].id, players[2].id], // Tiger & Rory
          },
          {
            name: 'Team Phil & Jordan',
            playerIds: [players[1].id, players[3].id], // Phil & Jordan
          },
        ],
      },
    },
    include: {
      teams: true,
    },
  });

  console.log('✅ Created Best Ball game with teams');

  // Create match for the Best Ball game
  await prisma.match.create({
    data: {
      gameId: bestBallGame.id,
      roundNumber: 1,
      status: 'PENDING',
      isTeamMatch: true,
      team1Id: bestBallGame.teams[0].id,
      team2Id: bestBallGame.teams[1].id,
    },
  });

  console.log('✅ Created match for Best Ball game');

  // Create a Match Play game (individual, gross scoring)
  const matchPlayGame = await prisma.game.create({
    data: {
      tripId: trip.id,
      name: 'Singles Match Play Round 2',
      format: 'COMBINED_SCORE',
      playType: 'MATCH_PLAY',
      scoringType: 'GROSS',
      roundNumber: 2,
      buyInAmount: 25,
      purseTotal: 100,
      isActive: true,
    },
  });

  // Create individual matches for Match Play
  await prisma.match.createMany({
    data: [
      {
        gameId: matchPlayGame.id,
        roundNumber: 2,
        status: 'PENDING',
        isTeamMatch: false,
        player1Id: players[0].id, // Tiger vs Phil
        player2Id: players[1].id,
      },
      {
        gameId: matchPlayGame.id,
        roundNumber: 2,
        status: 'PENDING',
        isTeamMatch: false,
        player1Id: players[2].id, // Rory vs Jordan
        player2Id: players[3].id,
      },
    ],
  });

  console.log('✅ Created Match Play game with individual matches');

  // Create a Nassau game (round 3)
  await prisma.game.create({
    data: {
      tripId: trip.id,
      name: 'Nassau Round 3',
      format: 'NASSAU',
      playType: 'MATCH_PLAY',
      scoringType: 'BOTH',
      roundNumber: 3,
      buyInAmount: 30,
      purseTotal: 120,
      isActive: true,
    },
  });

  console.log('✅ Created Nassau game');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

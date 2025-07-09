import { PrismaClient, Frequency } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. User作成
  const users = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Charlie', email: 'charlie@example.com' },
  ];

  // upsertでユーザー作成
  const createdUsers = [];
  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    createdUsers.push(created);
  }

  // 2. Habit作成（各ユーザーに1つずつ）
  const habits = [];
  for (const user of createdUsers) {
    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        name: `${user.name}'s Habit`,
        description: `This is a habit for ${user.name}`,
        frequency: Frequency.daily,
      },
    });
    habits.push(habit);
  }

  // 3. CalendarDate作成（直近3日分）
  const today = new Date();
  for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    await prisma.calendarDate.upsert({
      where: { date },
      update: {},
      create: {
        date,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        weekday: date.getDay(),
      },
    });
  }

  // 4. HabitLog作成（各Habitに1つずつ、今日の日付で）
  for (const habit of habits) {
    const date = today;
    await prisma.habitLog.create({
      data: {
        habit_id: habit.id,
        log_date: date,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        completed: true,
        note: `Log for habit ${habit.id}`,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

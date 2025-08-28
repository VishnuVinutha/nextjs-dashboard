// app/seed/route.ts
import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedUsers(sqlClient = sql) {
  // disable statement timeout for the session
  await sqlClient`SET statement_timeout = 0`;
  await sqlClient`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sqlClient`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await sqlClient`
      INSERT INTO users (id, name, email, password)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}

async function seedInvoices(sqlClient = sql) {
  await sqlClient`SET statement_timeout = 0`;
  await sqlClient`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sqlClient`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  for (const invoice of invoices) {
    await sqlClient`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}

async function seedCustomers(sqlClient = sql) {
  await sqlClient`SET statement_timeout = 0`;
  await sqlClient`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sqlClient`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  for (const customer of customers) {
    await sqlClient`
      INSERT INTO customers (id, name, email, image_url)
      VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}

async function seedRevenue(sqlClient = sql) {
  await sqlClient`SET statement_timeout = 0`;

  await sqlClient`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  for (const rev of revenue) {
    await sqlClient`
      INSERT INTO revenue (month, revenue)
      VALUES (${rev.month}, ${rev.revenue})
      ON CONFLICT (month) DO NOTHING;
    `;
  }
}

export async function GET() {
  try {
    // Use a transaction and pass the tx sql client into each seeder
    await sql.begin(async (tx) => {
      // optionally set session-level timeout once for the tx:
      await tx`SET statement_timeout = 0`;
      await seedUsers(tx);
      await seedCustomers(tx);
      await seedInvoices(tx);
      await seedRevenue(tx);
    });

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error', error);
    return Response.json({ error }, { status: 500 });
  }
}

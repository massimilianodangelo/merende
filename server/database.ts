import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { users, products, orders, orderItems } from '../shared/schema';
import { InsertUser, InsertProduct, InsertOrder, InsertOrderItem } from '../shared/schema';

// Per ambiente di sviluppo, utilizza variabili d'ambiente o fallback a valori di default
const databaseUrl = process.env.DATABASE_URL || '';

// Configura la connessione al database
const sql = neon(databaseUrl);
export const db = drizzle(sql);

// Esporta una funzione di migrazione per creare le tabelle se necessario
export async function migrate() {
  try {
    // Verifica se le tabelle esistono già
    const tableExists = await db.select().from(users).limit(1);
    console.log('Database già inizializzato');
    return;
  } catch (error) {
    console.log('Inizializzazione del database...');
    
    // Crea le tabelle
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        class_room TEXT,
        email TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        is_representative BOOLEAN DEFAULT FALSE,
        is_user_admin BOOLEAN DEFAULT FALSE
      );
      
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category TEXT,
        available BOOLEAN DEFAULT TRUE
      );
      
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT DEFAULT 'pending',
        total DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        order_date TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL
      );
    `;
    
    console.log('Database inizializzato con successo');
  }
}
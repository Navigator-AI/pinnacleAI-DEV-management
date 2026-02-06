#!/usr/bin/env node

import { execSync } from 'child_process';
import postgres from 'postgres';

const DB_NAME = 'project-tracker';
const DB_USER = 'postgres';
const DB_PASSWORD = 'root';
const DB_HOST = 'localhost';
const DB_PORT = '5500';

async function setupDatabase() {
  try {
    console.log('Setting up PostgreSQL database...');
    
    // Connect to postgres database to create our app database
    const adminClient = postgres({
      host: DB_HOST,
      port: parseInt(DB_PORT),
      database: 'postgres',
      username: DB_USER,
      password: DB_PASSWORD,
    });

    try {
      // Create database if it doesn't exist
      await adminClient.unsafe(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Database ${DB_NAME} created successfully`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`Database ${DB_NAME} already exists`);
      } else {
        throw error;
      }
    }

    await adminClient.end();

    // Run database migrations
    console.log('Running database migrations...');
    execSync('npm run db:push', { stdio: 'inherit' });

    // Initialize with sample data
    console.log('Initializing database with sample data...');
    execSync('npm run db:init', { stdio: 'inherit' });

    console.log('Database setup completed successfully!');
    console.log('\nYou can now start the application with: npm run dev');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@pinnacle.ai / admin123');
    console.log('User: john@pinnacle.ai / user123');

  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
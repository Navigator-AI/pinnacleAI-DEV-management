import { Client } from 'pg';
import bcrypt from 'bcrypt';

async function createUsers() {
  const client = new Client({
    connectionString: 'postgresql://postgres:root@localhost:5500/project-tracker'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Clear existing users
    await client.query('DELETE FROM users');
    console.log('Cleared existing users');

    // Insert users
    const result = await client.query(`
      INSERT INTO users (username, password, name, email, role, avatar, status, created_at, updated_at)
      VALUES 
        ('admin', $1, 'Admin User', 'admin@pinnacle.ai', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'online', NOW(), NOW()),
        ('john_doe', $2, 'John Doe', 'john@pinnacle.ai', 'member', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', 'online', NOW(), NOW()),
        ('jane_smith', $2, 'Jane Smith', 'jane@pinnacle.ai', 'manager', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', 'away', NOW(), NOW())
      RETURNING email, name, role
    `, [adminPassword, userPassword]);

    console.log('Users created successfully:');
    result.rows.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\nLogin credentials:');
    console.log('Admin: admin@pinnacle.ai / admin123');
    console.log('User: john@pinnacle.ai / user123');
    console.log('Manager: jane@pinnacle.ai / user123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

createUsers();
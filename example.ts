// Example usage of airtable-types-gen
// This file shows how to use the generated types and runtime utilities

import Airtable from 'airtable';
import { flattenRecord, flattenRecords } from './src/runtime/flatten';

// Example generated types (would be in a separate file)
export interface UsersRecord {
  id: string;
  Name: string;
  Email: string;
  Age?: number;
  Active: boolean;
  Role: "Admin" | "User" | "Guest";
  readonly Created: string;
  readonly "Auto ID": number;
}

export type CreateRecord<T> = Partial<Omit<T, 'id'>> & { id?: never };
export type UpdateRecord<T> = Partial<Omit<T, 'id'>> & { id: string };

// Setup Airtable
const airtable = new Airtable({ apiKey: process.env.AIRTABLE_PERSONAL_TOKEN });
const base = airtable.base('appXXXXXXXX');

// Example 1: Using flattenRecord for easier data access
async function getUser(id: string) {
  try {
    const record = await base('Users').find(id);
    const flattened = flattenRecord(record);
    
    // Now you can access fields directly without .fields wrapper
    console.log(`User: ${flattened.Name} (${flattened.Email})`);
    console.log(`Active: ${flattened.Active}, Role: ${flattened.Role}`);
    
    return flattened as UsersRecord;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Example 2: Using flattenRecords for multiple records
async function getAllUsers() {
  try {
    const records = await base('Users').select({
      filterByFormula: '{Active} = TRUE()',
      sort: [{ field: 'Name', direction: 'asc' }]
    }).all();
    
    const flattened = flattenRecords(records);
    
    // Type-safe access to all user data
    flattened.forEach(user => {
      console.log(`${user.Name}: ${user.Role} (Created: ${user.Created})`);
    });
    
    return flattened as UsersRecord[];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Example 3: Type-safe record creation
async function createUser(userData: CreateRecord<UsersRecord>) {
  try {
    const record = await base('Users').create([{
      fields: {
        Name: userData.Name!,
        Email: userData.Email!,
        Active: userData.Active ?? true,
        Role: userData.Role ?? 'User',
        Age: userData.Age
      }
    }]);
    
    return flattenRecord(record[0]) as UsersRecord;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

// Example 4: Type-safe record updates
async function updateUser(userData: UpdateRecord<UsersRecord>) {
  try {
    const record = await base('Users').update([{
      id: userData.id,
      fields: {
        // Only include non-undefined fields
        ...(userData.Name && { Name: userData.Name }),
        ...(userData.Email && { Email: userData.Email }),
        ...(userData.Active !== undefined && { Active: userData.Active }),
        ...(userData.Role && { Role: userData.Role }),
        ...(userData.Age && { Age: userData.Age }),
      }
    }]);
    
    return flattenRecord(record[0]) as UsersRecord;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

// Example usage
async function main() {
  // Get a user
  const user = await getUser('recXXXXXXXX');
  if (user) {
    console.log('Fetched user:', user.Name);
  }
  
  // Create a new user
  const newUser = await createUser({
    Name: 'Jane Doe',
    Email: 'jane@example.com',
    Role: 'Admin',
    Active: true
  });
  
  if (newUser) {
    console.log('Created user:', newUser.Name, 'with ID:', newUser.id);
    
    // Update the user
    const updatedUser = await updateUser({
      id: newUser.id,
      Role: 'User' // Demote from Admin to User
    });
    
    if (updatedUser) {
      console.log('Updated user role to:', updatedUser.Role);
    }
  }
  
  // Get all users
  const allUsers = await getAllUsers();
  console.log(`Found ${allUsers.length} active users`);
}

// Run example (uncomment to test)
// main().catch(console.error);
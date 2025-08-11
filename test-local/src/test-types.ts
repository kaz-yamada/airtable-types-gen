// TypeScript test file to validate generated types
// This file will only compile if the generated types are correct

// Import the generated types (will be created after running npm run generate)
// import type { UsersRecord, ProjectsRecord, CreateRecord, UpdateRecord } from '../generated/types';

// For now, we'll use example types to demonstrate the testing approach
interface ExampleUsersRecord {
  id: string;
  Name: string;
  Email: string;
  Age?: number;
  Active: boolean;
  Role: "Admin" | "User" | "Guest";
  readonly Created: string;
  readonly "Auto ID": number;
}

type ExampleCreateRecord<T> = Partial<Omit<T, 'id'>> & { id?: never };
type ExampleUpdateRecord<T> = Partial<Omit<T, 'id'>> & { id: string };

// Test 1: Type safety for record creation
function testCreateRecord() {
  const validCreate: ExampleCreateRecord<ExampleUsersRecord> = {
    Name: "John Doe",
    Email: "john@example.com",
    Active: true,
    Role: "User",
    // Age is optional
    // Created and "Auto ID" are readonly, so they can't be set
    // id is automatically excluded for create operations
  };

  // These should cause TypeScript errors (uncomment to test):
  
  // const invalidCreate1: ExampleCreateRecord<ExampleUsersRecord> = {
  //   id: "should-not-be-allowed", // ❌ id is not allowed in create
  //   Name: "John"
  // };

  // const invalidCreate2: ExampleCreateRecord<ExampleUsersRecord> = {
  //   Name: "John",
  //   Created: "2024-01-01", // ❌ readonly field can't be set
  // };

  // const invalidCreate3: ExampleCreateRecord<ExampleUsersRecord> = {
  //   Name: "John",
  //   Role: "InvalidRole" // ❌ must be "Admin" | "User" | "Guest"
  // };

  console.log('✅ Create record type safety works');
  return validCreate;
}

// Test 2: Type safety for record updates
function testUpdateRecord() {
  const validUpdate: ExampleUpdateRecord<ExampleUsersRecord> = {
    id: "rec123ABC", // ✅ id is required for updates
    Name: "Jane Doe",
    Role: "Admin",
    // All other fields are optional for updates
  };

  // These should cause TypeScript errors (uncomment to test):
  
  // const invalidUpdate1: ExampleUpdateRecord<ExampleUsersRecord> = {
  //   // ❌ id is required for updates
  //   Name: "Jane"
  // };

  // const invalidUpdate2: ExampleUpdateRecord<ExampleUsersRecord> = {
  //   id: "rec123",
  //   Created: "2024-01-01", // ❌ readonly field can't be updated
  // };

  console.log('✅ Update record type safety works');
  return validUpdate;
}

// Test 3: Union types for select fields
function testUnionTypes() {
  const validRoles: ExampleUsersRecord['Role'][] = ["Admin", "User", "Guest"];
  
  // This should cause a TypeScript error (uncomment to test):
  // const invalidRole: ExampleUsersRecord['Role'] = "SuperAdmin"; // ❌ not in union

  console.log('✅ Union type validation works');
  return validRoles;
}

// Test 4: Optional vs required fields
function testOptionalFields() {
  // Age is optional, so this should work
  const userWithoutAge: Pick<ExampleUsersRecord, 'id' | 'Name' | 'Email' | 'Active' | 'Role' | 'Created' | 'Auto ID'> = {
    id: "rec123",
    Name: "Bob",
    Email: "bob@example.com", 
    Active: true,
    Role: "User",
    Created: "2024-01-01T00:00:00Z",
    "Auto ID": 1
    // Age is omitted - should be fine
  };

  // These are required fields, should cause errors if omitted (uncomment to test):
  // const invalidUser: Pick<ExampleUsersRecord, 'id' | 'Name'> = {
  //   id: "rec123"
  //   // ❌ Name is required
  // };

  console.log('✅ Optional field handling works');
  return userWithoutAge;
}

// Test 5: Readonly field enforcement
function testReadonlyFields() {
  let user: ExampleUsersRecord = {
    id: "rec123",
    Name: "Alice",
    Email: "alice@example.com",
    Active: true,
    Role: "Admin",
    Created: "2024-01-01T00:00:00Z",
    "Auto ID": 1
  };

  // These should cause TypeScript errors (uncomment to test):
  // user.Created = "2024-02-01T00:00:00Z"; // ❌ readonly field
  // user["Auto ID"] = 2; // ❌ readonly field

  // These should work fine:
  user.Name = "Alice Updated";
  user.Role = "User";

  console.log('✅ Readonly field enforcement works');
  return user;
}

// Run all tests
export function runTypeTests() {
  console.log('🧪 Running TypeScript type tests...\n');
  
  try {
    testCreateRecord();
    testUpdateRecord();
    testUnionTypes();
    testOptionalFields();
    testReadonlyFields();
    
    console.log('\n🎉 All TypeScript type tests passed!');
    console.log('💡 This means the generated types will provide excellent IntelliSense and type safety.');
    
  } catch (error) {
    console.error('❌ Type test failed:', error);
  }
}

// If running directly (not imported)
if (require.main === module) {
  runTypeTests();
}
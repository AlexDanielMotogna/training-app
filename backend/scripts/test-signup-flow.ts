/**
 * Test the complete signup flow
 */

import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function testSignupFlow() {
  console.log('\n🧪 Testing Signup Flow\n');

  const timestamp = Date.now();
  const email = `test-${timestamp}@example.com`;
  const password = 'TestPassword123';

  try {
    // Step 1: Create user account
    console.log('Step 1: Creating user account...');
    const signupResponse = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name: 'Test User',
        role: 'coach',
      }),
    });

    if (!signupResponse.ok) {
      const error = await signupResponse.json();
      throw new Error(`Signup failed: ${JSON.stringify(error)}`);
    }

    const signupData = await signupResponse.json();
    console.log('✅ User created:', signupData.user.id);
    const token = signupData.token;

    // Step 2: Get sports list
    console.log('\nStep 2: Getting sports list...');
    const sportsResponse = await fetch(`${API_URL}/organizations/sports`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!sportsResponse.ok) {
      const error = await sportsResponse.json();
      throw new Error(`Get sports failed: ${JSON.stringify(error)}`);
    }

    const sports = await sportsResponse.json();
    console.log('✅ Sports loaded:', sports.length);
    const sport = sports[0];
    const ageCategory = sport.ageCategories[0];
    console.log(`   Using sport: ${sport.name}, category: ${ageCategory.name}`);

    // Step 3: Create organization
    console.log('\nStep 3: Creating organization...');
    const orgResponse = await fetch(`${API_URL}/organizations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Organization',
        slug: `test-org-${timestamp}`,
        sportId: sport.id,
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        timezone: 'Europe/Madrid',
      }),
    });

    if (!orgResponse.ok) {
      const error = await orgResponse.json();
      console.error('❌ Organization creation failed:', error);
      throw new Error(`Create org failed: ${JSON.stringify(error)}`);
    }

    const organization = await orgResponse.json();
    console.log('✅ Organization created:', organization.id);
    console.log('   Name:', organization.name);
    console.log('   Role:', organization.role);

    // Step 4: Create team
    console.log('\nStep 4: Creating team...');
    const teamResponse = await fetch(`${API_URL}/organizations/${organization.id}/teams`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Team',
        ageCategoryId: ageCategory.id,
        isActive: true,
      }),
    });

    if (!teamResponse.ok) {
      const error = await teamResponse.json();
      console.error('❌ Team creation failed:', error);
      throw new Error(`Create team failed: ${JSON.stringify(error)}`);
    }

    const team = await teamResponse.json();
    console.log('✅ Team created:', team.id);
    console.log('   Name:', team.name);

    console.log('\n✨ Signup flow test PASSED!\n');
    console.log('Summary:');
    console.log('- User:', signupData.user.id);
    console.log('- Organization:', organization.id);
    console.log('- Team:', team.id);

  } catch (error: any) {
    console.error('\n❌ Signup flow test FAILED:', error.message);
    throw error;
  }
}

testSignupFlow();

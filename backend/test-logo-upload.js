/**
 * Quick test script for logo upload endpoint
 *
 * Usage: node test-logo-upload.js
 *
 * This script:
 * 1. Creates a test organization (if needed)
 * 2. Generates a simple test image
 * 3. Uploads it to the logo endpoint
 * 4. Verifies the response
 * 5. Checks if the URL is valid
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Configuration
const API_URL = 'http://localhost:5000';
const ORG_ID = process.env.TEST_ORG_ID || 'test-org-id';
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || '';

// Create a simple test image
function createTestImage() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');

  // Draw a simple background
  ctx.fillStyle = '#203731';
  ctx.fillRect(0, 0, 200, 200);

  // Draw a circle
  ctx.fillStyle = '#FFB612';
  ctx.beginPath();
  ctx.arc(100, 100, 50, 0, 2 * Math.PI);
  ctx.fill();

  // Draw text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('TEST', 100, 110);

  return canvas.toBuffer('image/png');
}

// Test the upload endpoint
async function testLogoUpload() {
  console.log('\n=== Testing Logo Upload Endpoint ===\n');

  if (!AUTH_TOKEN) {
    console.error('❌ No AUTH_TOKEN provided');
    console.log('\nTo test with authentication:');
    console.log('1. Login to http://localhost:3000');
    console.log('2. Open DevTools → Console');
    console.log('3. Run: localStorage.getItem("authToken")');
    console.log('4. Copy the token');
    console.log('5. Run: TEST_AUTH_TOKEN="your-token" TEST_ORG_ID="your-org-id" node test-logo-upload.js\n');
    return;
  }

  try {
    // Create test image
    console.log('📝 Creating test image...');
    const imageBuffer = createTestImage();
    console.log('✅ Test image created (200x200 PNG)');

    // Prepare form data
    const FormData = require('form-data');
    const form = new FormData();
    form.append('logo', imageBuffer, {
      filename: 'test-logo.png',
      contentType: 'image/png'
    });

    // Upload
    console.log(`\n📤 Uploading to ${API_URL}/api/organizations/${ORG_ID}/logo`);
    console.log(`🔑 Using token: ${AUTH_TOKEN.substring(0, 20)}...`);

    const response = await fetch(`${API_URL}/api/organizations/${ORG_ID}/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...form.getHeaders()
      },
      body: form
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    const data = await response.json();
    console.log('📦 Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Upload successful!');
      console.log(`🔗 Logo URL: ${data.logoUrl}`);

      // Verify Cloudinary URL format
      if (data.logoUrl && data.logoUrl.includes('cloudinary.com')) {
        console.log('✅ Cloudinary URL format is correct');
      } else {
        console.log('⚠️  URL does not appear to be from Cloudinary');
      }
    } else {
      console.log('\n❌ Upload failed');
      console.error('Error:', data);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
  }
}

// Check if canvas is installed
try {
  require.resolve('canvas');
  testLogoUpload();
} catch (e) {
  console.log('\n⚠️  canvas package not installed');
  console.log('\nInstall it with: npm install canvas');
  console.log('\nOr test manually via the UI at http://localhost:3000\n');
}

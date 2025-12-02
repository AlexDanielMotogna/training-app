# Logo Upload Testing Guide

## Feature: Organization Logo Upload

### Overview
Organization admins can upload custom logos via the Organization Settings page. The logo is stored in Cloudinary and replaces the default teamTraining logo.

### Test Environment
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: MongoDB (rhinos-training-dev)
- **Image Storage**: Cloudinary

---

## Test Scenarios

### 1. **Manual Upload Test via UI**

#### Steps:
1. Navigate to http://localhost:3000
2. Login as organization owner/admin
3. Click on Settings → Organization Settings
4. Go to the "Logo" tab (3rd tab)
5. Click "Select File" button
6. Choose a test image (PNG/JPG, < 2MB)
7. Wait for upload to complete
8. Verify:
   - ✅ Success toast appears: "Logo uploaded successfully!"
   - ✅ Logo preview updates immediately
   - ✅ No console errors
9. Click "Save Settings"
10. Refresh the page
11. Verify:
   - ✅ Logo persists in Organization Settings
   - ✅ Logo appears in AppShell header
   - ✅ Logo appears in AppShell drawer

#### Expected Results:
- Upload completes in < 3 seconds
- Cloudinary URL returned (format: `https://res.cloudinary.com/dchr6mefv/image/upload/...`)
- Logo displays correctly at 150x150px in preview
- Logo displays correctly at 40x40px in AppShell

---

### 2. **Error Handling Tests**

#### Test 2a: Invalid File Type
**Steps:**
1. Select a non-image file (PDF, TXT, etc.)
2. Verify error toast: "Please select a valid image file (PNG, JPG, etc.)"

#### Test 2b: File Too Large
**Steps:**
1. Select an image > 2MB
2. Verify error toast: "Image must be less than 2MB"

#### Test 2c: Network Error
**Steps:**
1. Stop backend server
2. Attempt upload
3. Verify error toast: "Failed to upload logo. Please try again."
4. Restart backend

---

### 3. **Logo URL Input Test**

#### Steps:
1. Go to Logo tab
2. Enter a direct image URL in "Logo URL" field
   - Example: `https://via.placeholder.com/200`
3. Verify preview updates immediately
4. Click "Save Settings"
5. Refresh page
6. Verify logo persists

---

### 4. **Default Logo Fallback Test**

#### Steps:
1. Create new organization (signup flow)
2. Don't upload custom logo
3. Navigate through app
4. Verify:
   - ✅ Default teamTraining logo shows everywhere
   - ✅ Logo path: `/teamtraining-logo.svg`
   - ✅ No broken image icons

---

### 5. **Backend API Test (cURL)**

```bash
# Get auth token from browser localStorage
# Navigate to http://localhost:3000, open DevTools → Console, run:
# localStorage.getItem('authToken')

# Test logo upload
curl -X POST http://localhost:5000/api/organizations/{ORG_ID}/logo \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "logo=@/path/to/test-image.png"

# Expected response:
# {
#   "logoUrl": "https://res.cloudinary.com/dchr6mefv/image/upload/v.../rhinos-training/organizations/logo-{ORG_ID}"
# }
```

---

### 6. **Cloudinary Verification**

#### Steps:
1. Login to Cloudinary dashboard: https://console.cloudinary.com
2. Navigate to Media Library
3. Go to folder: `rhinos-training/organizations`
4. Verify uploaded logo appears with:
   - Public ID: `logo-{organizationId}`
   - Transformations: 500x500, fit, auto quality, auto format
   - URL matches what's stored in database

---

## Security Tests

### 7. **Permission Tests**

#### Test 7a: Non-Admin Cannot Upload
**Steps:**
1. Login as player (non-admin)
2. Navigate to Organization Settings
3. Verify: "You do not have permission to manage organization settings."

#### Test 7b: Wrong Organization
**Steps:**
1. Login as admin of Org A
2. Try to upload logo for Org B via API
3. Verify: 403 Forbidden error

---

## Database Verification

### 8. **Check MongoDB**

```javascript
// MongoDB query to verify logo URL is saved
db.organizations.findOne(
  { _id: ObjectId("YOUR_ORG_ID") },
  { name: 1, logoUrl: 1 }
)

// Expected result:
{
  "_id": ObjectId("..."),
  "name": "Test Organization",
  "logoUrl": "https://res.cloudinary.com/dchr6mefv/image/upload/v.../logo-..."
}
```

---

## Known Issues
- None currently

---

## Test Results

| Test | Status | Date | Notes |
|------|--------|------|-------|
| Manual Upload | ⏳ Pending | - | - |
| Invalid File Type | ⏳ Pending | - | - |
| File Too Large | ⏳ Pending | - | - |
| URL Input | ⏳ Pending | - | - |
| Default Fallback | ⏳ Pending | - | - |
| API Endpoint | ⏳ Pending | - | - |
| Cloudinary Storage | ⏳ Pending | - | - |
| Permission Check | ⏳ Pending | - | - |

---

## Next Steps
1. Run all manual tests above
2. Update test results table
3. Fix any bugs discovered
4. Proceed to next feature: Member Management

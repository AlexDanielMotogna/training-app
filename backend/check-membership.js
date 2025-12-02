import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URL || 'mongodb+srv://alexdanielmotogna:Ursul123@cluster0.21lzwuz.mongodb.net/rhinos-training?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

async function checkMembership() {
  try {
    await client.connect();
    const db = client.db();
    
    const userId = '692daa8ad2337bac2892c766';
    const orgId = '692daa8ad2337bac2892c767';
    
    console.log('\n🔍 Checking OrganizationMember records...\n');
    
    const membership = await db.collection('OrganizationMember').findOne({
      organizationId: { $oid: orgId },
      userId: { $oid: userId }
    });
    
    if (membership) {
      console.log('✅ Membership exists:', membership);
    } else {
      console.log('❌ No membership found!');
      console.log('User ID:', userId);
      console.log('Org ID:', orgId);
    }
    
  } finally {
    await client.close();
  }
}

checkMembership().catch(console.error);

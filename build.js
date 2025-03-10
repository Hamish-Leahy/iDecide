import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function generateEmergencyPages() {
  try {
    // Fetch all active emergency IDs
    const { data: emergencyIds, error } = await supabase
      .from('emergency_ids')
      .select(`
        *,
        emergency_contacts (*),
        medical_info (*)
      `)
      .eq('status', 'active');

    if (error) throw error;

    // Create id directory in dist
    const idDir = path.join(process.cwd(), 'dist', 'id');
    fs.mkdirSync(idDir, { recursive: true });

    // Generate static HTML for each emergency ID
    for (const id of emergencyIds) {
      const html = generateEmergencyHTML(id);
      const filePath = path.join(idDir, `${id.id}.html`);
      fs.writeFileSync(filePath, html);
    }

    console.log(`Generated ${emergencyIds.length} emergency ID pages`);
  } catch (error) {
    console.error('Error generating emergency pages:', error);
    process.exit(1);
  }
}

function generateEmergencyHTML(data) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Emergency Information - iDecide</title>
    <link rel="stylesheet" href="/assets/index-BdRDZUCq.css" />
  </head>
  <body>
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="bg-[#2D5959] p-6 text-white">
            <h1 class="text-2xl font-bold mb-2">Emergency Information</h1>
            <p class="opacity-90">This is an emergency contact card for ${data.name}</p>
          </div>

          <div class="p-6 border-b">
            <h2 class="text-xl font-semibold mb-4">
              Emergency Contact
            </h2>
            <div class="space-y-4">
              <div>
                <p class="text-gray-600">Name</p>
                <p class="font-medium">${data.emergency_contacts[0]?.name || 'Not specified'}</p>
              </div>
              <div>
                <p class="text-gray-600">Relationship</p>
                <p class="font-medium">${data.emergency_contacts[0]?.relationship || 'Not specified'}</p>
              </div>
              <div class="flex gap-4">
                ${data.emergency_contacts[0]?.phone ? `
                  <a href="tel:${data.emergency_contacts[0].phone}" 
                     class="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90">
                    Call
                  </a>
                ` : ''}
                ${data.emergency_contacts[0]?.email ? `
                  <a href="mailto:${data.emergency_contacts[0].email}"
                     class="flex items-center gap-2 px-4 py-2 border border-[#2D5959] text-[#2D5959] rounded-lg hover:bg-gray-50">
                    Email
                  </a>
                ` : ''}
              </div>
            </div>
          </div>

          ${data.type !== 'contact' ? `
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-4">
                Medical Information
              </h2>
              <div class="space-y-4">
                ${data.medical_info[0]?.blood_type ? `
                  <div>
                    <p class="text-gray-600">Blood Type</p>
                    <p class="font-medium">${data.medical_info[0].blood_type}</p>
                  </div>
                ` : ''}
                ${data.medical_info[0]?.allergies ? `
                  <div>
                    <p class="text-gray-600">Allergies</p>
                    <p class="font-medium">${data.medical_info[0].allergies}</p>
                  </div>
                ` : ''}
                ${data.medical_info[0]?.conditions ? `
                  <div>
                    <p class="text-gray-600">Medical Conditions</p>
                    <p class="font-medium">${data.medical_info[0].conditions}</p>
                  </div>
                ` : ''}
                ${data.medical_info[0]?.medications ? `
                  <div>
                    <p class="text-gray-600">Current Medications</p>
                    <p class="font-medium">${data.medical_info[0].medications}</p>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
        </div>

        <p class="text-center text-sm text-gray-500 mt-6">
          This emergency information card was created with iDecide
        </p>
      </div>
    </div>
  </body>
</html>
  `;
}

generateEmergencyPages();
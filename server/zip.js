const AdmZip = require('adm-zip');
const fs = require('fs');

async function createZip() {
  const zip = new AdmZip();

  // Add files
  zip.addLocalFile('package.json');
  if (fs.existsSync('package-lock.json')) {
    zip.addLocalFile('package-lock.json');
  }

  // Add directories
  zip.addLocalFolder('dist', 'dist');
  zip.addLocalFolder('prisma', 'prisma');

  // Write zip file
  zip.writeZip('aws-backend.zip');
  console.log('✅ Archivo aws-backend.zip creado exitosamente!');
}

createZip();

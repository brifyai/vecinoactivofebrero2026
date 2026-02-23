const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile(filePath) {
  console.log(`\n📄 Ejecutando: ${filePath}`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Dividir el SQL en statements individuales
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // Si exec_sql no existe, intentar usar el endpoint SQL directo
          console.warn(`⚠️  Error con exec_sql: ${error.message}`);
          console.log(`ℹ️  El SQL debe ejecutarse manualmente en el panel de Supabase`);
          console.log(`\n--- SQL a ejecutar ---\n${statement}\n--- Fin SQL ---\n`);
        } else {
          console.log(`✅ Ejecutado correctamente`);
        }
      } catch (err) {
        console.warn(`⚠️  Error ejecutando statement: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`❌ Error leyendo archivo ${filePath}:`, err.message);
    throw err;
  }
}

async function main() {
  console.log('🚀 Iniciando ejecución de scripts SQL...\n');
  
  const sqlFiles = [
    path.join(__dirname, 'services-table.sql'),
    path.join(__dirname, 'events-table.sql')
  ];

  for (const file of sqlFiles) {
    if (fs.existsSync(file)) {
      await executeSQLFile(file);
    } else {
      console.warn(`⚠️  Archivo no encontrado: ${file}`);
    }
  }

  console.log('\n✨ Proceso completado');
  console.log('\n⚠️  IMPORTANTE: Si los scripts no se ejecutaron automáticamente,');
  console.log('   debes ejecutarlos manualmente en el panel de Supabase:');
  console.log('   1. Ve a https://supabase.vecinoactivo.cl');
  console.log('   2. Abre el SQL Editor');
  console.log('   3. Copia y pega el contenido de server/services-table.sql');
  console.log('   4. Ejecuta el script');
  console.log('   5. Repite con server/events-table.sql');
}

main().catch(console.error);

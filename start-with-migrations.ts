#!/usr/bin/env tsx
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const projectRoot = process.cwd();

console.log('🔄 Iniciando processo de preparação do banco de dados...\n');

try {
  // 1. Regenerar Prisma Client
  console.log('📦 Regenerando Prisma Client...');
  try {
    execSync('npx prisma generate', {
      stdio: 'inherit',
      cwd: projectRoot,
      env: { ...process.env },
    });
    console.log('✅ Prisma Client regenerado com sucesso\n');
  } catch (err) {
    console.warn('⚠️  Não foi possível regenerar Prisma Client, continuando...\n');
  }

  // 2. Aplicar migrações (somente em produção)
  if (process.env.NODE_ENV === 'production') {
    console.log('📄 Aplicando migrações no banco de dados...');
    try {
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        cwd: projectRoot,
        env: { ...process.env },
      });
      console.log('✅ Migrações aplicadas com sucesso\n');
    } catch (err) {
      console.warn('⚠️  Erro ao aplicar migrações (pode ser normal se já estão aplicadas)\n');
    }
  }

  // 3. Iniciar o servidor
  console.log('🚀 Iniciando servidor...\n');
  
  // Importy e inicia o servidor
  const serverPath = path.join(projectRoot, 'server.ts');
  if (fs.existsSync(serverPath)) {
    // Use dynamic import if needed, but for tsx we can just execute server.ts directly
    execSync('npx tsx server.ts', {
      stdio: 'inherit',
      cwd: projectRoot,
      env: { ...process.env },
    });
  } else {
    throw new Error('server.ts não encontrado');
  }
} catch (error) {
  console.error('❌ Erro fatal:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

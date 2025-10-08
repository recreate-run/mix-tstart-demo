#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import prompts from 'prompts';
import kleur from 'kleur';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log(kleur.bold().cyan('\n🚀 Create Mix TanStack Start App\n'));

  // Get project name from args or prompt
  const args = process.argv.slice(2);
  let projectName = args[0];

  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-mix-app',
      validate: (value) => {
        if (!value) return 'Project name is required';
        if (fs.existsSync(value)) return `Directory "${value}" already exists`;
        return true;
      },
    });

    if (!response.projectName) {
      console.log(kleur.red('\n✖ Project creation cancelled'));
      process.exit(1);
    }

    projectName = response.projectName;
  }

  // Check if directory exists
  if (fs.existsSync(projectName)) {
    console.log(kleur.red(`\n✖ Directory "${projectName}" already exists`));
    process.exit(1);
  }

  // Check if examples directory exists to show example options
  const examplesDir = path.join(__dirname, 'examples');
  const hasExamples = fs.existsSync(examplesDir);
  const exampleChoices = hasExamples
    ? fs.readdirSync(examplesDir).filter(f => fs.statSync(path.join(examplesDir, f)).isDirectory())
    : [];

  const templateChoices = [
    { title: 'Base (minimal starter)', value: 'base' },
    ...exampleChoices.map(name => ({
      title: `${name} (example)`,
      value: `example:${name}`,
    })),
  ];

  // Ask for template
  const { template } = await prompts({
    type: 'select',
    name: 'template',
    message: 'Choose a template:',
    choices: templateChoices,
    initial: 0,
  });

  if (!template) {
    console.log(kleur.red('\n✖ Template selection cancelled'));
    process.exit(1);
  }

  // Ask for package manager
  const { packageManager } = await prompts({
    type: 'select',
    name: 'packageManager',
    message: 'Package manager:',
    choices: [
      { title: 'bun (recommended)', value: 'bun' },
      { title: 'npm', value: 'npm' },
      { title: 'pnpm', value: 'pnpm' },
      { title: 'yarn', value: 'yarn' },
    ],
    initial: 0,
  });

  if (!packageManager) {
    console.log(kleur.red('\n✖ Package manager selection cancelled'));
    process.exit(1);
  }

  console.log(kleur.cyan(`\n📦 Creating project in ${kleur.bold(projectName)}...\n`));

  // Create project directory
  fs.mkdirSync(projectName, { recursive: true });

  // Determine source directory
  const isExample = template.startsWith('example:');
  const templateName = isExample ? template.replace('example:', '') : 'base';
  const sourceDir = isExample
    ? path.join(__dirname, 'examples', templateName)
    : __dirname;

  if (!fs.existsSync(sourceDir)) {
    console.log(kleur.red(`\n✖ Template "${templateName}" not found`));
    fs.rmSync(projectName, { recursive: true, force: true });
    process.exit(1);
  }

  // Copy template files
  copyTemplate(sourceDir, projectName, isExample);

  // Update package.json name and remove CLI-specific fields
  const packageJsonPath = path.join(projectName, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.name = projectName;
    packageJson.version = '0.0.0';
    delete packageJson.bin;
    delete packageJson.files;

    // Remove CLI dependencies
    if (packageJson.dependencies) {
      delete packageJson.dependencies.prompts;
      delete packageJson.dependencies.kleur;
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  }

  console.log(kleur.green('✓ Template copied\n'));

  // Install dependencies
  console.log(kleur.cyan('📥 Installing dependencies...\n'));

  try {
    const installCmd = packageManager === 'bun'
      ? 'bun install'
      : packageManager === 'yarn'
      ? 'yarn'
      : `${packageManager} install`;

    execSync(installCmd, {
      cwd: projectName,
      stdio: 'inherit',
    });

    console.log(kleur.green('\n✓ Dependencies installed\n'));
  } catch (error) {
    console.log(kleur.yellow('\n⚠ Dependency installation failed. You can install them manually.\n'));
  }

  // Success message
  console.log(kleur.bold().green('🎉 Project created successfully!\n'));
  console.log(kleur.cyan('Next steps:\n'));
  console.log(kleur.white(`  cd ${projectName}`));

  if (isExample) {
    console.log(kleur.white(`  cp .env.example .env`));
    console.log(kleur.white(`  # Add your API keys to .env`));
  }

  console.log(kleur.white(`  ${packageManager === 'bun' ? 'bun run dev' : packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`}`));
  console.log('');
}

function copyTemplate(src, dest, isExample) {
  // Files and directories to skip
  const skipList = [
    'node_modules',
    '.git',
    '.netlify',
    '.tanstack',
    'dist',
    'build',
    '.DS_Store',
    '.env',
    '.shoreman.pid',
    'bun.lockb',
    'cli.js',           // Don't copy CLI file
    'examples',         // Don't copy examples dir if copying base
  ];

  const skipPatterns = [
    /\.log$/,
    /^dev-prev\.log$/,
    /^dev\.log$/,
  ];

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip files/dirs
    if (skipList.includes(entry.name)) {
      // For base template, skip examples folder
      if (entry.name === 'examples' && !isExample) {
        continue;
      }
      // For base template, skip cli.js
      if (entry.name === 'cli.js' && !isExample) {
        continue;
      }
      // Skip other items in skipList
      if (entry.name !== 'examples' && entry.name !== 'cli.js') {
        continue;
      }
    }

    // Skip files matching patterns
    if (skipPatterns.some(pattern => pattern.test(entry.name))) {
      continue;
    }

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyTemplate(srcPath, destPath, isExample);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

main().catch((error) => {
  console.error(kleur.red('\n✖ Error:'), error);
  process.exit(1);
});

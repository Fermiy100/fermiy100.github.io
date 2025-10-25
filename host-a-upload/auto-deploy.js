#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting automatic Railway deployment...');

// Check if Railway CLI is installed
function checkRailwayCLI() {
  try {
    execSync('railway --version', { stdio: 'ignore' });
    console.log('✅ Railway CLI is installed');
    return true;
  } catch (error) {
    console.log('❌ Railway CLI not found. Installing...');
    try {
      execSync('npm install -g @railway/cli', { stdio: 'inherit' });
      console.log('✅ Railway CLI installed successfully');
      return true;
    } catch (installError) {
      console.error('❌ Failed to install Railway CLI:', installError.message);
      return false;
    }
  }
}

// Build the application
function buildApplication() {
  console.log('📦 Building application...');
  try {
    // Install dependencies
    console.log('Installing frontend dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('Installing backend dependencies...');
    execSync('cd railway-backend && npm install', { stdio: 'inherit' });
    
    // Build frontend
    console.log('Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('✅ Application built successfully');
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

// Deploy to Railway
function deployToRailway() {
  console.log('🚀 Deploying to Railway...');
  try {
    // Login to Railway (if not already logged in)
    console.log('Checking Railway authentication...');
    try {
      execSync('railway whoami', { stdio: 'ignore' });
      console.log('✅ Already logged in to Railway');
    } catch (error) {
      console.log('🔐 Please login to Railway...');
      console.log('Opening Railway login page...');
      execSync('railway login', { stdio: 'inherit' });
    }
    
    // Create project if it doesn't exist
    console.log('Setting up Railway project...');
    try {
      execSync('railway project create school-meals-app --yes', { stdio: 'inherit' });
    } catch (error) {
      console.log('Project might already exist, continuing...');
    }
    
    // Set environment variables
    console.log('Setting environment variables...');
    const envVars = [
      'NODE_ENV=production',
      'PORT=3000',
      `JWT_SECRET=${generateJWTSecret()}`,
      'FRONTEND_URL=https://school-meals-app.railway.app'
    ];
    
    envVars.forEach(envVar => {
      try {
        execSync(`railway variables set ${envVar}`, { stdio: 'inherit' });
        console.log(`✅ Set ${envVar.split('=')[0]}`);
      } catch (error) {
        console.log(`⚠️ Failed to set ${envVar.split('=')[0]}`);
      }
    });
    
    // Deploy
    console.log('Deploying application...');
    execSync('railway up', { stdio: 'inherit' });
    
    console.log('✅ Deployment completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return false;
  }
}

// Generate JWT secret
function generateJWTSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64');
}

// Get deployment URL
function getDeploymentURL() {
  try {
    const output = execSync('railway status', { encoding: 'utf8' });
    const urlMatch = output.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      return urlMatch[0];
    }
  } catch (error) {
    console.log('Could not determine deployment URL');
  }
  return 'https://school-meals-app.railway.app';
}

// Main deployment process
async function main() {
  console.log('🎯 School Meals App - Railway Deployment');
  console.log('==========================================');
  
  // Step 1: Check Railway CLI
  if (!checkRailwayCLI()) {
    console.error('❌ Cannot proceed without Railway CLI');
    process.exit(1);
  }
  
  // Step 2: Build application
  if (!buildApplication()) {
    console.error('❌ Build failed, cannot deploy');
    process.exit(1);
  }
  
  // Step 3: Deploy to Railway
  if (!deployToRailway()) {
    console.error('❌ Deployment failed');
    process.exit(1);
  }
  
  // Step 4: Get deployment info
  const deploymentURL = getDeploymentURL();
  
  console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
  console.log('========================');
  console.log(`🌐 Your app is live at: ${deploymentURL}`);
  console.log(`📊 Health check: ${deploymentURL}/api/health`);
  console.log(`🔐 Admin login: director@school.ru / director123`);
  console.log(`👤 User login: parent@school.ru / parent123`);
  
  console.log('\n📱 Features available:');
  console.log('✅ Full-stack application');
  console.log('✅ Mobile-optimized interface');
  console.log('✅ User authentication');
  console.log('✅ Menu management');
  console.log('✅ Order system');
  console.log('✅ Admin dashboard');
  console.log('✅ Statistics and analytics');
  
  console.log('\n🚀 Next steps:');
  console.log('1. Visit your app URL');
  console.log('2. Login with admin credentials');
  console.log('3. Upload menu via Excel file');
  console.log('4. Start using the system!');
  
  console.log('\n📚 Documentation:');
  console.log('- Railway Dashboard: https://railway.app/dashboard');
  console.log('- Deployment Guide: ./RAILWAY_DEPLOYMENT_GUIDE.md');
  console.log('- API Documentation: /api/health');
}

// Run deployment
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = { main };

// scripts/checkEnv.js
require('dotenv').config();

const requiredEnvVars = [
    'BSC_MAINNET_URL',
    'BSC_TESTNET_URL',
    'DEPLOYER_PRIVATE_KEY',
    'DEPLOYER_ADDRESS',
    'BSCSCAN_API_KEY',
    'FUNDOS_WALLET',
    'CORE_TEAM_WALLET',
    'BENEFICIARIOS_WALLET',
    'INVESTIMENTO_WALLET',
    'LIQUIDEZ_WALLET'
];

const deployedEnvVars = [
    'BITSENA_TOKEN_ADDRESS',
    'BITSENA_VESTING_ADDRESS'
];

console.log('Verificando variáveis de ambiente necessárias...');

let missingVars = [];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        missingVars.push(envVar);
    }
}

if (missingVars.length > 0) {
    console.error('❌ As seguintes variáveis de ambiente necessárias estão faltando:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('\nPor favor, preencha essas variáveis no arquivo .env antes de prosseguir.');
} else {
    console.log('✅ Todas as variáveis de ambiente necessárias estão configuradas.');
}

console.log('\nVerificando variáveis de ambiente de contratos implantados...');

let missingDeployedVars = [];
for (const envVar of deployedEnvVars) {
    if (!process.env[envVar]) {
        missingDeployedVars.push(envVar);
    }
}

if (missingDeployedVars.length > 0) {
    console.log('ℹ️ As seguintes variáveis de endereços de contratos não estão definidas:');
    missingDeployedVars.forEach(v => console.log(`   - ${v}`));
    console.log('\nIsso é normal se os contratos ainda não foram implantados.');
} else {
    console.log('✅ Todos os endereços de contratos estão configurados.');
}
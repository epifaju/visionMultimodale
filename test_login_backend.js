const axios = require('axios');

async function testLogin() {
    const baseURL = 'http://localhost:8080';
    
    console.log('🧪 Test de l\'endpoint de login...\n');
    
    // Test 1: Vérifier que le serveur répond
    try {
        console.log('1. Test de connectivité du serveur...');
        const healthResponse = await axios.get(`${baseURL}/api/auth/test`);
        console.log('✅ Serveur accessible:', healthResponse.data);
    } catch (error) {
        console.error('❌ Serveur inaccessible:', error.message);
        return;
    }
    
    // Test 2: Vérifier les utilisateurs en base
    try {
        console.log('\n2. Test de récupération des utilisateurs...');
        const usersResponse = await axios.get(`${baseURL}/api/auth/test-users`);
        console.log('✅ Utilisateurs trouvés:', usersResponse.data);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des utilisateurs:', error.response?.data || error.message);
    }
    
    // Test 3: Test de login avec les bonnes credentials
    const testCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'user', password: 'user123' },
        { username: 'demo', password: 'demo123' }
    ];
    
    for (const cred of testCredentials) {
        try {
            console.log(`\n3. Test de login avec ${cred.username}...`);
            const loginResponse = await axios.post(`${baseURL}/api/auth/login`, cred, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(`✅ Login réussi pour ${cred.username}:`, {
                status: loginResponse.status,
                hasToken: !!loginResponse.data?.token,
                userRole: loginResponse.data?.user?.role
            });
        } catch (error) {
            console.error(`❌ Login échoué pour ${cred.username}:`, {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
        }
    }
    
    // Test 4: Test avec les mauvaises credentials (votre cas)
    try {
        console.log('\n4. Test de login avec les credentials incorrects (admin/password)...');
        const badLoginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            username: 'admin',
            password: 'password'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Login inattendu réussi:', badLoginResponse.data);
    } catch (error) {
        console.error('❌ Login échoué comme attendu:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
    }
}

// Exécuter le test
testLogin().catch(console.error);


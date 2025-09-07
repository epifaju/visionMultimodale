// Script de test pour vérifier le token JWT
console.log('🔍 Test du token JWT');

// Simuler une connexion et récupérer le token
const testLogin = async () => {
  try {
    console.log('📤 Envoi de la requête de connexion...');
    
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'test123'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Connexion réussie:', data);
    
    if (data.token) {
      console.log('🔑 Token reçu:', data.token);
      console.log('📏 Longueur du token:', data.token.length);
      console.log('🔍 Points dans le token:', (data.token.match(/\./g) || []).length);
      
      // Test de l'endpoint documents avec le token
      console.log('\n📋 Test de l\'endpoint documents...');
      
      const documentsResponse = await fetch('http://localhost:8080/api/documents?page=0&size=20&sortBy=uploadedAt&sortDir=desc', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📊 Status documents:', documentsResponse.status);
      
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        console.log('✅ Documents récupérés:', documentsData);
      } else {
        const errorText = await documentsResponse.text();
        console.log('❌ Erreur documents:', errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

testLogin();

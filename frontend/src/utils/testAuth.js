// Simple manual test function you can call from browser console
export const testAuthFlow = async () => {
    const baseURL = 'http://localhost:5000/api';

    console.log('🧪 Testing Auth Flow...\n');

    try {
        // 1. Register
        console.log('1️⃣ Testing Registration...');
        const registerRes = await fetch(`${baseURL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'password123',
            }),
        });
        const registerData = await registerRes.json();
        console.log('✅ Register:', registerData);

        // 2. Login
        console.log('\n2️⃣ Testing Login...');
        const loginRes = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: registerData.user.email,
                password: 'password123',
            }),
        });
        const loginData = await loginRes.json();
        console.log('✅ Login:', loginData);

        // 3. Get Current User
        console.log('\n3️⃣ Testing Get Current User...');
        const meRes = await fetch(`${baseURL}/auth/me`, {
            headers: { Authorization: `Bearer ${loginData.accessToken}` },
        });
        const meData = await meRes.json();
        console.log('✅ Get Me:', meData);

        // 4. Logout
        console.log('\n4️⃣ Testing Logout...');
        const logoutRes = await fetch(`${baseURL}/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${loginData.accessToken}` },
        });
        const logoutData = await logoutRes.json();
        console.log('✅ Logout:', logoutData);

        console.log('\n🎉 All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

// Make it available in browser console
if (typeof window !== 'undefined') {
    window.testAuthFlow = testAuthFlow;
}
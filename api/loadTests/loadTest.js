import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// Load users
const users = new SharedArray('users', function () {
    let arr = [];
    for (let i = 1; i <= 50; i++) {
        arr.push({
            email: `testuser${i}@example.com`,
            password: 'password123',
        });
    }
    return arr;
});

export let options = {
    vus: 50,
    duration: '10s',
    thresholds: {
        checks: ['rate>0.95'], // 95% of checks should pass
        http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    },
};

export default function () {
    const user = users[Math.floor(Math.random() * users.length)];

    // 1. Login to get cookie
    const loginRes = http.post('http://localhost:5500/api/login', JSON.stringify({
        email: user.email,
        password: user.password,
    }), {
        headers: { 'Content-Type': 'application/json' },
    });

    check(loginRes, {
        'login succeeded': (r) => r.status === 200 && r.json('message') === 'Login successful',
    });

    // 2. Extract cookie
    const cookies = loginRes.headers['Set-Cookie'];
    if (!cookies) {
        return;
    }

    // 3. Authenticated request to /api/profile (GET)
    const profileRes = http.get('http://localhost:5500/api/profile', {
        headers: { 'Cookie': cookies },
    });
    check(profileRes, {
        'profile succeeded': (r) => r.status === 200 && r.json('user'),
    });

    // 4. Update profile (PUT)
    const updateRes = http.put('http://localhost:5500/api/profile', JSON.stringify({
        name: `User${Math.floor(Math.random() * 10000)}`,
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies,
        },
    });
    check(updateRes, {
        'profile update succeeded': (r) => r.status === 200 && r.json('user'),
    });

    // 7. Search teams (GET)
    const searchRes = http.get('http://localhost:5500/api/teams/search?q=Temp', {
        headers: { 'Cookie': cookies },
    });
    check(searchRes, {
        'team search status': (r) => r.status === 200,
    });

    // 8. Logout
    const logoutRes = http.post('http://localhost:5500/api/logout', null, {
        headers: { 'Cookie': cookies },
    });
    check(logoutRes, {
        'logout succeeded': (r) => r.status === 200,
    });

    sleep(1);
}

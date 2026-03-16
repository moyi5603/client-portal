// 认证API
export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { username, password } = req.body;
    
    // 模拟登录验证
    if (username === 'admin' && password === 'admin123') {
      res.status(200).json({
        success: true,
        data: {
          token: 'jwt-token-' + Date.now(),
          user: {
            id: '1',
            username: 'admin',
            accountType: 'MAIN'
          }
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
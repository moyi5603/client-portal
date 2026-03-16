// 简化的认证 API
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    
    // 简单的认证逻辑
    if (username === 'admin' && password === 'admin123') {
      res.status(200).json({
        success: true,
        data: {
          token: 'mock-jwt-token',
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
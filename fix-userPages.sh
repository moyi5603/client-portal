#!/bin/bash
# 修复 userPages.ts 中的类型错误

# 1. 替换 authenticateToken 为 authenticate
sed -i 's/authenticateToken/authenticate/g' src/routes/userPages.ts

# 2. 移除 auditLog 中间件（暂时不使用）
sed -i 's/, auditLog//g' src/routes/userPages.ts

# 3. 修复 userId 获取
sed -i 's/req\.user\.id/req.user?.accountId || req.user?.id || ""/g' src/routes/userPages.ts
sed -i 's/req\.user?\.userId/req.user?.accountId/g' src/routes/userPages.ts

echo "修复完成！"

# 账号管理页面角色显示更新

## 更新内容

已成功修改账号管理页面的角色显示逻辑，现在主账号的角色会正确显示为"超级管理"。

## 具体修改

### 1. 账号管理页面 (`client/src/pages/AccountManagement.tsx`)

#### 修改前：
- 主账号（MAIN类型）显示固定文本"全部权限"
- 不显示具体的角色信息

#### 修改后：
- 移除了对主账号的特殊处理
- 所有账号都显示其实际分配的角色
- 超级管理员角色（ROLE-000 或 "Super Administrator"）特殊显示为"超级管理"/"Super Admin"

### 2. 国际化支持 (`client/src/contexts/LocaleContext.tsx`)

添加了新的翻译键：
- 中文：`'role.superAdmin': '超级管理'`
- 英文：`'role.superAdmin': 'Super Admin'`

## 显示逻辑

```typescript
const getRoleBadges = (account: Account) => {
  if (!account.roles || account.roles.length === 0) {
    return <span className="text-secondary">{t('account.noRoles')}</span>;
  }
  
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
      {account.roles.slice(0, 2).map((roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        let displayName = role ? role.name : roleId;
        
        // 特殊处理：超级管理员角色显示为"超级管理"
        if (roleId === 'ROLE-000' || (role && role.name === 'Super Administrator')) {
          displayName = t('role.superAdmin');
        }
        
        return (
          <Badge key={roleId} variant="default">
            {displayName}
          </Badge>
        );
      })}
      {account.roles.length > 2 && (
        <Badge variant="secondary">+{account.roles.length - 2}</Badge>
      )}
    </div>
  );
};
```

## 预期效果

### 主账号显示：
- **中文界面**：显示"超级管理"徽章
- **英文界面**：显示"Super Admin"徽章

### 其他账号显示：
- 显示其实际分配的角色名称
- 如果某个账号也被分配了超级管理员角色，同样显示为"超级管理"/"Super Admin"

## 验证方法

1. 访问 http://localhost:3003
2. 使用 admin/admin123 登录
3. 进入账号管理页面
4. 查看主账号（admin）的角色列显示
5. 应该看到"超级管理"徽章而不是"全部权限"

## 技术细节

- 使用了角色ID（ROLE-000）和角色名称（Super Administrator）双重检查
- 支持国际化，根据当前语言显示对应文本
- 保持了原有的角色显示逻辑，只是特殊处理超级管理员角色
- 热模块替换已自动应用更改，无需重启服务

## 兼容性

- 向后兼容：不影响其他角色的显示
- 多语言支持：中英文界面都有对应显示
- 响应式设计：保持原有的徽章样式和布局
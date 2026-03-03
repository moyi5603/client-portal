# Customer-Facility Mapping 更新说明

## 更新日期
2025年1月27日

## 更新内容

### 功能变更
将账号管理中的Customer和Facility分配方式从独立选择改为层级关系：
- **旧方式**：独立选择Customer列表和Facility列表
- **新方式**：先选择Customer，然后为每个Customer单独分配Facility

### 用户界面变更

#### 创建/编辑账号对话框
1. **Customer & Facility 区域**
   - 合并为一个统一的区域，使用边框包裹
   - 顶部显示"Customer & Facility"标签

2. **Customer 选择**
   - 使用下拉菜单选择多个Customer
   - 显示已选择的Customer数量
   - 可以随时添加或移除Customer

3. **Facility 分配**
   - 为每个选中的Customer显示独立的配置卡片
   - 每个卡片包含：
     - Customer名称（蓝色badge）
     - 移除Customer按钮（X图标）
     - Facility选择下拉菜单
     - 已选择的Facility标签列表（绿色badge）
   - 每个Customer可以有不同的Facility配置

### 数据结构变更

#### 新增接口
```typescript
interface CustomerFacilityMapping {
  customerId: string;
  facilityIds: string[];
}
```

#### FormData 更新
```typescript
interface FormData {
  // ... 其他字段
  customerFacilityMappings: CustomerFacilityMapping[];  // 新增
}
```

### 技术实现

#### 数据转换
- **前端 → 后端**：从 `customerFacilityMappings` 提取所有 `customerIds` 和去重后的 `facilityIds`
- **后端 → 前端**：编辑时将现有的 `customerIds` 和 `facilityIds` 转换为 `customerFacilityMappings`

#### 提交逻辑
```typescript
// 提取customerIds
const accessibleCustomerIds = formData.customerFacilityMappings.map(m => m.customerId);

// 提取并去重facilityIds
const allFacilityIds = new Set<string>();
formData.customerFacilityMappings.forEach(m => {
  m.facilityIds.forEach(id => allFacilityIds.add(id));
});
const accessibleFacilityIds = Array.from(allFacilityIds);
```

### 列表页展示变更

#### 表格列调整
- **合并列**：将原来的"Customer"和"Facility"两列合并为一列"Customer & Facility"
- **列宽**：设置最小宽度200px以容纳层级显示

#### 显示格式

**主账号（MAIN）**：
```
[All Customers]
→ All Facilities
```

**普通账号**：
```
[customer-1]
→ [facility-1] [facility-2]
[customer-2]
→ [facility-2] [facility-3]
+1 more customer(s)
```

#### 显示规则
1. **最多显示2个Customer**
   - 每个Customer显示为蓝色badge
   - 超过2个显示"+N more customer(s)"

2. **每个Customer下显示其Facility**
   - 使用箭头"→"表示层级关系
   - Facility显示为绿色小badge
   - 最多显示2个Facility，超过显示"+N"

3. **无数据显示**
   - 无Customer时显示灰色文字"无"

#### 视觉层级
- Customer badge：蓝色，11px字体
- Facility badge：绿色，10px字体，带1px内边距
- 箭头和计数：11px灰色文字
- 整体垂直排列，间距6px

### CSV导出更新

#### 列头变更
- 将"Customer"和"Facility"合并为"Customer & Facility"

#### 导出格式
```
customer-1(code1) → [facility-1, facility-2]; customer-2(code2) → [facility-3]
```

每个Customer-Facility对用分号分隔，便于在Excel中查看。

1. **更清晰的层级关系**
   - 用户可以直观地看到每个Customer对应的Facility
   - 避免了独立选择时的混淆

2. **灵活的配置**
   - 每个Customer可以有不同的Facility配置
   - 支持快速添加/移除Customer及其Facility

3. **视觉反馈**
   - Customer使用蓝色badge
   - Facility使用绿色badge
   - 配置卡片使用浅色背景区分

### 后续优化建议

1. **数据持久化**
   - 考虑在后端存储完整的Customer-Facility映射关系
   - 当前实现是将所有Facility合并后存储

2. **批量操作**
   - 添加"为所有Customer分配相同Facility"的快捷操作
   - 支持复制某个Customer的Facility配置到其他Customer

3. **验证规则**
   - 添加必须为每个Customer至少分配一个Facility的验证
   - 或允许Customer没有Facility（根据业务需求）

## 影响范围

### 修改的文件
- `client/src/pages/AccountManagement.tsx`

### 不受影响的功能
- 账号列表显示
- 筛选功能
- 删除功能
- 重置密码功能
- 角色分配功能

## 测试建议

1. **创建账号测试**
   - 选择单个Customer，分配多个Facility
   - 选择多个Customer，为每个分配不同的Facility
   - 选择Customer但不分配Facility

2. **编辑账号测试**
   - 编辑现有账号，修改Customer-Facility映射
   - 添加新的Customer并分配Facility
   - 移除某个Customer及其Facility

3. **数据一致性测试**
   - 验证保存后的数据是否正确
   - 验证编辑时数据是否正确回显

---

**文档版本**：1.0  
**最后更新**：2025年1月27日

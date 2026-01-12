// Demo 数据和状态
let conversationHistory = [];
let currentPageConfig = null;
let isProcessing = false;

// 模拟的API数据
const mockAPIs = {
    user: [
        { method: 'GET', endpoint: '/api/users', description: '获取用户列表' },
        { method: 'POST', endpoint: '/api/users', description: '创建新用户' },
        { method: 'PUT', endpoint: '/api/users/:id', description: '更新用户信息' },
        { method: 'DELETE', endpoint: '/api/users/:id', description: '删除用户' }
    ],
    role: [
        { method: 'GET', endpoint: '/api/roles', description: '获取角色列表' },
        { method: 'POST', endpoint: '/api/roles', description: '创建新角色' },
        { method: 'PUT', endpoint: '/api/roles/:id', description: '更新角色信息' }
    ],
    menu: [
        { method: 'GET', endpoint: '/api/menus', description: '获取菜单列表' },
        { method: 'POST', endpoint: '/api/menus', description: '创建新菜单' }
    ]
};

// 模拟的页面模板
const pageTemplates = {
    userList: {
        title: '用户管理',
        type: 'list',
        fields: ['ID', '用户名', '邮箱', '角色', '状态', '创建时间'],
        operations: ['新增', '编辑', '删除', '搜索'],
        mockData: [
            { id: 1, username: 'admin', email: 'admin@example.com', role: '管理员', status: '激活', createdAt: '2024-01-01' },
            { id: 2, username: 'user1', email: 'user1@example.com', role: '普通用户', status: '激活', createdAt: '2024-01-02' },
            { id: 3, username: 'user2', email: 'user2@example.com', role: '普通用户', status: '禁用', createdAt: '2024-01-03' }
        ]
    },
    roleList: {
        title: '角色管理',
        type: 'list',
        fields: ['ID', '角色名称', '描述', '权限数量', '用户数量', '创建时间'],
        operations: ['新增', '编辑', '删除', '权限配置'],
        mockData: [
            { id: 1, name: '管理员', description: '系统管理员角色', permissions: 15, users: 2, createdAt: '2024-01-01' },
            { id: 2, name: '普通用户', description: '普通用户角色', permissions: 5, users: 10, createdAt: '2024-01-01' }
        ]
    },
    menuList: {
        title: '菜单管理',
        type: 'list',
        fields: ['ID', '菜单名称', '路径', '图标', '父级菜单', '排序'],
        operations: ['新增', '编辑', '删除', '排序'],
        mockData: [
            { id: 1, name: '系统管理', path: '/system', icon: '⚙️', parent: '-', order: 1 },
            { id: 2, name: '用户管理', path: '/system/users', icon: '👥', parent: '系统管理', order: 1 },
            { id: 3, name: '角色管理', path: '/system/roles', icon: '🔐', parent: '系统管理', order: 2 }
        ]
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
    setupEventListeners();
});

function initializeChat() {
    const welcomeMessage = {
        role: 'agent',
        content: '您好！我是页面设计助手。我可以帮您通过对话的方式创建个性化的页面。请告诉我您想要创建什么类型的页面？',
        timestamp: new Date(),
        suggestions: ['创建用户管理页面', '创建角色管理页面', '创建菜单管理页面', '创建数据统计页面']
    };
    
    addMessage(welcomeMessage);
    updateSuggestions(welcomeMessage.suggestions);
}

function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    messageInput.addEventListener('input', function() {
        sendBtn.disabled = !this.value.trim();
    });
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message || isProcessing) return;
    
    // 添加用户消息
    const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
    };
    
    addMessage(userMessage);
    input.value = '';
    document.getElementById('sendBtn').disabled = true;
    
    // 处理消息
    processMessage(message);
}

function processMessage(message) {
    isProcessing = true;
    
    // 显示加载状态
    showTyping();
    
    // 模拟处理延迟
    setTimeout(() => {
        const response = generateResponse(message);
        hideTyping();
        addMessage(response);
        
        if (response.pageConfig) {
            generatePagePreview(response.pageConfig);
        }
        
        if (response.suggestions) {
            updateSuggestions(response.suggestions);
        }
        
        isProcessing = false;
    }, 1500 + Math.random() * 1000);
}

function generateResponse(message) {
    const messageLower = message.toLowerCase();
    
    // 检测自定义表头格式：表头：xxx，xxx，xxx
    const customTableMatch = message.match(/表头[：:]\s*(.+)/);
    if (customTableMatch) {
        const headers = customTableMatch[1].split(/[，,、]/).map(h => h.trim()).filter(h => h);
        if (headers.length > 0) {
            return generateCustomTableResponse(headers, message);
        }
    }
    
    // 检测其他表格描述格式
    const tablePatterns = [
        /创建.*表格.*包含[：:](.+)/,
        /生成.*表格.*字段[：:](.+)/,
        /表格字段[：:](.+)/,
        /列名[：:](.+)/,
        /字段[：:](.+)/
    ];
    
    for (const pattern of tablePatterns) {
        const match = message.match(pattern);
        if (match) {
            const headers = match[1].split(/[，,、]/).map(h => h.trim()).filter(h => h);
            if (headers.length > 0) {
                return generateCustomTableResponse(headers, message);
            }
        }
    }
    
    // 用户管理页面
    if (messageLower.includes('用户管理') || messageLower.includes('用户列表')) {
        return {
            role: 'agent',
            content: '好的，我来帮您创建用户管理页面。\n\n根据您的需求，页面将包含：\n- 用户列表显示\n- 搜索和筛选功能\n- 新增用户功能\n- 编辑用户功能\n- 删除用户功能\n\n我发现系统有以下相关API：\n- GET /api/users - 获取用户列表\n- POST /api/users - 创建新用户\n- PUT /api/users/:id - 更新用户信息\n- DELETE /api/users/:id - 删除用户\n\n这样的设计符合您的需求吗？',
            timestamp: new Date(),
            apis: mockAPIs.user,
            pageConfig: pageTemplates.userList,
            suggestions: ['确认生成页面', '添加批量操作', '修改字段显示', '添加导出功能']
        };
    }
    
    // 角色管理页面
    if (messageLower.includes('角色管理') || messageLower.includes('角色列表')) {
        return {
            role: 'agent',
            content: '好的，我来帮您创建角色管理页面。\n\n页面将包含：\n- 角色列表显示\n- 角色权限配置\n- 新增角色功能\n- 编辑角色功能\n\n相关API接口：\n- GET /api/roles - 获取角色列表\n- POST /api/roles - 创建新角色\n- PUT /api/roles/:id - 更新角色信息\n\n是否需要添加权限分配功能？',
            timestamp: new Date(),
            apis: mockAPIs.role,
            pageConfig: pageTemplates.roleList,
            suggestions: ['确认生成页面', '添加权限分配', '添加用户关联', '修改显示字段']
        };
    }
    
    // 菜单管理页面
    if (messageLower.includes('菜单管理') || messageLower.includes('菜单列表')) {
        return {
            role: 'agent',
            content: '好的，我来帮您创建菜单管理页面。\n\n页面将包含：\n- 树形菜单结构显示\n- 菜单拖拽排序\n- 新增菜单功能\n- 编辑菜单功能\n\n相关API接口：\n- GET /api/menus - 获取菜单列表\n- POST /api/menus - 创建新菜单\n\n需要支持菜单图标选择吗？',
            timestamp: new Date(),
            apis: mockAPIs.menu,
            pageConfig: pageTemplates.menuList,
            suggestions: ['确认生成页面', '添加图标选择', '添加权限控制', '支持拖拽排序']
        };
    }
    
    // 确认生成
    if (messageLower.includes('确认') || messageLower.includes('生成页面') || messageLower.includes('好的')) {
        if (currentPageConfig) {
            return {
                role: 'agent',
                content: '好的，我已经为您生成了页面。您可以在右侧预览窗口中查看效果。\n\n页面包含了完整的功能：\n- 数据列表展示\n- 搜索筛选功能\n- 增删改操作\n- 响应式布局\n\n您可以保存这个页面到您的个人空间，或者继续调整页面设计。',
                timestamp: new Date(),
                suggestions: ['保存页面', '修改样式', '添加更多功能', '创建新页面']
            };
        }
    }
    
    // 默认响应
    return {
        role: 'agent',
        content: '我理解您想要创建页面。请告诉我您具体需要什么功能？\n\n我可以帮您创建：\n- 数据管理页面（列表、表单）\n- 统计分析页面\n- 用户交互页面\n- 系统配置页面\n\n您也可以直接指定表头来创建表格，格式如：\n"表头：姓名，年龄，部门，职位"',
        timestamp: new Date(),
        suggestions: ['创建用户管理页面', '创建角色管理页面', '表头：姓名，年龄，部门', '表头：产品名称，价格，库存']
    };
}

// 生成自定义表格响应
function generateCustomTableResponse(headers, originalMessage) {
    // 生成示例数据
    const mockData = generateMockDataForHeaders(headers);
    
    // 创建自定义页面配置
    const customPageConfig = {
        title: '自定义数据表格',
        type: 'list',
        fields: headers,
        operations: ['新增', '编辑', '删除', '搜索', '导出'],
        mockData: mockData,
        isCustom: true
    };
    
    return {
        role: 'agent',
        content: `好的，我已经根据您指定的表头创建了表格。\n\n表格包含以下字段：\n${headers.map(h => `- ${h}`).join('\n')}\n\n我为您生成了${mockData.length}条示例数据来展示效果。您可以：\n- 查看表格预览\n- 修改字段名称\n- 添加更多操作功能\n- 调整数据类型\n\n这个表格符合您的需求吗？`,
        timestamp: new Date(),
        pageConfig: customPageConfig,
        suggestions: ['确认生成页面', '修改字段名称', '添加更多字段', '更改数据类型', '添加筛选功能']
    };
}

// 为指定表头生成模拟数据
function generateMockDataForHeaders(headers) {
    const dataGenerators = {
        // 姓名相关
        '姓名': () => ['张三', '李四', '王五', '赵六', '钱七'][Math.floor(Math.random() * 5)],
        '名称': () => ['张三', '李四', '王五', '赵六', '钱七'][Math.floor(Math.random() * 5)],
        '用户名': () => ['admin', 'user001', 'manager', 'guest', 'test'][Math.floor(Math.random() * 5)],
        
        // 年龄相关
        '年龄': () => Math.floor(Math.random() * 40) + 20,
        
        // 部门相关
        '部门': () => ['技术部', '销售部', '市场部', '人事部', '财务部'][Math.floor(Math.random() * 5)],
        '科室': () => ['技术科', '销售科', '市场科', '人事科', '财务科'][Math.floor(Math.random() * 5)],
        
        // 职位相关
        '职位': () => ['经理', '主管', '专员', '助理', '总监'][Math.floor(Math.random() * 5)],
        '岗位': () => ['开发工程师', '产品经理', '设计师', '测试工程师', '运维工程师'][Math.floor(Math.random() * 5)],
        
        // 状态相关
        '状态': () => ['激活', '禁用', '待审核'][Math.floor(Math.random() * 3)],
        
        // 时间相关
        '创建时间': () => new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
        '更新时间': () => new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
        '日期': () => new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
        
        // 联系方式
        '电话': () => '138' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
        '手机': () => '138' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
        '邮箱': () => ['zhang@example.com', 'li@example.com', 'wang@example.com', 'zhao@example.com'][Math.floor(Math.random() * 4)],
        
        // 数值相关
        '价格': () => '¥' + (Math.random() * 1000).toFixed(2),
        '金额': () => '¥' + (Math.random() * 10000).toFixed(2),
        '数量': () => Math.floor(Math.random() * 100) + 1,
        '库存': () => Math.floor(Math.random() * 500) + 10,
        '销量': () => Math.floor(Math.random() * 1000) + 1,
        
        // 产品相关
        '产品名称': () => ['iPhone 15', 'MacBook Pro', 'iPad Air', 'Apple Watch', 'AirPods'][Math.floor(Math.random() * 5)],
        '商品名称': () => ['笔记本电脑', '台式机', '显示器', '键盘', '鼠标'][Math.floor(Math.random() * 5)],
        '品牌': () => ['苹果', '华为', '小米', '三星', '联想'][Math.floor(Math.random() * 5)],
        
        // 地址相关
        '地址': () => ['北京市朝阳区', '上海市浦东新区', '广州市天河区', '深圳市南山区'][Math.floor(Math.random() * 4)],
        '城市': () => ['北京', '上海', '广州', '深圳', '杭州'][Math.floor(Math.random() * 5)],
        
        // ID相关
        'ID': (index) => index + 1,
        'id': (index) => index + 1,
        '编号': (index) => 'NO' + (index + 1).toString().padStart(3, '0'),
        
        // 默认生成器
        'default': (index, header) => `${header}${index + 1}`
    };
    
    const mockData = [];
    for (let i = 0; i < 5; i++) {
        const row = {};
        headers.forEach(header => {
            const generator = dataGenerators[header] || dataGenerators['default'];
            row[header] = generator(i, header);
        });
        mockData.push(row);
    }
    
    return mockData;
}

function addMessage(message) {
    conversationHistory.push(message);
    
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.role}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = message.role === 'user' ? '👤' : '🤖';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textDiv = document.createElement('div');
    textDiv.textContent = message.content;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = message.timestamp.toLocaleTimeString();
    
    contentDiv.appendChild(textDiv);
    contentDiv.appendChild(timeDiv);
    
    // 添加API信息
    if (message.apis && message.apis.length > 0) {
        const apiDiv = document.createElement('div');
        apiDiv.className = 'api-list';
        apiDiv.innerHTML = '<strong>🔌 相关API：</strong>';
        
        message.apis.forEach(api => {
            const apiItem = document.createElement('div');
            apiItem.className = 'api-item';
            apiItem.innerHTML = `
                <span class="api-method">${api.method}</span>
                <span>${api.endpoint}</span>
                <span style="color: #666; font-size: 12px;">- ${api.description}</span>
            `;
            apiDiv.appendChild(apiItem);
        });
        
        contentDiv.appendChild(apiDiv);
    }
    
    // 添加建议按钮
    if (message.suggestions && message.suggestions.length > 0) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'suggestions-container';
        suggestionsDiv.innerHTML = '<div style="font-size: 12px; color: #666; margin-bottom: 8px;">💡 您可以尝试：</div>';
        
        message.suggestions.forEach(suggestion => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.textContent = suggestion;
            btn.onclick = () => {
                document.getElementById('messageInput').value = suggestion;
                sendMessage();
            };
            suggestionsDiv.appendChild(btn);
        });
        
        contentDiv.appendChild(suggestionsDiv);
    }
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // 滚动到底部
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // 保存页面配置
    if (message.pageConfig) {
        currentPageConfig = message.pageConfig;
    }
}

function showTyping() {
    const messagesContainer = document.getElementById('messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message agent';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="loading">
                <div class="spinner"></div>
                <span>正在思考...</span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTyping() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function updateSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';
    
    suggestions.forEach(suggestion => {
        const btn = document.createElement('button');
        btn.className = 'quick-suggestion';
        btn.textContent = suggestion;
        btn.onclick = () => {
            document.getElementById('messageInput').value = suggestion;
            sendMessage();
        };
        suggestionsContainer.appendChild(btn);
    });
}

function generatePagePreview(pageConfig) {
    const previewResult = document.getElementById('previewResult');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    
    previewPlaceholder.style.display = 'none';
    previewResult.style.display = 'block';
    
    // 生成页面HTML
    const pageHTML = `
        <div class="generated-page">
            <div class="page-header">
                <h2 class="page-title">${pageConfig.title}</h2>
                <div class="page-actions">
                    ${pageConfig.operations.map(op => 
                        `<button class="action-btn ${getButtonClass(op)}">${op}</button>`
                    ).join('')}
                    <button class="action-btn" onclick="openSaveModal()">💾 保存页面</button>
                </div>
            </div>
            
            <div class="search-bar">
                <input type="text" class="search-input" placeholder="搜索数据...">
                ${pageConfig.isCustom ? '<span style="margin-left: 10px; color: #666; font-size: 12px;">✨ 自定义表格</span>' : ''}
            </div>
            
            <table class="data-table">
                <thead>
                    <tr>
                        ${pageConfig.fields.map(field => `<th>${field}</th>`).join('')}
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateTableRows(pageConfig)}
                </tbody>
            </table>
            
            ${pageConfig.isCustom ? `
                <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 4px;">
                    <div style="font-size: 14px; color: #0369a1; font-weight: 500;">💡 提示</div>
                    <div style="font-size: 12px; color: #075985; margin-top: 4px;">
                        这是根据您指定的表头"${pageConfig.fields.join('，')}"自动生成的表格，包含了${pageConfig.mockData.length}条示例数据。
                        您可以继续对话来调整字段、添加功能或修改样式。
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    previewResult.innerHTML = pageHTML;
    
    // 更新配置显示
    updateConfigDisplay(pageConfig);
}

// 生成表格行数据
function generateTableRows(pageConfig) {
    return pageConfig.mockData.map(row => `
        <tr>
            ${pageConfig.fields.map(field => {
                const value = row[field];
                // 特殊字段的渲染处理
                if (field === '状态' || field === 'status') {
                    const statusClass = (value === '激活' || value === 'active') ? 'status-active' : 
                                       (value === '禁用' || value === 'inactive') ? 'status-inactive' : 'status-pending';
                    return `<td><span class="status-tag ${statusClass}">${value}</span></td>`;
                } else if (field.includes('时间') || field.includes('日期')) {
                    return `<td><span style="color: #666; font-size: 13px;">${value}</span></td>`;
                } else if (field.includes('价格') || field.includes('金额')) {
                    return `<td><span style="color: #f56565; font-weight: 500;">${value}</span></td>`;
                } else if (field.includes('数量') || field.includes('库存')) {
                    return `<td><span style="color: #38a169; font-weight: 500;">${value}</span></td>`;
                } else if (field === 'ID' || field === 'id' || field.includes('编号')) {
                    return `<td><span style="font-family: monospace; color: #4a5568;">${value}</span></td>`;
                } else {
                    return `<td>${value}</td>`;
                }
            }).join('')}
            <td>
                <button class="action-btn" style="font-size: 12px; padding: 4px 8px;">编辑</button>
                <button class="action-btn danger" style="font-size: 12px; padding: 4px 8px; margin-left: 4px;">删除</button>
            </td>
        </tr>
    `).join('');
}

function getButtonClass(operation) {
    const classMap = {
        '新增': 'success',
        '删除': 'danger',
        '编辑': '',
        '搜索': '',
        '权限配置': '',
        '排序': ''
    };
    return classMap[operation] || '';
}

function updateConfigDisplay(pageConfig) {
    const configDisplay = document.getElementById('configDisplay');
    
    const configHTML = `
        <div class="config-item">
            <div class="config-label">页面类型</div>
            <div class="config-value">${pageConfig.type}${pageConfig.isCustom ? ' (自定义表格)' : ''}</div>
        </div>
        <div class="config-item">
            <div class="config-label">页面标题</div>
            <div class="config-value">${pageConfig.title}</div>
        </div>
        <div class="config-item">
            <div class="config-label">显示字段</div>
            <div class="config-value">${pageConfig.fields.join(', ')}</div>
        </div>
        <div class="config-item">
            <div class="config-label">字段数量</div>
            <div class="config-value">${pageConfig.fields.length} 个字段</div>
        </div>
        <div class="config-item">
            <div class="config-label">支持操作</div>
            <div class="config-value">${pageConfig.operations.join(', ')}</div>
        </div>
        <div class="config-item">
            <div class="config-label">数据条数</div>
            <div class="config-value">${pageConfig.mockData.length} 条示例数据</div>
        </div>
        ${pageConfig.isCustom ? `
            <div class="config-item">
                <div class="config-label">创建方式</div>
                <div class="config-value">对话式自定义表头</div>
            </div>
        ` : ''}
        <div class="config-item">
            <div class="config-label">生成时间</div>
            <div class="config-value">${new Date().toLocaleString()}</div>
        </div>
    `;
    
    configDisplay.innerHTML = configHTML;
}

function switchTab(tabName) {
    // 更新标签按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 切换内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
}

function clearChat() {
    conversationHistory = [];
    currentPageConfig = null;
    document.getElementById('messages').innerHTML = '';
    document.getElementById('suggestions').innerHTML = '';
    document.getElementById('previewResult').style.display = 'none';
    document.getElementById('previewPlaceholder').style.display = 'flex';
    document.getElementById('configDisplay').innerHTML = '<p>页面配置信息将在这里显示</p>';
    
    // 重新初始化
    initializeChat();
}

function openSaveModal() {
    document.getElementById('saveModal').style.display = 'flex';
}

function closeSaveModal() {
    document.getElementById('saveModal').style.display = 'none';
    document.getElementById('pageName').value = '';
    document.getElementById('pageDescription').value = '';
}

function savePage() {
    const pageName = document.getElementById('pageName').value.trim();
    const pageDescription = document.getElementById('pageDescription').value.trim();
    
    if (!pageName) {
        alert('请输入页面名称');
        return;
    }
    
    if (!currentPageConfig) {
        alert('没有可保存的页面配置');
        return;
    }
    
    // 模拟保存过程
    const saveData = {
        name: pageName,
        description: pageDescription,
        config: currentPageConfig,
        createdAt: new Date().toISOString(),
        id: Date.now()
    };
    
    // 保存到本地存储（实际项目中会发送到服务器）
    const savedPages = JSON.parse(localStorage.getItem('savedPages') || '[]');
    savedPages.push(saveData);
    localStorage.setItem('savedPages', JSON.stringify(savedPages));
    
    alert(`页面 "${pageName}" 已保存成功！\n\n您可以在个人页面管理中查看和管理已保存的页面。`);
    closeSaveModal();
    
    // 添加成功消息
    const successMessage = {
        role: 'agent',
        content: `✅ 页面 "${pageName}" 已成功保存到您的个人空间！\n\n您可以：\n- 继续创建新的页面\n- 修改当前页面设计\n- 查看已保存的页面列表`,
        timestamp: new Date(),
        suggestions: ['创建新页面', '查看已保存页面', '修改当前页面', '导出页面代码']
    };
    
    addMessage(successMessage);
    updateSuggestions(successMessage.suggestions);
}

// 添加一些演示用的快捷功能
function quickDemo(type) {
    const demoMessages = {
        user: '我想创建一个用户管理页面，需要显示用户列表，支持搜索和编辑功能',
        role: '帮我创建一个角色管理页面，要能够配置角色权限',
        menu: '我需要一个菜单管理页面，支持树形结构和拖拽排序'
    };
    
    if (demoMessages[type]) {
        document.getElementById('messageInput').value = demoMessages[type];
        sendMessage();
    }
}

// 导出功能（可选）
function exportPageCode() {
    if (!currentPageConfig) {
        alert('请先生成页面');
        return;
    }
    
    const code = generatePageCode(currentPageConfig);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPageConfig.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generatePageCode(config) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        /* 页面样式 */
        body { font-family: Arial, sans-serif; margin: 20px; }
        .page-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 12px; border: 1px solid #ddd; text-align: left; }
        .data-table th { background-color: #f5f5f5; }
        .action-btn { padding: 6px 12px; margin: 2px; border: none; border-radius: 4px; cursor: pointer; }
        .action-btn.success { background-color: #28a745; color: white; }
        .action-btn.danger { background-color: #dc3545; color: white; }
    </style>
</head>
<body>
    <div class="page-header">
        <h1>${config.title}</h1>
        <div>
            ${config.operations.map(op => `<button class="action-btn">${op}</button>`).join('')}
        </div>
    </div>
    
    <table class="data-table">
        <thead>
            <tr>
                ${config.fields.map(field => `<th>${field}</th>`).join('')}
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
            ${config.mockData.map(row => `
                <tr>
                    ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                    <td>
                        <button class="action-btn">编辑</button>
                        <button class="action-btn danger">删除</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <script>
        // 页面交互逻辑
        console.log('${config.title} 页面已加载');
    </script>
</body>
</html>`;
}
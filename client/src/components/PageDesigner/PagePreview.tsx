import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, message, Modal, Input } from 'antd';
import { EyeOutlined, CodeOutlined, SaveOutlined, DownloadOutlined } from '@ant-design/icons';
import MonacoEditor from '@monaco-editor/react';
import './PagePreview.css';

const { TabPane } = Tabs;

interface PagePreviewProps {
  pageData?: {
    componentCode: string;
    styleCode: string;
    configCode: string;
    apiCalls: string[];
    dependencies: string[];
  };
  onSave?: (pageName: string, pageData: any) => void;
}

const PagePreview: React.FC<PagePreviewProps> = ({ pageData, onSave }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [pageName, setPageName] = useState('');
  const [previewContent, setPreviewContent] = useState<string>('');

  useEffect(() => {
    if (pageData) {
      generatePreviewContent();
    }
  }, [pageData]);

  const generatePreviewContent = () => {
    if (!pageData) return;

    // 生成预览HTML
    const previewHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面预览</title>
    <link rel="stylesheet" href="https://unpkg.com/antd@4.24.0/dist/antd.min.css">
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f0f2f5;
        }
        ${pageData.styleCode}
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/antd@4.24.0/dist/antd.min.js"></script>
    
    <script type="text/babel">
        // Mock data for preview
        const mockData = [
            { id: 1, name: '示例数据1', status: 'active', createdAt: '2024-01-01' },
            { id: 2, name: '示例数据2', status: 'inactive', createdAt: '2024-01-02' },
            { id: 3, name: '示例数据3', status: 'active', createdAt: '2024-01-03' }
        ];
        
        // Mock API calls
        const mockAPI = {
            get: () => Promise.resolve({ data: mockData }),
            post: (data) => Promise.resolve({ data: { ...data, id: Date.now() } }),
            put: (id, data) => Promise.resolve({ data: { ...data, id } }),
            delete: (id) => Promise.resolve({ success: true })
        };
        
        ${pageData.componentCode.replace(/fetch\(/g, 'mockAPI.get(')}
        
        ReactDOM.render(React.createElement(GeneratedPage), document.getElementById('root'));
    </script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</body>
</html>`;

    setPreviewContent(previewHTML);
  };

  const handleSave = async () => {
    if (!pageName.trim()) {
      message.error('请输入页面名称');
      return;
    }

    if (!pageData) {
      message.error('没有可保存的页面数据');
      return;
    }

    try {
      if (onSave) {
        await onSave(pageName, pageData);
        message.success('页面保存成功');
        setSaveModalVisible(false);
        setPageName('');
      }
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleDownload = () => {
    if (!pageData) {
      message.error('没有可下载的代码');
      return;
    }

    // 创建下载文件
    const files = [
      {
        name: 'Component.tsx',
        content: pageData.componentCode
      },
      {
        name: 'styles.css',
        content: pageData.styleCode
      },
      {
        name: 'config.ts',
        content: pageData.configCode
      }
    ];

    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    message.success('代码文件已下载');
  };

  const renderPreview = () => {
    if (!pageData) {
      return (
        <div className="preview-placeholder">
          <EyeOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p>开始对话来生成页面预览</p>
        </div>
      );
    }

    return (
      <div className="preview-container">
        <iframe
          srcDoc={previewContent}
          className="preview-iframe"
          title="页面预览"
        />
      </div>
    );
  };

  const renderCode = (code: string, language: string) => {
    return (
      <MonacoEditor
        height="500px"
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14
        }}
      />
    );
  };

  return (
    <div className="page-preview">
      <Card
        title="页面预览"
        extra={
          pageData && (
            <div className="preview-actions">
              <Button
                icon={<SaveOutlined />}
                onClick={() => setSaveModalVisible(true)}
                style={{ marginRight: 8 }}
              >
                保存页面
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                下载代码
              </Button>
            </div>
          )
        }
        className="preview-card"
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><EyeOutlined />预览</span>} key="preview">
            {renderPreview()}
          </TabPane>
          
          {pageData && (
            <>
              <TabPane tab={<span><CodeOutlined />组件代码</span>} key="component">
                {renderCode(pageData.componentCode, 'typescript')}
              </TabPane>
              
              <TabPane tab={<span><CodeOutlined />样式代码</span>} key="style">
                {renderCode(pageData.styleCode, 'css')}
              </TabPane>
              
              <TabPane tab={<span><CodeOutlined />配置代码</span>} key="config">
                {renderCode(pageData.configCode, 'typescript')}
              </TabPane>
            </>
          )}
        </Tabs>
      </Card>

      <Modal
        title="保存页面"
        visible={saveModalVisible}
        onOk={handleSave}
        onCancel={() => setSaveModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Input
          placeholder="请输入页面名称"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          onPressEnter={handleSave}
        />
      </Modal>
    </div>
  );
};

export default PagePreview;
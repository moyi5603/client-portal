import React, { useState } from 'react';
import { Layout, Row, Col, message } from 'antd';
import ChatInterface from '../components/PageDesigner/ChatInterface';
import PagePreview from '../components/PageDesigner/PagePreview';
import './PageDesigner.css';

const { Content } = Layout;

const PageDesigner: React.FC = () => {
  const [pageData, setPageData] = useState<any>(null);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  const handlePageGenerated = (generatedPageData: any) => {
    setPageData(generatedPageData);
  };

  const handleSavePage = async (pageName: string, pageData: any) => {
    try {
      const response = await fetch('/api/user-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: pageName,
          config: pageData.config,
          componentCode: pageData.componentCode,
          styleCode: pageData.styleCode,
          configCode: pageData.configCode,
          apiCalls: pageData.apiCalls,
          dependencies: pageData.dependencies
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data;
    } catch (error) {
      console.error('Save page error:', error);
      throw error;
    }
  };

  return (
    <Layout className="page-designer-layout">
      <Content className="page-designer-content">
        <Row gutter={16} style={{ height: '100%' }}>
          <Col xs={24} lg={12} className="chat-column">
            <ChatInterface
              onPageGenerated={handlePageGenerated}
              sessionId={sessionId}
            />
          </Col>
          
          <Col xs={24} lg={12} className="preview-column">
            <PagePreview
              pageData={pageData}
              onSave={handleSavePage}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default PageDesigner;
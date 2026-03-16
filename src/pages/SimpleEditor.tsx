import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const SimpleEditor: React.FC = () => {
  return (
    <div>
      <Title level={2}>文本编辑器</Title>
      <Card>
        <p>这是文本编辑器页面，可以在这里添加编辑功能。</p>
      </Card>
    </div>
  );
};

export default SimpleEditor;
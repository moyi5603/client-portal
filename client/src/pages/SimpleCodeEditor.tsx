import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const SimpleCodeEditor: React.FC = () => {
  return (
    <div>
      <Title level={2}>代码编辑器</Title>
      <Card>
        <p>这是代码编辑器页面，可以在这里添加代码编辑功能。</p>
      </Card>
    </div>
  );
};

export default SimpleCodeEditor;
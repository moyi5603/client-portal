import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Card, Avatar, Tag, Spin, List, Divider } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, ApiOutlined } from '@ant-design/icons';
import './ChatInterface.css';

interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  metadata?: {
    suggestions?: string[];
    apis?: any[];
    needsConfirmation?: boolean;
  };
}

interface ChatInterfaceProps {
  onPageGenerated?: (pageData: any) => void;
  sessionId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onPageGenerated, sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始化对话
    if (messages.length === 0) {
      setMessages([{
        role: 'agent',
        content: '您好！我是页面设计助手。我可以帮您通过对话的方式创建个性化的页面。请告诉我您想要创建什么类型的页面？',
        timestamp: new Date(),
        metadata: {
          suggestions: [
            '创建用户管理页面',
            '创建角色管理页面',
            '创建菜单管理页面',
            '创建审计日志页面'
          ]
        }
      }]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/page-designer/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message,
          sessionId
        })
      });

      const result = await response.json();

      if (result.success) {
        const agentMessage: Message = {
          role: 'agent',
          content: result.data.response,
          timestamp: new Date(),
          metadata: {
            suggestions: result.data.suggestions,
            apis: result.data.apis,
            needsConfirmation: result.data.needsConfirmation
          }
        };

        setMessages(prev => [...prev, agentMessage]);
        setSuggestions(result.data.suggestions || []);

        // 如果有页面预览数据，通知父组件
        if (result.data.pagePreview && onPageGenerated) {
          onPageGenerated(result.data.pagePreview);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'agent',
        content: '抱歉，处理您的请求时出现了错误。请稍后重试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <div key={index} className={`message ${isUser ? 'user-message' : 'agent-message'}`}>
        <div className="message-avatar">
          <Avatar 
            icon={isUser ? <UserOutlined /> : <RobotOutlined />}
            style={{ backgroundColor: isUser ? '#1890ff' : '#52c41a' }}
          />
        </div>
        
        <div className="message-content">
          <div className="message-bubble">
            <div className="message-text">{message.content}</div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
          
          {/* 显示API信息 */}
          {message.metadata?.apis && message.metadata.apis.length > 0 && (
            <div className="message-apis">
              <Divider orientation="left" plain>
                <ApiOutlined /> 相关API
              </Divider>
              <List
                size="small"
                dataSource={message.metadata.apis}
                renderItem={(api: any) => (
                  <List.Item>
                    <Tag color="blue">{api.method}</Tag>
                    <span className="api-endpoint">{api.endpoint}</span>
                    <span className="api-description">{api.description}</span>
                  </List.Item>
                )}
              />
            </div>
          )}
          
          {/* 显示建议 */}
          {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
            <div className="message-suggestions">
              <div className="suggestions-title">您可以尝试：</div>
              <div className="suggestions-list">
                {message.metadata.suggestions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    size="small"
                    type="dashed"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="suggestion-button"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-interface">
      <Card 
        title="页面设计助手" 
        className="chat-card"
        bodyStyle={{ padding: 0 }}
      >
        <div className="messages-container">
          {messages.map((message, index) => renderMessage(message, index))}
          
          {loading && (
            <div className="message agent-message">
              <div className="message-avatar">
                <Avatar 
                  icon={<RobotOutlined />}
                  style={{ backgroundColor: '#52c41a' }}
                />
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <Spin size="small" />
                  <span style={{ marginLeft: 8 }}>正在思考...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-container">
          {suggestions.length > 0 && (
            <div className="quick-suggestions">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  size="small"
                  type="text"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="quick-suggestion"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          
          <div className="input-area">
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="描述您想要创建的页面..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => sendMessage(inputValue)}
              loading={loading}
              disabled={!inputValue.trim()}
              className="send-button"
            >
              发送
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
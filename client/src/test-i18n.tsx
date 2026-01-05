import React from 'react';
import { Button, Space } from 'antd';
import { useLocale } from './contexts/LocaleContext';

const TestI18n: React.FC = () => {
  const { locale, setLocale, t } = useLocale();

  return (
    <div style={{ padding: 20 }}>
      <h2>国际化测试 / Internationalization Test</h2>
      
      <div style={{ marginBottom: 20 }}>
        <strong>当前语言 / Current Language: {locale}</strong>
      </div>
      
      <Space style={{ marginBottom: 20 }}>
        <Button 
          type={locale === 'zh-CN' ? 'primary' : 'default'}
          onClick={() => setLocale('zh-CN')}
        >
          中文
        </Button>
        <Button 
          type={locale === 'en-US' ? 'primary' : 'default'}
          onClick={() => setLocale('en-US')}
        >
          English
        </Button>
      </Space>

      <div>
        <h3>翻译测试 / Translation Test:</h3>
        <ul>
          <li>标题: {t('account.title')}</li>
          <li>创建: {t('common.create')}</li>
          <li>编辑: {t('common.edit')}</li>
          <li>删除: {t('common.delete')}</li>
          <li>保存: {t('common.save')}</li>
          <li>取消: {t('common.cancel')}</li>
          <li>搜索: {t('common.search')}</li>
          <li>重置: {t('common.reset')}</li>
          <li>状态: {t('common.status')}</li>
          <li>操作: {t('common.actions')}</li>
          <li>角色管理: {t('nav.roleManagement')}</li>
          <li>权限查看: {t('nav.permissionView')}</li>
          <li>操作记录: {t('nav.auditLog')}</li>
        </ul>
      </div>
    </div>
  );
};

export default TestI18n;
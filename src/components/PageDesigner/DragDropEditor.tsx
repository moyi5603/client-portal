import React, { useState, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, Button, Tooltip, Modal, Form, Input, Select, ColorPicker } from 'antd';
import { 
  DragOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined,
  SettingOutlined,
  EyeOutlined,
  TableOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  FormOutlined
} from '@ant-design/icons';
import './DragDropEditor.css';

interface ComponentConfig {
  id: string;
  type: 'table' | 'chart' | 'card' | 'form' | 'text' | 'button';
  props: any;
  style: React.CSSProperties;
  position: { x: number; y: number };
  size: { width: number; height: number };
  dataBinding?: {
    dataSource: string;
    field?: string;
    filter?: any;
  };
}

interface DragDropEditorProps {
  components: ComponentConfig[];
  onComponentsChange: (components: ComponentConfig[]) => void;
  onPreview: () => void;
}

const COMPONENT_TYPES = [
  { type: 'table', name: '数据表格', icon: <TableOutlined />, defaultProps: { columns: [], dataSource: [] } },
  { type: 'chart', name: '图表', icon: <BarChartOutlined />, defaultProps: { chartType: 'bar', data: [] } },
  { type: 'card', name: '数据卡片', icon: <EyeOutlined />, defaultProps: { title: '标题', value: 0 } },
  { type: 'form', name: '表单', icon: <FormOutlined />, defaultProps: { fields: [] } },
];

const DragDropEditor: React.FC<DragDropEditorProps> = ({
  components,
  onComponentsChange,
  onPreview
}) => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [propertyModalVisible, setPropertyModalVisible] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentConfig | null>(null);
  const [form] = Form.useForm();
  const canvasRef = useRef<HTMLDivElement>(null);

  // 拖拽组件到画布
  const handleDrop = useCallback((item: any, monitor: any) => {
    const offset = monitor.getSourceClientOffset();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    if (offset && canvasRect) {
      const newComponent: ComponentConfig = {
        id: `component_${Date.now()}`,
        type: item.type,
        props: { ...item.defaultProps },
        style: {},
        position: {
          x: offset.x - canvasRect.left,
          y: offset.y - canvasRect.top
        },
        size: { width: 300, height: 200 }
      };

      onComponentsChange([...components, newComponent]);
    }
  }, [components, onComponentsChange]);

  // 移动组件
  const moveComponent = useCallback((id: string, position: { x: number; y: number }) => {
    const updatedComponents = components.map(comp =>
      comp.id === id ? { ...comp, position } : comp
    );
    onComponentsChange(updatedComponents);
  }, [components, onComponentsChange]);

  // 删除组件
  const deleteComponent = useCallback((id: string) => {
    const updatedComponents = components.filter(comp => comp.id !== id);
    onComponentsChange(updatedComponents);
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  }, [components, onComponentsChange, selectedComponent]);

  // 复制组件
  const duplicateComponent = useCallback((id: string) => {
    const component = components.find(comp => comp.id === id);
    if (component) {
      const newComponent: ComponentConfig = {
        ...component,
        id: `component_${Date.now()}`,
        position: {
          x: component.position.x + 20,
          y: component.position.y + 20
        }
      };
      onComponentsChange([...components, newComponent]);
    }
  }, [components, onComponentsChange]);

  // 编辑组件属性
  const editComponent = useCallback((component: ComponentConfig) => {
    setEditingComponent(component);
    form.setFieldsValue({
      ...component.props,
      backgroundColor: component.style.backgroundColor,
      color: component.style.color,
      fontSize: component.style.fontSize,
      padding: component.style.padding
    });
    setPropertyModalVisible(true);
  }, [form]);

  // 保存组件属性
  const saveComponentProperties = useCallback(() => {
    if (!editingComponent) return;

    form.validateFields().then(values => {
      const { backgroundColor, color, fontSize, padding, ...props } = values;
      
      const updatedComponents = components.map(comp =>
        comp.id === editingComponent.id
          ? {
              ...comp,
              props,
              style: {
                ...comp.style,
                backgroundColor,
                color,
                fontSize: fontSize ? `${fontSize}px` : undefined,
                padding: padding ? `${padding}px` : undefined
              }
            }
          : comp
      );

      onComponentsChange(updatedComponents);
      setPropertyModalVisible(false);
      setEditingComponent(null);
    });
  }, [editingComponent, components, onComponentsChange, form]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="drag-drop-editor">
        {/* 组件库面板 */}
        <div className="component-library">
          <h3>组件库</h3>
          {COMPONENT_TYPES.map(componentType => (
            <DraggableComponent
              key={componentType.type}
              type={componentType.type}
              name={componentType.name}
              icon={componentType.icon}
              defaultProps={componentType.defaultProps}
            />
          ))}
        </div>

        {/* 画布区域 */}
        <div className="canvas-area">
          <div className="canvas-toolbar">
            <Button icon={<EyeOutlined />} onClick={onPreview}>
              预览
            </Button>
            <Button 
              onClick={() => onComponentsChange([])}
              disabled={components.length === 0}
            >
              清空画布
            </Button>
          </div>
          
          <DropCanvas
            ref={canvasRef}
            onDrop={handleDrop}
            components={components}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            onMoveComponent={moveComponent}
            onEditComponent={editComponent}
            onDeleteComponent={deleteComponent}
            onDuplicateComponent={duplicateComponent}
          />
        </div>

        {/* 属性编辑面板 */}
        <div className="property-panel">
          <h3>属性面板</h3>
          {selectedComponent ? (
            <ComponentProperties
              component={components.find(c => c.id === selectedComponent)!}
              onEdit={editComponent}
            />
          ) : (
            <div className="no-selection">
              <p>请选择一个组件来编辑属性</p>
            </div>
          )}
        </div>

        {/* 属性编辑模态框 */}
        <Modal
          title="编辑组件属性"
          open={propertyModalVisible}
          onOk={saveComponentProperties}
          onCancel={() => setPropertyModalVisible(false)}
          width={600}
        >
          <Form form={form} layout="vertical">
            {editingComponent && (
              <ComponentPropertyForm componentType={editingComponent.type} />
            )}
            
            {/* 样式设置 */}
            <h4>样式设置</h4>
            <Form.Item label="背景颜色" name="backgroundColor">
              <ColorPicker />
            </Form.Item>
            <Form.Item label="文字颜色" name="color">
              <ColorPicker />
            </Form.Item>
            <Form.Item label="字体大小" name="fontSize">
              <Input type="number" addonAfter="px" />
            </Form.Item>
            <Form.Item label="内边距" name="padding">
              <Input type="number" addonAfter="px" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DndProvider>
  );
};

// 可拖拽组件
const DraggableComponent: React.FC<{
  type: string;
  name: string;
  icon: React.ReactNode;
  defaultProps: any;
}> = ({ type, name, icon, defaultProps }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { type, defaultProps },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`draggable-component ${isDragging ? 'dragging' : ''}`}
    >
      {icon}
      <span>{name}</span>
    </div>
  );
};

// 画布组件
const DropCanvas = React.forwardRef<HTMLDivElement, {
  onDrop: (item: any, monitor: any) => void;
  components: ComponentConfig[];
  selectedComponent: string | null;
  onSelectComponent: (id: string) => void;
  onMoveComponent: (id: string, position: { x: number; y: number }) => void;
  onEditComponent: (component: ComponentConfig) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
}>(({ 
  onDrop, 
  components, 
  selectedComponent, 
  onSelectComponent,
  onMoveComponent,
  onEditComponent,
  onDeleteComponent,
  onDuplicateComponent
}, ref) => {
  const [, drop] = useDrop({
    accept: 'component',
    drop: onDrop,
  });

  return (
    <div ref={(node) => {
      drop(node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }} className="drop-canvas">
      {components.map(component => (
        <DraggableCanvasComponent
          key={component.id}
          component={component}
          isSelected={selectedComponent === component.id}
          onSelect={() => onSelectComponent(component.id)}
          onMove={(position) => onMoveComponent(component.id, position)}
          onEdit={() => onEditComponent(component)}
          onDelete={() => onDeleteComponent(component.id)}
          onDuplicate={() => onDuplicateComponent(component.id)}
        />
      ))}
      
      {components.length === 0 && (
        <div className="empty-canvas">
          <p>从左侧组件库拖拽组件到此处开始设计</p>
        </div>
      )}
    </div>
  );
});

// 画布上的可拖拽组件
const DraggableCanvasComponent: React.FC<{
  component: ComponentConfig;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ component, isSelected, onSelect, onMove, onEdit, onDelete, onDuplicate }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'canvas-component',
    item: { id: component.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'canvas-component',
    hover: (item: any, monitor) => {
      const draggedId = item.id;
      if (draggedId === component.id) return;

      const hoverBoundingRect = (drop as any).current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      
      if (hoverBoundingRect && clientOffset) {
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        
        if (hoverClientY < hoverMiddleY) return;
      }
    },
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`canvas-component ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: component.position.x,
        top: component.position.y,
        width: component.size.width,
        height: component.size.height,
        ...component.style
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="component-content">
        <ComponentRenderer component={component} />
      </div>
      
      {isSelected && (
        <div className="component-controls">
          <Tooltip title="编辑">
            <Button size="small" icon={<EditOutlined />} onClick={onEdit} />
          </Tooltip>
          <Tooltip title="复制">
            <Button size="small" icon={<CopyOutlined />} onClick={onDuplicate} />
          </Tooltip>
          <Tooltip title="删除">
            <Button size="small" icon={<DeleteOutlined />} onClick={onDelete} danger />
          </Tooltip>
        </div>
      )}
      
      <div className="resize-handles">
        <div className="resize-handle resize-handle-se" />
      </div>
    </div>
  );
};

// 组件渲染器
const ComponentRenderer: React.FC<{ component: ComponentConfig }> = ({ component }) => {
  switch (component.type) {
    case 'table':
      return (
        <div className="component-preview">
          <TableOutlined style={{ fontSize: 24 }} />
          <p>数据表格</p>
        </div>
      );
    case 'chart':
      return (
        <div className="component-preview">
          <BarChartOutlined style={{ fontSize: 24 }} />
          <p>图表组件</p>
        </div>
      );
    case 'card':
      return (
        <Card size="small" title={component.props.title || '数据卡片'}>
          <div style={{ fontSize: 24, textAlign: 'center' }}>
            {component.props.value || 0}
          </div>
        </Card>
      );
    case 'form':
      return (
        <div className="component-preview">
          <FormOutlined style={{ fontSize: 24 }} />
          <p>表单组件</p>
        </div>
      );
    default:
      return <div>未知组件</div>;
  }
};

// 组件属性面板
const ComponentProperties: React.FC<{
  component: ComponentConfig;
  onEdit: (component: ComponentConfig) => void;
}> = ({ component, onEdit }) => {
  return (
    <div className="component-properties">
      <div className="property-header">
        <h4>{component.type} 组件</h4>
        <Button size="small" icon={<SettingOutlined />} onClick={() => onEdit(component)}>
          编辑
        </Button>
      </div>
      
      <div className="property-list">
        <div className="property-item">
          <label>位置:</label>
          <span>X: {component.position.x}, Y: {component.position.y}</span>
        </div>
        <div className="property-item">
          <label>大小:</label>
          <span>{component.size.width} × {component.size.height}</span>
        </div>
        {component.dataBinding && (
          <div className="property-item">
            <label>数据源:</label>
            <span>{component.dataBinding.dataSource}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// 组件属性表单
const ComponentPropertyForm: React.FC<{ componentType: string }> = ({ componentType }) => {
  switch (componentType) {
    case 'table':
      return (
        <>
          <Form.Item label="表格标题" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="显示分页" name="pagination" valuePropName="checked">
            <input type="checkbox" />
          </Form.Item>
        </>
      );
    case 'chart':
      return (
        <>
          <Form.Item label="图表类型" name="chartType">
            <Select>
              <Select.Option value="bar">柱状图</Select.Option>
              <Select.Option value="line">折线图</Select.Option>
              <Select.Option value="pie">饼图</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="图表标题" name="title">
            <Input />
          </Form.Item>
        </>
      );
    case 'card':
      return (
        <>
          <Form.Item label="卡片标题" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="显示值" name="value">
            <Input />
          </Form.Item>
        </>
      );
    default:
      return null;
  }
};

export default DragDropEditor;
import * as React from 'react';
import { ChevronRight, ChevronDown, Folder, File, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Checkbox } from './checkbox';
import './tree.css';

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  data?: any;
}

interface TreeProps {
  data: TreeNode[];
  checkable?: boolean;
  checkedKeys?: string[];
  onCheck?: (checkedKeys: string[]) => void;
  expandedKeys?: string[];
  onExpand?: (expandedKeys: string[]) => void;
  defaultExpandAll?: boolean;
  showLine?: boolean;
  showAccessIndicator?: boolean;
  accessibleKeys?: string[];
  searchValue?: string;
  className?: string;
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  checkable?: boolean;
  checkedKeys: string[];
  onCheck: (checkedKeys: string[]) => void;
  expandedKeys: string[];
  onExpand: (expandedKeys: string[]) => void;
  showLine?: boolean;
  showAccessIndicator?: boolean;
  accessibleKeys?: string[];
  searchValue?: string;
}

function getAllChildIds(node: TreeNode): string[] {
  let ids: string[] = [node.id];
  if (node.children) {
    node.children.forEach((child) => {
      ids = ids.concat(getAllChildIds(child));
    });
  }
  return ids;
}

function TreeNodeItem({
  node,
  level,
  checkable,
  checkedKeys,
  onCheck,
  expandedKeys,
  onExpand,
  showLine,
  showAccessIndicator,
  accessibleKeys,
  searchValue,
}: TreeNodeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedKeys.includes(node.id);
  const isChecked = checkedKeys.includes(node.id);
  const hasAccess = accessibleKeys?.includes(node.id);

  const handleToggle = () => {
    if (hasChildren) {
      if (isExpanded) {
        onExpand(expandedKeys.filter((k) => k !== node.id));
      } else {
        onExpand([...expandedKeys, node.id]);
      }
    }
  };

  const handleCheck = () => {
    const allIds = getAllChildIds(node);
    if (isChecked) {
      onCheck(checkedKeys.filter((k) => !allIds.includes(k)));
    } else {
      const newKeys = new Set([...checkedKeys, ...allIds]);
      onCheck(Array.from(newKeys));
    }
  };

  // Highlight search matches
  const highlightText = (text: string) => {
    if (!searchValue) return text;
    const index = text.toLowerCase().indexOf(searchValue.toLowerCase());
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <mark className="ui-tree-highlight">{text.slice(index, index + searchValue.length)}</mark>
        {text.slice(index + searchValue.length)}
      </>
    );
  };

  const isMatch = searchValue && node.label.toLowerCase().includes(searchValue.toLowerCase());

  return (
    <div className="ui-tree-node">
      <div
        className={cn(
          'ui-tree-node-content',
          isMatch && 'ui-tree-node-content--highlighted'
        )}
        style={{ paddingLeft: `${level * 24}px` }}
      >
        <span
          className={cn('ui-tree-toggle', !hasChildren && 'ui-tree-toggle--hidden')}
          onClick={handleToggle}
        >
          {hasChildren && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </span>

        {checkable && (
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleCheck}
            className="ui-tree-checkbox"
          />
        )}

        <span className="ui-tree-icon">
          {node.icon || (hasChildren ? <Folder size={16} /> : <File size={16} />)}
        </span>

        <span
          className={cn(
            'ui-tree-label',
            showAccessIndicator && !hasAccess && 'ui-tree-label--no-access'
          )}
        >
          {highlightText(node.label)}
        </span>

        {showAccessIndicator && (
          <span className="ui-tree-access-indicator">
            {hasAccess ? (
              <Check size={16} className="ui-tree-access-check" />
            ) : (
              <X size={16} className="ui-tree-access-no" />
            )}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className={cn('ui-tree-children', showLine && 'ui-tree-children--lined')}>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              checkable={checkable}
              checkedKeys={checkedKeys}
              onCheck={onCheck}
              expandedKeys={expandedKeys}
              onExpand={onExpand}
              showLine={showLine}
              showAccessIndicator={showAccessIndicator}
              accessibleKeys={accessibleKeys}
              searchValue={searchValue}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Tree({
  data,
  checkable = false,
  checkedKeys = [],
  onCheck,
  expandedKeys: controlledExpandedKeys,
  onExpand,
  defaultExpandAll = false,
  showLine = false,
  showAccessIndicator = false,
  accessibleKeys,
  searchValue,
  className,
}: TreeProps) {
  const getAllKeys = (nodes: TreeNode[]): string[] => {
    let keys: string[] = [];
    nodes.forEach((node) => {
      keys.push(node.id);
      if (node.children) {
        keys = keys.concat(getAllKeys(node.children));
      }
    });
    return keys;
  };

  const [internalExpandedKeys, setInternalExpandedKeys] = React.useState<string[]>(
    defaultExpandAll ? getAllKeys(data) : []
  );

  const expandedKeys = controlledExpandedKeys ?? internalExpandedKeys;
  const handleExpand = onExpand ?? setInternalExpandedKeys;

  const handleCheck = (keys: string[]) => {
    onCheck?.(keys);
  };

  return (
    <div className={cn('ui-tree', className)}>
      {data.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          level={0}
          checkable={checkable}
          checkedKeys={checkedKeys}
          onCheck={handleCheck}
          expandedKeys={expandedKeys}
          onExpand={handleExpand}
          showLine={showLine}
          showAccessIndicator={showAccessIndicator}
          accessibleKeys={accessibleKeys}
          searchValue={searchValue}
        />
      ))}
    </div>
  );
}

export { Tree };

